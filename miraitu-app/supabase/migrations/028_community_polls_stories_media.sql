-- ─────────────────────────────────────────────────────────────────────
-- 028 — Polls, stories and a real media bucket
--
-- Three of the five entries in the community create menu could not reach the
-- database at all:
--
--  1. POLLS   — CreatePostModal collected poll options in React state and then
--               dropped them: onSubmit only ever passed content/images/video/tags,
--               and community_posts had nowhere to put them.
--  2. STORIES — handleCreateStory pushed base64 data URLs into component state.
--               They vanished on refresh and no other user ever saw them.
--  3. VIDEO   — videos were read with FileReader into a base64 data URL and sent
--               through a Server Action. Server Actions cap request bodies at
--               1 MB, so every real video silently failed the insert.
--
-- Poll options live on the post row (not a child table) so publishing a poll
-- stays a single atomic INSERT — a post can never exist without its options.
--
-- Requires 024, 025 and 026.
-- ─────────────────────────────────────────────────────────────────────


-- ── 1. Poll options on the post row ──────────────────────────────────
ALTER TABLE public.community_posts
    ADD COLUMN IF NOT EXISTS poll_options TEXT[] NOT NULL DEFAULT '{}';

-- Two to four options, matching what the composer allows.
ALTER TABLE public.community_posts
    DROP CONSTRAINT IF EXISTS community_posts_poll_options_len;
ALTER TABLE public.community_posts
    ADD CONSTRAINT community_posts_poll_options_len
    CHECK (CARDINALITY(poll_options) = 0 OR CARDINALITY(poll_options) BETWEEN 2 AND 4);


-- ── 2. Poll votes (one per user per post) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_poll_votes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id       UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Index into community_posts.poll_options.
    option_index  SMALLINT NOT NULL CHECK (option_index >= 0 AND option_index < 4),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_poll_votes_post
    ON public.community_poll_votes (post_id);

ALTER TABLE public.community_poll_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Poll votes are readable by everyone" ON public.community_poll_votes;
CREATE POLICY "Poll votes are readable by everyone"
    ON public.community_poll_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage their own poll votes" ON public.community_poll_votes;
CREATE POLICY "Users manage their own poll votes"
    ON public.community_poll_votes FOR ALL
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── 3. Stories (expire after 24 hours) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_stories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Public storage URL, never a data URL.
    image       TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX IF NOT EXISTS idx_community_stories_live
    ON public.community_stories (expires_at DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_stories_user
    ON public.community_stories (user_id, created_at DESC);

ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Live stories are readable by everyone" ON public.community_stories;
CREATE POLICY "Live stories are readable by everyone"
    ON public.community_stories FOR SELECT USING (expires_at > NOW());

DROP POLICY IF EXISTS "Users manage their own stories" ON public.community_stories;
CREATE POLICY "Users manage their own stories"
    ON public.community_stories FOR ALL
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── 4. Story views (the seen ring follows the user across devices) ───
CREATE TABLE IF NOT EXISTS public.community_story_views (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id    UUID NOT NULL REFERENCES public.community_stories(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (story_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_story_views_story
    ON public.community_story_views (story_id);

ALTER TABLE public.community_story_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Story views are readable by everyone" ON public.community_story_views;
CREATE POLICY "Story views are readable by everyone"
    ON public.community_story_views FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users record their own story views" ON public.community_story_views;
CREATE POLICY "Users record their own story views"
    ON public.community_story_views FOR ALL
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── 5. Media bucket ──────────────────────────────────────────────────
-- The browser uploads straight to storage rather than posting the file to an
-- API route: route handlers on Vercel cap request bodies at ~4.5 MB, which no
-- video clears. Public bucket, so reads are served without RLS.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'community-media',
    'community-media',
    TRUE,
    52428800, -- 50 MB, matching the composer's client-side limit
    ARRAY[
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
        'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/3gpp'
    ]
)
ON CONFLICT (id) DO UPDATE
SET public             = EXCLUDED.public,
    file_size_limit    = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Every object lives under <user-id>/…, so ownership is a path check.
DROP POLICY IF EXISTS "community_media_insert" ON storage.objects;
CREATE POLICY "community_media_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'community-media'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Needed so a failed post can delete the media it already uploaded, instead of
-- leaving an orphan blob behind.
DROP POLICY IF EXISTS "community_media_delete_own" ON storage.objects;
CREATE POLICY "community_media_delete_own"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'community-media'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Owner-scoped reads only. Public URLs bypass RLS, so the feed still loads;
-- this just stops clients enumerating the bucket (same reasoning as 027).
DROP POLICY IF EXISTS "community_media_select_own" ON storage.objects;
CREATE POLICY "community_media_select_own"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'community-media'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );


-- ── 6. Realtime ──────────────────────────────────────────────────────
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_poll_votes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_stories;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
