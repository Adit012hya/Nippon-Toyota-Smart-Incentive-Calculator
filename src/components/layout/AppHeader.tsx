interface Props {
  email: string;
  role: string;
  onSignOut: () => void;
}

export function AppHeader({ email, role, onSignOut }: Props) {
  const roleLabel = role === 'admin' ? 'Admin' : 'Sales Officer';

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
          <span className="user-email">{email}</span>
          <span className="role-pill">{roleLabel}</span>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}
