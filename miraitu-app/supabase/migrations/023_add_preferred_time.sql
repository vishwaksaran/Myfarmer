-- ================================================
-- ADD preferred_time TO SERVICE BOOKINGS
-- Stores the customer's preferred time slot for a booking
-- (e.g. "Morning (8 AM – 11 AM)"). Complements preferred_date.
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ================================================

ALTER TABLE public.service_bookings
    ADD COLUMN IF NOT EXISTS preferred_time TEXT;
