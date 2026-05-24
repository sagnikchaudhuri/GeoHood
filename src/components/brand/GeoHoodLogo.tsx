import React from 'react';

/**
 * GeoHoodLogoMark — renders the official GeoHood PNG logo.
 * The image already contains the shield illustration.
 * Uses object-contain so the full mark is visible at any size.
 */
interface LogoMarkProps {
  /** Height in px (width auto-scales with aspect ratio). Default: 40 */
  size?: number;
}

export function GeoHoodLogoMark({ size = 40 }: LogoMarkProps) {
  return (
    <img
      src="/geohood-logo.png"
      alt="GeoHood"
      draggable={false}
      style={{
        height:     size,
        width:      'auto',
        objectFit:  'contain',
        display:    'block',
        flexShrink: 0,
      }}
    />
  );
}

/**
 * GeoHoodLogoFull — the official logo image at a larger display size.
 * Since the uploaded PNG already contains both the shield mark and the
 * "GeoHood" wordmark, no additional text is rendered alongside it.
 */
interface LogoFullProps {
  /** Height in px. Default: 80 */
  size?: number;
}

export function GeoHoodLogoFull({ size = 80 }: LogoFullProps) {
  return (
    <img
      src="/geohood-logo.png"
      alt="GeoHood"
      draggable={false}
      style={{
        height:    size,
        width:     'auto',
        objectFit: 'contain',
        display:   'block',
      }}
    />
  );
}
