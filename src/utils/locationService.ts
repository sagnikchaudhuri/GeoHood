import { LOCALITIES, haversineKm } from '../data/localities';

/* ── Fallback coordinates — Patuli, Kolkata ────────────────────────────── */
export const PATULI_FALLBACK_LAT = 22.4651;
export const PATULI_FALLBACK_LNG = 88.3804;

/* ── Mock reverse geocoding ─────────────────────────────────────────────── */
/**
 * Given GPS coords, return the id of the nearest known locality.
 * Prepared for future swap to Google Maps Geocoding API — just replace
 * the body with an API call and return the matching locality id.
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
  return nearestId;
}

/* ── Result type ────────────────────────────────────────────────────────── */
export type LocationResult =
  | { status: 'granted'; lat: number; lng: number; localityId: string }
  | { status: 'denied' }
  | { status: 'unavailable' };

/* ── Request geolocation from browser ──────────────────────────────────── */
export function requestGeolocation(): Promise<LocationResult> {
  return new Promise(resolve => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ status: 'unavailable' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const localityId = mockReverseGeocode(lat, lng);
        resolve({ status: 'granted', lat, lng, localityId });
      },
      () => {
        resolve({ status: 'denied' });
      },
      { timeout: 8000, maximumAge: 300_000, enableHighAccuracy: false },
    );
  });
}
