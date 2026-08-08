-- ─────────────────────────────────────────────────────────────────────
-- 026 — Community follow-ups to 024
--
-- Two problems introduced/left open by 024:
--
--  1. PRIVACY: 024 replaced the owner-only SELECT policy on `profiles` with
--     a public one so the feed could join author names. But `profiles` also
--     holds `phone`, so that made every user's phone number readable by any
--     signed-in (or anonymous) client through the REST API. The community
--     server actions read profiles with the service-role client, which
--     bypasses RLS entirely — the public policy was never actually needed.
--
--  2. USERNAMES: 024 backfilled handles for existing profiles, but the
--     signup trigger (`handle_new_user`) does not set one. Every account
--     created after 024 would get username = NULL, which breaks the profile
--     route, follow-by-handle, and the people directory links.
--
-- Run this after 024 and 025.
-- ─────────────────────────────────────────────────────────────────────


-- ── 1. Close the profile read hole ───────────────────────────────────
DROP POLICY IF EXISTS "Profiles are readable by everyone" ON public.profiles;

-- Restore owner-only reads (this is what 001 had).
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);


-- ── 2. Always give a profile a public handle ─────────────────────────
CREATE OR REPLACE FUNCTION public.generate_community_username()
RETURNS TRIGGER AS $$
DECLARE
    base TEXT;
BEGIN
    IF NEW.username IS NOT NULL AND TRIM(NEW.username) <> '' THEN
        RETURN NEW;
    END IF;

    -- Same rule as the 024 backfill: slugified name + short id suffix.
    base := LEFT(
        REGEXP_REPLACE(
            LOWER(COALESCE(NULLIF(TRIM(NEW.full_name), ''), 'farmer')),
            '[^a-z0-9]+', '', 'g'
        ),
        20
    );
    IF base = '' THEN base := 'farmer'; END IF;

    NEW.username := base || '_' || SUBSTRING(REPLACE(NEW.id::text, '-', '') FROM 1 FOR 6);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_community_username ON public.profiles;
CREATE TRIGGER set_community_username
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_community_username();

-- Catch any rows created between 024 and this migration.
UPDATE public.profiles p
SET username = LEFT(
        REGEXP_REPLACE(LOWER(COALESCE(NULLIF(TRIM(p.full_name), ''), 'farmer')), '[^a-z0-9]+', '', 'g'),
        20
    ) || '_' || SUBSTRING(REPLACE(p.id::text, '-', '') FROM 1 FOR 6)
WHERE p.username IS NULL OR TRIM(p.username) = '';
