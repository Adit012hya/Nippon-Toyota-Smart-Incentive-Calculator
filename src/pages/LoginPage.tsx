import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ErrorAlert, LoadingSpinner } from '../components/ui/StatusMessages';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, role, initializing, signingIn, error, signIn, clearError } =
    useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError ?? error;

  if (!initializing && session && role) {
    return <Navigate to={role === 'admin' ? '/admin' : '/officer'} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    try {
      const userRole = await signIn(email.trim(), password);
      navigate(userRole === 'admin' ? '/admin' : '/officer', { replace: true });
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Sign in failed. Please try again.'
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark brand-mark-lg" aria-hidden="true">
            NT
          </span>
          <h1>Smart Incentive Calculator</h1>
          <p>Sign in with your Nippon Toyota account</p>
        </div>

        {initializing && (
          <div className="login-checking" role="status">
            <LoadingSpinner message="Checking session…" />
          </div>
        )}

        {displayError && (
          <ErrorAlert message={displayError} onRetry={() => { clearError(); setLocalError(null); }} />
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="login-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@nippon-toyota.com"
            disabled={signingIn}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={signingIn}
          />

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={signingIn}
          >
            {signingIn ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="login-note">
          Accounts are provisioned by your administrator. Public registration is
          disabled.
        </p>
      </div>
    </div>
  );
}
