import { useCallback, useEffect, useRef, useState } from 'react';

/* ── Types ─────────────────────────────────────────────────────────────────── */

export type LocationStatus =
  | 'idle'        // never requested
  | 'requesting'  // watchPosition started, waiting for first fix
  | 'tracking'    // receiving live fixes
  | 'denied'      // permission denied (code 1)
  | 'error';      // unavailable / timeout

export interface LiveCoords {
  lat:       number;
  lng:       number;
  accuracy:  number;
  heading:   number | null;
  speed:     number | null;
  timestamp: number;
}

export interface UseLiveLocationResult {
  coords:        LiveCoords | null;
  status:        LocationStatus;
  errorMsg:      string;
  startTracking: () => void;
  stopTracking:  () => void;
}

/* ── watchPosition options ─────────────────────────────────────────────────── */
const WATCH_OPTS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge:         5_000,   // accept a fix up to 5s old
  timeout:            15_000,  // give up after 15s waiting
};

/* ═══════════════════════════════════════════════════════════════════════════
   useLiveLocation
   ═══════════════════════════════════════════════════════════════════════════ */
export function useLiveLocation(): UseLiveLocationResult {
  const [coords,   setCoords]   = useState<LiveCoords | null>(null);
  const [status,   setStatus]   = useState<LocationStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const watchIdRef = useRef<number | null>(null);

  /* ── stopTracking ── */
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      console.log('[GeoHood Location] clearWatch watchId=', watchIdRef.current);
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  /* ── startTracking ── */
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('[GeoHood Location] Geolocation API not available');
      setStatus('error');
      setErrorMsg('Geolocation not supported');
      return;
    }

    // Idempotent — don't double-watch
    if (watchIdRef.current !== null) {
      console.log('[GeoHood Location] Already tracking, watchId=', watchIdRef.current);
      return;
    }

    console.log('[GeoHood Location] Starting watchPosition...');
    setStatus('requesting');

    watchIdRef.current = navigator.geolocation.watchPosition(
      /* success ─────────────────────────────────────────────────────── */
      (pos) => {
        const c: LiveCoords = {
          lat:       pos.coords.latitude,
          lng:       pos.coords.longitude,
          accuracy:  pos.coords.accuracy  ?? 0,
          heading:   pos.coords.heading,
          speed:     pos.coords.speed,
          timestamp: pos.timestamp,
        };
        console.log(
          `[GeoHood Location] Fix: lat=${c.lat.toFixed(5)} lng=${c.lng.toFixed(5)} ±${Math.round(c.accuracy)}m`,
        );
        setCoords(c);
        setStatus('tracking');
        setErrorMsg('');
      },
      /* error ────────────────────────────────────────────────────────── */
      (err) => {
        console.warn('[GeoHood Location] Error:', err.code, err.message);
        // code 1 = PERMISSION_DENIED, 2 = UNAVAILABLE, 3 = TIMEOUT
        setStatus(err.code === 1 ? 'denied' : 'error');
        setErrorMsg(err.message);
        watchIdRef.current = null; // cleared — next startTracking() can retry
      },
      WATCH_OPTS,
    );

    console.log('[GeoHood Location] watchPosition started, watchId=', watchIdRef.current);
  }, []);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        console.log('[GeoHood Location] Unmount: clearWatch', watchIdRef.current);
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return { coords, status, errorMsg, startTracking, stopTracking };
}
