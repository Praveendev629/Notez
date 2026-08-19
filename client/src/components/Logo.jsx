export function LogoMark({ className = '', size = 200 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Notez logo mark"
    >
      <defs>
        <linearGradient id="nz-tile" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#23283c" />
          <stop offset="1" stopColor="#0c0e16" />
        </linearGradient>
        <linearGradient id="nz-pen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6b6e" />
          <stop offset="1" stopColor="#e01e26" />
        </linearGradient>
      </defs>

      <rect x="8" y="8" width="184" height="184" rx="52" fill="url(#nz-tile)" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />

      <g>
        <rect x="46" y="34" width="108" height="122" rx="20" fill="#14161f" stroke="#ff4b50" strokeWidth="8" />
        <rect x="41" y="60" width="10" height="9" rx="3" fill="#ff4b50" />
        <rect x="41" y="90" width="10" height="9" rx="3" fill="#ff4b50" />
        <rect x="41" y="120" width="10" height="9" rx="3" fill="#ff4b50" />
        <rect x="58" y="62" width="60" height="6" rx="3" fill="#ffffff" opacity="0.5" />
        <rect x="58" y="82" width="60" height="6" rx="3" fill="#ffffff" opacity="0.5" />
        <rect x="58" y="102" width="44" height="6" rx="3" fill="#ff4b50" />
        <path d="M106 158 h22 a22 22 0 0 1 -22 -22 z" fill="#ff4b50" />
      </g>

      <g transform="translate(112 148) rotate(-40)">
        <rect x="-8" y="-104" width="16" height="12" rx="4" fill="#ff4b50" />
        <rect x="-7" y="-92" width="14" height="56" rx="5" fill="url(#nz-pen)" />
        <rect x="-7" y="-20" width="14" height="20" rx="4" fill="#15181f" />
        <path d="M-7 0 L7 0 L0 18 Z" fill="#e01e26" />
      </g>
    </svg>
  );
}

export function LogoText({ className = '', size = 360 }) {
  return (
    <svg
      width={size}
      height={size * (120 / 420)}
      viewBox="0 0 420 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Notez"
    >
      <text
        x="0"
        y="60"
        fontFamily="Inter, 'Segoe UI', system-ui, sans-serif"
        fontSize="78"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="-1.5"
      >
        Note<tspan fill="#ff4b50">z</tspan>
      </text>
      <path d="M6 104 C 30 104, 300 88, 402 90" stroke="#ff4b50" strokeWidth="8" strokeLinecap="round" fill="none" />
    </svg>
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