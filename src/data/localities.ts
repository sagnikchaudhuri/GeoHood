import { Locality } from '../types';

export const LOCALITIES: Locality[] = [
  { id: 'patuli',       name: 'Patuli',        district: 'Kolkata', lat: 22.4729, lng: 88.3997 },
  { id: 'garia',        name: 'Garia',          district: 'Kolkata', lat: 22.4638, lng: 88.3857 },
  { id: 'baghajatin',   name: 'Baghajatin',     district: 'Kolkata', lat: 22.4823, lng: 88.3831 },
  { id: 'jadavpur',     name: 'Jadavpur',       district: 'Kolkata', lat: 22.4984, lng: 88.3694 },
  { id: 'santoshpur',   name: 'Santoshpur',     district: 'Kolkata', lat: 22.4741, lng: 88.4098 },
  { id: 'mukundapur',   name: 'Mukundapur',     district: 'Kolkata', lat: 22.4656, lng: 88.4061 },
  { id: 'panchasayar',  name: 'Panchasayar',    district: 'Kolkata', lat: 22.4601, lng: 88.3997 },
  { id: 'tollygunge',   name: 'Tollygunge',     district: 'Kolkata', lat: 22.4990, lng: 88.3400 },
  { id: 'narendrapur',  name: 'Narendrapur',    district: 'Kolkata', lat: 22.4283, lng: 88.4014 },
  { id: 'sonarpur',     name: 'Sonarpur',       district: 'South 24 Parganas', lat: 22.4089, lng: 88.4280 },
  { id: 'behala',       name: 'Behala',         district: 'Kolkata', lat: 22.5014, lng: 88.3120 },
  { id: 'new_alipore',  name: 'New Alipore',    district: 'Kolkata', lat: 22.5153, lng: 88.3318 },
];

export const DEFAULT_LOCALITY = LOCALITIES[0]; // Patuli

export function getLocalityById(id: string): Locality {
  return LOCALITIES.find(l => l.id === id) ?? DEFAULT_LOCALITY;
}

export function getNearbyLocalities(currentId: string): Locality[] {
  // Returns all except current
  return LOCALITIES.filter(l => l.id !== currentId);
}

// Haversine distance in km
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
