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

  const isAdmin = profile.role === 'admin';
  const displayName = isAdmin ? 'Admin' : 'Alex D';

  const handleSignOut = async () => {
    await onSignOut();
    navigate('/login', { replace: true });
  };

  const initial =
    displayName[0] || profile.full_name?.[0] || profile.email[0] || 'A';

  return (
    <div className="user-profile-widget">
      {isOpen && (
        <div className="profile-popup">
          <div className="profile-popup-header">
            <span className="profile-popup-email" title={profile.email}>
              {profile.email}
            </span>
          </div>
          <div className="profile-popup-content">
            <div className={`profile-badge profile-badge-${isAdmin ? 'admin' : 'officer'}`}>
              {isAdmin ? 'ADMIN' : 'OFFICER'}
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm profile-sign-out"
              onClick={() => void handleSignOut()}
            >
              Sign out
            </button>
          </div>
        </div>
      )}

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
            </div>
          </div>

          <span className="profile-chevron" aria-hidden>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 10l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 14l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
