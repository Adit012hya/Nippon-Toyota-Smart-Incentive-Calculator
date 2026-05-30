import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Profile } from '../../types';

interface Props {
  profile: Profile;
  onSignOut: () => Promise<void>;
}

export function UserProfileWidget({ profile, onSignOut }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // As requested: show specific display names for admin and officer
  const displayName = profile.role === 'admin' ? 'Admin' : 'Alex D.';
  const subtitle = 'Free plan';

  const handleSignOut = async () => {
    await onSignOut();
    navigate('/login', { replace: true });
  };

  const isAdmin = profile.role === 'admin';

  const initial = (displayName && displayName[0]) || profile.full_name?.[0] || 'A';

  return (
    <div className="user-profile-widget">
      {/* Popup Panel */}
      {isOpen && (
        <div className="profile-popup">
          <div className="profile-popup-content">
            <div className="profile-email">{profile.email}</div>
            <div className={`profile-badge profile-badge-${isAdmin ? 'admin' : 'officer'}`}>
              {isAdmin ? 'ADMIN' : 'OFFICER'}
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => void handleSignOut()}
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="profile-bar-wrap">
        <button
          type="button"
          className="profile-bar"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={`Profile menu for ${displayName}`}
        >
          <div className="profile-left">
            <div className="profile-avatar" aria-hidden>
              {initial.toUpperCase()}
            </div>
            <div className="profile-meta">
              <div className="profile-name">{displayName}</div>
              <div className="profile-subtitle">{subtitle}</div>
            </div>
          </div>

          <div className="profile-actions">
            <button type="button" className="btn btn-ghost btn-icon" aria-label="Downloads">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="17" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            <span className="profile-chevron" aria-hidden>
              {isOpen ? '⌃' : '⌄'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
