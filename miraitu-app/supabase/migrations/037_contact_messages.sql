-- ─────────────────────────────────────────────────────────────────────
-- 037 — Contact Us messages (web only)
--
-- Companies, partners, press and investors had no way to reach Miraitu
-- other than the farmer helpline. The web site now carries a Contact Us
-- page (header + footer, desktop only — the mobile apps do not show it),
-- and every message sent from it lands here for admin to work through
-- under Admin → Enquiries.
--
-- Kept apart from buyer_requirements and listing callbacks on purpose:
-- those are farmers waiting on a phone call about something to buy; these
-- are organisations writing in, usually by email, about a partnership.
-- Different people answer them, so they get their own inbox.
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Set when the sender happened to be signed in. Null is normal.
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Who wrote in
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,

    -- 'partnership' | 'business' | 'advertising' | 'media' | 'investor'
    -- | 'support' | 'other'. Free of a CHECK so the form can grow topics
    -- without a migration; the API route validates the list.
    topic TEXT NOT NULL DEFAULT 'other',
    subject TEXT,
    message TEXT NOT NULL,

    -- Admin workflow
    status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'in_progress', 'replied', 'closed')),
    admin_note TEXT,
    handled_by UUID REFERENCES auth.users(id),
    handled_at TIMESTAMPTZ,

    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created
    ON public.contact_messages (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email
    ON public.contact_messages (email);
-- The API route rate-limits by IP over a short window.
CREATE INDEX IF NOT EXISTS idx_contact_messages_ip_created
    ON public.contact_messages (ip_address, created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Never read or written from the browser. Messages come in through a
-- server route running as the service role, and only admin reads them.
DROP POLICY IF EXISTS "Service role full access on contact_messages"
    ON public.contact_messages;
CREATE POLICY "Service role full access on contact_messages"
    ON public.contact_messages
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');


CREATE OR REPLACE FUNCTION public.touch_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contact_messages_updated_at
    ON public.contact_messages;
CREATE TRIGGER trg_contact_messages_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW EXECUTE FUNCTION public.touch_contact_messages_updated_at();
