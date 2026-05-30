import { useState } from 'react';
import { useCarModels } from '../../hooks/useCarModels';
import type { CarModel } from '../../types';
import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
  SuccessAlert,
} from '../ui/StatusMessages';

const emptyForm = { model_name: '', base_suffix: '', variant: '' };

export function CarModelManager() {
  const { models, loading, error, addModel, updateModel, deleteModel, fetchModels } =
    useCarModels();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAdd = async () => {
    setActionError(null);
    setSuccess(null);
    if (!form.model_name.trim() || !form.base_suffix.trim() || !form.variant.trim()) {
      setActionError('All fields are required.');
      return;
    }
    const ok = await addModel({
      model_name: form.model_name.trim(),
      base_suffix: form.base_suffix.trim(),
      variant: form.variant.trim(),
    });
    if (ok) {
      setForm(emptyForm);
      setSuccess('Car model added.');
    }
  };

  const startEdit = (model: CarModel) => {
    setEditingId(model.id);
    setEditForm({
      model_name: model.model_name,
      base_suffix: model.base_suffix,
      variant: model.variant,
    });
    setActionError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleSaveEdit = async (id: string) => {
    setActionError(null);
    setSuccess(null);
    const ok = await updateModel(id, {
      model_name: editForm.model_name.trim(),
      base_suffix: editForm.base_suffix.trim(),
      variant: editForm.variant.trim(),
    });
    if (ok) {
      setEditingId(null);
      setSuccess('Car model updated.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setActionError(null);
    setSuccess(null);
    const ok = await deleteModel(id);
    if (ok) setSuccess('Car model deleted.');
  };

  return (
    <>
      {(error || actionError) && (
        <ErrorAlert
          message={actionError ?? error ?? ''}
          onRetry={() => {
            setActionError(null);
            void fetchModels();
          }}
        />
      )}
      {success && <SuccessAlert message={success} />}

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
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Model name</th>
                <th>Base suffix</th>
                <th>Variant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.id}>
                  {editingId === model.id ? (
                    <>
                      <td>
                        <input
                          value={editForm.model_name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, model_name: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={editForm.base_suffix}
                          onChange={(e) =>
                            setEditForm({ ...editForm, base_suffix: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={editForm.variant}
                          onChange={(e) =>
                            setEditForm({ ...editForm, variant: e.target.value })
                          }
                        />
                      </td>
                      <td className="actions-cell">
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
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{model.model_name}</td>
                      <td>{model.base_suffix}</td>
                      <td>{model.variant}</td>
                      <td className="actions-cell">
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
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
