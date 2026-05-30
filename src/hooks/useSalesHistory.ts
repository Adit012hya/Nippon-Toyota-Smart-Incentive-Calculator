import { useCallback, useEffect, useState } from 'react';
import { requireSupabase } from '../lib/supabase';
import { calculateIncentive, formatCurrency } from '../lib/incentive';
import type { CarModel, IncentiveSlab, SalesEntry } from '../types';

export interface SalesPeriod {
  month: number;
  year: number;
  totalUnits: number;
  totalPayout: number;
}

export interface HistoryDetail {
  period: SalesPeriod;
  entries: (SalesEntry & { model?: CarModel })[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatPeriod(month: number, year: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}

export function useSalesHistory(officerId: string | undefined) {
  const [periods, setPeriods] = useState<SalesPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = useCallback(async () => {
    if (!officerId) return;
    setLoading(true);
    setError(null);
    try {
      const [{ data: entries, error: entriesError }, { data: slabs, error: slabsError }] =
        await Promise.all([
          requireSupabase()
            .from('sales_entries')
            .select('month, year, units_sold')
            .eq('officer_id', officerId),
          requireSupabase().from('incentive_slabs').select('*').order('order'),
        ]);

      if (entriesError) throw entriesError;
      if (slabsError) throw slabsError;

      const slabList = (slabs as IncentiveSlab[]) ?? [];
      const periodMap = new Map<string, number>();

      for (const row of entries ?? []) {
        const key = `${row.year}-${row.month}`;
        periodMap.set(key, (periodMap.get(key) ?? 0) + (row.units_sold as number));
      }

      const result: SalesPeriod[] = Array.from(periodMap.entries()).map(
        ([key, totalUnits]) => {
          const [yearStr, monthStr] = key.split('-');
          const year = parseInt(yearStr, 10);
          const month = parseInt(monthStr, 10);
          const incentive = calculateIncentive(totalUnits, slabList);
          return {
            month,
            year,
            totalUnits,
            totalPayout: incentive.totalPayout,
          };
        }
      );

      result.sort((a, b) => b.year - a.year || b.month - a.month);
      setPeriods(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales history.');
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  }, [officerId]);

  const fetchPeriodDetail = useCallback(
    async (month: number, year: number): Promise<HistoryDetail | null> => {
      if (!officerId) return null;
      try {
        const [{ data: entries, error: entriesError }, { data: models, error: modelsError }] =
          await Promise.all([
            requireSupabase()
              .from('sales_entries')
              .select('*')
              .eq('officer_id', officerId)
              .eq('month', month)
              .eq('year', year)
              .gt('units_sold', 0),
            requireSupabase().from('car_models').select('*'),
          ]);

        if (entriesError) throw entriesError;
        if (modelsError) throw modelsError;

        const modelMap = new Map(
          ((models as CarModel[]) ?? []).map((m) => [m.id, m])
        );

        const enriched = ((entries as SalesEntry[]) ?? []).map((e) => ({
          ...e,
          model: modelMap.get(e.car_model_id),
        }));

        const totalUnits = enriched.reduce((s, e) => s + e.units_sold, 0);
        const { data: slabs } = await requireSupabase()
          .from('incentive_slabs')
          .select('*')
          .order('order');
        const incentive = calculateIncentive(
          totalUnits,
          (slabs as IncentiveSlab[]) ?? []
        );

        return {
          period: {
            month,
            year,
            totalUnits,
            totalPayout: incentive.totalPayout,
          },
          entries: enriched,
        };
      } catch {
        return null;
      }
    },
    [officerId]
  );

  useEffect(() => {
    void fetchPeriods();
  }, [fetchPeriods]);

  return { periods, loading, error, fetchPeriods, fetchPeriodDetail };
}

export { MONTHS, formatCurrency };
