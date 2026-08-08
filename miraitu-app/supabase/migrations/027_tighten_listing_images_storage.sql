-- ─────────────────────────────────────────────────────────────────────
-- 027 — Stop clients enumerating the `listing-images` bucket
--
-- Supabase flags: "Clients can list all files in this bucket — a broad SELECT
-- policy on storage.objects allows clients to retrieve a full list of files."
--
-- Why it is safe to remove:
--   • The bucket is PUBLIC, so files are served from
--     /storage/v1/object/public/listing-images/... which bypasses RLS.
--     Every existing image URL keeps working.
--   • Nothing in the app calls storage.list() — verified across the codebase.
--   • The SELECT policy only ever enabled enumeration, which exposed the
--     per-user UUID folders and every uploaded file path.
--
-- What is deliberately kept:
--   • INSERT. `uploadListingImages()` in src/lib/supabase-db.ts uploads with
--     the BROWSER client (machinery sell flow), so it needs an insert policy.
--     The lease/community uploads go through the service-role client and
--     bypass RLS either way.
-- ─────────────────────────────────────────────────────────────────────


-- ── 1. Drop any SELECT policy scoped to this bucket ──────────────────
-- Policy names differ between projects, so match on the bucket instead.
-- Only cmd = 'SELECT' is touched; INSERT/UPDATE/DELETE and any 'ALL'
-- policy are left alone so uploads cannot break.
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename  = 'objects'
          AND cmd        = 'SELECT'
          AND COALESCE(qual, '') LIKE '%listing-images%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
        RAISE NOTICE 'Dropped storage SELECT policy: %', pol.policyname;
    END LOOP;
END $$;


-- ── 2. Guarantee uploads still work ──────────────────────────────────
-- Recreated explicitly so the browser upload path is not left depending on
-- whichever policy happened to exist before.
DROP POLICY IF EXISTS "listing_images_insert" ON storage.objects;
CREATE POLICY "listing_images_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'listing-images');


-- ─────────────────────────────────────────────────────────────────────
-- After running, confirm in the dashboard that the
-- "Clients can list all files in this bucket" warning is gone, then load any
-- existing listing image to confirm public URLs still resolve.
--
-- If the warning persists, the offending policy is probably scoped with
-- `cmd = ALL` rather than SELECT. Check with:
--
--   SELECT policyname, cmd, qual
--   FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects';
--
-- and drop the ALL policy by name, replacing it with the INSERT policy above.
-- ─────────────────────────────────────────────────────────────────────
