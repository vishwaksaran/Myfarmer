-- ─────────────────────────────────────────────────────────────────────
-- 033 — Let farmers edit their own community comments
--
-- community_comments could be inserted and deleted but never updated — there
-- was no UPDATE policy and no updated_at column, so a typo in a comment was
-- permanent. This mirrors what community_posts already has (028/024).
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.community_comments
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DROP POLICY IF EXISTS "Users update their own comments" ON public.community_comments;
CREATE POLICY "Users update their own comments"
    ON public.community_comments FOR UPDATE USING (auth.uid() = user_id);
