-- ================================================
-- CRM VENDOR SYSTEM — Migration 014
-- Paste this into Supabase Dashboard → SQL Editor
-- ================================================

-- ──────────────────────────────────────────────────
-- 1. SHOPS TABLE
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Only service-role (admin) can access shops
CREATE POLICY "Service role full access on shops"
    ON public.shops FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Allow anon/authenticated to read active shops (for login page branding)
CREATE POLICY "Public can read active shops"
    ON public.shops FOR SELECT
    USING (status = 'active');


-- ──────────────────────────────────────────────────
-- 2. SHOP CATEGORIES
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shop_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on shop_categories"
    ON public.shop_categories FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Public can read shop_categories"
    ON public.shop_categories FOR SELECT
    USING (true);


-- ──────────────────────────────────────────────────
-- 3. SHOP ↔ CATEGORY ASSIGNMENTS (many-to-many)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_category_assignments (
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.shop_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (shop_id, category_id)
);

ALTER TABLE public.shop_category_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on shop_category_assignments"
    ON public.shop_category_assignments FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Public can read shop_category_assignments"
    ON public.shop_category_assignments FOR SELECT
    USING (true);


-- ──────────────────────────────────────────────────
-- 4. VENDOR CREDENTIALS (separate from Supabase Auth)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vendor_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,

    -- Auth fields
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,           -- bcrypt (one-way, for login verification)
    password_encrypted TEXT NOT NULL,      -- AES-256-GCM (reversible, for admin viewing)

    -- Profile fields
    display_name TEXT NOT NULL,
    email TEXT,

    -- Status & session
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'deactivated', 'suspended')),
    is_temp_password BOOLEAN NOT NULL DEFAULT true,
    session_version INTEGER NOT NULL DEFAULT 1,

    -- Tracking
    last_login TIMESTAMPTZ,
    login_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),   -- admin who created this vendor

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.vendor_credentials ENABLE ROW LEVEL SECURITY;

-- Vendor credentials are NEVER accessible from the client
-- All access goes through service-role (server actions / API routes)
CREATE POLICY "Service role full access on vendor_credentials"
    ON public.vendor_credentials FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');


-- ──────────────────────────────────────────────────
-- 5. VENDOR ACTIVITY LOG
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vendor_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendor_credentials(id) ON DELETE SET NULL,
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.vendor_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on vendor_activity_log"
    ON public.vendor_activity_log FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');


-- ──────────────────────────────────────────────────
-- 6. CRM PRODUCTS
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2),
    compare_at_price NUMERIC(10, 2),      -- original price (for showing discount)
    category_id UUID REFERENCES public.shop_categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    unit TEXT,                             -- kg, piece, litre, etc.
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'archived', 'out_of_stock')),
    created_by UUID REFERENCES public.vendor_credentials(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on crm_products"
    ON public.crm_products FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Public can view active products (for storefront)
CREATE POLICY "Public can read active crm_products"
    ON public.crm_products FOR SELECT
    USING (status = 'active');


-- ──────────────────────────────────────────────────
-- 7. PRODUCT VARIANTS
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.crm_products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                    -- e.g., "500g Pack", "1kg Pack"
    sku TEXT,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    attributes JSONB DEFAULT '{}',        -- e.g., { "weight": "500g", "type": "organic" }
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on product_variants"
    ON public.product_variants FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Public can read product_variants"
    ON public.product_variants FOR SELECT
    USING (true);


-- ──────────────────────────────────────────────────
-- 8. CRM ORDERS
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    customer_address TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shipping NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'unpaid'
        CHECK (payment_status IN ('unpaid', 'paid', 'partial', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on crm_orders"
    ON public.crm_orders FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');


-- ──────────────────────────────────────────────────
-- 9. CRM ORDER ITEMS
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.crm_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.crm_products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,           -- snapshot at order time
    variant_name TEXT,                    -- snapshot at order time
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on crm_order_items"
    ON public.crm_order_items FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');


-- ──────────────────────────────────────────────────
-- 10. INVENTORY
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.crm_products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, variant_id)
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on inventory"
    ON public.inventory FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');


-- ──────────────────────────────────────────────────
-- 11. APPROVAL LOGS
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.approval_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,            -- 'shop', 'product', 'vendor'
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,                 -- 'approved', 'rejected', 'suspended'
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.approval_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on approval_logs"
    ON public.approval_logs FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');


-- ──────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_shops_slug ON public.shops(slug);
CREATE INDEX IF NOT EXISTS idx_vendor_credentials_username ON public.vendor_credentials(username);
CREATE INDEX IF NOT EXISTS idx_vendor_credentials_shop_id ON public.vendor_credentials(shop_id);
CREATE INDEX IF NOT EXISTS idx_vendor_activity_vendor_created ON public.vendor_activity_log(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_activity_shop_created ON public.vendor_activity_log(shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_activity_action ON public.vendor_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_crm_products_shop_id ON public.crm_products(shop_id);
CREATE INDEX IF NOT EXISTS idx_crm_products_status ON public.crm_products(status);
CREATE INDEX IF NOT EXISTS idx_crm_products_category ON public.crm_products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_crm_orders_shop_created ON public.crm_orders(shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_orders_status ON public.crm_orders(status);
CREATE INDEX IF NOT EXISTS idx_crm_order_items_order_id ON public.crm_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_approval_logs_entity ON public.approval_logs(entity_type, entity_id);


-- ──────────────────────────────────────────────────
-- AUTO-UPDATE TRIGGERS (updated_at)
-- ──────────────────────────────────────────────────
-- Reuses the existing update_updated_at() function from 001_initial_schema.sql

CREATE TRIGGER update_shops_updated_at
    BEFORE UPDATE ON public.shops
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_vendor_credentials_updated_at
    BEFORE UPDATE ON public.vendor_credentials
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_crm_products_updated_at
    BEFORE UPDATE ON public.crm_products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_crm_orders_updated_at
    BEFORE UPDATE ON public.crm_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ──────────────────────────────────────────────────
-- HELPER: Generate sequential order numbers
-- ──────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.crm_order_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'ORD-' || LPAD(nextval('public.crm_order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.crm_orders
    FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();
