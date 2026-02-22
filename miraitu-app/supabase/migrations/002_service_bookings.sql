-- ================================================
-- MIRAITU SERVICE BOOKINGS & ADMIN TABLES
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ================================================

-- Helper function to check if current user is admin (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. SERVICE_BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    module TEXT NOT NULL,
    category TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    preferred_date DATE,
    extra_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Anyone can insert bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.service_bookings;

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.service_bookings
    FOR SELECT USING (auth.uid() = user_id);

-- Anyone can insert bookings (including guests via anon key)
CREATE POLICY "Anyone can insert bookings" ON public.service_bookings
    FOR INSERT WITH CHECK (true);

-- Admin role can view all bookings
CREATE POLICY "Admins can view all bookings" ON public.service_bookings
    FOR SELECT USING (public.is_admin());

-- Admin role can update all bookings (status, notes)
CREATE POLICY "Admins can update all bookings" ON public.service_bookings
    FOR UPDATE USING (public.is_admin());

-- Index for fast admin queries
CREATE INDEX IF NOT EXISTS idx_bookings_module ON public.service_bookings(module);
CREATE INDEX IF NOT EXISTS idx_bookings_category ON public.service_bookings(category);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.service_bookings(created_at DESC);

-- Auto update updated_at
DROP TRIGGER IF EXISTS update_service_bookings_updated_at ON public.service_bookings;
CREATE TRIGGER update_service_bookings_updated_at
    BEFORE UPDATE ON public.service_bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- 2. Grant admin role access to profiles for admin panel user listing
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Admins can view all profiles (uses is_admin() to avoid infinite recursion)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin());
