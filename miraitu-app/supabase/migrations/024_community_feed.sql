-- ─────────────────────────────────────────────────────────────────────
-- 024 — Community feed
--
-- Turns the community page from in-memory sample data into a real, shared
-- feed: posts persist, every user sees every post, and likes/comments stream
-- in over Supabase Realtime.
-- ─────────────────────────────────────────────────────────────────────


-- ── 1. Public handles on profiles ────────────────────────────────────
-- The community profile route is /home/community/user/[username], but
-- profiles had no username. Add one and backfill a stable handle.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username
    ON public.profiles (LOWER(username))
    WHERE username IS NOT NULL;

-- Backfill: slugified full name + a short id suffix so it is always unique.
UPDATE public.profiles p
SET username = LEFT(
        REGEXP_REPLACE(LOWER(COALESCE(NULLIF(TRIM(p.full_name), ''), 'farmer')), '[^a-z0-9]+', '', 'g'),
        20
    ) || '_' || SUBSTRING(REPLACE(p.id::text, '-', '') FROM 1 FOR 6)
WHERE p.username IS NULL;


-- ── 2. Posts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_posts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content     TEXT NOT NULL DEFAULT '',
    images      TEXT[] NOT NULL DEFAULT '{}',
    video       TEXT,
    location    TEXT,
    tags        TEXT[] NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_created  ON public.community_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user     ON public.community_posts (user_id, created_at DESC);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Community posts are readable by everyone" ON public.community_posts;
CREATE POLICY "Community posts are readable by everyone"
    ON public.community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert their own posts" ON public.community_posts;
CREATE POLICY "Users insert their own posts"
    ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update their own posts" ON public.community_posts;
CREATE POLICY "Users update their own posts"
    ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete their own posts" ON public.community_posts;
CREATE POLICY "Users delete their own posts"
    ON public.community_posts FOR DELETE USING (auth.uid() = user_id);


-- ── 3. Reactions (one per user per post) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_reactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- like | love | celebrate | insightful | funny | growth
    type        TEXT NOT NULL DEFAULT 'like',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_reactions_post ON public.community_reactions (post_id);

ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reactions are readable by everyone" ON public.community_reactions;
CREATE POLICY "Reactions are readable by everyone"
    ON public.community_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage their own reactions" ON public.community_reactions;
CREATE POLICY "Users manage their own reactions"
    ON public.community_reactions FOR ALL
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── 4. Comments (one level of replies via parent_id) ─────────────────
CREATE TABLE IF NOT EXISTS public.community_comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id   UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post ON public.community_comments (post_id, created_at);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are readable by everyone" ON public.community_comments;
CREATE POLICY "Comments are readable by everyone"
    ON public.community_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert their own comments" ON public.community_comments;
CREATE POLICY "Users insert their own comments"
    ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete their own comments" ON public.community_comments;
CREATE POLICY "Users delete their own comments"
    ON public.community_comments FOR DELETE USING (auth.uid() = user_id);


-- ── 5. Profiles must be publicly readable for the feed ───────────────
-- Author name/avatar are joined onto every post, and the people directory
-- lists everyone who has created a profile.
DROP POLICY IF EXISTS "Profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Profiles are readable by everyone"
    ON public.profiles FOR SELECT USING (true);


-- ── 6. Realtime ──────────────────────────────────────────────────────
-- Lets clients subscribe to inserts/updates so likes, comments and new
-- posts appear without a refresh.
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reactions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
