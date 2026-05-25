import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapContainer, TileLayer, Marker, Circle,
  CircleMarker, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation2, Phone, MessageCircle, MapPin, Loader } from 'lucide-react';
import { Vendor, VendorCategory } from '../types';
import { CATEGORIES, PIN_COLORS, CATEGORY_MAP } from '../constants';
import { getVendorsByCategory } from '../data/mockVendors';
import { getOpenStatus, formatDistance } from '../utils/timeUtils';
import { useAppContext } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import { PATULI_FALLBACK_LAT, PATULI_FALLBACK_LNG } from '../utils/locationService';
import { supabase, DbVendor } from '../lib/supabase';

/* ── Vite asset path fix ─────────────────────────────────────────────────── */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

/* ── Convert Supabase DB vendor → display Vendor ────────────────────────── */
function dbVendorToVendor(row: DbVendor): Vendor {
  return {
    id:          row.id,
    name:        row.business_name,
    category:    row.category as VendorCategory,
    subcategory: row.subcategory || row.category,
    description: row.description,
    rating:      0,
    reviewCount: 0,
    isOpen:      row.is_live,
    isVerified:  false,
    isPremium:   false,
    isLive:      row.is_live,
    distance:    0,
    address:     row.locality + ', Kolkata',
    whatsapp:    row.whatsapp,
    lat:         row.lat ?? PATULI_FALLBACK_LAT,
    lng:         row.lng ?? PATULI_FALLBACK_LNG,
    features:    [],
    tags:        [],
    locality:    row.locality,
  };
}

/* ── Vendor pin SVG ──────────────────────────────────────────────────────── */
function makePinSvg(color: string, isLive: boolean) {
  const pulse = isLive
    ? `<circle cx="16" cy="15" r="13" fill="${color}" fill-opacity="0.18"/>`
    : '';
  return `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
    ${pulse}
    <circle cx="16" cy="15" r="10" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="1.5"/>
    <circle cx="16" cy="15" r="5"  fill="${color}"/>
    <line x1="16" y1="25" x2="16" y2="37" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;
}

function pinIcon(color: string, isLive = false) {
  return L.divIcon({
    html:        makePinSvg(color, isLive),
    className:   '',
    iconSize:    [32, 40],
    iconAnchor:  [16, 39],
    popupAnchor: [0, -40],
  });
}

/* ── User location pin (blue dot) ───────────────────────────────────────── */
const USER_PIN = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#4D9EFF" fill-opacity="0.18"/>
    <circle cx="12" cy="12" r="7" fill="#4D9EFF" fill-opacity="0.22"/>
    <circle cx="12" cy="12" r="5" fill="#4D9EFF" stroke="white" stroke-width="2.5"/>
  </svg>`,
  className:   '',
  iconSize:    [24, 24],
  iconAnchor:  [12, 12],
  popupAnchor: [0, -14],
});

/* ── MapResizer ─────────────────────────────────────────────────────────── */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const fix = () => {
      try { map.invalidateSize({ animate: false, pan: false }); } catch {}
    };
    // Fire at multiple intervals to handle all layout phases
    const timers = [0, 50, 150, 350, 700, 1400, 2500].map(ms => setTimeout(fix, ms));
    const ro = new ResizeObserver(() => {
      fix();
      setTimeout(fix, 100);
    });
    ro.observe(map.getContainer());
    return () => { timers.forEach(clearTimeout); ro.disconnect(); };
  }, [map]);
  return null;
}

/* ── LocationLayer ───────────────────────────────────────────────────────── */
function LocationLayer({
  coords, accuracy, recenterSignal,
}: {
  coords:         [number, number] | null;
  accuracy:       number | null;
  recenterSignal: number;
}) {
  const map          = useMap();
  const prevRecenter = useRef(0);
  const fallback: [number, number] = [PATULI_FALLBACK_LAT, PATULI_FALLBACK_LNG];

  useEffect(() => {
    if (recenterSignal > 0 && recenterSignal !== prevRecenter.current) {
      prevRecenter.current = recenterSignal;
      const target = coords ?? fallback;
      map.setView(target, 16, { animate: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterSignal, coords, map]);

  if (!coords) return null;

  const showAccuracy = accuracy != null && accuracy > 0 && accuracy < 500;

  return (
    <>
      {showAccuracy && (
        <Circle center={coords} radius={accuracy!}
          pathOptions={{ fillColor: '#4D9EFF', fillOpacity: 0.07, color: '#4D9EFF', weight: 1.5, opacity: 0.4 }}
        />
      )}
      {/* Pulse ring */}
      <CircleMarker center={coords} radius={18}
        pathOptions={{ fillColor: '#4D9EFF', fillOpacity: 0.13, color: '#4D9EFF', weight: 1, opacity: 0.45 }}
      />
      {/* Solid dot */}
      <Marker position={coords} icon={USER_PIN} />
    </>
  );
}

/* ── Category filter list ────────────────────────────────────────────────── */
const ALL_CATS = [
  { id: 'all', label: 'All', icon: '🏘️', color: '#00C896', bgColor: 'rgba(0,200,150,0.12)' },
  ...CATEGORIES,
];

/* ═══════════════════════════════════════════════════════════════════════════
   MapScreen
   ═══════════════════════════════════════════════════════════════════════════ */
export function MapScreen() {
  const { setSelectedVendor } = useAppContext();
  const {
    userLat, userLng, userAccuracy,
    locationPermission, locationStatus,
    requestUserLocation, selectedLocality,
  } = useUser();

  const [activeCat,        setActiveCat]      = useState('all');
  const [previewVendor,    setPreviewVendor]  = useState<Vendor | null>(null);
  const [recenterSignal,   setRecenterSignal] = useState(0);
  const [locLoading,       setLocLoading]     = useState(false);
  const [supabaseVendors,  setSupabaseVendors]= useState<Vendor[]>([]);

  /* ── Load Supabase vendors + realtime subscription ── */
  useEffect(() => {
    let mounted = true;

    // Initial load
    supabase.from('vendors').select('*')
      .then(({ data, error }) => {
        if (!mounted || error || !data) return;
        setSupabaseVendors(data.map(dbVendorToVendor));
      });

    // Realtime subscription
    const channel = supabase
      .channel('map-vendors-rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vendors' },
        payload => {
          if (!mounted) return;
          if (payload.eventType === 'INSERT') {
            setSupabaseVendors(prev => {
              const newV = dbVendorToVendor(payload.new as DbVendor);
              return prev.some(v => v.id === newV.id) ? prev : [...prev, newV];
            });
          } else if (payload.eventType === 'UPDATE') {
            setSupabaseVendors(prev =>
              prev.map(v => v.id === payload.new.id ? dbVendorToVendor(payload.new as DbVendor) : v)
            );
          } else if (payload.eventType === 'DELETE') {
            setSupabaseVendors(prev => prev.filter(v => v.id !== payload.old.id));
            // Close preview if it was the deleted vendor
            setPreviewVendor(prev => (prev?.id === payload.old.id ? null : prev));
          }
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  /* ── Merge mock + Supabase vendors, filter by category ── */
  const mockVendors = getVendorsByCategory(activeCat);
  const allVendors: Vendor[] = [
    ...mockVendors,
    ...supabaseVendors.filter(v =>
      activeCat === 'all' || v.category === activeCat
    ),
  ];
  // Deduplicate
  const vendors = allVendors.filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i);

  const hasLocation = userLat != null && userLng != null;
  const userCoords: [number, number] | null = hasLocation
    ? [userLat as number, userLng as number]
    : null;
  const mapCenter: [number, number] = userCoords ?? [PATULI_FALLBACK_LAT, PATULI_FALLBACK_LNG];

  const handleRequestLocation = useCallback(async () => {
    setLocLoading(true);
    await requestUserLocation();
    setLocLoading(false);
    setTimeout(() => setRecenterSignal(s => s + 1), 150);
  }, [requestUserLocation]);

  /* ── Status badge ── */
  const statusBadge = (() => {
    if (locationStatus === 'detecting' || locLoading)
      return { text: 'Detecting location…', color: '#5C5C5C', showSpinner: true };
    if (locationStatus === 'success' && hasLocation)
      return { text: 'Location detected', color: '#4D9EFF', showSpinner: false };
    if (locationStatus === 'denied' || locationPermission === 'denied')
      return { text: `Using ${selectedLocality || 'Patuli'}`, color: '#5C5C5C', showSpinner: false };
    if (locationStatus === 'error')
      return { text: 'Location error', color: '#F5A623', showSpinner: false };
    return {
      text: selectedLocality
        ? selectedLocality.charAt(0).toUpperCase() + selectedLocality.slice(1)
        : 'Patuli',
      color: '#5C5C5C', showSpinner: false,
    };
  })();

  /* ─── Layout: CSS Grid 3 rows ─── */
  return (
    <div style={{
      position:         'absolute',
      inset:            0,
      display:          'grid',
      gridTemplateRows: 'auto 1fr auto',
      background:       '#0D0D0D',
    }}>

      {/* ══ ROW 1 — Category filter bar ══════════════════════════════════════ */}
      <div style={{
        background: 'rgba(13,13,13,0.98)', borderBottom: '1px solid #1A1A1A',
        paddingTop: 'calc(var(--safe-top) + 10px)', paddingBottom: 10, zIndex: 10,
      }}>
        <div className="scrollbar-none"
          style={{ display: 'flex', gap: 8, paddingLeft: 14, paddingRight: 14, overflowX: 'auto' }}
        >
          {ALL_CATS.map(cat => {
            const active = activeCat === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 9999,
                border:     `1px solid ${active ? cat.color + '50' : '#222'}`,
                background: active ? cat.bgColor : '#181818',
                color:      active ? cat.color   : '#888',
                fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 13 }}>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ ROW 2 — Map (1fr) ════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#0C0C0C' }}>

        <MapContainer
          center={mapCenter}
          zoom={14}
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
          preferCanvas={false}
        >
          <MapResizer />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
            maxZoom={19}
          />

          {/* User location */}
          <LocationLayer coords={userCoords} accuracy={userAccuracy} recenterSignal={recenterSignal} />

          {/* Vendor pins */}
          {vendors.map(v => (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={pinIcon(PIN_COLORS[v.category] ?? '#888', v.isLive)}
              eventHandlers={{ click: () => setPreviewVendor(v) }}
            />
          ))}
        </MapContainer>

        {/* Status badge — top left */}
        <div style={{ position: 'absolute', top: 10, left: 12, zIndex: 410 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 9999,
            fontSize: 11, fontWeight: 500, color: statusBadge.color,
            border: `1px solid ${locationStatus === 'success' && hasLocation ? 'rgba(77,158,255,0.3)' : '#242424'}`,
            background: 'rgba(16,16,16,0.92)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            {statusBadge.showSpinner
              ? <Loader size={9} style={{ animation: 'spin 1s linear infinite' }} />
              : <MapPin size={10} />
            }
            {statusBadge.text}
          </div>
        </div>

        {/* Vendor count — top right */}
        <div style={{ position: 'absolute', top: 10, right: 12, zIndex: 410 }}>
          <div style={{
            padding: '4px 10px', borderRadius: 9999,
            fontSize: 11, fontWeight: 500, color: '#ABABAB',
            border: '1px solid #242424', background: 'rgba(16,16,16,0.92)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            {vendors.length} vendors
          </div>
        </div>

        {/* Recenter / GPS button — bottom right */}
        <button
          onClick={handleRequestLocation}
          disabled={locLoading || locationStatus === 'detecting'}
          style={{
            position: 'absolute', bottom: 14, right: 12, zIndex: 410,
            width: 44, height: 44, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: hasLocation ? 'rgba(77,158,255,0.15)' : 'rgba(20,20,20,0.95)',
            border: `1px solid ${hasLocation ? 'rgba(77,158,255,0.35)' : '#242424'}`,
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            cursor: (locLoading || locationStatus === 'detecting') ? 'wait' : 'pointer',
            transition: 'all 0.2s', boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
          aria-label="Center on my location"
        >
          {(locLoading || locationStatus === 'detecting') ? (
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid #2A2A2A', borderTopColor: '#4D9EFF', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <Navigation2 size={18} color={hasLocation ? '#4D9EFF' : '#ADADAD'} fill={hasLocation ? 'rgba(77,158,255,0.25)' : 'none'} />
          )}
        </button>

        {/* Location denied hint — bottom left */}
        {locationPermission === 'denied' && (
          <div style={{
            position: 'absolute', bottom: 14, left: 12, zIndex: 410,
            padding: '6px 12px', borderRadius: 10,
            fontSize: 10, fontWeight: 500, color: '#5C5C5C',
            background: 'rgba(16,16,16,0.92)', border: '1px solid #222',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            Using {selectedLocality || 'Patuli'} as default
          </div>
        )}

        {/* Vendor preview popup */}
        <AnimatePresence>
          {previewVendor && (
            <MapPreviewPopup
              vendor={previewVendor}
              onClose={() => setPreviewVendor(null)}
              onOpen={() => {
                setSelectedVendor(previewVendor);
                setPreviewVendor(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ══ ROW 3 — Nearby vendors strip ═════════════════════════════════════ */}
      <div style={{ background: '#0D0D0D', borderTop: '1px solid #1A1A1A', maxHeight: 170, overflow: 'hidden' }}>
        <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#EBEBEB', letterSpacing: '-0.01em', margin: 0 }}>Nearby Vendors</p>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#3A3A3A' }}>{vendors.length} shown</span>
        </div>
        <div className="scrollbar-none"
          style={{ display: 'flex', gap: 8, paddingLeft: 16, paddingRight: 16, overflowX: 'auto', paddingBottom: 10 }}
        >
          {vendors.map(v => {
            const cat    = CATEGORY_MAP[v.category];
            const status = getOpenStatus(v.openTime, v.closeTime);
            const isPrev = previewVendor?.id === v.id;
            const initials = v.name.split(' ').filter(Boolean)
              .map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
            return (
              <button key={v.id} onClick={() => setPreviewVendor(isPrev ? null : v)} style={{
                flexShrink: 0, width: 136,
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '9px 11px 10px', borderRadius: 14, textAlign: 'left',
                background: isPrev ? (cat?.bgColor ?? 'rgba(136,136,136,0.1)') : '#161616',
                border: `1px solid ${isPrev ? (cat?.color ?? '#888') + '40' : '#1A1A1A'}`,
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, width: '100%' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${cat?.color ?? '#888'}1a`, fontSize: 9, fontWeight: 700, color: cat?.color ?? '#ADADAD' }}>
                    {initials}
                  </div>
                  <span style={{ fontSize: 10, color: '#5C5C5C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {v.subcategory}
                  </span>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#EBEBEB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', margin: 0 }}>
                  {v.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  {v.distance > 0 && <><span style={{ fontSize: 9, color: '#5C5C5C' }}>{formatDistance(v.distance)}</span><span style={{ color: '#252525', fontSize: 9 }}>·</span></>}
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 9999,
                    background: (v.isOpen || v.isLive) ? 'rgba(0,200,150,0.1)' : 'rgba(72,72,72,0.1)',
                    color: (v.isOpen || v.isLive) ? '#00C896' : '#5C5C5C',
                    border: `1px solid ${(v.isOpen || v.isLive) ? 'rgba(0,200,150,0.22)' : '#222'}`,
                  }}>
                    {(v.isOpen || v.isLive) ? (v.isLive ? '● Live' : 'Open') : status.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </button>
            );
          })}
          {vendors.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', color: '#3A3A3A', fontSize: 12 }}>
              No vendors in this category
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Map vendor popup ─────────────────────────────────────────────────────── */
function MapPreviewPopup({
  vendor, onClose, onOpen,
}: {
  vendor: Vendor;
  onClose: () => void;
  onOpen: () => void;
}) {
  const cat    = CATEGORY_MAP[vendor.category];
  const status = getOpenStatus(vendor.openTime, vendor.closeTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      style={{
        position: 'absolute', top: 12, left: 12, right: 12, zIndex: 420,
        borderRadius: 18, border: '1px solid #282828', padding: 14,
        background: 'rgba(18,18,18,0.97)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 42, height: 42, flexShrink: 0, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: cat?.bgColor ?? 'rgba(136,136,136,0.12)', fontSize: 20,
        }}>
          {cat?.icon ?? '📦'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {vendor.name}
          </p>
          <p style={{ fontSize: 11, color: '#5C5C5C', margin: '2px 0 0' }}>{vendor.subcategory}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {vendor.distance > 0 && <span style={{ fontSize: 11, color: '#5C5C5C' }}>{formatDistance(vendor.distance)}</span>}
            {vendor.distance > 0 && <span style={{ color: '#2A2A2A' }}>·</span>}
            <span style={{ fontSize: 11, fontWeight: 600, color: (vendor.isLive || status.isOpen) ? '#00C896' : '#5C5C5C' }}>
              {vendor.isLive ? '● Live' : status.short}
            </span>
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#1A1A1A', border: 'none', cursor: 'pointer', flexShrink: 0,
        }}>
          <X size={12} color="#5C5C5C" />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {vendor.phone && (
          <a href={`tel:${vendor.phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 10, fontSize: 12, fontWeight: 600, background: '#1A1A1A', color: '#ADADAD', textDecoration: 'none' }}>
            <Phone size={12} /> Call
          </a>
        )}
        {vendor.whatsapp && (
          <a href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 10, fontSize: 12, fontWeight: 600, background: 'rgba(0,200,150,0.08)', color: '#00C896', border: '1px solid rgba(0,200,150,0.28)', textDecoration: 'none' }}
          >
            <MessageCircle size={12} /> WhatsApp
          </a>
        )}
        <button onClick={onOpen} style={{ flex: 1, padding: '7px 0', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg, #00C896, #0aa87a)', color: 'white', border: 'none', cursor: 'pointer' }}>
          Details
        </button>
      </div>
    </motion.div>
  );
}
