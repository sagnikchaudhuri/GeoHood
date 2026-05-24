/**
 * Deprecated — watchPosition removed per V1 architecture decision.
 * All exports here are type/function stubs that satisfy any remaining
 * import sites while the real implementation lives in useLocationService.ts.
 */
export type LocationStatus = 'idle' | 'requesting' | 'tracking' | 'denied' | 'error';
export interface LiveCoords {
  lat: number; lng: number; accuracy: number;
  heading: number | null; speed: number | null; timestamp: number;
}
