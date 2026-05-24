import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   GeoHood Branding System — two official assets only.

   geohood-icon.png     → shield mark (no text), black background
                          Used: favicon, navbar, watermarks, compact placements

   geohood-full-logo.png → shield + GeoHood wordmark, white background
                           Used: onboarding hero, splash, welcome/loading
   ───────────────────────────────────────────────────────────────────────────── */

/* ── GeoHoodIcon ──────────────────────────────────────────────────────────────
   The shield-only icon. Use everywhere a compact brand mark is needed.
   height drives size; width auto-scales with aspect ratio.
   ─────────────────────────────────────────────────────────────────────────── */
interface IconProps {
  /** Height in px. Width auto-scales. Default: 32 */
  size?: number;
  style?: React.CSSProperties;
}

export function GeoHoodIcon({ size = 32, style }: IconProps) {
  return (
    <img
      src="/geohood-icon.png"
      alt="GeoHood"
      draggable={false}
      style={{
        height:     size,
        width:      'auto',
        objectFit:  'contain',
        display:    'block',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

/* ── GeoHoodLogoMark ─────────────────────────────────────────────────────────
   Alias of GeoHoodIcon — kept so existing usages (HomeScreen watermark etc.)
   compile without changes.
   ─────────────────────────────────────────────────────────────────────────── */
interface LogoMarkProps {
  size?: number;
}

export function GeoHoodLogoMark({ size = 32 }: LogoMarkProps) {
  return <GeoHoodIcon size={size} />;
}

/* ── GeoHoodFullLogo ─────────────────────────────────────────────────────────
   The shield + wordmark hero logo. Use only on large centred placements:
   onboarding, splash, loading screens.
   ─────────────────────────────────────────────────────────────────────────── */
interface FullLogoProps {
  /** Height in px. Width auto-scales. Default: 160 */
  size?: number;
  style?: React.CSSProperties;
}

export function GeoHoodFullLogo({ size = 160, style }: FullLogoProps) {
  return (
    <img
      src="/geohood-full-logo.png"
      alt="GeoHood"
      draggable={false}
      style={{
        height:    size,
        width:     'auto',
        objectFit: 'contain',
        display:   'block',
        ...style,
      }}
    />
  );
}

/* Alias kept for any GeoHoodLogoFull usages */
export function GeoHoodLogoFull({ size = 160 }: { size?: number }) {
  return <GeoHoodFullLogo size={size} />;
}
