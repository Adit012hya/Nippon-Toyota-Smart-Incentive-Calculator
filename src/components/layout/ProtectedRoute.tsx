import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ToastProvider } from '../../context/ToastContext';
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
      <PortalNav role={profile.role} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );

  if (allowedRole === 'sales_officer') {
    return <ToastProvider>{shell}</ToastProvider>;
  }

  return shell;
}
