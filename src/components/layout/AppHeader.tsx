import { getDisplayName, getEmployeeIdLabel } from '../../lib/profileDisplay';
import type { Profile } from '../../types';

interface Props {
  profile: Profile;
  onSignOut: () => void;
}

export function AppHeader({ profile, onSignOut }: Props) {
  const roleLabel = profile.role === 'admin' ? 'Admin' : 'Sales Officer';
  const displayName = getDisplayName(profile);
  const employeeId = getEmployeeIdLabel(profile);

  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="brand-mark" aria-hidden="true">NT</span>
        <div>
          <h1>Smart Incentive Calculator</h1>
          <p className="header-subtitle">Nippon Toyota</p>
        </div>
      </div>
      <div className="header-actions">
        <div className="user-badge">
          <span className="user-display-name">{displayName}</span>
          {employeeId && (
            <span className="user-employee-id">ID: {employeeId}</span>
          )}
          <span className="user-email">{profile.email}</span>
          <span className="role-pill">{roleLabel}</span>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}
