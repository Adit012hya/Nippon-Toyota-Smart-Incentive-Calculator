import { useMemo, useState } from 'react';
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

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function OfficerHistoryPage() {
  const { profile } = useAuth();
  const { periods, loading, error, fetchPeriods, fetchPeriodDetail } =
    useSalesHistory(profile?.id);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const summary = useMemo(() => {
    const totalUnits = periods.reduce((sum, p) => sum + p.totalUnits, 0);
    const totalPayout = periods.reduce((sum, p) => sum + p.totalPayout, 0);
    return {
      months: periods.length,
      totalUnits,
      totalPayout,
    };
  }, [periods]);

  const togglePeriod = async (month: number, year: number) => {
    const key = `${year}-${month}`;
    if (expandedKey === key) {
      setExpandedKey(null);
      setDetail(null);
      setDetailKey(null);
      return;
    }

    setExpandedKey(key);
    setDetail(null);
    setDetailKey(null);
    setDetailLoading(true);
    const data = await fetchPeriodDetail(month, year);
    setDetail(data);
    setDetailKey(key);
    setDetailLoading(false);
  };

  return (
    <div className="portal-page history-page">
      <div className="page-intro">
        <h2>Sales History</h2>
        <p>Review your saved monthly sales and incentive payouts.</p>
      </div>

      {error && (
        <ErrorAlert message={error} onRetry={() => void fetchPeriods()} />
      )}

      {loading ? (
        <div className="panel history-loading-panel">
          <LoadingSpinner message="Loading history…" />
        </div>
      ) : periods.length === 0 ? (
        <section className="panel">
          <EmptyState
            title="No saved entries yet"
            description="Save a monthly sales entry from the Sales Entry page to see it here."
          />
        </section>
      ) : (
        <>
          <div className="history-summary-grid">
            <div className="history-summary-card">
              <span className="history-summary-label">Months saved</span>
              <span className="history-summary-value">{summary.months}</span>
            </div>
            <div className="history-summary-card">
              <span className="history-summary-label">Total units</span>
              <span className="history-summary-value">{summary.totalUnits}</span>
            </div>
            <div className="history-summary-card history-summary-card-highlight">
              <span className="history-summary-label">Total earned</span>
              <span className="history-summary-value">
                {formatCurrency(summary.totalPayout)}
              </span>
            </div>
          </div>

          <ul className="history-list">
            {periods.map((period) => {
              const key = `${period.year}-${period.month}`;
              const isOpen = expandedKey === key;
              const detailReady = detailKey === key && detail !== null;

              return (
                <li
                  key={key}
                  className={`history-item${isOpen ? ' history-item-expanded' : ''}`}
                >
                  <button
                    type="button"
                    className="history-item-header"
                    onClick={() => void togglePeriod(period.month, period.year)}
                    aria-expanded={isOpen}
                  >
                    <div className="history-period-badge">
                      <span className="history-period-month">
                        {MONTH_SHORT[period.month - 1]}
                      </span>
                      <span className="history-period-year">{period.year}</span>
                    </div>

                    <div className="history-item-body">
                      <span className="history-period-title">
                        {formatPeriod(period.month, period.year)}
                      </span>
                      <div className="history-metrics">
                        <span className="history-metric">
                          <span className="history-metric-label">Units</span>
                          <span className="history-metric-value">
                            {period.totalUnits}
                          </span>
                        </span>
                        <span className="history-metric history-metric-payout">
                          <span className="history-metric-label">Incentive</span>
                          <span className="history-metric-value">
                            {formatCurrency(period.totalPayout)}
                          </span>
                        </span>
                      </div>
                    </div>

                    <span className="history-chevron" aria-hidden="true">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d={isOpen ? 'M6 14l6-6 6 6' : 'M6 10l6 6 6-6'}
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="history-detail">
                      {detailLoading && detailKey !== key ? (
                        <LoadingSpinner message="Loading details…" />
                      ) : detailReady ? (
                        <>
                          <div className="history-detail-summary">
                            <span>
                              {detail.entries.length} vehicle
                              {detail.entries.length === 1 ? '' : 's'} recorded
                            </span>
                            <span className="history-detail-total">
                              {formatCurrency(detail.period.totalPayout)}
                            </span>
                          </div>
                          <ul className="history-vehicle-list">
                            {detail.entries.map((entry) => (
                              <li key={entry.id} className="history-vehicle-card">
                                <div className="history-vehicle-info">
                                  <strong>
                                    {entry.model?.model_name ?? 'Unknown model'}
                                  </strong>
                                  <span className="model-meta">
                                    {entry.model
                                      ? `${entry.model.base_suffix} · ${entry.model.variant}`
                                      : '—'}
                                  </span>
                                </div>
                                <div className="history-vehicle-units">
                                  <span className="history-vehicle-units-label">
                                    Units
                                  </span>
                                  <span className="history-vehicle-units-value">
                                    {entry.units_sold}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : detailLoading ? (
                        <LoadingSpinner message="Loading details…" />
                      ) : (
                        <p className="muted">Could not load details for this period.</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
