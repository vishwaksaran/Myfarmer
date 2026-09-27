-- ─────────────────────────────────────────────────────────────────────
-- 035 — Buyer requirements ("Post Your Requirement")
--
-- The homepage hero carried a "Sell Your Product" panel whose Submit
-- button had no handler at all — it collected images, a name, a category
-- and a price, and then did nothing with any of it. Meanwhile a buyer
-- arriving with something specific in mind ("used 45 HP tractor, under
-- ₹5 lakh, near Hassan") had to scroll the boards and hope.
--
-- This is the other side of the marketplace: the buyer states what they
-- want and Miraitu goes and finds it. Requirements land here, admin works
-- the list, and nothing is asked of the buyer beyond a name and a number —
-- no account, because demand is exactly what you do not want to gate.
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.buyer_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Set when the buyer happened to be signed in. Null is normal and fine.
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- What they are after
    category TEXT NOT NULL,
    product_model TEXT,
    -- 'new' | 'used' | 'any' — buyers of seed do not care, buyers of
    -- tractors care a great deal.
    condition TEXT NOT NULL DEFAULT 'any'
        CHECK (condition IN ('new', 'used', 'any')),
    quantity TEXT,
    budget TEXT,
    location TEXT,
    -- Free text rather than a date: "before Kharif sowing" and "this week"
    -- are both real answers a farmer gives.
    needed_by TEXT,
    notes TEXT,

    -- Reference photos, e.g. the part they need or the crop they want.
    images TEXT[] NOT NULL DEFAULT '{}',

    -- Who to call back
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,

    -- Admin workflow
    status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'in_progress', 'fulfilled', 'closed')),
    admin_note TEXT,
    handled_by UUID REFERENCES auth.users(id),
    handled_at TIMESTAMPTZ,

    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin works newest-first and filters by status and category.
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_status_created
    ON public.buyer_requirements (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_category
    ON public.buyer_requirements (category);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_phone
    ON public.buyer_requirements (phone);

ALTER TABLE public.buyer_requirements ENABLE ROW LEVEL SECURITY;

-- Never read from the browser. A requirement carries a phone number and
-- what someone is willing to spend, which is exactly the list a competitor
-- would want. Submissions come in through a server route running as the
-- service role, and only admin reads them back.
DROP POLICY IF EXISTS "Service role full access on buyer_requirements"
    ON public.buyer_requirements;
CREATE POLICY "Service role full access on buyer_requirements"
    ON public.buyer_requirements
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');


-- Keep updated_at honest.
CREATE OR REPLACE FUNCTION public.touch_buyer_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_buyer_requirements_updated_at
    ON public.buyer_requirements;
CREATE TRIGGER trg_buyer_requirements_updated_at
    BEFORE UPDATE ON public.buyer_requirements
    FOR EACH ROW EXECUTE FUNCTION public.touch_buyer_requirements_updated_at();
