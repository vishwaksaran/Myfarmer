-- ================================================
-- LABOUR & SERVICES BOARD
-- ------------------------------------------------
-- Adds a third listing board alongside Rent and Buy & Sell, for people
-- offering their labour or a service (borewell drilling, fencing, drone
-- spraying, harvest crews).
--
-- Two constraints have to widen:
--
--   listing_mode  gains 'labour'   — its own board, so these never mix into
--                                   the Rent or Buy & Sell chips and counts.
--   category      gains 'services' — the second of the board's two categories.
--                                   'labour' already exists: migration 030
--                                   allowed it, then the app stopped offering
--                                   it when neither board wanted it. This
--                                   board is where it comes back.
--
-- Nothing is rewritten and no rows move; both statements only widen what is
-- permitted, so re-running this migration is safe.
-- ================================================

ALTER TABLE public.marketplace_listings
    DROP CONSTRAINT IF EXISTS marketplace_listings_listing_mode_check;
ALTER TABLE public.marketplace_listings
    ADD CONSTRAINT marketplace_listings_listing_mode_check
    CHECK (listing_mode IN ('sale', 'rent', 'labour'));

ALTER TABLE public.marketplace_listings
    DROP CONSTRAINT IF EXISTS marketplace_listings_category_check;
ALTER TABLE public.marketplace_listings
    ADD CONSTRAINT marketplace_listings_category_check
    CHECK (category IN ('machinery', 'vehicles', 'animals', 'land', 'crops',
                        'labour', 'services', 'other'));

-- The board filters by listing_mode + category on every load, same as the
-- other two boards do.
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_mode_category
    ON public.marketplace_listings (listing_mode, category, created_at DESC);

-- Work type, crew size and the poster's name have no columns of their own and
-- are read straight back out of specs. Documented here so the shape is not a
-- surprise to anyone reading the table:
--   specs = {
--     "work_type":    "Borewell drilling",
--     "worker_count": 5,
--     "contact_name": "Ramesh"
--   }
COMMENT ON COLUMN public.marketplace_listings.specs IS
    'Free-form extras. Labour & Services listings store work_type, worker_count and contact_name here.';
