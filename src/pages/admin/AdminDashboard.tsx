import { useMemo, useState } from 'react';
import { useBestPerformer, MONTHS } from '../../hooks/useBestPerformer';
import { useIncentiveSlabs } from '../../hooks/useIncentiveSlabs';
import { formatCurrency } from '../../lib/incentive';
import { SlabPreview } from '../../components/admin/SlabPreview';
import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
} from '../../components/ui/StatusMessages';

const currentDate = new Date();
const defaultMonth = currentDate.getMonth() + 1;
const defaultYear = currentDate.getFullYear();

export function AdminDashboard() {
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);

  const { slabs, loading: slabsLoading, error: slabsError } = useIncentiveSlabs();
  const { performers, best, loading, error, fetchPerformers, monthLabel } =
    useBestPerformer(month, year);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = defaultYear - 2; y <= defaultYear + 1; y++) list.push(y);
    return list;
  }, []);

  return (
    <div className="portal-page">
      <div className="page-intro">
        <h2>Admin Dashboard</h2>
        <p>Overview of top sales performance and current incentive tiers.</p>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Best performer</h2>
            <p>Highest total units sold for the selected period.</p>
          </div>

          <div className="month-picker">
            <label htmlFor="dash-month">Month</label>
            <select
              id="dash-month"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            >
              {MONTHS.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <label htmlFor="dash-year">Year</label>
            <select
              id="dash-year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <ErrorAlert message={error} onRetry={() => void fetchPerformers()} />
          )}

          {loading ? (
            <LoadingSpinner message="Loading rankings…" />
          ) : !best ? (
            <EmptyState
              title="No sales data yet"
              description={`No saved entries for ${monthLabel} ${year}.`}
            />
          ) : (
            <div className="best-performer-card">
              <span className="performer-badge">Top performer</span>
              <p className="performer-name">{best.displayName}</p>
              {best.employeeId && (
                <p className="performer-emp-id">Employee ID: {best.employeeId}</p>
              )}
              <div className="performer-stats">
                <div>
                  <span className="stat-label">Total units</span>
                  <span className="stat-value">{best.totalUnits}</span>
                </div>
                <div>
                  <span className="stat-label">Incentive earned</span>
                  <span className="stat-value">{formatCurrency(best.totalPayout)}</span>
                </div>
                <div>
                  <span className="stat-label">Slab rate</span>
                  <span className="stat-value stat-value-sm">{best.slabLabel}</span>
                </div>
              </div>
            </div>
          )}

          {!loading && performers.length > 1 && (
            <div className="leaderboard">
              <h3>All officers — {monthLabel} {year}</h3>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Employee ID</th>
                      <th>Units</th>
                      <th>Incentive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performers.map((p, i) => (
                      <tr key={p.officerId} className={i === 0 ? 'row-highlight' : ''}>
                        <td>{i + 1}</td>
                        <td>{p.displayName}</td>
                        <td>{p.employeeId ?? '—'}</td>
                        <td>{p.totalUnits}</td>
                        <td>{formatCurrency(p.totalPayout)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Live incentive slab preview</h2>
            <p>Current global payout tiers (read-only).</p>
          </div>
          {slabsError && <ErrorAlert message={slabsError} />}
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
