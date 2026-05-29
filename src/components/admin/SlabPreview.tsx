import { formatCurrency, formatSlabRange } from '../../lib/incentive';
import type { IncentiveSlab, SlabDraft } from '../../types';

interface Props {
  slabs: (IncentiveSlab | SlabDraft)[];
  title?: string;
  emptyMessage?: string;
}

export function SlabPreview({
  slabs,
  title = 'Incentive slab preview',
  emptyMessage = 'No slabs configured yet.',
}: Props) {
  const sorted = [...slabs].sort((a, b) => a.order - b.order);

  return (
    <div className="slab-preview-panel">
      {title ? <h3>{title}</h3> : null}
      {sorted.length === 0 ? (
        <p className="muted">{emptyMessage}</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table preview-table">
            <thead>
              <tr>
                <th>Units sold</th>
                <th>Payout per car</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((slab, i) => (
                <tr key={slab.id ?? `preview-${i}`}>
                  <td>{formatSlabRange(slab.min_units, slab.max_units)}</td>
                  <td>{formatCurrency(slab.payout_per_car)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
