-- ================================================
-- MIRAITU SUPABASE DATABASE SETUP
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ================================================

-- 1. PROFILES TABLE (extends auth.users with app-specific data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'farmer', -- farmer, dealer, service-provider
    farm_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'),
        NEW.phone
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- 2. SELLERS TABLE (seller registrations from become-seller page)
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_type TEXT NOT NULL, -- 'dealer', 'farmer-seller', 'service-provider'
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    business_name TEXT,
    location TEXT,
    form_data JSONB DEFAULT '{}', -- stores all form field values
    images TEXT[] DEFAULT '{}', -- array of storage URLs
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Sellers policies
CREATE POLICY "Users can view own sellers" ON public.sellers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sellers" ON public.sellers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sellers" ON public.sellers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sellers" ON public.sellers
    FOR DELETE USING (auth.uid() = user_id);


-- 3. SERVICES TABLE (services added by service providers)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    type_label TEXT,
    type_icon TEXT,
    title TEXT NOT NULL,
    description TEXT,
    price TEXT,
    unit TEXT,
    area TEXT,
    availability TEXT,
    images TEXT[] DEFAULT '{}', -- array of storage URLs
    status TEXT DEFAULT 'pending', -- pending, active, paused
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Services policies
CREATE POLICY "Users can view own services" ON public.services
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own services" ON public.services
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services" ON public.services
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services" ON public.services
    FOR DELETE USING (auth.uid() = user_id);

-- Public can view active services (for marketplace)
CREATE POLICY "Anyone can view active services" ON public.services
    FOR SELECT USING (status = 'active');


-- 4. STORAGE BUCKETS
-- Create storage buckets for seller and service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('seller-images', 'seller-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies - authenticated users can upload to their own folder
CREATE POLICY "Users can upload seller images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'seller-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view seller images" ON storage.objects
    FOR SELECT USING (bucket_id = 'seller-images');

CREATE POLICY "Users can delete own seller images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'seller-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload service images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'service-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view service images" ON storage.objects
    FOR SELECT USING (bucket_id = 'service-images');

CREATE POLICY "Users can delete own service images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'service-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );


-- 5. UPDATED_AT TRIGGER (auto-update timestamps)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_sellers_updated_at
    BEFORE UPDATE ON public.sellers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
