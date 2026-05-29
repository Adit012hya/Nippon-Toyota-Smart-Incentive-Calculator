import { CarModelManager } from '../components/admin/CarModelManager';
import { IncentiveSlabManager } from '../components/admin/IncentiveSlabManager';

export function AdminDashboard() {
  return (
    <div className="portal-page">
      <div className="page-intro">
        <h2>Admin Portal</h2>
        <p>Manage car models and configure global incentive payout slabs.</p>
      </div>
      <CarModelManager />
      <IncentiveSlabManager />
    </div>
  );
}
