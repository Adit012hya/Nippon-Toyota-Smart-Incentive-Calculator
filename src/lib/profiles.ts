import { supabase } from './supabase';
import type { Profile } from '../types';

function isMissingColumnError(err: unknown): boolean {
  const msg =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message: string }).message).toLowerCase()
      : '';
  return (
    msg.includes('full_name') ||
    msg.includes('employee_id') ||
    msg.includes('does not exist')
  );
}

/** Load profile; works before and after add-profile-fields.sql migration */
export async function fetchProfileById(userId: string): Promise<Profile> {
  const extended = await supabase
    .from('profiles')
    .select('id, email, role, full_name, employee_id')
    .eq('id', userId)
    .maybeSingle();

  if (!extended.error && extended.data) {
    return {
      id: extended.data.id,
      email: extended.data.email,
      role: extended.data.role,
      full_name: extended.data.full_name ?? '',
      employee_id: extended.data.employee_id ?? '',
    };
  }

  if (isMissingColumnError(extended.error)) {
    const basic = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', userId)
      .maybeSingle();

    if (basic.error) throw basic.error;
    if (!basic.data) {
      throw new Error('No profile found for this account.');
    }

    return {
      id: basic.data.id,
      email: basic.data.email,
      role: basic.data.role,
      full_name: '',
      employee_id: '',
    };
  }

  if (extended.error) throw extended.error;
  throw new Error('No profile found for this account.');
}

export const PROFILE_FIELDS_MIGRATION_HINT =
  'Run supabase/add-profile-fields.sql in the Supabase SQL Editor to enable officer names and employee IDs.';
