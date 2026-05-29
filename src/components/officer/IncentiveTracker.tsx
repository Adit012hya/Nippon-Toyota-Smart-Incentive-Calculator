import { formatCurrency, formatSlabRange } from '../../lib/incentive';
import type { IncentiveResult } from '../../types';

interface Props {
  result: IncentiveResult;
}

export function IncentiveTracker({ result }: Props) {
  const {
    totalUnits,
    matchedSlab,
    payoutPerCar,
    totalPayout,
    nextSlab,
    unitsToNextSlab,
    progressPercent,
  } = result;

  return (
    <aside className="incentive-panel">
      <h2>Real-Time Incentive Tracker</h2>

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

      {nextSlab && unitsToNextSlab !== null && unitsToNextSlab > 0 && (
        <div className="progress-section">
          <div className="progress-header flex-between">
            <span>
              {unitsToNextSlab} unit{unitsToNextSlab === 1 ? '' : 's'} to next tier
            </span>
            <span className="muted">
              {formatSlabRange(nextSlab.min_units, nextSlab.max_units)} →{' '}
              {formatCurrency(nextSlab.payout_per_car)}/car
            </span>
          </div>
          <div className="progress-bar" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {!nextSlab && matchedSlab && totalUnits > 0 && (
        <p className="top-tier-badge">You&apos;re at the highest incentive tier!</p>
      )}

      {totalUnits === 0 && (
        <p className="muted">Enter unit counts below to see your projected incentive.</p>
      )}

      <div className="breakdown-box">
        <h3>Breakdown</h3>
        <dl className="breakdown-list">
          <div>
            <dt>Total units</dt>
            <dd>{totalUnits}</dd>
          </div>
          <div>
            <dt>Slab range</dt>
            <dd>
              {matchedSlab
                ? formatSlabRange(matchedSlab.min_units, matchedSlab.max_units)
                : 'No slab matched'}
            </dd>
          </div>
          <div>
            <dt>Per-unit payout</dt>
            <dd>{formatCurrency(payoutPerCar)}</dd>
          </div>
          <div className="breakdown-total">
            <dt>Final incentive</dt>
            <dd>{formatCurrency(totalPayout)}</dd>
          </div>
        </dl>
        {matchedSlab && totalUnits > 0 && (
          <p className="formula-note">
            {formatCurrency(payoutPerCar)} × {totalUnits} units ={' '}
            {formatCurrency(totalPayout)}
          </p>
        )}
      </div>
    </aside>
  );
}
