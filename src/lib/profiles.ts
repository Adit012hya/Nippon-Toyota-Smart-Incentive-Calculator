import { requireSupabase } from './supabase';
import type { Profile } from '../types';

const PROFILE_FIELDS_ENABLED =
  import.meta.env.VITE_ENABLE_PROFILE_FIELDS === 'true';

/**
 * Load profile. By default only queries id, email, role (no 400 if optional
 * columns are missing). Set VITE_ENABLE_PROFILE_FIELDS=true in .env after
 * running supabase/add-profile-fields.sql.
 */
export async function fetchProfileById(userId: string): Promise<Profile> {
  const supabase = requireSupabase();

  const selectFields = PROFILE_FIELDS_ENABLED
    ? 'id, email, role, full_name, employee_id'
    : 'id, email, role';

  const { data, error } = await supabase
    .from('profiles')
    .select(selectFields)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('No profile found for this account.');
  }

  const row = data as {
    id: string;
    email: string;
    role: Profile['role'];
    full_name?: string;
    employee_id?: string;
  };

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    full_name: row.full_name ?? '',
    employee_id: row.employee_id ?? '',
  };
}

export const PROFILE_FIELDS_MIGRATION_HINT =
  'Run supabase/add-profile-fields.sql in the Supabase SQL Editor, then set VITE_ENABLE_PROFILE_FIELDS=true in .env and restart the dev server.';
