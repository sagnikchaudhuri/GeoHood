import { useCallback, useState } from 'react';
import { requestGeolocation } from '../utils/locationService';
import { LocationState } from '../types';

/* ── Status type ────────────────────────────────────────────────────────── */
export type DetectStatus = 'idle' | 'detecting' | 'success' | 'denied' | 'error';

export interface UseLocationServiceResult {
  detectStatus: DetectStatus;
  errorMsg:     string;
  /** Call getCurrentPosition, returns updated LocationState or null on failure */
  detectLocation: () => Promise<LocationState | null>;
  /** Reset status back to idle (e.g. after showing an error) */
  resetStatus: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   useLocationService
   Single-shot getCurrentPosition wrapper. V1 GPS architecture — no
   watchPosition, no continuous tracking. Call detectLocation() whenever
   a fresh GPS fix is needed (onboarding, recenter button, etc).
   ═══════════════════════════════════════════════════════════════════════════ */
export function useLocationService(): UseLocationServiceResult {
  const [detectStatus, setDetectStatus] = useState<DetectStatus>('idle');
  const [errorMsg,     setErrorMsg]     = useState('');

  const detectLocation = useCallback(async (): Promise<LocationState | null> => {
    setDetectStatus('detecting');
    setErrorMsg('');

    const result = await requestGeolocation();

    if (result.status === 'granted') {
      setDetectStatus('success');
      const state: LocationState = {
        lat:       result.lat,
        lng:       result.lng,
        accuracy:  result.accuracy,
        locality:  result.localityId,
        source:    'gps',
        updatedAt: Date.now(),
      };
      console.log('[GeoHood Location] detectLocation success:', state.lat, state.lng);
      return state;
    }

    if (result.status === 'denied') {
      setDetectStatus('denied');
      setErrorMsg('Location permission denied');
      console.log('[GeoHood Location] detectLocation: permission denied');
    } else {
      setDetectStatus('error');
      setErrorMsg('Location unavailable');
      console.log('[GeoHood Location] detectLocation: unavailable');
    }
    return null;
  }, []);

  const resetStatus = useCallback(() => {
    setDetectStatus('idle');
    setErrorMsg('');
  }, []);

  return { detectStatus, errorMsg, detectLocation, resetStatus };
}
