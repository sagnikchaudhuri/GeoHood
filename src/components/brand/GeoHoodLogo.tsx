import React from 'react';

interface LogoMarkProps {
  size?: number;
}

/*
  GeoHoodLogoMark — SVG recreation of the GeoHood shield logo.

  viewBox 0 0 200 230  (aspect ≈ 1 : 1.15)

  ┌──────────────────────────────┐
  │   BUILDINGS  (top ~50 %)     │
  ├─────────────┬────────────────┤  y ≈ 113
  │  Maroon     │  Teal person   │
  │  crescent   │  (head + body) │
  └─────────────┴────────────────┘
       x < 100         x > 100
*/
export function GeoHoodLogoMark({ size = 40 }: LogoMarkProps) {
  const height = Math.round(size * 1.15);

  /* Each rendered instance needs a unique clip-path id.
     Using size is fine for this app (each usage is a different size). */
  const clipId = `gh-shield-${size}`;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 200 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M 22 3 Q 3 3 3 22 L 3 142 Q 3 194 100 228 Q 197 194 197 142 L 197 22 Q 197 3 178 3 Z" />
        </clipPath>
      </defs>

      {/* ── Shield fill (dark forest background) ── */}
      <path
        d="M 22 3 Q 3 3 3 22 L 3 142 Q 3 194 100 228 Q 197 194 197 142 L 197 22 Q 197 3 178 3 Z"
        fill="#0C1810"
      />

      {/* ── Buildings backdrop — slightly darker wash in top half ── */}
      <rect
        x="3" y="3" width="194" height="112"
        fill="#07110C"
        clipPath={`url(#${clipId})`}
      />

      {/* ════════════════════════════════════════
          BUILDINGS  (y 20 – 113)
          ════════════════════════════════════════ */}

      {/* B1 — tallest, dark forest-green, left edge */}
      <rect x="20" y="28" width="25" height="85" rx="2" fill="#1D4A2A" clipPath={`url(#${clipId})`} />
      <rect x="20" y="28" width="25" height="9"  rx="2" fill="#245C33" clipPath={`url(#${clipId})`} />
      <rect x="25" y="43" width="6" height="7"   rx="1" fill="#2DB864" opacity="0.30" clipPath={`url(#${clipId})`} />
      <rect x="34" y="43" width="6" height="7"   rx="1" fill="#2DB864" opacity="0.22" clipPath={`url(#${clipId})`} />
      <rect x="25" y="58" width="6" height="7"   rx="1" fill="#2DB864" opacity="0.25" clipPath={`url(#${clipId})`} />
      <rect x="34" y="58" width="6" height="7"   rx="1" fill="#2DB864" opacity="0.18" clipPath={`url(#${clipId})`} />

      {/* B2 — bright emerald, second from left */}
      <rect x="49" y="44" width="22" height="69" rx="2" fill="#2DB864" clipPath={`url(#${clipId})`} />
      <rect x="49" y="44" width="22" height="8"  rx="2" fill="#38D470" clipPath={`url(#${clipId})`} />
      <rect x="54" y="58" width="5" height="6"   rx="1" fill="rgba(0,0,0,0.22)" clipPath={`url(#${clipId})`} />
      <rect x="62" y="58" width="5" height="6"   rx="1" fill="rgba(0,0,0,0.22)" clipPath={`url(#${clipId})`} />
      <rect x="54" y="70" width="5" height="6"   rx="1" fill="rgba(0,0,0,0.18)" clipPath={`url(#${clipId})`} />
      <rect x="62" y="70" width="5" height="6"   rx="1" fill="rgba(0,0,0,0.18)" clipPath={`url(#${clipId})`} />

      {/* B3 — centre arch / dome (tallest column) */}
      <rect x="76" y="20" width="30" height="93" rx="2" fill="#286940" clipPath={`url(#${clipId})`} />
      {/* dome cap */}
      <path d="M 76 36 Q 91 14 106 36 Z" fill="#30834E" clipPath={`url(#${clipId})`} />
      {/* centre stripe shadow */}
      <rect x="89" y="36" width="5" height="77" rx="1" fill="rgba(0,0,0,0.16)" clipPath={`url(#${clipId})`} />
      <rect x="80" y="48" width="5" height="7"   rx="1" fill="rgba(255,255,255,0.12)" clipPath={`url(#${clipId})`} />
      <rect x="99" y="48" width="5" height="7"   rx="1" fill="rgba(255,255,255,0.10)" clipPath={`url(#${clipId})`} />
      <rect x="80" y="62" width="5" height="7"   rx="1" fill="rgba(255,255,255,0.09)" clipPath={`url(#${clipId})`} />
      <rect x="99" y="62" width="5" height="7"   rx="1" fill="rgba(255,255,255,0.07)" clipPath={`url(#${clipId})`} />

      {/* B4 — teal, right-centre */}
      <rect x="111" y="38" width="26" height="75" rx="2" fill="#007580" clipPath={`url(#${clipId})`} />
      <rect x="111" y="38" width="26" height="9"  rx="2" fill="#008F9C" clipPath={`url(#${clipId})`} />
      <rect x="116" y="53" width="5" height="7"   rx="1" fill="rgba(255,255,255,0.14)" clipPath={`url(#${clipId})`} />
      <rect x="127" y="53" width="5" height="7"   rx="1" fill="rgba(255,255,255,0.11)" clipPath={`url(#${clipId})`} />
      <rect x="116" y="66" width="5" height="7"   rx="1" fill="rgba(255,255,255,0.09)" clipPath={`url(#${clipId})`} />
      <rect x="127" y="66" width="5" height="7"   rx="1" fill="rgba(255,255,255,0.07)" clipPath={`url(#${clipId})`} />

      {/* B5 — smaller darker teal, far right */}
      <rect x="142" y="53" width="22" height="60" rx="2" fill="#005A64" clipPath={`url(#${clipId})`} />
      <rect x="147" y="64" width="5" height="6"   rx="1" fill="rgba(255,255,255,0.10)" clipPath={`url(#${clipId})`} />
      <rect x="155" y="64" width="5" height="6"   rx="1" fill="rgba(255,255,255,0.08)" clipPath={`url(#${clipId})`} />

      {/* ── Divider lines (very faint) ── */}
      <line
        x1="10" y1="113" x2="190" y2="113"
        stroke="rgba(255,255,255,0.055)" strokeWidth="1.5"
        clipPath={`url(#${clipId})`}
      />
      <line
        x1="100" y1="8" x2="100" y2="222"
        stroke="rgba(255,255,255,0.045)" strokeWidth="1.5"
        clipPath={`url(#${clipId})`}
      />

      {/* ══════════════════════════════════════
          MAROON CRESCENT  (bottom-left)
          Thick left-side arc  → C-shape
          Centre ≈ (57, 170),  outer-r = 46
          strokeWidth 18 gives ≈ 18 px thickness
          ══════════════════════════════════════ */}
      <path
        d="M 57 124 A 46 46 0 1 0 57 216"
        stroke="#8B1A2A"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
        clipPath={`url(#${clipId})`}
      />

      {/* ══════════════════════════════════════
          TEAL PERSON ICON  (bottom-right)
          Head  cx=143 cy=152  r=21
          Body  M 110 196 Q 110 173 143 173 Q 176 173 176 196
          ══════════════════════════════════════ */}
      {/* Head */}
      <circle
        cx="143" cy="152" r="21"
        fill="#00838F"
        clipPath={`url(#${clipId})`}
      />
      {/* Shoulders / body arc */}
      <path
        d="M 110 198 Q 110 173 143 173 Q 176 173 176 198"
        fill="#00838F"
        clipPath={`url(#${clipId})`}
      />

      {/* Small teal accent blocks — middle-right divider zone */}
      <rect x="164" y="116" width="14" height="7" rx="1.5"
        fill="#00838F" opacity="0.65" clipPath={`url(#${clipId})`} />
      <rect x="164" y="127" width="10" height="6" rx="1.5"
        fill="#00838F" opacity="0.45" clipPath={`url(#${clipId})`} />

      {/* ── Shield border (drawn last, on top of everything) ── */}
      <path
        d="M 22 3 Q 3 3 3 22 L 3 142 Q 3 194 100 228 Q 197 194 197 142 L 197 22 Q 197 3 178 3 Z"
        fill="none"
        stroke="rgba(180,180,180,0.3)"
        strokeWidth="2.5"
      />
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
