import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { clampMonthForYear, getCurrentPeriod } from '../lib/salesPeriod';

export interface PeriodDraft {
  selectedModelIds: string[];
  unitMap: Record<string, number>;
}

interface OfficerSalesDraftContextValue {
  month: number;
  year: number;
  selectedModelIds: string[];
  unitMap: Record<string, number>;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  confirmModels: (ids: string[]) => void;
  setUnitForModel: (modelId: string, value: string) => void;
  clearDraft: () => void;
}

const OfficerSalesDraftContext = createContext<OfficerSalesDraftContextValue | null>(
  null
);

const { year: defaultYear, month: defaultMonth } = getCurrentPeriod();

function periodKey(month: number, year: number): string {
  return `${year}-${month}`;
}

function emptyDraft(): PeriodDraft {
  return { selectedModelIds: [], unitMap: {} };
}

export function OfficerSalesDraftProvider({ children }: { children: ReactNode }) {
  const [month, setMonthState] = useState(defaultMonth);
  const [year, setYearState] = useState(defaultYear);
  const [draftsByPeriod, setDraftsByPeriod] = useState<Record<string, PeriodDraft>>(
    {}
  );

  const currentKey = periodKey(month, year);
  const currentDraft = draftsByPeriod[currentKey] ?? emptyDraft();

  const setMonth = useCallback((nextMonth: number) => {
    setMonthState(clampMonthForYear(nextMonth, year));
  }, [year]);

  const setYear = useCallback((nextYear: number) => {
    setYearState(nextYear);
    setMonthState((m) => clampMonthForYear(m, nextYear));
  }, []);

  const confirmModels = useCallback(
    (ids: string[]) => {
      setDraftsByPeriod((prev) => {
        const current = prev[currentKey] ?? emptyDraft();
        const prevSelected = new Set(current.selectedModelIds);
        const nextMap: Record<string, number> = {};
        for (const id of ids) {
          nextMap[id] = prevSelected.has(id) ? (current.unitMap[id] ?? 0) : 0;
        }
        return {
          ...prev,
          [currentKey]: { selectedModelIds: ids, unitMap: nextMap },
        };
      });
    },
    [currentKey]
  );

  const setUnitForModel = useCallback(
    (modelId: string, value: string) => {
      const parsed =
        value.trim() === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
      setDraftsByPeriod((prev) => {
        const current = prev[currentKey] ?? emptyDraft();
        return {
          ...prev,
          [currentKey]: {
            ...current,
            unitMap: { ...current.unitMap, [modelId]: parsed },
          },
        };
      });
    },
    [currentKey]
  );

  const clearDraft = useCallback(() => {
    setDraftsByPeriod((prev) => ({
      ...prev,
      [currentKey]: emptyDraft(),
    }));
  }, [currentKey]);

  const value = useMemo(
    () => ({
      month,
      year,
      selectedModelIds: currentDraft.selectedModelIds,
      unitMap: currentDraft.unitMap,
      setMonth,
      setYear,
      confirmModels,
      setUnitForModel,
      clearDraft,
    }),
    [
      month,
      year,
      currentDraft,
      setMonth,
      setYear,
      confirmModels,
      setUnitForModel,
      clearDraft,
    ]
  );

  return (
    <OfficerSalesDraftContext.Provider value={value}>
      {children}
    </OfficerSalesDraftContext.Provider>
  );
}

export function useOfficerSalesDraft() {
  const ctx = useContext(OfficerSalesDraftContext);
  if (!ctx) {
    throw new Error('useOfficerSalesDraft must be used within OfficerSalesDraftProvider');
  }
  return ctx;
}
