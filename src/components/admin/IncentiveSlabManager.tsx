import { useEffect, useState } from 'react';
import { useIncentiveSlabs } from '../../hooks/useIncentiveSlabs';
import { validateSlabs } from '../../lib/slabValidation';
import type { SlabDraft } from '../../types';
import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
  SuccessAlert,
} from '../ui/StatusMessages';

function slabsToDrafts(
  slabs: { id: string; min_units: number; max_units: number | null; payout_per_car: number; order: number }[]
): SlabDraft[] {
  return slabs.map(({ id, min_units, max_units, payout_per_car, order }) => ({
    id,
    min_units,
    max_units,
    payout_per_car,
    order,
  }));
}

function newSlabDraft(order: number, prevMax: number | null): SlabDraft {
  const min = prevMax !== null ? prevMax + 1 : 1;
  return {
    min_units: min,
    max_units: min + 2,
    payout_per_car: 1000,
    order,
  };
}

export function IncentiveSlabManager() {
  const { slabs, loading, error, saving, fetchSlabs, saveAllSlabs } = useIncentiveSlabs();
  const [drafts, setDrafts] = useState<SlabDraft[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (slabs.length > 0) {
      setDrafts(slabsToDrafts(slabs));
    }
  }, [slabs]);

  const sortedDrafts = [...drafts].sort((a, b) => a.order - b.order);

  const updateDraft = (index: number, updates: Partial<SlabDraft>) => {
    setDrafts((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      sorted[index] = { ...sorted[index], ...updates };
      return sorted;
    });
    setValidationErrors([]);
    setSuccess(null);
  };

  const addSlab = () => {
    const sorted = [...sortedDrafts];
    const last = sorted[sorted.length - 1];
    const prevMax = last?.max_units ?? null;
    const nextOrder = (last?.order ?? 0) + 1;
    setDrafts([...sorted, newSlabDraft(nextOrder, prevMax)]);
    setValidationErrors([]);
    setSuccess(null);
  };

  const removeSlab = (index: number) => {
    const sorted = [...sortedDrafts];
    sorted.splice(index, 1);
    setDrafts(sorted.map((s, i) => ({ ...s, order: i + 1 })));
    setValidationErrors([]);
    setSuccess(null);
  };

  const handleSave = async () => {
    const normalized = sortedDrafts.map((s, i) => ({ ...s, order: i + 1 }));
    const result = validateSlabs(normalized);
    setValidationErrors(result.errors);

    if (!result.valid) return;

    const ok = await saveAllSlabs(normalized);
    if (ok) {
      setSuccess('Incentive slabs saved successfully.');
      setValidationErrors([]);
    }
  };

  return (
    <>
      {error && <ErrorAlert message={error} onRetry={() => void fetchSlabs()} />}
      {success && <SuccessAlert message={success} />}
      {validationErrors.length > 0 && (
        <div className="alert alert-error" role="alert">
          <ul className="validation-list">
            {validationErrors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading slabs…" />
      ) : drafts.length === 0 ? (
        <EmptyState
          title="No incentive slabs configured"
          description="Add your first slab to define payout tiers."
          action={
            <button type="button" className="btn btn-primary" onClick={addSlab}>
              Add first slab
            </button>
          }
        />
      ) : (
        <>
          <div className="slab-editor">
            {sortedDrafts.map((slab, index) => (
              <div key={slab.id ?? `draft-${index}`} className="slab-row">
                <span className="slab-order">#{index + 1}</span>
                <label>
                  Min units
                  <input
                    type="number"
                    min={1}
                    value={slab.min_units}
                    onChange={(e) =>
                      updateDraft(index, { min_units: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                </label>
                <label>
                  Max units
                  <input
                    type="number"
                    min={slab.min_units}
                    placeholder="∞ (unlimited)"
                    value={slab.max_units ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft(index, {
                        max_units: val === '' ? null : parseInt(val, 10) || 0,
                      });
                    }}
                  />
                </label>
                <label>
                  Payout / car (₹)
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={slab.payout_per_car}
                    onChange={(e) =>
                      updateDraft(index, {
                        payout_per_car: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </label>
                <div className="slab-actions">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeSlab(index)}
                    disabled={sortedDrafts.length <= 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="panel-actions">
            <button type="button" className="btn btn-ghost" onClick={addSlab}>
              + Add slab
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save slabs'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
