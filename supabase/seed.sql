-- ============================================================
-- Seed data — run AFTER creating users in Supabase Auth
-- Replace the UUIDs below with actual auth.users IDs
-- ============================================================

-- Example car models
INSERT INTO public.car_models (model_name, base_suffix, variant) VALUES
  ('Innova Crysta', 'IC', 'GX'),
  ('Innova Crysta', 'IC', 'VX'),
  ('Fortuner', 'FT', '4x2 AT'),
  ('Fortuner', 'FT', '4x4 AT'),
  ('Glanza', 'GL', 'G'),
  ('Urban Cruiser Hyryder', 'UCH', 'S'),
  ('Camry', 'CM', 'Hybrid');

-- Example incentive slabs
INSERT INTO public.incentive_slabs (min_units, max_units, payout_per_car, "order") VALUES
  (1,  3,  1000.00, 1),
  (4,  7,  2000.00, 2),
  (8,  NULL, 3500.00, 3);

-- ── Create users manually in Supabase Dashboard ─────────────
-- Authentication → Users → Add user
--
-- Admin:
--   email: admin@nippon-toyota.com
--   password: (your secure password)
--
-- Sales Officer:
--   email: officer@nippon-toyota.com
--   password: (your secure password)
--
-- Then insert profiles (replace UUIDs with actual user IDs):
--
-- INSERT INTO public.profiles (id, email, role) VALUES
--   ('<ADMIN_USER_UUID>',  'admin@nippon-toyota.com',   'admin'),
--   ('<OFFICER_USER_UUID>', 'officer@nippon-toyota.com', 'sales_officer');
