import { BrandLogo } from './BrandLogo';

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="header-brand">
        <BrandLogo variant="header" />
        <div>
          <h1>Incentive Hub</h1>
        </div>
      </div>
    </header>
  );
}
