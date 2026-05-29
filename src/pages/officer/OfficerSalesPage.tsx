import { SalesEntryForm } from '../../components/officer/SalesEntryForm';

export function OfficerSalesPage() {
  return (
    <div className="portal-page">
      <div className="page-intro">
        <h2>Monthly Sales Entry</h2>
        <p>Record units sold per model and track your incentive in real time.</p>
      </div>
      <SalesEntryForm />
    </div>
  );
}
