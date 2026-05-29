-- ============================================================
-- Smart Incentive Calculator — Supabase Schema + RLS
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)
-- ============================================================

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'sales_officer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ── Car Models ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.car_models (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name  TEXT NOT NULL,
  base_suffix TEXT NOT NULL,
  variant     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read car models"
  ON public.car_models FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert car models"
  ON public.car_models FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update car models"
  ON public.car_models FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete car models"
  ON public.car_models FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── Incentive Slabs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.incentive_slabs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_units      INTEGER NOT NULL CHECK (min_units >= 1),
  max_units      INTEGER CHECK (max_units IS NULL OR max_units >= min_units),
  payout_per_car NUMERIC(12, 2) NOT NULL CHECK (payout_per_car >= 0),
  "order"        INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.incentive_slabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read incentive slabs"
  ON public.incentive_slabs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert incentive slabs"
  ON public.incentive_slabs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update incentive slabs"
  ON public.incentive_slabs FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete incentive slabs"
  ON public.incentive_slabs FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── Sales Entries ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sales_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  car_model_id UUID NOT NULL REFERENCES public.car_models(id) ON DELETE CASCADE,
  month        INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year         INTEGER NOT NULL CHECK (year >= 2020),
  units_sold   INTEGER NOT NULL DEFAULT 0 CHECK (units_sold >= 0),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (officer_id, car_model_id, month, year)
);

ALTER TABLE public.sales_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Officers can read own sales entries"
  ON public.sales_entries FOR SELECT
  TO authenticated
  USING (officer_id = auth.uid());

CREATE POLICY "Admins can read all sales entries"
  ON public.sales_entries FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Officers can insert own sales entries"
  ON public.sales_entries FOR INSERT
  TO authenticated
  WITH CHECK (officer_id = auth.uid());

CREATE POLICY "Officers can update own sales entries"
  ON public.sales_entries FOR UPDATE
  TO authenticated
  USING (officer_id = auth.uid());

CREATE POLICY "Officers can delete own sales entries"
  ON public.sales_entries FOR DELETE
  TO authenticated
  USING (officer_id = auth.uid());

-- ── Helper: auto-create profile on signup (optional) ────────
-- Skip if you pre-seed users manually via seed.sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'sales_officer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uncomment to auto-create profiles on auth signup:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Grants (required for Supabase API access) ───────────────
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_models TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incentive_slabs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_entries TO authenticated;
