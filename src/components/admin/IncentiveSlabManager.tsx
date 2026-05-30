import { useState } from 'react';
import { useIncentiveSlabs } from '../../hooks/useIncentiveSlabs';
import { useToast } from '../../context/ToastContext';
import { validateSlabs } from '../../lib/slabValidation';
import type { IncentiveSlab, SlabDraft } from '../../types';
import { SlabPreview } from './SlabPreview';
import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
} from '../ui/StatusMessages';

function slabsToDrafts(
  slabs: Pick<
    IncentiveSlab,
    'id' | 'min_units' | 'max_units' | 'payout_per_car' | 'order'
  >[]
): SlabDraft[] {
  return slabs.map(({ id, min_units, max_units, payout_per_car, order }) => ({
    id,
    min_units,
    max_units,
    payout_per_car,
    order,
  }));
}

function sortDrafts(drafts: SlabDraft[]): SlabDraft[] {
  return [...drafts].sort((a, b) => a.order - b.order);
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
  const { showToast } = useToast();
  const { slabs, loading, error, saving, fetchSlabs, saveAllSlabs } =
    useIncentiveSlabs();
  const [draftOverrides, setDraftOverrides] = useState<SlabDraft[] | null>(null);

  const drafts = sortDrafts(draftOverrides ?? slabsToDrafts(slabs));

  const replaceDrafts = (next: SlabDraft[]) => {
    setDraftOverrides(sortDrafts(next));
  };

  const updateDraft = (index: number, updates: Partial<SlabDraft>) => {
    const sorted = sortDrafts(draftOverrides ?? slabsToDrafts(slabs));
    sorted[index] = { ...sorted[index], ...updates };
    replaceDrafts(sorted);
  };

  const addSlab = () => {
    const sorted = drafts;
    const last = sorted[sorted.length - 1];
    const prevMax = last?.max_units ?? null;
    const nextOrder = (last?.order ?? 0) + 1;
    replaceDrafts([...sorted, newSlabDraft(nextOrder, prevMax)]);
  };

  const removeSlab = (index: number) => {
    const sorted = [...drafts];
    sorted.splice(index, 1);
    replaceDrafts(sorted.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleSave = async () => {
    const normalized = drafts.map((s, i) => ({ ...s, order: i + 1 }));
    const result = validateSlabs(normalized);

    if (!result.valid) {
      showToast(result.errors[0] ?? 'Please fix slab validation errors.', 'error');
      return;
    }

    const ok = await saveAllSlabs(normalized);
    if (ok) {
      setDraftOverrides(null);
      showToast('Incentive slabs saved successfully.');
    } else {
      showToast('Failed to save incentive slabs.', 'error');
    }
  };

  return (
    <section className="panel slab-config-panel">
      {error && <ErrorAlert message={error} onRetry={() => void fetchSlabs()} />}

      {loading ? (
        <LoadingSpinner message="Loading slabs…" />
      ) : drafts.length === 0 ? (
        <EmptyState
          title="No incentive slabs configured"
          description="Add your first slab to define payout tiers for all sales officers."
          action={
            <button type="button" className="btn btn-primary" onClick={addSlab}>
              Add first slab
            </button>
          }
        />
      ) : (
        <div className="slab-config-layout">
          <div className="slab-config-main">
            <div className="slab-editor">
              <div className="slab-records-head">
                <span>Tier</span>
                <span>Min units</span>
                <span>Max units</span>
                <span>Payout / car</span>
                <span>Actions</span>
              </div>
              {drafts.map((slab, index) => (
                <div key={slab.id ?? `draft-${index}`} className="slab-row">
                  <span className="slab-order">#{index + 1}</span>
                  <label>
                    <span className="sr-only">Min units for tier {index + 1}</span>
                    <input
                      type="number"
                      min={1}
                      value={slab.min_units}
                      onChange={(e) =>
                        updateDraft(index, {
                          min_units: parseInt(e.target.value, 10) || 0,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span className="sr-only">Max units for tier {index + 1}</span>
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
                    <span className="sr-only">Payout per car for tier {index + 1}</span>
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
                      disabled={drafts.length <= 1}
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
          </div>

          <aside className="slab-config-aside">
            <SlabPreview
              slabs={drafts}
              title="Live preview"
              emptyMessage="Add slabs to see the payout tiers."
            />
            <p className="slab-config-help muted">
              Tiers apply to total units sold per month. The last tier can leave max
              units empty for unlimited.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
