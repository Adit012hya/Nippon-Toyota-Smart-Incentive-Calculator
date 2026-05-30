import { useState } from 'react';
import { useCarModels } from '../../hooks/useCarModels';
import { useToast } from '../../context/ToastContext';
import type { CarModel } from '../../types';
import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
} from '../ui/StatusMessages';

const emptyForm = { model_name: '', base_suffix: '', variant: '' };

export function CarModelManager() {
  const { showToast } = useToast();
  const { models, loading, error, addModel, updateModel, deleteModel, fetchModels } =
    useCarModels();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const handleAdd = async () => {
    if (!form.model_name.trim() || !form.base_suffix.trim() || !form.variant.trim()) {
      showToast('All fields are required.', 'error');
      return;
    }
    const ok = await addModel({
      model_name: form.model_name.trim(),
      base_suffix: form.base_suffix.trim(),
      variant: form.variant.trim(),
    });
    if (ok) {
      setForm(emptyForm);
      showToast('Car model added.');
    } else {
      showToast('Failed to add car model.', 'error');
    }
  };

  const startEdit = (model: CarModel) => {
    setEditingId(model.id);
    setEditForm({
      model_name: model.model_name,
      base_suffix: model.base_suffix,
      variant: model.variant,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleSaveEdit = async (id: string) => {
    const ok = await updateModel(id, {
      model_name: editForm.model_name.trim(),
      base_suffix: editForm.base_suffix.trim(),
      variant: editForm.variant.trim(),
    });
    if (ok) {
      setEditingId(null);
      showToast('Car model updated.');
    } else {
      showToast('Failed to update car model.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const ok = await deleteModel(id);
    if (ok) showToast('Car model deleted.');
    else showToast('Failed to delete car model.', 'error');
  };

  return (
    <section className="panel model-config-panel">
      {error && (
        <ErrorAlert
          message={error}
          onRetry={() => void fetchModels()}
        />
      )}

      <div className="add-form-grid">
        <input
          placeholder="Model name (e.g. Innova Crysta)"
          value={form.model_name}
          onChange={(e) => setForm({ ...form, model_name: e.target.value })}
        />
        <input
          placeholder="Base suffix (e.g. IC)"
          value={form.base_suffix}
          onChange={(e) => setForm({ ...form, base_suffix: e.target.value })}
        />
        <input
          placeholder="Variant (e.g. GX)"
          value={form.variant}
          onChange={(e) => setForm({ ...form, variant: e.target.value })}
        />
        <button type="button" className="btn btn-primary" onClick={() => void handleAdd()}>
          Add model
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading car models…" />
      ) : models.length === 0 ? (
        <EmptyState
          title="No car models yet"
          description="Add your first car model using the form above."
        />
      ) : (
        <div className="model-records">
          <div className="model-records-head">
            <span>Model name</span>
            <span>Suffix</span>
            <span>Variant</span>
            <span>Actions</span>
          </div>
          {models.map((model) => (
            <div key={model.id} className="model-record-row">
              {editingId === model.id ? (
                <>
                  <input
                    value={editForm.model_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, model_name: e.target.value })
                    }
                    aria-label="Model name"
                  />
                  <input
                    value={editForm.base_suffix}
                    onChange={(e) =>
                      setEditForm({ ...editForm, base_suffix: e.target.value })
                    }
                    aria-label="Base suffix"
                  />
                  <input
                    value={editForm.variant}
                    onChange={(e) =>
                      setEditForm({ ...editForm, variant: e.target.value })
                    }
                    aria-label="Variant"
                  />
                  <div className="model-record-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => void handleSaveEdit(model.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="model-record-name">{model.model_name}</span>
                  <span className="model-record-suffix">{model.base_suffix}</span>
                  <span className="model-record-variant">{model.variant}</span>
                  <div className="model-record-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => startEdit(model)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => void handleDelete(model.id, model.model_name)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
