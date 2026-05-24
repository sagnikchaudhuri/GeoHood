import 'leaflet/dist/leaflet.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MapContainer, TileLayer, Marker, useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { motion } from 'framer-motion';
import { X, Navigation2, MapPin, Check } from 'lucide-react';
import { mockReverseGeocode, getLocalityDisplayName, requestGeolocation } from '../../utils/locationService';
import { PATULI_FALLBACK_LAT, PATULI_FALLBACK_LNG } from '../../utils/locationService';

/* ── Vite icon fix ─────────────────────────────────────────────────────── */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

/* ── Store pin — teardrop shape in GeoHood green ────────────────────────── */
const STORE_PIN = L.divIcon({
  html: `<svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
    <filter id="ps"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.35"/></filter>
    <path d="M18 2C10.27 2 4 8.27 4 16c0 9.5 14 30 14 30S32 25.5 32 16C32 8.27 25.73 2 18 2z"
          fill="#00C896" filter="url(#ps)"/>
    <circle cx="18" cy="16" r="6" fill="white"/>
    <circle cx="18" cy="16" r="2.5" fill="#00C896"/>
  </svg>`,
  className:   '',
  iconSize:    [36, 48],
  iconAnchor:  [18, 48],
  popupAnchor: [0, -50],
});

/* ── MapResizer ─────────────────────────────────────────────────────────── */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const fix = () => { try { map.invalidateSize({ animate: false, pan: false }); } catch {} };
    const timers = [0, 100, 300, 700].map(ms => setTimeout(fix, ms));
    const ro = new ResizeObserver(fix);
    ro.observe(map.getContainer());
    return () => { timers.forEach(clearTimeout); ro.disconnect(); };
  }, [map]);
  return null;
}

/* ── Tap-to-move: clicking the map moves the pin ───────────────────────── */
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/* ── Recenter helper ────────────────────────────────────────────────────── */
function Recenterer({ signal, target }: { signal: number; target: [number, number] }) {
  const map     = useMap();
  const prevSig = useRef(0);
  useEffect(() => {
    if (signal > 0 && signal !== prevSig.current) {
      prevSig.current = signal;
      map.setView(target, 16, { animate: true });
    }
  }, [signal, target, map]);
  return null;
}

/* ── Public API ─────────────────────────────────────────────────────────── */
export interface PickedLocation {
  lat:      number;
  lng:      number;
  locality: string;          // locality id
  displayName: string;       // human name for display
}

interface Props {
  title?:          string;
  subtitle?:       string;
  initialLocation?: { lat: number; lng: number };
  onConfirm: (loc: PickedLocation) => void;
  onClose:   () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MapLocationPicker
   Full-screen modal for picking a location on the map.
   - Tap anywhere on the map to move the pin
   - Drag the pin to fine-tune
   - "Use my location" button gets a fresh GPS fix
   - Confirm CTA returns the picked location
   ═══════════════════════════════════════════════════════════════════════════ */
export function MapLocationPicker({ title, subtitle, initialLocation, onConfirm, onClose }: Props) {

  const defaultCenter: [number, number] = initialLocation
    ? [initialLocation.lat, initialLocation.lng]
    : [PATULI_FALLBACK_LAT, PATULI_FALLBACK_LNG];

  const [pinPos,    setPinPos]    = useState<[number, number]>(defaultCenter);
  const [locality,  setLocality]  = useState<string>(() => mockReverseGeocode(defaultCenter[0], defaultCenter[1]));
  const [locLoading, setLocLoading] = useState(false);
  const [recenterSig, setRecenterSig] = useState(0);

  const updatePin = useCallback((lat: number, lng: number) => {
    const rounded: [number, number] = [
      Math.round(lat * 1e6) / 1e6,
      Math.round(lng * 1e6) / 1e6,
    ];
    setPinPos(rounded);
    const loc = mockReverseGeocode(lat, lng);
    setLocality(loc);
    console.log('[GeoHood Picker] Pin moved to:', rounded, 'locality:', loc);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    updatePin(lat, lng);
  }, [updatePin]);

  const handleDragEnd = useCallback((e: L.LeafletEvent) => {
    const { lat, lng } = (e.target as L.Marker).getLatLng();
    updatePin(lat, lng);
  }, [updatePin]);

  const handleUseMyLocation = async () => {
    setLocLoading(true);
    console.log('[GeoHood Picker] Requesting GPS...');
    const result = await requestGeolocation();
    setLocLoading(false);

    if (result.status === 'granted') {
      updatePin(result.lat, result.lng);
      setRecenterSig(s => s + 1);
    } else {
      console.log('[GeoHood Picker] GPS failed:', result.status);
    }
  };

  const handleConfirm = () => {
    const picked: PickedLocation = {
      lat:         pinPos[0],
      lng:         pinPos[1],
      locality,
      displayName: getLocalityDisplayName(locality),
    };
    console.log('[GeoHood Picker] Confirmed:', picked);
    onConfirm(picked);
  };

  const displayName = getLocalityDisplayName(locality);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 70,
        display:  'grid',
        gridTemplateRows: 'auto 1fr auto',
        background: '#0D0D0D',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        padding:      'calc(var(--safe-top) + 16px) 16px 12px',
        background:   '#0D0D0D',
        borderBottom: '1px solid #1A1A1A',
        zIndex:       10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#1A1A1A', border: 'none', cursor: 'pointer',
            }}
          >
            <X size={16} color="#ADADAD" />
          </button>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>
              {title ?? 'Set Store Location'}
            </h2>
            <p style={{ fontSize: 11, color: '#5C5C5C', margin: '2px 0 0' }}>
              {subtitle ?? 'Tap the map or drag the pin to place your store'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Map area (1fr — definite height, CSS Grid) ── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#0C0C0C' }}>
        <MapContainer
          center={defaultCenter}
          zoom={15}
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <MapResizer />
          <MapClickHandler onMapClick={handleMapClick} />
          <Recenterer signal={recenterSig} target={pinPos} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
            maxZoom={19}
          />

          <Marker
            position={pinPos}
            icon={STORE_PIN}
            draggable={true}
            eventHandlers={{ dragend: handleDragEnd }}
          />
        </MapContainer>

        {/* ── Locality preview chip (top-left) ── */}
        <div style={{ position: 'absolute', top: 10, left: 12, zIndex: 410 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 9999,
            fontSize: 12, fontWeight: 600,
            color: '#00C896',
            border: '1px solid rgba(0,200,150,0.3)',
            background: 'rgba(16,16,16,0.94)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <MapPin size={11} />
            {displayName}
          </div>
        </div>

        {/* ── Use my location button (bottom-right) ── */}
        <button
          onClick={handleUseMyLocation}
          disabled={locLoading}
          style={{
            position: 'absolute', bottom: 14, right: 12, zIndex: 410,
            width: 40, height: 40, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(20,20,20,0.95)',
            border: '1px solid #2A2A2A',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            cursor: locLoading ? 'wait' : 'pointer',
          }}
        >
          {locLoading ? (
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid #2A2A2A', borderTopColor: '#00C896',
              animation: 'spin 0.7s linear infinite',
            }} />
          ) : (
            <Navigation2 size={16} color="#ADADAD" />
          )}
        </button>

        {/* ── Hint label (bottom-left) ── */}
        <div style={{
          position: 'absolute', bottom: 14, left: 12, zIndex: 410,
          padding: '5px 10px', borderRadius: 8,
          fontSize: 10, color: '#5C5C5C',
          background: 'rgba(16,16,16,0.88)',
          border: '1px solid #222',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}>
          Tap map or drag pin
        </div>
      </div>

      {/* ── Confirm CTA ── */}
      <div style={{
        padding:    '12px 16px calc(var(--safe-bottom) + 12px)',
        background: '#0D0D0D',
        borderTop:  '1px solid #1A1A1A',
      }}>
        {/* Location summary row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 14, marginBottom: 10,
          background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.18)',
        }}>
          <MapPin size={14} color="#00C896" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>
              {displayName}
            </p>
            <p style={{ fontSize: 10, color: '#5C5C5C', margin: '2px 0 0' }}>
              {pinPos[0].toFixed(4)}, {pinPos[1].toFixed(4)}
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          style={{
            width: '100%', padding: '15px', borderRadius: 16,
            fontSize: 14, fontWeight: 700, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'linear-gradient(135deg, #00C896, #0aa87a)',
            border: 'none', cursor: 'pointer',
          }}
        >
          <Check size={16} />
          Confirm Store Location
        </motion.button>
      </div>
    </motion.div>
  );
}
