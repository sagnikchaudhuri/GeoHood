import React from 'react';

interface LogoMarkProps {
  size?: number;
}

export function GeoHoodLogoMark({ size = 40 }: LogoMarkProps) {
  return (
    <svg width={size} height={size * 1.26} viewBox="0 0 100 126" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield body */}
      <path
        d="M16 5 C8 5 6 11 6 20 L10 68 C10 83 25 98 50 114 C75 98 90 83 90 68 L94 20 C94 11 92 5 84 5 Z"
        fill="#0D0D0D"
        stroke="#2A2A2A"
        strokeWidth="1.5"
      />
      {/* Maroon fill bottom-left quadrant */}
      <path
        d="M16 5 C8 5 6 11 6 20 L10 68 C10 83 25 98 50 114 L50 62 L50 5 Z"
        fill="#8B1A2A"
        opacity="0.7"
      />
      {/* Teal fill bottom-right quadrant */}
      <path
        d="M84 5 C92 5 94 11 94 20 L90 68 C90 83 75 98 50 114 L50 62 L50 5 Z"
        fill="#00C896"
        opacity="0.18"
      />
      {/* Vertical white divider */}
      <line x1="50" y1="10" x2="50" y2="110" stroke="white" strokeWidth="1.2" opacity="0.12" />
      {/* Horizontal white divider */}
      <line x1="12" y1="62" x2="88" y2="62" stroke="white" strokeWidth="1.2" opacity="0.12" />
      {/* Top-left: green column accents */}
      <rect x="22" y="22" width="5" height="34" rx="2" fill="#00C896" opacity="0.85" />
      <rect x="31" y="28" width="5" height="28" rx="2" fill="#00C896" opacity="0.6" />
      <rect x="40" y="18" width="5" height="38" rx="2" fill="#00C896" opacity="0.75" />
      {/* Top-right: teal-blue accent */}
      <circle cx="72" cy="36" r="12" fill="#1666E8" opacity="0.3" />
      <circle cx="72" cy="36" r="7" fill="#1666E8" opacity="0.5" />
      {/* Bottom maroon circle */}
      <circle cx="32" cy="85" r="10" fill="#8B1A2A" opacity="0.85" />
      <circle cx="32" cy="85" r="5" fill="#FF4D6A" opacity="0.6" />
      {/* Bottom teal circle */}
      <circle cx="68" cy="85" r="10" fill="#00C896" opacity="0.25" />
      <circle cx="68" cy="85" r="5" fill="#00C896" opacity="0.7" />
    </svg>
  );
}

interface LogoFullProps {
  size?: number;
  hideTagline?: boolean;
}

export function GeoHoodLogoFull({ size = 36, hideTagline = false }: LogoFullProps) {
  return (
    <div className="flex items-center gap-2.5">
      <GeoHoodLogoMark size={size} />
      <div className="flex flex-col">
        <span
          style={{ fontSize: size * 0.52, lineHeight: 1.1 }}
          className="font-bold tracking-tight text-[#EBEBEB]"
        >
          GeoHood
        </span>
        {!hideTagline && (
          <span
            style={{ fontSize: size * 0.28, lineHeight: 1.2 }}
            className="text-[#5C5C5C] tracking-widest uppercase font-medium"
          >
            Hyperlocal
          </span>
        )}
      </div>
    </div>
  );
}
