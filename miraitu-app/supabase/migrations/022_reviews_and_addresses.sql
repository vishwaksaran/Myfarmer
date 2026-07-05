-- ================================================================
-- PROVIDER REVIEWS + USER ADDRESSES
-- Backs the provider Profile screen: ratings/"My Reviews" and
-- "Manage Locations". Run in Supabase Dashboard → SQL Editor.
-- ================================================================

-- 1. PROVIDER REVIEWS ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.provider_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.service_bookings(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewer_name TEXT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_reviews_provider_id ON public.provider_reviews(provider_id);

ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;

-- Ratings are public (shown on provider profiles)
DROP POLICY IF EXISTS "Anyone can read provider reviews" ON public.provider_reviews;
CREATE POLICY "Anyone can read provider reviews" ON public.provider_reviews
    FOR SELECT USING (true);

-- A signed-in customer may post a review as themselves
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.provider_reviews;
CREATE POLICY "Users can create their own reviews" ON public.provider_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- 2. USER ADDRESSES (Manage Locations) ------------------------------
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Home',
    address TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);

DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER update_user_addresses_updated_at
    BEFORE UPDATE ON public.user_addresses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Owner-only access for every operation
DROP POLICY IF EXISTS "Users manage own addresses" ON public.user_addresses;
CREATE POLICY "Users manage own addresses" ON public.user_addresses
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
