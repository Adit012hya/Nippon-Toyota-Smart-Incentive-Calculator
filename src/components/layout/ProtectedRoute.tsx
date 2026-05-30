import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ToastProvider } from '../../context/ToastContext';
import { OfficerSalesDraftProvider } from '../../context/OfficerSalesDraftContext';
import { AppHeader } from './AppHeader';
import { PortalNav } from './PortalNav';
import { LoadingSpinner } from '../ui/StatusMessages';

interface Props {
  allowedRole: 'admin' | 'sales_officer';
}

export function ProtectedRoute({ allowedRole }: Props) {
  const { session, profile, role, initializing, signOut } = useAuth();

  if (initializing) {
    return (
      <div className="page-center">
        <LoadingSpinner message="Checking session…" />
      </div>
    );
  }

  if (!session || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    const redirect = role === 'admin' ? '/admin' : '/officer';
    return <Navigate to={redirect} replace />;
  }

  const shell = (
    <div className="app-shell">
      <AppHeader profile={profile} onSignOut={() => void signOut()} />
      <div className="app-body">
        <PortalNav role={profile.role} profile={profile} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );

  if (allowedRole === 'sales_officer') {
    return (
      <ToastProvider>
        <OfficerSalesDraftProvider>{shell}</OfficerSalesDraftProvider>
      </ToastProvider>
    );
  }

  return shell;
}
