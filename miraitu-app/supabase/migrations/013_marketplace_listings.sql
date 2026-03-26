-- ================================================
-- MARKETPLACE LISTINGS TABLE
-- Unified table for machinery, crops, and livestock listings
-- ================================================

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('machinery', 'crops', 'livestock')),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    description TEXT,
    price NUMERIC NOT NULL,
    unit TEXT,
    location TEXT NOT NULL,
    district TEXT,
    state TEXT,
    images TEXT[] DEFAULT '{}',
    specs JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'sold', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can read active listings
CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings
    FOR SELECT USING (status = 'active');

-- Users can view their own listings regardless of status
CREATE POLICY "Users can view own listings" ON public.marketplace_listings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own listings
CREATE POLICY "Users can create listings" ON public.marketplace_listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings" ON public.marketplace_listings
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings" ON public.marketplace_listings
    FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_listings_type ON public.marketplace_listings(listing_type);
CREATE INDEX idx_listings_user ON public.marketplace_listings(user_id);
CREATE INDEX idx_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_listings_category ON public.marketplace_listings(category);

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload to their own folder
CREATE POLICY "Users can upload listing images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'listing-images' AND
        auth.role() = 'authenticated'
    );

-- Storage policy: anyone can view listing images
CREATE POLICY "Anyone can view listing images" ON storage.objects
    FOR SELECT USING (bucket_id = 'listing-images');

-- Orders table for shop tracking
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL UNIQUE,
    items JSONB NOT NULL DEFAULT '[]',
    subtotal NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    shipping_address JSONB NOT NULL DEFAULT '{}',
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
