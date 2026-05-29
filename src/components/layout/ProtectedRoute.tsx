import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AppHeader } from './AppHeader';
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

  return (
    <div className="app-shell">
      <AppHeader
        email={profile.email}
        role={profile.role}
        onSignOut={() => void signOut()}
      />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
