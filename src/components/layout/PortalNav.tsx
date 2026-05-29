import { NavLink } from 'react-router-dom';
import type { UserRole } from '../../types';

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
}

export function PortalNav({ role }: Props) {
  const items = role === 'admin' ? ADMIN_NAV : OFFICER_NAV;

  return (
    <nav className="portal-nav" aria-label="Main navigation">
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
    </nav>
  );
}
