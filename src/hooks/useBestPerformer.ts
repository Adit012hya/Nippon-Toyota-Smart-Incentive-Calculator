import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { calculateIncentive, formatCurrency } from '../lib/incentive';
import { getDisplayName, getEmployeeIdLabel } from '../lib/profileDisplay';
import type { IncentiveSlab } from '../types';

export interface PerformerRow {
  officerId: string;
  displayName: string;
  employeeId: string | null;
  email: string;
  totalUnits: number;
  totalPayout: number;
  slabLabel: string;
}

interface ProfileJoin {
  email: string;
  full_name?: string;
  employee_id?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parseProfile(
  raw: ProfileJoin | ProfileJoin[] | null
): ProfileJoin {
  if (Array.isArray(raw)) {
    return raw[0] ?? { email: 'Unknown', full_name: '', employee_id: '' };
  }
  return raw ?? { email: 'Unknown', full_name: '', employee_id: '' };
}

async function fetchSalesWithProfiles(month: number, year: number) {
  const extended = await supabase
    .from('sales_entries')
    .select('officer_id, units_sold, profiles ( email, full_name, employee_id )')
    .eq('month', month)
    .eq('year', year);

  if (!extended.error) return extended;

  const msg = extended.error.message.toLowerCase();
  if (
    msg.includes('full_name') ||
    msg.includes('employee_id') ||
    msg.includes('does not exist')
  ) {
    return supabase
      .from('sales_entries')
      .select('officer_id, units_sold, profiles ( email )')
      .eq('month', month)
      .eq('year', year);
  }

  return extended;
}

export function useBestPerformer(month: number, year: number) {
  const [performers, setPerformers] = useState<PerformerRow[]>([]);
  const [best, setBest] = useState<PerformerRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: entries, error: entriesError }, { data: slabs, error: slabsError }] =
        await Promise.all([
          fetchSalesWithProfiles(month, year),
          supabase.from('incentive_slabs').select('*').order('order'),
        ]);

      if (entriesError) throw entriesError;
      if (slabsError) throw slabsError;

      const slabList = (slabs as IncentiveSlab[]) ?? [];
      const totals = new Map<
        string,
        { profile: ProfileJoin; totalUnits: number }
      >();

      for (const row of entries ?? []) {
        const officerId = row.officer_id as string;
        const profile = parseProfile(
          row.profiles as ProfileJoin | ProfileJoin[] | null
        );
        const units = (row.units_sold as number) ?? 0;

        const existing = totals.get(officerId);
        if (existing) {
          existing.totalUnits += units;
        } else {
          totals.set(officerId, { profile, totalUnits: units });
        }
      }

      const rows: PerformerRow[] = Array.from(totals.entries()).map(
        ([officerId, { profile, totalUnits }]) => {
          const result = calculateIncentive(totalUnits, slabList);
          const slabLabel = result.matchedSlab
            ? formatCurrency(result.payoutPerCar) + '/car'
            : '—';
          const profileForDisplay = {
            email: profile.email,
            full_name: profile.full_name ?? '',
            employee_id: profile.employee_id ?? '',
          };
          return {
            officerId,
            displayName: getDisplayName(profileForDisplay),
            employeeId: getEmployeeIdLabel(profileForDisplay),
            email: profile.email,
            totalUnits,
            totalPayout: result.totalPayout,
            slabLabel,
          };
        }
      );

      rows.sort((a, b) => b.totalUnits - a.totalUnits || b.totalPayout - a.totalPayout);
      setPerformers(rows);
      setBest(rows[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performer data.');
      setPerformers([]);
      setBest(null);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void fetchPerformers();
  }, [fetchPerformers]);

  return { performers, best, loading, error, fetchPerformers, monthLabel: MONTHS[month - 1] };
}

export { MONTHS };
