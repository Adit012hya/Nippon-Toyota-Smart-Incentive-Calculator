import { useCallback, useEffect, useState } from 'react';
import { requireSupabase } from '../lib/supabase';
import type { IncentiveSlab, SlabDraft } from '../types';

export function useIncentiveSlabs() {
  const [slabs, setSlabs] = useState<IncentiveSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSlabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await requireSupabase()
        .from('incentive_slabs')
        .select('*')
        .order('order');

      if (fetchError) throw fetchError;
      setSlabs((data as IncentiveSlab[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incentive slabs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlabs();
  }, [fetchSlabs]);

  const saveAllSlabs = async (drafts: SlabDraft[]): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      const { error: deleteError } = await requireSupabase()
        .from('incentive_slabs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) throw deleteError;

      const toInsert = drafts.map(({ min_units, max_units, payout_per_car, order }) => ({
        min_units,
        max_units,
        payout_per_car,
        order,
      }));

      const { error: insertError } = await requireSupabase()
        .from('incentive_slabs')
        .insert(toInsert);

      if (insertError) throw insertError;
      await fetchSlabs();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save incentive slabs.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { slabs, loading, error, saving, fetchSlabs, saveAllSlabs };
}
