import { useState } from 'react';
import type { CarModel } from '../../types';

interface Props {
  models: CarModel[];
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
}

export function ModelSelector({ models, selectedIds, onConfirm }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState<Set<string>>(new Set());

  const hasSelection = selectedIds.length > 0;

  const openPicker = () => {
    setPending(new Set(hasSelection ? selectedIds : []));
    setIsOpen(true);
  };

  const closePicker = () => {
    setIsOpen(false);
    setPending(new Set());
  };

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
    closePicker();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        className="btn btn-primary model-select-trigger"
        onClick={openPicker}
      >
        {hasSelection ? 'Change selection' : 'Select model(s)'}
      </button>
    );
  }

  return (
    <div className="model-picker-panel">
      <div className="model-picker-header">
        <h3>Select vehicles</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={closePicker}>
          Cancel
        </button>
      </div>

      <div className="model-picker-body">
        <ul className="model-picker-list" role="listbox" aria-label="Available vehicles">
          {models.map((model) => (
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
          ))}
        </ul>

        <div className="model-picker-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
          >
            OK
          </button>
          <span className="model-picker-count">{pending.size} selected</span>
        </div>
      </div>
    </div>
  );
}
