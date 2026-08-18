-- ─────────────────────────────────────────────────────────────────────
-- 031 — Listing sub-categories
--
-- "Machinery" covers a tractor, a drone sprayer and a borewell rig alike,
-- which is too coarse to search. Each category now carries a second level
-- (Tractor, Sowing Equipment, Sprayers & Drones, Borewell Drilling, …).
--
-- Deliberately free text rather than a CHECK constraint: the option lists live
-- in the app (`components/listings/listingTypes.ts`) and will grow as farmers
-- ask for more, and a constraint would turn each addition into a migration.
-- Values are validated against the app's list on write.
--
-- Requires 030.
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.marketplace_listings
    ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Board queries filter by (mode, category, subcategory) together.
CREATE INDEX IF NOT EXISTS idx_listings_mode_category_sub
    ON public.marketplace_listings (listing_mode, category, subcategory)
    WHERE status = 'active';

-- Best-effort backfill from the original free-text category kept by 030, so
-- rows that already said "cattle" land on the matching sub-category instead of
-- being blank.
UPDATE public.marketplace_listings
SET subcategory = CASE LOWER(TRIM(specs->>'original_category'))
        WHEN 'cattle'  THEN 'Cow'
        WHEN 'cow'     THEN 'Cow'
        WHEN 'buffalo' THEN 'Buffalo'
        WHEN 'goat'    THEN 'Goat & Sheep'
        WHEN 'sheep'   THEN 'Goat & Sheep'
        WHEN 'poultry' THEN 'Poultry'
        WHEN 'duck'    THEN 'Poultry'
        WHEN 'tractor' THEN 'Tractor'
        ELSE NULL
    END
-- jsonb_exists(), not `?` — some SQL clients read `?` as a bind placeholder.
WHERE subcategory IS NULL
  AND jsonb_exists(COALESCE(specs, '{}'::jsonb), 'original_category');
