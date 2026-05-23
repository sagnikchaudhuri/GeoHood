import { OpenStatus } from '../types';

export function parseTimeToMins(t: string): number {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

export function nowMins(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function isVendorOpenNow(openTime?: string, closeTime?: string): boolean {
  if (!openTime || !closeTime) return true;
  const now = nowMins();
  const open = parseTimeToMins(openTime);
  const close = parseTimeToMins(closeTime);
  if (close > open) return now >= open && now < close;
  // overnight
  return now >= open || now < close;
}

export function getOpenStatus(openTime?: string, closeTime?: string): OpenStatus {
  if (!openTime || !closeTime) {
    return { isOpen: true, short: 'Open', label: 'Open always', urgent: false };
  }

  const now = nowMins();
  const open = parseTimeToMins(openTime);
  const close = parseTimeToMins(closeTime);

  const isOpen = close > open
    ? now >= open && now < close
    : now >= open || now < close;

  if (isOpen) {
    const minsLeft = close > now ? close - now : (24 * 60 - now) + close;
    if (minsLeft <= 30) {
      return { isOpen: true, short: `Closes ${minsLeft}m`, label: `Closes in ${minsLeft} min`, urgent: true, minsLeft };
    }
    return { isOpen: true, short: 'Open', label: `Open · Closes ${closeTime}`, urgent: false, minsLeft };
  } else {
    const minsUntil = open > now ? open - now : (24 * 60 - now) + open;
    if (minsUntil <= 60) {
      return { isOpen: false, short: `Opens ${minsUntil}m`, label: `Opens in ${minsUntil} min`, urgent: false, minsUntil };
    }
    return { isOpen: false, short: 'Closed', label: `Closed · Opens ${openTime}`, urgent: false, minsUntil };
  }
}

export function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}
