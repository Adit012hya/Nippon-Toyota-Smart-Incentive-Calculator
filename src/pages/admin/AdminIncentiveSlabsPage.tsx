import { IncentiveSlabManager } from '../../components/admin/IncentiveSlabManager';

export function AdminIncentiveSlabsPage() {
  return (
    <div className="portal-page">
      <div className="page-intro">
        <h2>Incentive Slab Configuration</h2>
        <p>Define and manage global tiered payout slabs for all sales officers.</p>
      </div>
      <IncentiveSlabManager />
    </div>
  );
}
