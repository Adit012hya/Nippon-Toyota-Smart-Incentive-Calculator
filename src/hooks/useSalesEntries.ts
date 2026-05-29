import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SalesEntry } from '../types';

export function useSalesEntries(officerId: string | undefined) {
  const [entries, setEntries] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(
    async (month: number, year: number) => {
      if (!officerId) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('sales_entries')
          .select('*')
          .eq('officer_id', officerId)
          .eq('month', month)
          .eq('year', year);

        if (fetchError) throw fetchError;
        setEntries((data as SalesEntry[]) ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sales entries.');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    },
    [officerId]
  );

  const saveEntries = async (
    month: number,
    year: number,
    unitMap: Record<string, number>
  ): Promise<boolean> => {
    if (!officerId) return false;
    setSaving(true);
    setError(null);
    try {
      const rows = Object.entries(unitMap).map(([car_model_id, units_sold]) => ({
        officer_id: officerId,
        car_model_id,
        month,
        year,
        units_sold,
      }));

      const { error: upsertError } = await supabase
        .from('sales_entries')
        .upsert(rows, { onConflict: 'officer_id,car_model_id,month,year' });

      if (upsertError) throw upsertError;
      await fetchEntries(month, year);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save sales entries.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { entries, loading, saving, error, fetchEntries, saveEntries };
}
