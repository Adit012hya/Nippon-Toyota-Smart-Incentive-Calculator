import { useMemo, useState } from 'react';
import type { CarModel } from '../../types';

interface Props {
  models: CarModel[];
  selectedIds: string[];
  isOpen: boolean;
  onIsOpenChange: (open: boolean) => void;
  onConfirm: (ids: string[]) => void;
}

function matchesSearch(model: CarModel, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = `${model.model_name} ${model.base_suffix} ${model.variant}`.toLowerCase();
  return haystack.includes(q);
}

interface PickerPanelProps {
  models: CarModel[];
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}

function ModelPickerPanel({
  models,
  selectedIds,
  onClose,
  onConfirm,
}: PickerPanelProps) {
  const hasSelection = selectedIds.length > 0;
  const [pending, setPending] = useState(
    () => new Set(hasSelection ? selectedIds : [])
  );
  const [search, setSearch] = useState('');

  const filteredModels = useMemo(
    () => models.filter((m) => matchesSearch(m, search)),
    [models, search]
  );

  const toggle = (id: string) => {
    setPending((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(Array.from(pending));
    onClose();
  };

  return (
    <div className="model-selector model-selector-open">
      <div className="model-picker-panel">
        <div className="model-picker-header">
          <h3>Select vehicles</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
        </div>

        <div className="model-picker-search">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by model, suffix, or variant…"
            aria-label="Search vehicles"
            autoFocus
          />
        </div>

        <div className="model-picker-body">
          <ul className="model-picker-list" role="listbox" aria-label="Available vehicles">
            {filteredModels.length === 0 ? (
              <li className="model-picker-empty">No vehicles match your search.</li>
            ) : (
              filteredModels.map((model) => (
                <li key={model.id}>
                  <label className="model-picker-option">
                    <input
                      type="checkbox"
                      checked={pending.has(model.id)}
                      onChange={() => toggle(model.id)}
                    />
                    <span className="model-picker-option-text">
                      <strong>{model.model_name}</strong>
                      <span className="model-meta">
                        {model.base_suffix} · {model.variant}
                      </span>
                    </span>
                  </label>
                </li>
              ))
            )}
          </ul>

          <div className="model-picker-actions">
            <button type="button" className="btn btn-primary" onClick={handleConfirm}>
              OK
            </button>
            <span className="model-picker-count">{pending.size} selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModelSelector({
  models,
  selectedIds,
  isOpen,
  onIsOpenChange,
  onConfirm,
}: Props) {
  if (!isOpen) return null;

  const selectionKey = selectedIds.join(',');

  return (
    <ModelPickerPanel
      key={selectionKey}
      models={models}
      selectedIds={selectedIds}
      onClose={() => onIsOpenChange(false)}
      onConfirm={onConfirm}
    />
  );
}
