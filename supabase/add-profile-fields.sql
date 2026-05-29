-- ============================================================
-- REQUIRED for officer names & employee IDs (fixes login error)
-- Supabase → SQL Editor → paste ALL → Run
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT '';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS employee_id TEXT NOT NULL DEFAULT '';

-- Example: update existing officers (edit values to match your team)
UPDATE public.profiles
SET full_name = 'John Mathew', employee_id = 'NT-1001'
WHERE email = 'officer@nippon-toyota.com';

UPDATE public.profiles
SET full_name = 'Admin User', employee_id = 'NT-0001'
WHERE email = 'admin@nippon-toyota.com';

-- Verify
SELECT id, email, full_name, employee_id, role FROM public.profiles;
