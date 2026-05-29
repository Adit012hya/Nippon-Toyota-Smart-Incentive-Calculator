-- Fix infinite recursion in profiles RLS
-- Run this in Supabase SQL Editor if you already applied schema.sql

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

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Recreate admin policies on other tables to use is_admin() (avoids nested profile lookups under RLS)
DROP POLICY IF EXISTS "Admins can insert car models" ON public.car_models;
DROP POLICY IF EXISTS "Admins can update car models" ON public.car_models;
DROP POLICY IF EXISTS "Admins can delete car models" ON public.car_models;

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

DROP POLICY IF EXISTS "Admins can insert incentive slabs" ON public.incentive_slabs;
DROP POLICY IF EXISTS "Admins can update incentive slabs" ON public.incentive_slabs;
DROP POLICY IF EXISTS "Admins can delete incentive slabs" ON public.incentive_slabs;

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

DROP POLICY IF EXISTS "Admins can read all sales entries" ON public.sales_entries;

CREATE POLICY "Admins can read all sales entries"
  ON public.sales_entries FOR SELECT
  TO authenticated
  USING (public.is_admin());
