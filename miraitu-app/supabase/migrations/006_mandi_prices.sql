-- ================================================
-- MANDI PRICES – Live Market Data from data.gov.in
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ================================================

-- 1. CREATE mandi_prices table
CREATE TABLE IF NOT EXISTS public.mandi_prices (
    id              BIGSERIAL PRIMARY KEY,
    state           TEXT NOT NULL,
    district        TEXT NOT NULL DEFAULT '',
    market          TEXT NOT NULL,
    commodity       TEXT NOT NULL,
    variety         TEXT NOT NULL DEFAULT '',
    arrival_date    DATE NOT NULL,
    min_price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    max_price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    modal_price     NUMERIC(10, 2) NOT NULL DEFAULT 0,
    fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate rows for same market+commodity+date+variety
    UNIQUE (state, market, commodity, variety, arrival_date)
);

-- 2. INDEXES for fast queries
CREATE INDEX IF NOT EXISTS idx_mandi_commodity     ON public.mandi_prices (commodity);
CREATE INDEX IF NOT EXISTS idx_mandi_state         ON public.mandi_prices (state);
CREATE INDEX IF NOT EXISTS idx_mandi_arrival       ON public.mandi_prices (arrival_date DESC);
CREATE INDEX IF NOT EXISTS idx_mandi_state_comm    ON public.mandi_prices (state, commodity);
CREATE INDEX IF NOT EXISTS idx_mandi_market        ON public.mandi_prices (market);
CREATE INDEX IF NOT EXISTS idx_mandi_fetched       ON public.mandi_prices (fetched_at DESC);

-- 3. ENABLE RLS
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;

-- Public read access (market prices are public data)
CREATE POLICY "mandi_prices_public_read"
    ON public.mandi_prices
    FOR SELECT
    USING (true);

-- Only service_role can insert/update (used by sync API)
CREATE POLICY "mandi_prices_service_insert"
    ON public.mandi_prices
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "mandi_prices_service_update"
    ON public.mandi_prices
    FOR UPDATE
    USING (auth.role() = 'service_role');

CREATE POLICY "mandi_prices_service_delete"
    ON public.mandi_prices
    FOR DELETE
    USING (auth.role() = 'service_role');

-- 4. HELPER VIEW: Latest prices per commodity (most recent arrival_date)
CREATE OR REPLACE VIEW public.mandi_prices_latest AS
SELECT DISTINCT ON (commodity, state, market)
    id, state, district, market, commodity, variety,
    arrival_date, min_price, max_price, modal_price, fetched_at
FROM public.mandi_prices
ORDER BY commodity, state, market, arrival_date DESC;

-- 5. HELPER VIEW: Daily average by commodity (for trend charts)
CREATE OR REPLACE VIEW public.mandi_prices_daily_avg AS
SELECT
    commodity,
    arrival_date,
    ROUND(AVG(min_price), 2)   AS avg_min,
    ROUND(AVG(max_price), 2)   AS avg_max,
    ROUND(AVG(modal_price), 2) AS avg_modal,
    COUNT(*)                   AS market_count
FROM public.mandi_prices
GROUP BY commodity, arrival_date
ORDER BY commodity, arrival_date DESC;


-- ================================================
-- 6. STORE API KEY IN SUPABASE VAULT (Optional)
-- ================================================
-- Uncomment and run ONCE after enabling Vault in your Supabase project:
--
-- INSERT INTO vault.secrets (name, secret)
-- VALUES ('DATA_GOV_IN_API_KEY', '579b464db66ec23bdd00000115d4991838404bd0523006e28fd08132');
--
-- To read it in an Edge Function:
--   SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'DATA_GOV_IN_API_KEY';


-- ================================================
-- 7. AUTO-CLEANUP: Delete data older than 90 days
-- ================================================
-- (Run periodically via pg_cron or manually)
-- DELETE FROM public.mandi_prices WHERE arrival_date < CURRENT_DATE - INTERVAL '90 days';

-- ================================================
-- 8. pg_cron: Schedule auto-sync (Supabase Pro plan only)
-- ================================================
-- If your Supabase project has pg_cron enabled (Pro plan), you can
-- call the sync Edge Function every 6 hours automatically:
--
-- SELECT cron.schedule(
--     'sync-mandi-prices',
--     '0 */6 * * *',              -- every 6 hours
--     $$
--     SELECT net.http_post(
--         url := 'https://rvpcafovujqujlcjgjos.supabase.co/functions/v1/sync-mandi-prices',
--         headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
--         body := '{}'::jsonb
--     );
--     $$
-- );
