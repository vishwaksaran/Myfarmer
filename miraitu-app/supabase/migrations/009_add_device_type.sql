-- ================================================
-- Add device_type and last_login_device columns to profiles
-- Tracks whether user logged in from mobile or desktop
-- ================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_login_device TEXT DEFAULT NULL;

-- device_type: 'mobile' | 'desktop' | 'tablet' (detected at login time)
-- last_login_device: more detailed user-agent info

COMMENT ON COLUMN public.profiles.device_type IS 'Device category: mobile, desktop, or tablet — updated on each login';
COMMENT ON COLUMN public.profiles.last_login_device IS 'Detailed device info from user-agent — updated on each login';
