import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation2, Phone, MessageCircle } from 'lucide-react';
import { Vendor } from '../types';
import { CATEGORIES, PIN_COLORS, CATEGORY_MAP } from '../constants';
import { MOCK_VENDORS, getVendorsByCategory } from '../data/mockVendors';
import { getOpenStatus, formatDistance } from '../utils/timeUtils';
import { useAppContext } from '../context/AppContext';

const CENTER: [number, number] = [22.4729, 88.3997];

/* ── SVG pin icon ─────────────────────────────────────────────────────── */
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

/* ── MapResizer — robust invalidation strategy ─────────────────────────── */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize({ animate: false, pan: false });
    // Staggered calls cover animation-frame timing windows
    const timers = [0, 80, 200, 450].map(ms => setTimeout(fix, ms));
    // ResizeObserver catches any dynamic container changes
    const ro = new ResizeObserver(fix);
    ro.observe(map.getContainer());
    return () => { timers.forEach(clearTimeout); ro.disconnect(); };
  }, [map]);
  return null;
}

/* ── Category filter data ──────────────────────────────────────────────── */
const ALL_CATS = [
  { id: 'all', label: 'All', icon: '🏘️', color: '#00C896', bgColor: 'rgba(0,200,150,0.12)' },
  ...CATEGORIES,
];

/* ═══════════════════════════════════════════════════════════════════════════
   MapScreen
   ═══════════════════════════════════════════════════════════════════════════ */
export function MapScreen() {
  const { setSelectedVendor } = useAppContext();
  const [activeCat, setActiveCat]         = useState('all');
  const [previewVendor, setPreviewVendor] = useState<Vendor | null>(null);

  const vendors = getVendorsByCategory(activeCat);

  /* ── Measure the map wrapper to give Leaflet exact pixel dimensions ── */
  const wrapperRef                          = useRef<HTMLDivElement>(null);
  const [mapDims, setMapDims]               = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      // Use offsetWidth/Height as a reliable alternative to getBoundingClientRect
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w > 0 && h > 0) setMapDims({ w, h });
    };

    // Try immediate, then after rAF (layout settled), then via ResizeObserver
    measure();
    const id = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => { cancelAnimationFrame(id); ro.disconnect(); };
  }, []);

  return (
    <div
      style={{
        position:      'absolute',
        inset:         0,
        display:       'flex',
        flexDirection: 'column',
        background:    '#0D0D0D',
        overflow:      'hidden',
      }}
    >
      {/* ── Category filter — sits above map as a real bar ── */}
      <div
        style={{
          flexShrink:    0,
          background:    'rgba(13,13,13,0.98)',
          borderBottom:  '1px solid #1A1A1A',
          paddingTop:    'calc(var(--safe-top) + 10px)',
          paddingBottom: 10,
        }}
      >
        <div
          className="scrollbar-none"
          style={{
            display:    'flex',
            gap:        8,
            paddingLeft: 14,
            paddingRight: 14,
            overflowX:  'auto',
          }}
        >
          {ALL_CATS.map(cat => {
            const active = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                style={{
                  flexShrink:  0,
                  display:     'flex',
                  alignItems:  'center',
                  gap:         5,
                  padding:     '5px 12px',
                  borderRadius: 9999,
                  border:      `1px solid ${active ? cat.color + '50' : '#222'}`,
                  background:  active ? cat.bgColor : '#181818',
                  color:       active ? cat.color : '#888',
                  fontSize:    12,
                  fontWeight:  500,
                  whiteSpace:  'nowrap',
                  cursor:      'pointer',
                  transition:  'all 0.15s',
                }}
              >
                <span style={{ fontSize: 13 }}>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Map wrapper — measured ref gives Leaflet exact pixel dimensions ── */}
      <div
        ref={wrapperRef}
        style={{
          flex:     1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {mapDims ? (
          /* Key encodes dimensions so a resize triggers a fresh mount */
          <MapContainer
            key={`gh-map-${mapDims.w}x${mapDims.h}`}
            center={CENTER}
            zoom={14}
            zoomControl={false}
            style={{
              width:    mapDims.w,
              height:   mapDims.h,
              position: 'absolute',
              top:      0,
              left:     0,
            }}
          >
            <MapResizer />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution=""
              subdomains="abcd"
              maxZoom={20}
            />
            {vendors.map(v => (
              <Marker
                key={v.id}
                position={[v.lat, v.lng]}
                icon={pinIcon(PIN_COLORS[v.category] ?? '#888', v.isLive)}
                eventHandlers={{ click: () => setPreviewVendor(v) }}
              />
            ))}
          </MapContainer>
        ) : (
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#0C0C0C',
            }}
          >
            <div
              style={{
                width: 24, height: 24,
                border: '2px solid #1E1E1E',
                borderTopColor: '#00C896',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        )}

        {/* Vendor count — top-right, low z-index (map controls level) */}
        {mapDims && (
          <div style={{ position: 'absolute', top: 10, right: 12, zIndex: 10 }}>
            <div style={{
              padding: '4px 10px', borderRadius: 9999,
              fontSize: 11, fontWeight: 500,
              color: '#ABABAB', border: '1px solid #242424',
              background: 'rgba(16,16,16,0.92)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            }}>
              {vendors.length} vendors
            </div>
          </div>
        )}

        {/* Recenter button */}
        {mapDims && (
          <button
            style={{
              position: 'absolute', bottom: 14, right: 12, zIndex: 10,
              width: 38, height: 38, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(20,20,20,0.95)', border: '1px solid #242424',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              cursor: 'pointer',
            }}
          >
            <Navigation2 size={16} color="#ADADAD" />
          </button>
        )}

        {/* Map vendor preview popup — z-20 (above controls, below modals) */}
        <AnimatePresence>
          {previewVendor && (
            <MapPreviewPopup
              vendor={previewVendor}
              onClose={() => setPreviewVendor(null)}
              onOpen={() => { setSelectedVendor(previewVendor); setPreviewVendor(null); }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Nearby vendors strip ── */}
      <div
        style={{
          flexShrink:   0,
          background:   '#0D0D0D',
          borderTop:    '1px solid #1A1A1A',
        }}
      >
        <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#EBEBEB', letterSpacing: '-0.01em' }}>
            Nearby Vendors
          </p>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#3A3A3A' }}>{vendors.length} shown</span>
        </div>
        <div
          className="scrollbar-none"
          style={{
            display: 'flex', gap: 8,
            paddingLeft: 16, paddingRight: 16,
            overflowX: 'auto', paddingBottom: 12,
          }}
        >
          {vendors.map(v => {
            const cat    = CATEGORY_MAP[v.category];
            const status = getOpenStatus(v.openTime, v.closeTime);
            const isPrev = previewVendor?.id === v.id;
            const initials = v.name.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
            return (
              <button
                key={v.id}
                onClick={() => setPreviewVendor(isPrev ? null : v)}
                style={{
                  flexShrink: 0, width: 140,
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  padding: '10px 12px 12px', borderRadius: 16, textAlign: 'left',
                  background: isPrev ? (cat?.bgColor ?? 'rgba(136,136,136,0.1)') : '#161616',
                  border: `1px solid ${isPrev ? (cat?.color ?? '#888') + '40' : '#1A1A1A'}`,
                  transition: 'all 0.15s',
                }}
              >
                {/* Icon + subcategory */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, width: '100%' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${cat?.color ?? '#888'}1a`,
                    fontSize: 9, fontWeight: 700, color: cat?.color ?? '#ADADAD',
                  }}>
                    {initials}
                  </div>
                  <span style={{ fontSize: 10, color: '#5C5C5C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {v.subcategory}
                  </span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#EBEBEB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', margin: 0 }}>
                  {v.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                  <span style={{ fontSize: 9, color: '#5C5C5C' }}>{formatDistance(v.distance)}</span>
                  <span style={{ color: '#252525', fontSize: 9 }}>·</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 9999,
                    background: status.isOpen ? 'rgba(0,200,150,0.1)' : 'rgba(72,72,72,0.1)',
                    color: status.isOpen ? '#00C896' : '#5C5C5C',
                    border: `1px solid ${status.isOpen ? 'rgba(0,200,150,0.22)' : '#222'}`,
                  }}>
                    {status.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Map vendor popup ──────────────────────────────────────────────────── */
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
        position: 'absolute', top: 12, left: 12, right: 12, zIndex: 20,
        borderRadius: 18, border: '1px solid #282828', padding: 14,
        background: 'rgba(18,18,18,0.97)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 42, height: 42, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12, background: cat?.bgColor ?? 'rgba(136,136,136,0.12)', fontSize: 20,
        }}>
          {cat?.icon ?? '📦'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {vendor.name}
          </p>
          <p style={{ fontSize: 11, color: '#5C5C5C', margin: '2px 0 0' }}>{vendor.subcategory}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: '#5C5C5C' }}>{formatDistance(vendor.distance)}</span>
            <span style={{ color: '#2A2A2A' }}>·</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: status.isOpen ? '#00C896' : '#5C5C5C' }}>{status.short}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A1A1A', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          <X size={12} color="#5C5C5C" />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {vendor.phone && (
          <a
            href={`tel:${vendor.phone}`}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 10, fontSize: 12, fontWeight: 600, background: '#1A1A1A', color: '#ADADAD', textDecoration: 'none' }}
          >
            <Phone size={12} /> Call
          </a>
        )}
        {vendor.whatsapp && (
          <a
            href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}`}
            target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 10, fontSize: 12, fontWeight: 600, background: 'rgba(0,200,150,0.08)', color: '#00C896', border: '1px solid rgba(0,200,150,0.28)', textDecoration: 'none' }}
          >
            <MessageCircle size={12} /> WhatsApp
          </a>
        )}
        <button
          onClick={onOpen}
          style={{ flex: 1, padding: '7px 0', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg, #00C896, #0aa87a)', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Details
        </button>
      </div>
    </motion.div>
  );
}
