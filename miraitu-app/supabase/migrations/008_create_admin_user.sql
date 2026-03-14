-- ================================================
-- 008: Create admin user for production
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ================================================
--
-- IMPORTANT: This sets up an admin user for production access.
-- Before running this, you must create the admin user in Supabase Dashboard:
--
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Enter your admin email and a STRONG password
-- 4. Check "Auto Confirm User"
-- 5. Click "Create user"
-- 6. Copy the user's UUID from the list
-- 7. Replace 'YOUR_ADMIN_USER_UUID' below with the actual UUID
-- 8. Replace 'your-admin-email@example.com' with your actual email
-- 9. Run this SQL
--

-- Option A: If you know the UUID (from step 6 above)
-- UPDATE public.profiles
-- SET role = 'admin', updated_at = NOW()
-- WHERE id = 'YOUR_ADMIN_USER_UUID';

-- Option B: Set admin by email (simpler — works if the email is in profiles)
-- UPDATE public.profiles
-- SET role = 'admin', updated_at = NOW()
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com');

-- ================================================
-- QUICK SETUP: Uncomment ONE of the lines above,
-- replace the placeholder, and run.
--
-- Example (replace with your email):
-- UPDATE public.profiles SET role = 'admin', updated_at = NOW()
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'rajumuppidi@gmail.com');
-- ================================================

-- Verify the admin was set correctly:
-- SELECT id, full_name, email, role FROM public.profiles WHERE role = 'admin';

-- Also add RLS policy so admin can read ALL profiles (needed for admin panel)
-- This policy already works via service_role key in server actions,
-- but adding an explicit admin policy is good practice:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles'
    ) THEN
        CREATE POLICY "Admins can view all profiles" ON public.profiles
            FOR SELECT
            USING (
                auth.uid() = id
                OR EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.role = 'admin'
                )
            );
    END IF;
END $$;
