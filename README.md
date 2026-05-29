# Smart Incentive Calculator

A React + Supabase web app for Nippon Toyota with role-based access for **Admin** and **Sales Officer** users. Admins manage car models and global incentive slabs; sales officers record monthly unit sales and see real-time incentive calculations.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, React Router
- **Backend:** Supabase (Auth, PostgreSQL, Row Level Security)

## Project structure

```
src/
├── components/
│   ├── admin/          # Car models & incentive slabs
│   ├── layout/         # Header, protected routes
│   ├── officer/        # Sales entry & incentive tracker
│   └── ui/             # Loading, empty, error states
├── context/            # Auth context
├── hooks/              # Data fetching hooks
├── lib/                # Supabase client, incentive logic
├── pages/              # Login, Admin, Sales Officer
└── types/              # Shared TypeScript types
supabase/
├── schema.sql          # Tables + RLS policies
└── seed.sql            # Sample car models & slabs
```

---

## Supabase setup (step by step)

### 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New project**.
3. Choose an organization, set a **project name** (e.g. `nippon-toyota-incentives`), set a **database password**, and pick a **region** close to your users.
4. Wait for the project to finish provisioning (~2 minutes).

### 2. Run the database schema

1. In the Supabase Dashboard, open **SQL Editor**.
2. Click **New query**.
3. Copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and paste it into the editor.
4. Click **Run**. You should see “Success” with no errors.

This creates four tables with RLS:

| Table | Purpose |
|-------|---------|
| `profiles` | User roles (`admin` / `sales_officer`) |
| `car_models` | Vehicle catalog |
| `incentive_slabs` | Global tiered payout rules |
| `sales_entries` | Monthly per-model unit counts |

### 3. Seed sample data (optional)

1. In **SQL Editor**, run [`supabase/seed.sql`](supabase/seed.sql) to insert example car models and incentive slabs.

### 4. Create users (no public signup)

Accounts are **not** self-service. Create them in the dashboard:

1. Go to **Authentication → Users → Add user → Create new user**.
2. Create an **admin** account, e.g. `admin@nippon-toyota.com`.
3. Create a **sales officer** account, e.g. `officer@nippon-toyota.com`.
4. Copy each user’s **UUID** from the users list.

Then link them to roles in **SQL Editor**:

```sql
INSERT INTO public.profiles (id, email, role) VALUES
  ('PASTE-ADMIN-UUID-HERE',    'admin@nippon-toyota.com',   'admin'),
  ('PASTE-OFFICER-UUID-HERE',  'officer@nippon-toyota.com', 'sales_officer');
```

> **Important:** Every auth user must have a matching row in `profiles`, or login will fail with a profile error.

### 5. Configure the React app

1. In Supabase Dashboard, go to **Project Settings → API**.
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
3. In this repo root, create a `.env` file:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

(See [`.env.example`](.env.example) for the template.)

### 6. Disable public signup (recommended)

1. Go to **Authentication → Providers → Email**.
2. Turn **off** “Enable sign ups” if you want to block self-registration entirely.
3. Only admins create users via the dashboard (or a future admin UI).

### 7. Run the app locally

```bash
npm install
npm run dev
```

Open [http://localhost:7236](http://localhost:7236) and sign in with the accounts you created.

---

## Roles & routing

| Role | Login redirect | Capabilities |
|------|----------------|--------------|
| `admin` | `/admin` | CRUD car models; configure/reorder incentive slabs |
| `sales_officer` | `/officer` | Enter monthly sales; live incentive tracker; save/load history |

---

## Incentive calculation

1. Sum **total units sold** across all models for the selected month.
2. Find the matching slab where `total >= min_units` and (`max_units` is null or `total <= max_units`).
3. **Total payout** = `payout_per_car × total_units`.

Example slabs (from seed data):

| Units | Payout per car |
|-------|----------------|
| 1–3   | ₹1,000         |
| 4–7   | ₹2,000         |
| 8+    | ₹3,500         |

If a sales officer sells 5 units total → slab 4–7 → ₹2,000 × 5 = **₹10,000**.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## Adding more users later

1. **Authentication → Users → Add user**
2. Insert a profile row with the correct `role`:

```sql
INSERT INTO public.profiles (id, email, role)
VALUES ('NEW-USER-UUID', 'new.officer@nippon-toyota.com', 'sales_officer');
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| “Missing Supabase environment variables” | Create `.env` with URL and anon key |
| Login works but “Failed to load profile” | Add a row in `profiles` for that user’s UUID |
| Admin can’t edit tables | Confirm `profiles.role = 'admin'` and RLS schema was applied |
| Officer can’t save entries | Check `officer_id` matches their auth UUID |
| Slab save validation errors | Ranges must start at 1, be contiguous, and only the last slab can be unlimited |

---

## License

Internal use — Nippon Toyota Smart Incentive Calculator.
