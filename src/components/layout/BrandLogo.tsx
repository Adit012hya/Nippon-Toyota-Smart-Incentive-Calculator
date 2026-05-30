interface Props {
  variant?: 'header' | 'login' | 'hero';
  className?: string;
}

export function BrandLogo({ variant = 'header', className = '' }: Props) {
  const wrapClass =
    variant === 'hero'
      ? 'brand-logo-wrap brand-logo-wrap--hero'
      : variant === 'login'
        ? 'brand-logo-wrap brand-logo-wrap--login'
        : 'brand-logo-wrap brand-logo-wrap--header';

  const sizeClass =
    variant === 'hero'
      ? 'brand-logo-hero'
      : variant === 'login'
        ? 'brand-logo-lg'
        : 'brand-logo';

  return (
    <div className={`${wrapClass} ${className}`.trim()}>
      <img src="/toyota-logo.png" alt="Toyota" className={sizeClass} />
    </div>
  );
}
