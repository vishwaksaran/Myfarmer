-- ================================================
-- PROVIDER WORKSPACE ENHANCEMENT
-- Service catalog + extended provider profile fields
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ================================================

-- 1. EXTEND PROFILES with business / working-hours / service-area fields
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS business_name TEXT,
    ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS service_area_text TEXT,
    ADD COLUMN IF NOT EXISTS service_radius_km INTEGER;

-- 2. PROVIDER SERVICES CATALOG
-- Each service a provider offers: name, description, price (capped), unit, availability.
-- The 1,000,000 hard ceiling matches MAX_SERVICE_PRICE in src/lib/provider-config.ts
-- (application-level validation is the configurable limit; this CHECK is the safety net).
CREATE TABLE IF NOT EXISTS public.provider_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) DEFAULT 0 CHECK (price >= 0 AND price <= 1000000),
    unit TEXT DEFAULT 'per service',
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id
    ON public.provider_services(provider_id);

-- 3. updated_at trigger (reuses the shared function from migration 001)
DROP TRIGGER IF EXISTS update_provider_services_updated_at ON public.provider_services;
CREATE TRIGGER update_provider_services_updated_at
    BEFORE UPDATE ON public.provider_services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4. RLS
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;

-- Providers manage only their own services
DROP POLICY IF EXISTS "Providers manage own services" ON public.provider_services;
CREATE POLICY "Providers manage own services" ON public.provider_services
    FOR ALL
    USING (auth.uid() = provider_id)
    WITH CHECK (auth.uid() = provider_id);

-- Anyone can read available services (so customers can browse them),
-- mirroring the "Anyone can view provider public info" policy on profiles.
DROP POLICY IF EXISTS "Anyone can view available services" ON public.provider_services;
CREATE POLICY "Anyone can view available services" ON public.provider_services
    FOR SELECT
    USING (is_available = true);
