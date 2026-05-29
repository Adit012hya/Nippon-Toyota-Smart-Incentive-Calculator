import { CarModelManager } from '../../components/admin/CarModelManager';

export function AdminCarModelsPage() {
  return (
    <div className="portal-page">
      <div className="page-intro">
        <h2>Car Model Management</h2>
        <p>Add, edit, and remove car models available for sales tracking.</p>
      </div>
      <CarModelManager />
    </div>
  );
}
