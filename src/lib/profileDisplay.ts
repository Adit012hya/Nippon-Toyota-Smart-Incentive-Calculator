import type { Profile } from '../types';

export function getDisplayName(profile: Pick<Profile, 'full_name' | 'email'>): string {
  const name = profile.full_name?.trim();
  if (name) return name;
  return profile.email.split('@')[0] ?? profile.email;
}

export function getEmployeeIdLabel(profile: Pick<Profile, 'employee_id'>): string | null {
  const id = profile.employee_id?.trim();
  return id ? id : null;
}

export function formatOfficerLabel(
  profile: Pick<Profile, 'full_name' | 'email' | 'employee_id'>
): string {
  const name = getDisplayName(profile);
  const empId = getEmployeeIdLabel(profile);
  return empId ? `${name} · ${empId}` : name;
}
