-- ============================================================
-- FIX: "Failed to load user profile" on sign-in
-- Run ALL of this in Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1. Table grants (required — without these, RLS policies never run)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_models TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incentive_slabs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_entries TO authenticated;

-- 2. Fix RLS recursion via security-definer helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Profiles policies — every signed-in user must read their own row
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 4. Check which auth users are missing a profile row
-- (Results appear in the output panel below)
SELECT
  u.id AS user_id,
  u.email,
  p.role AS profile_role,
  CASE WHEN p.id IS NULL THEN 'MISSING — run step 5' ELSE 'OK' END AS status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at;

-- 5. Create profile rows for your users (edit emails/roles, then run)
-- Replace emails below with the ones you created in Authentication → Users
INSERT INTO public.profiles (id, email, full_name, employee_id, role)
SELECT u.id, u.email, 'Admin User', 'NT-0001', 'admin'
FROM auth.users u
WHERE u.email = 'admin@nippon-toyota.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

INSERT INTO public.profiles (id, email, full_name, employee_id, role)
SELECT u.id, u.email, 'John Mathew', 'NT-1001', 'sales_officer'
FROM auth.users u
WHERE u.email = 'officer@nippon-toyota.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- If you used different emails, use this pattern instead:
-- INSERT INTO public.profiles (id, email, role)
-- SELECT u.id, u.email, 'admin'
-- FROM auth.users u
-- WHERE u.email = 'YOUR-EMAIL@HERE.com'
-- ON CONFLICT (id) DO NOTHING;
