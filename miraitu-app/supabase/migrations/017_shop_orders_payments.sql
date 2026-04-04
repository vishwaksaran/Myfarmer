-- ===============================================================
-- SHOP ORDERS + RAZORPAY PAYMENTS
-- Migration 017
-- ===============================================================

CREATE TABLE IF NOT EXISTS public.shop_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL UNIQUE,
    checkout_attempt_id UUID NOT NULL UNIQUE,
    shipping_address JSONB NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_method TEXT NOT NULL DEFAULT 'razorpay' CHECK (payment_method IN ('razorpay')),
    payment_status TEXT NOT NULL DEFAULT 'payment_pending'
        CHECK (payment_status IN ('payment_pending', 'paid', 'failed', 'refunded')),
    order_status TEXT NOT NULL DEFAULT 'created'
        CHECK (order_status IN ('created', 'paid', 'packed', 'dispatched', 'in_transit', 'delivered', 'cancelled', 'payment_failed', 'refunded')),
    transporter_name TEXT,
    tracking_id TEXT,
    tracking_url TEXT,
    admin_notes TEXT,
    paid_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shop_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shop_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES public.shop_orders(id) ON DELETE CASCADE,
    checkout_attempt_id UUID NOT NULL UNIQUE,
    razorpay_order_id TEXT NOT NULL UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created'
        CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    failure_reason TEXT,
    gateway_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    captured_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shop_order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('system', 'user', 'admin', 'webhook')),
    actor_id UUID,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_event_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.shop_orders(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    source_event_id TEXT UNIQUE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.shop_orders(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    source_event_id TEXT UNIQUE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_user_id_created_at
    ON public.shop_orders(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shop_orders_payment_status
    ON public.shop_orders(payment_status);

CREATE INDEX IF NOT EXISTS idx_shop_orders_order_status
    ON public.shop_orders(order_status);

CREATE INDEX IF NOT EXISTS idx_shop_order_items_order_id
    ON public.shop_order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_shop_order_events_order_id_created_at
    ON public.shop_order_events(order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id_created_at
    ON public.user_notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at
    ON public.admin_notifications(created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_shop_orders_updated_at ON public.shop_orders;
CREATE TRIGGER trg_shop_orders_updated_at
BEFORE UPDATE ON public.shop_orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_shop_payments_updated_at ON public.shop_payments;
CREATE TRIGGER trg_shop_payments_updated_at
BEFORE UPDATE ON public.shop_payments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on shop_orders"
    ON public.shop_orders FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can read own shop_orders"
    ON public.shop_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on shop_order_items"
    ON public.shop_order_items FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can read own shop_order_items"
    ON public.shop_order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.shop_orders o
            WHERE o.id = shop_order_items.order_id
              AND o.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access on shop_payments"
    ON public.shop_payments FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can read own shop_payments"
    ON public.shop_payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.shop_orders o
            WHERE o.id = shop_payments.order_id
              AND o.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access on shop_order_events"
    ON public.shop_order_events FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can read own shop_order_events"
    ON public.shop_order_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.shop_orders o
            WHERE o.id = shop_order_events.order_id
              AND o.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access on user_notifications"
    ON public.user_notifications FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can read own notifications"
    ON public.user_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.user_notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on admin_notifications"
    ON public.admin_notifications FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
