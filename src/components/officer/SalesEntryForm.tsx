import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useOfficerSalesDraft } from '../../context/OfficerSalesDraftContext';
import { useCarModels } from '../../hooks/useCarModels';
import { useIncentiveSlabs } from '../../hooks/useIncentiveSlabs';
import { useSalesEntries } from '../../hooks/useSalesEntries';
import { useToast } from '../../context/ToastContext';
import { calculateIncentive } from '../../lib/incentive';
import {
  formatPeriod,
  getAvailableMonths,
} from '../../lib/salesPeriod';
import { ModelSelector } from './ModelSelector';
import { YearSelect } from './YearSelect';
import { UnitsSoldInput } from './UnitsSoldInput';
import { IncentiveTracker } from './IncentiveTracker';
import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
} from '../ui/StatusMessages';

export function SalesEntryForm() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const {
    month,
    year,
    selectedModelIds,
    unitMap,
    setMonth,
    setYear,
    confirmModels,
    setUnitForModel,
    clearDraft,
  } = useOfficerSalesDraft();

  const { models, loading: modelsLoading, error: modelsError } = useCarModels();
  const { slabs, loading: slabsLoading, error: slabsError } = useIncentiveSlabs();
  const {
    loading: entriesLoading,
    saving,
    error: entriesError,
    fetchEntries,
    saveEntries,
  } = useSalesEntries(profile?.id);

  const [pickerOpen, setPickerOpen] = useState(false);
  const availableMonths = getAvailableMonths(year);
  const hasSelectedModels = selectedModelIds.length > 0;

  const selectedModels = useMemo(
    () => models.filter((m) => selectedModelIds.includes(m.id)),
    [models, selectedModelIds]
  );

  useEffect(() => {
    void fetchEntries(month, year);
  }, [month, year, fetchEntries]);

  const totalUnits = useMemo(
    () =>
      selectedModelIds.reduce((sum, id) => sum + (unitMap[id] ?? 0), 0),
    [selectedModelIds, unitMap]
  );

  const incentiveResult = useMemo(
    () => calculateIncentive(totalUnits, slabs),
    [totalUnits, slabs]
  );

  const handleSave = async () => {
    if (selectedModelIds.length === 0) {
      showToast('Select at least one vehicle before saving.', 'error');
      return;
    }
    const ok = await saveEntries(month, year, unitMap, selectedModelIds);
    if (ok) {
      showToast(`Sales for ${formatPeriod(month, year)} saved successfully.`);
    }
  };

  const handleClear = () => {
    clearDraft();
    showToast('Selection and entries cleared.');
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
              onChange={setYear}
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
              {!pickerOpen && (
                <div
                  className={`model-select-actions${hasSelectedModels ? '' : ' model-select-actions-single'}`}
                >
                  <button
                    type="button"
                    className="btn btn-primary model-action-btn"
                    onClick={() => setPickerOpen(true)}
                  >
                    {hasSelectedModels ? 'Change selection' : 'Select model(s)'}
                  </button>
                  {hasSelectedModels && (
                    <button
                      type="button"
                      className="btn btn-ghost model-action-btn"
                      onClick={handleClear}
                    >
                      Clear selection &amp; entries
                    </button>
                  )}
                </div>
              )}
              <ModelSelector
                models={models}
                selectedIds={selectedModelIds}
                isOpen={pickerOpen}
                onIsOpenChange={setPickerOpen}
                onConfirm={confirmModels}
              />
            </div>

            {selectedModels.length > 0 ? (
              <>
                <h3 className="selected-models-heading">Selected vehicles</h3>
                <div className="sales-vehicles">
                  <div className="sales-vehicles-head">
                    <span>Vehicle</span>
                    <span className="sales-col-units">Units sold</span>
                  </div>
                  {selectedModels.map((model) => (
                    <div key={model.id} className="sales-row">
                      <div className="model-info">
                        <strong>{model.model_name}</strong>
                        <span className="model-meta">
                          {model.base_suffix} · {model.variant}
                        </span>
                      </div>
                      <label className="units-input-label">
                        <span className="sr-only">Units sold for {model.model_name}</span>
                        <UnitsSoldInput
                          modelId={model.id}
                          value={unitMap[model.id] ?? 0}
                          onChange={setUnitForModel}
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

      <IncentiveTracker
        result={incentiveResult}
        loading={slabsLoading}
        slabsConfigured={slabs.length > 0}
      />
    </div>
  );
}
