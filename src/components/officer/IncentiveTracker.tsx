import { formatCurrency, formatSlabRange } from '../../lib/incentive';
import type { IncentiveResult } from '../../types';
import { LoadingSpinner } from '../ui/StatusMessages';

const TRACKER_HINT =
  'Select vehicles and enter unit counts to see your projected incentive.';

interface Props {
  result: IncentiveResult;
  loading?: boolean;
  slabsConfigured?: boolean;
}

export function IncentiveTracker({
  result,
  loading = false,
  slabsConfigured = true,
}: Props) {
  const { totalUnits, matchedSlab, payoutPerCar, totalPayout } = result;

  return (
    <aside className="incentive-panel" aria-live="polite">
      <h2>Real-Time Incentive Tracker</h2>
      {slabsConfigured && !loading && (
        <p className="incentive-subtitle">{TRACKER_HINT}</p>
      )}

      {loading ? (
        <LoadingSpinner message="Loading incentive slabs…" />
      ) : !slabsConfigured ? (
        <p className="muted">No incentive slabs configured yet. Ask your administrator.</p>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">Total units sold</span>
            <span className="stat-value">{totalUnits}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Matched slab</span>
            <span className="stat-value stat-value-sm">
              {matchedSlab
                ? formatSlabRange(matchedSlab.min_units, matchedSlab.max_units)
                : '—'}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Payout per car</span>
            <span className="stat-value">{formatCurrency(payoutPerCar)}</span>
          </div>
          <div className="stat-card stat-card-highlight">
            <span className="stat-label">Total incentive</span>
            <span className="stat-value">{formatCurrency(totalPayout)}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
