export function LogoMark({ className = '', size = 200 }) {
  return (
    <img
      src="/assets/imag1.png"
      alt="Notez logo mark"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}

export function LogoText({ className = '', size = 360 }) {
  return (
    <img
      src="/assets/logo.png"
      alt="Notez"
      width={size}
      height={size * (120 / 420)}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}

export function LogoLockup({ markSize = 44, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={markSize} />
      <span className="text-xl font-extrabold tracking-tight">
        Note<span className="text-brand-500">z</span>
      </span>
    </span>
  );
}