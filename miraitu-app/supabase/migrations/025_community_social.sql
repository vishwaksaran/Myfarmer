-- ─────────────────────────────────────────────────────────────────────
-- 025 — Community social graph
--
-- Moves the last three client-only behaviours onto the server so they follow
-- the user across devices:
--   • follows      — were localStorage, so following reset on every device
--   • comment likes — were React state, so they vanished on refresh
--   • shares        — were a cosmetic counter that never left the browser
--
-- Requires 024_community_feed.sql.
-- ─────────────────────────────────────────────────────────────────────


-- ── 1. Follows ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_follows (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (follower_id, following_id),
    -- Nobody follows themselves.
    CONSTRAINT community_follows_not_self CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_community_follows_follower  ON public.community_follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_community_follows_following ON public.community_follows (following_id);

ALTER TABLE public.community_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are readable by everyone" ON public.community_follows;
CREATE POLICY "Follows are readable by everyone"
    ON public.community_follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage their own follows" ON public.community_follows;
CREATE POLICY "Users manage their own follows"
    ON public.community_follows FOR ALL
    USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);


-- ── 2. Comment likes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_comment_likes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id  UUID NOT NULL REFERENCES public.community_comments(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_comment_likes_comment
    ON public.community_comment_likes (comment_id);

ALTER TABLE public.community_comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comment likes are readable by everyone" ON public.community_comment_likes;
CREATE POLICY "Comment likes are readable by everyone"
    ON public.community_comment_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage their own comment likes" ON public.community_comment_likes;
CREATE POLICY "Users manage their own comment likes"
    ON public.community_comment_likes FOR ALL
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── 3. Shares ────────────────────────────────────────────────────────
-- A share is an event, not a toggle, so there is deliberately no unique
-- constraint — sharing the same post twice counts twice.
CREATE TABLE IF NOT EXISTS public.community_shares (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    -- 'native' (OS share sheet), 'copy' (link copied), 'whatsapp', …
    channel     TEXT NOT NULL DEFAULT 'native',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_shares_post ON public.community_shares (post_id);

ALTER TABLE public.community_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shares are readable by everyone" ON public.community_shares;
CREATE POLICY "Shares are readable by everyone"
    ON public.community_shares FOR SELECT USING (true);

DROP POLICY IF EXISTS "Signed-in users can record a share" ON public.community_shares;
CREATE POLICY "Signed-in users can record a share"
    ON public.community_shares FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id));


-- ── 4. Realtime ──────────────────────────────────────────────────────
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_follows;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comment_likes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_shares;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
