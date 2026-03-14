-- ================================================
-- ONBOARDING PROFILE FIELDS
-- Adds fields collected during first-time user onboarding
-- ================================================

-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS farm_size TEXT,
    ADD COLUMN IF NOT EXISTS experience_years TEXT,
    ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- Index for quick onboarding check
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);
