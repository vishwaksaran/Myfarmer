-- ─────────────────────────────────────────────────────────────────────
-- 029 — Live story view counts
--
-- 028 created community_story_views but left it out of the realtime
-- publication, so an author watching their own story saw a frozen viewer
-- count until they reloaded. Instagram updates it as people watch; this makes
-- ours do the same.
--
-- Also stops a story author counting as a viewer of their own story: the
-- "seen by" list should be other people, not you.
--
-- Requires 028.
-- ─────────────────────────────────────────────────────────────────────


-- ── 1. Nobody views their own story ──────────────────────────────────
-- Clear any self-views already recorded before adding the guard.
DELETE FROM public.community_story_views v
USING public.community_stories s
WHERE v.story_id = s.id
  AND v.user_id  = s.user_id;

CREATE OR REPLACE FUNCTION public.reject_self_story_view()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.community_stories s
        WHERE s.id = NEW.story_id AND s.user_id = NEW.user_id
    ) THEN
        -- Silently skip rather than error: the client marks every story it
        -- shows as seen, including the user's own, and that is not a fault.
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS skip_self_story_view ON public.community_story_views;
CREATE TRIGGER skip_self_story_view
    BEFORE INSERT ON public.community_story_views
    FOR EACH ROW
    EXECUTE FUNCTION public.reject_self_story_view();


-- ── 2. Realtime ──────────────────────────────────────────────────────
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_story_views;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
