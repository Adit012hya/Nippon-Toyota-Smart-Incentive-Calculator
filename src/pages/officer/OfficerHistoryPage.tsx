import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  useSalesHistory,
  formatPeriod,
} from '../../hooks/useSalesHistory';
import { formatCurrency } from '../../lib/incentive';
import type { HistoryDetail } from '../../hooks/useSalesHistory';
import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
} from '../../components/ui/StatusMessages';

export function OfficerHistoryPage() {
  const { profile } = useAuth();
  const { periods, loading, error, fetchPeriods, fetchPeriodDetail } =
    useSalesHistory(profile?.id);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const togglePeriod = async (month: number, year: number) => {
    const key = `${year}-${month}`;
    if (expandedKey === key) {
      setExpandedKey(null);
      setDetail(null);
      return;
    }

    setExpandedKey(key);
    setDetailLoading(true);
    const data = await fetchPeriodDetail(month, year);
    setDetail(data);
    setDetailLoading(false);
  };

  return (
    <div className="portal-page">
      <div className="page-intro">
        <h2>Sales History</h2>
        <p>View your previously saved monthly sales entries.</p>
      </div>

      <section className="panel">
        {error && <ErrorAlert message={error} onRetry={() => void fetchPeriods()} />}

        {loading ? (
          <LoadingSpinner message="Loading history…" />
        ) : periods.length === 0 ? (
          <EmptyState
            title="No saved entries yet"
            description="Save a monthly sales entry from the Sales Entry page to see it here."
          />
        ) : (
          <ul className="history-list">
            {periods.map((period) => {
              const key = `${period.year}-${period.month}`;
              const isOpen = expandedKey === key;

              return (
                <li key={key} className="history-item">
                  <button
                    type="button"
                    className="history-item-header"
                    onClick={() => void togglePeriod(period.month, period.year)}
                    aria-expanded={isOpen}
                  >
                    <span className="history-period">
                      {formatPeriod(period.month, period.year)}
                    </span>
                    <span className="history-summary">
                      {period.totalUnits} units · {formatCurrency(period.totalPayout)}
                    </span>
                    <span className="history-chevron" aria-hidden="true">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="history-detail">
                      {detailLoading ? (
                        <LoadingSpinner message="Loading details…" />
                      ) : detail ? (
                        <div className="table-wrap">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Model</th>
                                <th>Variant</th>
                                <th>Units sold</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detail.entries.map((entry) => (
                                <tr key={entry.id}>
                                  <td>{entry.model?.model_name ?? '—'}</td>
                                  <td>
                                    {entry.model
                                      ? `${entry.model.base_suffix} · ${entry.model.variant}`
                                      : '—'}
                                  </td>
                                  <td>{entry.units_sold}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="muted">Could not load details.</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
