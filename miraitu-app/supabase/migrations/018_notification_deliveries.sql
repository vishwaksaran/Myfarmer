-- ===============================================================
-- NOTIFICATION DELIVERIES (EMAIL / WHATSAPP / SMS)
-- Migration 018
-- ===============================================================

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_event_id TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
    recipient TEXT,
    provider TEXT NOT NULL DEFAULT 'internal',
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    attempt_count INTEGER NOT NULL DEFAULT 1 CHECK (attempt_count >= 0),
    external_message_id TEXT,
    error_message TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source_event_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status_created_at
    ON public.notification_deliveries(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_source_event_id
    ON public.notification_deliveries(source_event_id);

DROP TRIGGER IF EXISTS trg_notification_deliveries_updated_at ON public.notification_deliveries;
CREATE TRIGGER trg_notification_deliveries_updated_at
BEFORE UPDATE ON public.notification_deliveries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on notification_deliveries"
    ON public.notification_deliveries FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');