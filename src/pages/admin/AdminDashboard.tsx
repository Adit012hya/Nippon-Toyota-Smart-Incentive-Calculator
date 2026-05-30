import { useCarModels } from '../../hooks/useCarModels';
import { useIncentiveSlabs } from '../../hooks/useIncentiveSlabs';
import { SlabPreview } from '../../components/admin/SlabPreview';
import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
} from '../../components/ui/StatusMessages';

export function AdminDashboard() {
  const {
    models,
    loading: modelsLoading,
    error: modelsError,
    fetchModels,
  } = useCarModels();

  const {
    slabs,
    loading: slabsLoading,
    error: slabsError,
    fetchSlabs,
  } = useIncentiveSlabs();

  const error = modelsError ?? slabsError;

  return (
    <div className="portal-page">
      <div className="page-intro">
        <h2>Admin Dashboard</h2>
        <p>Overview of active vehicle models and incentive slabs.</p>
      </div>

      {error && (
        <ErrorAlert
          message={error}
          onRetry={() => {
            if (modelsError) void fetchModels();
            if (slabsError) void fetchSlabs();
          }}
        />
      )}

      <div className="dashboard-grid">
        {/* Car Models Panel */}
        <section className="panel">
          <div className="panel-header">
            <h2>Active Car Models</h2>
            <p>List of vehicles currently active for sales tracking.</p>
          </div>

          {modelsLoading ? (
            <LoadingSpinner message="Loading car models…" />
          ) : models.length === 0 ? (
            <EmptyState
              title="No car models"
              description="Click 'Car Models' in the menu to add one."
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Model Name</th>
                    <th>Base Suffix</th>
                    <th>Variant</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <tr key={model.id}>
                      <td>{model.model_name}</td>
                      <td>{model.base_suffix}</td>
                      <td>{model.variant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Incentive Slab Preview Panel */}
        <section className="panel">
          <div className="panel-header">
            <h2>Live Incentive Slab Preview</h2>
            <p>Current global payout tiers (read-only).</p>
          </div>
          {slabsLoading ? (
            <LoadingSpinner message="Loading slabs…" />
          ) : (
            <SlabPreview slabs={slabs} title="" emptyMessage="No slabs configured." />
          )}
        </section>
      </div>
    </div>
  );
}

