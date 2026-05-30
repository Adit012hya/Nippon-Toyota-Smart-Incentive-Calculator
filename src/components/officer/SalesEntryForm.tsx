import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCarModels } from '../../hooks/useCarModels';
import { useIncentiveSlabs } from '../../hooks/useIncentiveSlabs';
import { useSalesEntries } from '../../hooks/useSalesEntries';
import { useToast } from '../../context/ToastContext';
import { calculateIncentive } from '../../lib/incentive';
import {
  clampMonthForYear,
  formatPeriod,
  getAvailableMonths,
  getCurrentPeriod,
} from '../../lib/salesPeriod';
import { ModelSelector } from './ModelSelector';
import { YearSelect } from './YearSelect';
import { IncentiveTracker } from './IncentiveTracker';
import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
} from '../ui/StatusMessages';

const { year: defaultYear, month: defaultMonth } = getCurrentPeriod();

export function SalesEntryForm() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { models, loading: modelsLoading, error: modelsError } = useCarModels();
  const { slabs, loading: slabsLoading, error: slabsError } = useIncentiveSlabs();
  const {
    entries,
    loading: entriesLoading,
    saving,
    error: entriesError,
    fetchEntries,
    saveEntries,
  } = useSalesEntries(profile?.id);

  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [unitMap, setUnitMap] = useState<Record<string, number>>({});

  const availableMonths = getAvailableMonths(year);

  const selectedModels = useMemo(
    () => models.filter((m) => selectedModelIds.includes(m.id)),
    [models, selectedModelIds]
  );

  useEffect(() => {
    setMonth((current) => clampMonthForYear(current, year));
  }, [year]);

  useEffect(() => {
    setSelectedModelIds([]);
    setUnitMap({});
    void fetchEntries(month, year);
  }, [month, year, fetchEntries]);

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
  };

  const handleModelsConfirm = (ids: string[]) => {
    setSelectedModelIds(ids);
    setUnitMap((prev) => {
      const next: Record<string, number> = {};
      for (const id of ids) {
        const saved = entries.find((e) => e.car_model_id === id);
        next[id] = prev[id] ?? saved?.units_sold ?? 0;
      }
      return next;
    });
  };

  const totalUnits = useMemo(
    () =>
      selectedModelIds.reduce((sum, id) => sum + (unitMap[id] ?? 0), 0),
    [selectedModelIds, unitMap]
  );

  const incentiveResult = useMemo(
    () => calculateIncentive(totalUnits, slabs),
    [totalUnits, slabs]
  );

  const handleUnitChange = (modelId: string, value: string) => {
    const parsed = Math.max(0, parseInt(value, 10) || 0);
    setUnitMap((prev) => ({ ...prev, [modelId]: parsed }));
  };

  const handleSave = async () => {
    if (selectedModelIds.length === 0) {
      showToast('Select at least one vehicle before saving.');
      return;
    }
    const ok = await saveEntries(month, year, unitMap, selectedModelIds);
    if (ok) {
      showToast(`Sales for ${formatPeriod(month, year)} saved successfully.`);
    }
  };

  const loading = modelsLoading || slabsLoading || entriesLoading;
  const error = modelsError ?? slabsError ?? entriesError;

  return (
    <div className="officer-layout">
      <section className="panel sales-panel">
        <div className="panel-header">
          <h2>Enter sales</h2>
          <p>Select vehicles sold this month, then enter unit counts.</p>
        </div>

        <div className="month-picker">
          <div className="period-field">
            <label htmlFor="month-select">Month</label>
            <select
              id="month-select"
              className="period-select"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            >
              {availableMonths.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="period-field">
            <label htmlFor="year-select">Year</label>
            <YearSelect
              id="year-select"
              value={year}
              onChange={handleYearChange}
            />
          </div>
        </div>

        {error && <ErrorAlert message={error} />}

        {loading ? (
          <LoadingSpinner message="Loading sales data…" />
        ) : models.length === 0 ? (
          <EmptyState
            title="No car models available"
            description="Ask your administrator to add car models first."
          />
        ) : (
          <>
            <div className="model-select-section">
              <ModelSelector
                models={models}
                selectedIds={selectedModelIds}
                onConfirm={handleModelsConfirm}
              />
            </div>

            {selectedModels.length > 0 ? (
              <>
                <h3 className="selected-models-heading">Selected vehicles</h3>
                <div className="sales-grid">
                  {selectedModels.map((model) => (
                    <div key={model.id} className="sales-row">
                      <div className="model-info">
                        <strong>{model.model_name}</strong>
                        <span className="model-meta">
                          {model.base_suffix} · {model.variant}
                        </span>
                      </div>
                      <label className="units-input-label">
                        Units sold
                        <input
                          type="number"
                          min={0}
                          value={unitMap[model.id] ?? 0}
                          onChange={(e) =>
                            handleUnitChange(model.id, e.target.value)
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="panel-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void handleSave()}
                    disabled={saving}
                  >
                    {saving ? 'Saving…' : `Save ${formatPeriod(month, year)}`}
                  </button>
                </div>
              </>
            ) : (
              <p className="muted model-select-hint">
                Click &quot;Select model(s)&quot; to choose vehicles for this month.
              </p>
            )}
          </>
        )}
      </section>

      {!slabsLoading && slabs.length > 0 && selectedModelIds.length > 0 && (
        <IncentiveTracker result={incentiveResult} />
      )}
    </div>
  );
}
