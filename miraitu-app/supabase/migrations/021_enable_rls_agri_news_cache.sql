-- ================================================================
-- SECURITY FIX: enable RLS on agri_news_cache
-- Resolves Supabase lint `rls_disabled_in_public` — the table was in
-- the public schema without Row-Level Security, so anyone with the
-- anon key could read/write/delete it.
--
-- SAFE: every access to this table in the app goes through the
-- service-role admin client (src/app/api/agri-news/*), which BYPASSES
-- RLS. Enabling RLS therefore blocks anonymous/public access without
-- affecting the server. No public policy is needed.
-- Run this SQL in Supabase Dashboard → SQL Editor.
-- ================================================================

ALTER TABLE public.agri_news_cache ENABLE ROW LEVEL SECURITY;

-- Explicit service-role-only policy (mirrors migration 018). The service
-- role bypasses RLS regardless; this documents intent. With RLS on and no
-- permissive policy for anon/authenticated, public access is denied.
DROP POLICY IF EXISTS "Service role full access on agri_news_cache" ON public.agri_news_cache;
CREATE POLICY "Service role full access on agri_news_cache"
    ON public.agri_news_cache FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
