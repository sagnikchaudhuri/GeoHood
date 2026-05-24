import { LOCALITIES, haversineKm } from '../data/localities';

/* ── Fallback coordinates — Patuli, Kolkata ─────────────────────────────── */
export const PATULI_FALLBACK_LAT = 22.4651;
export const PATULI_FALLBACK_LNG = 88.3804;

/* ── Locality display name ──────────────────────────────────────────────── */
export function getLocalityDisplayName(localityId: string): string {
  if (localityId === 'nearby_kolkata') return 'Nearby Kolkata';
  const loc = LOCALITIES.find(l => l.id === localityId);
  return loc?.name ?? 'Patuli';
}

/* ── Mock reverse geocoding ─────────────────────────────────────────────── */
/**
 * Given GPS coords, return the id of the nearest known locality.
 * Returns 'nearby_kolkata' if more than 15 km from all known localities.
 * Prepared for future swap to a real geocoding API.
 */
export function mockReverseGeocode(lat: number, lng: number): string {
  let minDist = Infinity;
  let nearestId = 'patuli';

  for (const loc of LOCALITIES) {
    const d = haversineKm(lat, lng, loc.lat, loc.lng);
    if (d < minDist) {
      minDist = d;
      nearestId = loc.id;
    }
  }

  // Outside all known localities → generic fallback
  if (minDist > 15) {
    console.log(`[GeoHood Location] Coords too far from any locality (${minDist.toFixed(1)} km) → nearby_kolkata`);
    return 'nearby_kolkata';
  }

  return nearestId;
}

/* ── Result type (used by requestGeolocation one-shot) ─────────────────── */
export type LocationResult =
  | { status: 'granted'; lat: number; lng: number; accuracy: number; localityId: string }
  | { status: 'denied' }
  | { status: 'unavailable' };

/* ── One-shot getCurrentPosition ────────────────────────────────────────── */
export function requestGeolocation(): Promise<LocationResult> {
  return new Promise(resolve => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ status: 'unavailable' });
      return;
    }

    console.log('[GeoHood Location] requestGeolocation: getCurrentPosition started');

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat      = pos.coords.latitude;
        const lng      = pos.coords.longitude;
        const accuracy = pos.coords.accuracy ?? 0;
        const localityId = mockReverseGeocode(lat, lng);
        console.log(
          `[GeoHood Location] Got fix: lat=${lat.toFixed(5)} lng=${lng.toFixed(5)}` +
          ` ±${Math.round(accuracy)}m locality=${localityId}`
        );
        resolve({ status: 'granted', lat, lng, accuracy, localityId });
      },
      err => {
        console.warn('[GeoHood Location] Permission/error:', err.code, err.message);
        resolve({ status: 'denied' });
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  });
}
