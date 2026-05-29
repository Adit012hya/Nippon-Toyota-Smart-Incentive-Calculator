import { SalesEntryForm } from '../components/officer/SalesEntryForm';

export function SalesOfficerPortal() {
  return (
    <div className="portal-page">
      <div className="page-intro">
        <h2>Sales Officer Portal</h2>
        <p>Record monthly sales and track your incentive payout in real time.</p>
      </div>
      <SalesEntryForm />
    </div>
  );
}
