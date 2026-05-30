import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Profile, UserRole } from '../../types';
import { UserProfileWidget } from './UserProfileWidget';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/car-models', label: 'Car Models' },
  { to: '/admin/incentive-slabs', label: 'Incentive Slabs' },
];

const OFFICER_NAV: NavItem[] = [
  { to: '/officer', label: 'Sales Entry', end: true },
  { to: '/officer/history', label: 'History' },
];

interface Props {
  role: UserRole;
  profile: Profile;
}

export function PortalNav({ role, profile }: Props) {
  const { signOut } = useAuth();
  const items = role === 'admin' ? ADMIN_NAV : OFFICER_NAV;

  return (
    <nav className="portal-nav" aria-label="Main navigation">
      <div className="portal-nav-links">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `portal-nav-link${isActive ? ' portal-nav-link-active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <UserProfileWidget profile={profile} onSignOut={signOut} />
    </nav>
  );
}
