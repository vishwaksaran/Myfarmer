-- ─────────────────────────────────────────────────────────────────────
-- 034 — Seller verification workflow + seller login credentials
--
-- `sellers` has collected applications since 001, but nothing ever read
-- them back: there was no admin screen, no way to approve or reject one,
-- and the seller dashboard was a static mock-up with no account behind it.
-- A farmer could fill in four steps, land on a dashboard, and every button
-- on it did nothing.
--
-- This adds the two things that were missing:
--
--   1. A review trail on `sellers`, so admin can approve or reject an
--      application and the decision is recorded with who made it and why.
--   2. `seller_credentials`, so an approved seller gets a username and
--      password to sign in with — the same shape as `vendor_credentials`
--      from 014 (bcrypt hash for login, AES for admin viewing, session
--      versioning to force logout), because that pattern already works
--      and sellers need exactly the same guarantees.
--
-- Additive only: no column is dropped and no existing row changes meaning.
-- ─────────────────────────────────────────────────────────────────────

-- ── 1. Review trail on the application ───────────────────────────────

ALTER TABLE public.sellers
    ADD COLUMN IF NOT EXISTS reviewed_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reviewed_by  UUID REFERENCES auth.users(id),
    -- Why it was rejected, or any note admin wants kept with the decision.
    ADD COLUMN IF NOT EXISTS review_note  TEXT,
    -- Set once credentials have been issued, so admin can see at a glance
    -- which approved sellers can actually sign in.
    ADD COLUMN IF NOT EXISTS credentialed_at TIMESTAMPTZ;

-- status has always been free text defaulting to 'pending'. Normalise any
-- stray values before constraining it, so the constraint cannot fail on
-- data that is already there.
UPDATE public.sellers
   SET status = 'pending'
 WHERE status IS NULL
    OR status NOT IN ('pending', 'approved', 'rejected');

ALTER TABLE public.sellers
    ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.sellers
    DROP CONSTRAINT IF EXISTS sellers_status_check;

ALTER TABLE public.sellers
    ADD CONSTRAINT sellers_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- Admin lists these newest-first and filters by status and type.
CREATE INDEX IF NOT EXISTS idx_sellers_status_created
    ON public.sellers (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sellers_type
    ON public.sellers (seller_type);


-- ── 2. Seller login credentials ──────────────────────────────────────
--
-- Deliberately separate from Supabase Auth, exactly as vendor_credentials
-- is: a seller signs in at /seller-login with a username admin issued,
-- not with the phone OTP the public app uses. Admin can read the password
-- back to read it out over the phone, which is why it is stored twice —
-- bcrypt for verification, AES-256-GCM for display.

CREATE TABLE IF NOT EXISTS public.seller_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,

    -- Auth
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,        -- bcrypt, one-way, used at login
    password_encrypted TEXT NOT NULL,   -- AES-256-GCM, reversible, admin only

    -- Profile
    display_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,

    -- Status & session
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'deactivated', 'suspended')),
    is_temp_password BOOLEAN NOT NULL DEFAULT true,
    -- Bumping this invalidates every issued token for this seller.
    session_version INTEGER NOT NULL DEFAULT 1,

    -- Tracking
    last_login TIMESTAMPTZ,
    login_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One login per seller application.
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_credentials_seller
    ON public.seller_credentials (seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_credentials_username
    ON public.seller_credentials (username);

ALTER TABLE public.seller_credentials ENABLE ROW LEVEL SECURITY;

-- Never reachable from the browser. Every read and write goes through a
-- server action or API route running as the service role, the same rule
-- vendor_credentials follows — the anon key must never see a hash.
DROP POLICY IF EXISTS "Service role full access on seller_credentials"
    ON public.seller_credentials;
CREATE POLICY "Service role full access on seller_credentials"
    ON public.seller_credentials
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');


-- ── 3. Keep updated_at honest ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.touch_seller_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_seller_credentials_updated_at
    ON public.seller_credentials;
CREATE TRIGGER trg_seller_credentials_updated_at
    BEFORE UPDATE ON public.seller_credentials
    FOR EACH ROW EXECUTE FUNCTION public.touch_seller_credentials_updated_at();
