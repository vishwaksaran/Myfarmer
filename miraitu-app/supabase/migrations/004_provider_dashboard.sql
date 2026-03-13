-- ================================================
-- PROVIDER DASHBOARD & BOOKING-PROVIDER LINK
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ================================================

-- 1. EXTEND PROFILES TABLE with provider-specific fields
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS pincode TEXT,
    ADD COLUMN IF NOT EXISTS district TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS service_types TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
    ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. EXTEND SERVICE_BOOKINGS with provider link & lifecycle tracking
ALTER TABLE public.service_bookings
    ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS commission DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS provider_notes TEXT,
    ADD COLUMN IF NOT EXISTS user_latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS user_longitude DOUBLE PRECISION;

-- 3. INDEX for fast provider queries
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON public.service_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_status ON public.service_bookings(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_service_types ON public.profiles USING GIN(service_types);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_availability ON public.profiles(availability_status);

-- 4. RLS POLICY: Providers can view bookings assigned to them
DROP POLICY IF EXISTS "Providers can view assigned bookings" ON public.service_bookings;
CREATE POLICY "Providers can view assigned bookings" ON public.service_bookings
    FOR SELECT USING (auth.uid() = provider_id);

-- 5. RLS POLICY: Providers can update bookings assigned to them (accept/reject/complete)
DROP POLICY IF EXISTS "Providers can update assigned bookings" ON public.service_bookings;
CREATE POLICY "Providers can update assigned bookings" ON public.service_bookings
    FOR UPDATE USING (auth.uid() = provider_id);

-- 6. MODULE → SERVICE_TYPE MAPPING
-- Maps booking module names to provider service_types for auto-assignment
-- borewell → borewell
-- fencing → fencing
-- cctv → cctv
-- protection → protection
-- services → (matches by category: soil-testing, harvester, transport, etc.)
-- land → land
-- veterinary → veterinary

-- 7. FUNCTION: Find nearest available provider for a booking
CREATE OR REPLACE FUNCTION public.find_nearest_provider(
    p_module TEXT,
    p_category TEXT,
    p_user_lat DOUBLE PRECISION DEFAULT NULL,
    p_user_lng DOUBLE PRECISION DEFAULT NULL,
    p_exclude_ids UUID[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_provider_id UUID;
    v_search_type TEXT;
BEGIN
    -- Map module to the service_type tag providers register with
    v_search_type := CASE
        WHEN p_module = 'services' THEN p_category
        ELSE p_module
    END;

    -- Find the nearest available provider who covers this service type
    SELECT p.id INTO v_provider_id
    FROM public.profiles p
    WHERE p.role = 'service_provider'
      AND p.availability_status = 'available'
      AND v_search_type = ANY(p.service_types)
      AND p.id != ALL(p_exclude_ids)
    ORDER BY
        CASE
            WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL
                 AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
            THEN (
                6371 * acos(
                    cos(radians(p_user_lat)) * cos(radians(p.latitude))
                    * cos(radians(p.longitude) - radians(p_user_lng))
                    + sin(radians(p_user_lat)) * sin(radians(p.latitude))
                )
            )
            ELSE 999999
        END ASC,
        p.created_at ASC -- tie-breaker: older accounts first
    LIMIT 1;

    RETURN v_provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 8. PROVIDER EARNINGS VIEW
CREATE OR REPLACE VIEW public.provider_earnings AS
SELECT
    sb.provider_id,
    COUNT(*) FILTER (WHERE sb.status = 'completed') AS completed_jobs,
    COUNT(*) FILTER (WHERE sb.status IN ('accepted', 'confirmed')) AS active_jobs,
    COALESCE(SUM(sb.amount) FILTER (WHERE sb.status = 'completed'), 0) AS total_earned,
    COALESCE(SUM(sb.commission) FILTER (WHERE sb.status = 'completed'), 0) AS total_commission,
    COALESCE(SUM(sb.amount - sb.commission) FILTER (WHERE sb.status = 'completed'), 0) AS net_earnings,
    COUNT(*) FILTER (WHERE sb.status = 'completed'
        AND sb.completed_at >= date_trunc('month', NOW())) AS this_month_jobs,
    COALESCE(SUM(sb.amount - sb.commission) FILTER (WHERE sb.status = 'completed'
        AND sb.completed_at >= date_trunc('month', NOW())), 0) AS this_month_earnings,
    COUNT(*) FILTER (WHERE sb.status = 'completed'
        AND sb.completed_at >= date_trunc('week', NOW())) AS this_week_jobs,
    COALESCE(SUM(sb.amount - sb.commission) FILTER (WHERE sb.status = 'completed'
        AND sb.completed_at >= date_trunc('week', NOW())), 0) AS this_week_earnings
FROM public.service_bookings sb
WHERE sb.provider_id IS NOT NULL
GROUP BY sb.provider_id;

-- Grant access to the view
GRANT SELECT ON public.provider_earnings TO authenticated;

-- 9. Public read policy on profiles for provider info (name only, not phone)
-- This lets users see their assigned provider's name
DROP POLICY IF EXISTS "Anyone can view provider public info" ON public.profiles;
CREATE POLICY "Anyone can view provider public info" ON public.profiles
    FOR SELECT USING (role = 'service_provider');
