-- ─────────────────────────────────────────────────────────────────────
-- 030 — Rent and Buy & Sell boards
--
-- `marketplace_listings` (013) could only express things for SALE, under three
-- fixed types (machinery/crops/livestock). The two new boards need:
--
--   • rentals as well as sales           → `listing_mode`
--   • vehicles and land as categories    → widened `category` + dropped the
--                                          listing_type CHECK
--   • "₹3,500 One day", "₹50,00,000 Per acre", "₹13 per KM", "negotiable"
--                                        → `price_unit`, nullable `price`
--   • "6.0 km away"                      → `latitude` / `longitude`
--
-- Existing rows are migrated in place: everything already there is a sale, and
-- its listing_type becomes its category.
--
-- Requires 013.
-- ─────────────────────────────────────────────────────────────────────


-- ── 1. New columns ───────────────────────────────────────────────────
-- `listing_mode`, not `mode`: PostgreSQL has a built-in ordered-set aggregate
-- called mode(), and a bare `mode` in a select list resolves to it, failing
-- with "WITHIN GROUP is required for ordered-set aggregate mode".
ALTER TABLE public.marketplace_listings
    ADD COLUMN IF NOT EXISTS listing_mode  TEXT NOT NULL DEFAULT 'sale',
    ADD COLUMN IF NOT EXISTS price_unit    TEXT,
    ADD COLUMN IF NOT EXISTS negotiable    BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS latitude      DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude     DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS contact_phone TEXT;

ALTER TABLE public.marketplace_listings
    DROP CONSTRAINT IF EXISTS marketplace_listings_listing_mode_check;
ALTER TABLE public.marketplace_listings
    ADD CONSTRAINT marketplace_listings_listing_mode_check
    CHECK (listing_mode IN ('sale', 'rent'));


-- ── 2. Widen the taxonomy ────────────────────────────────────────────
-- 013 pinned listing_type to machinery/crops/livestock, which cannot express
-- vehicles or land. `category` becomes the real taxonomy; listing_type is kept
-- (and backfilled) so nothing reading the old column breaks.
--
-- `category` was free text, holding whatever the old forms put there — real
-- rows carry values like 'cattle' and 'others'. So every row is normalised
-- into the new fixed set BEFORE the CHECK is added; adding it first fails with
-- "check constraint … is violated by some row".
ALTER TABLE public.marketplace_listings
    DROP CONSTRAINT IF EXISTS marketplace_listings_listing_type_check;
ALTER TABLE public.marketplace_listings
    DROP CONSTRAINT IF EXISTS marketplace_listings_category_check;

ALTER TABLE public.marketplace_listings
    ALTER COLUMN listing_type DROP NOT NULL;

-- Keep the original free-text value: 'cattle' says more than 'animals', and it
-- is the only place that detail exists once the column is normalised.
-- jsonb_exists(), not the `?` operator: some SQL clients read `?` as a bind
-- placeholder and mangle the statement.
UPDATE public.marketplace_listings
SET specs = COALESCE(specs, '{}'::jsonb) || jsonb_build_object('original_category', category)
WHERE category IS NOT NULL
  AND TRIM(category) <> ''
  AND NOT jsonb_exists(COALESCE(specs, '{}'::jsonb), 'original_category');

-- Map the old free text onto the new taxonomy, falling back to listing_type
-- and finally to 'other' — the CHECK below must hold for every row, whatever
-- was in there.
UPDATE public.marketplace_listings
SET category = CASE
        WHEN LOWER(TRIM(COALESCE(category, ''))) IN
            ('animals', 'animal', 'livestock', 'cattle', 'cow', 'cows', 'buffalo', 'buffaloes',
             'goat', 'goats', 'sheep', 'poultry', 'duck', 'ducks', 'hen', 'chicken', 'birds', 'pig', 'pigs')
            THEN 'animals'
        WHEN LOWER(TRIM(COALESCE(category, ''))) IN
            ('machinery', 'machine', 'machines', 'tractor', 'tractors', 'harvester', 'harvesters',
             'implement', 'implements', 'equipment', 'tools', 'pump', 'pumps')
            THEN 'machinery'
        WHEN LOWER(TRIM(COALESCE(category, ''))) IN
            ('vehicles', 'vehicle', 'car', 'cars', 'bike', 'bikes', 'motorcycle', 'truck', 'trucks',
             'tempo', 'auto', 'van', 'trailer', 'trailers')
            THEN 'vehicles'
        WHEN LOWER(TRIM(COALESCE(category, ''))) IN
            ('land', 'lands', 'plot', 'plots', 'farm', 'farmland', 'field', 'fields', 'acre', 'acres')
            THEN 'land'
        WHEN LOWER(TRIM(COALESCE(category, ''))) IN
            ('crops', 'crop', 'grain', 'grains', 'seed', 'seeds', 'produce', 'vegetables', 'fruits', 'fodder')
            THEN 'crops'
        WHEN LOWER(TRIM(COALESCE(category, ''))) IN
            ('labour', 'labor', 'labours', 'worker', 'workers', 'manpower')
            THEN 'labour'
        -- Nothing recognisable in `category` — including placeholders like
        -- 'other'/'others', which deliberately fall through here — so use the
        -- old listing_type, which is the more reliable signal for those rows.
        WHEN LOWER(TRIM(COALESCE(listing_type, ''))) = 'livestock' THEN 'animals'
        WHEN LOWER(TRIM(COALESCE(listing_type, ''))) = 'crops'     THEN 'crops'
        WHEN LOWER(TRIM(COALESCE(listing_type, ''))) = 'machinery' THEN 'machinery'
        ELSE 'other'
    END;

-- Safety net: anything the mapping somehow missed lands on 'other' so the
-- constraint below can always be created.
UPDATE public.marketplace_listings
SET category = 'other'
WHERE category IS NULL
   OR category NOT IN ('machinery', 'vehicles', 'animals', 'land', 'crops', 'labour', 'other');

ALTER TABLE public.marketplace_listings
    ADD CONSTRAINT marketplace_listings_category_check
    CHECK (category IN ('machinery', 'vehicles', 'animals', 'land', 'crops', 'labour', 'other'));

-- Keep listing_type in step for any legacy reader.
UPDATE public.marketplace_listings
SET listing_type = CASE category
        WHEN 'animals' THEN 'livestock'
        WHEN 'crops'   THEN 'crops'
        ELSE 'machinery'
    END
WHERE listing_type IS NULL
   OR listing_type NOT IN ('machinery', 'crops', 'livestock');


-- ── 3. Price becomes optional ────────────────────────────────────────
-- "negotiable" listings (the Land example in the reference app) have no number.
ALTER TABLE public.marketplace_listings
    ALTER COLUMN price DROP NOT NULL;


-- ── 4. Indexes for the two boards ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_listings_mode_status_created
    ON public.marketplace_listings (listing_mode, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_mode_category
    ON public.marketplace_listings (listing_mode, category, status);


-- ── 5. Row level security ────────────────────────────────────────────
-- 013's policies already cover the new columns (they are on the same table):
-- public SELECT of active rows, owner-only insert/update/delete. Re-asserted
-- here so a project that lost them during earlier edits gets them back.
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;
CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Users can view own listings" ON public.marketplace_listings;
CREATE POLICY "Users can view own listings" ON public.marketplace_listings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create listings" ON public.marketplace_listings;
CREATE POLICY "Users can create listings" ON public.marketplace_listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own listings" ON public.marketplace_listings;
CREATE POLICY "Users can update own listings" ON public.marketplace_listings
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own listings" ON public.marketplace_listings;
CREATE POLICY "Users can delete own listings" ON public.marketplace_listings
    FOR DELETE USING (auth.uid() = user_id);


-- ── 6. Realtime ──────────────────────────────────────────────────────
-- A new ad shows up on every open board without a refresh.
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_listings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
