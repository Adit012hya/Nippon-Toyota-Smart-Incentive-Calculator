import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCarModelsPage } from './pages/admin/AdminCarModelsPage';
import { AdminIncentiveSlabsPage } from './pages/admin/AdminIncentiveSlabsPage';
import { OfficerSalesPage } from './pages/officer/OfficerSalesPage';
import { OfficerHistoryPage } from './pages/officer/OfficerHistoryPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={<ProtectedRoute allowedRole="admin" />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="car-models" element={<AdminCarModelsPage />} />
            <Route path="incentive-slabs" element={<AdminIncentiveSlabsPage />} />
          </Route>
          <Route
            path="/officer"
            element={<ProtectedRoute allowedRole="sales_officer" />}
          >
            <Route index element={<OfficerSalesPage />} />
            <Route path="history" element={<OfficerHistoryPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
