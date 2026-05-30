import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { BrandLogo } from '../components/layout/BrandLogo';
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
      <div className="login-page-overlay" aria-hidden="true" />

      <div className="login-layout">
        <section className="login-hero" aria-label="Welcome">
          <BrandLogo variant="hero" />
          <h1 className="login-hero-title">Incentive Hub</h1>
          <p className="login-hero-tagline">
            Where your sales performance drives real rewards.
          </p>
          <p className="login-hero-desc">
            Track monthly units, hit incentive tiers, and see your payout in real
            time — built for Nippon Toyota sales teams.
          </p>
        </section>

        <section className="login-glass-card" aria-label="Sign in">
          <div className="login-glass-inner">
            <h2 className="login-card-title">Sign in</h2>
            <p className="login-card-subtitle">Use your company account to continue</p>

            {initializing && (
              <div className="login-checking" role="status">
                <LoadingSpinner message="Checking session…" />
              </div>
            )}

            {displayError && (
              <div className="login-alert-wrap">
                <ErrorAlert
                  message={displayError}
                  onRetry={() => {
                    clearError();
                    setLocalError(null);
                  }}
                />
              </div>
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
                placeholder="you@company.com"
                disabled={signingIn || initializing || !isSupabaseConfigured}
                className="login-input"
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={signingIn || initializing || !isSupabaseConfigured}
                className="login-input"
              />

              <button
                type="submit"
                className="btn btn-login-submit"
                disabled={signingIn || initializing || !isSupabaseConfigured}
              >
                {signingIn ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="login-note">
              Accounts are provisioned by your administrator. Public registration
              is disabled.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
