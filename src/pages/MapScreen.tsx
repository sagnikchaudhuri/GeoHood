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

function makePinSvg(color: string, isLive: boolean) {
  const pulse = isLive ? `<circle cx="16" cy="15" r="13" fill="${color}" fill-opacity="0.2"/>` : '';
  return `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
    ${pulse}
    <circle cx="16" cy="15" r="11" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="1.8"/>
    <circle cx="16" cy="15" r="5.5" fill="${color}"/>
    <line x1="16" y1="26" x2="16" y2="38" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}

function pinIcon(color: string, isLive = false) {
  return L.divIcon({
    html: makePinSvg(color, isLive),
    className: '',
    iconSize:    [32, 40],
    iconAnchor:  [16, 39],
    popupAnchor: [0, -40],
  });
}

// Force Leaflet to recalculate size after mount
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

const ALL_CATS = [
  { id: 'all', label: 'All', icon: '🏘️', color: '#00C896', bgColor: 'rgba(0,200,150,0.12)' },
  ...CATEGORIES,
];

export function MapScreen() {
  const { setSelectedVendor } = useAppContext();
  const [activeCat, setActiveCat]         = useState('all');
  const [previewVendor, setPreviewVendor] = useState<Vendor | null>(null);

  const vendors = getVendorsByCategory(activeCat);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#0D0D0D' }}>
      {/* Map — fills all remaining space */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapContainer
          center={CENTER}
          zoom={14}
          zoomControl={false}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
        >
          <MapResizer />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
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

        {/* Category filter overlay */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999,
            background: 'linear-gradient(to bottom, rgba(13,13,13,0.92) 60%, transparent)',
            paddingTop: 12, paddingBottom: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 8, paddingLeft: 16, paddingRight: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {ALL_CATS.map(cat => {
              const active = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  style={{
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 999,
                    border: `1px solid ${active ? cat.color + '55' : '#2A2A2A'}`,
                    background: active ? cat.bgColor : '#161616',
                    color: active ? cat.color : '#ADADAD',
                    fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer',
                  }}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vendor count */}
        <div style={{ position: 'absolute', top: 52, right: 12, zIndex: 999 }}>
          <div style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            color: '#ADADAD', border: '1px solid #2A2A2A',
            background: 'rgba(17,17,17,0.9)', backdropFilter: 'blur(8px)',
          }}>
            {vendors.length} vendors
          </div>
        </div>

        {/* Recenter */}
        <button
          style={{
            position: 'absolute', bottom: 16, right: 12, zIndex: 999,
            width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(22,22,22,0.95)', border: '1px solid #2A2A2A', backdropFilter: 'blur(8px)', cursor: 'pointer',
          }}
        >
          <Navigation2 size={17} color="#ADADAD" />
        </button>

        {/* Map preview popup */}
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

      {/* Nearby Vendors strip — pinned below map */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(13,13,13,0.97)',
        borderTop: '1px solid #1A1A1A',
        paddingBottom: 4,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#EBEBEB', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 16px 8px' }}>
          Nearby Vendors
        </p>
        <div style={{ display: 'flex', gap: 10, paddingLeft: 16, paddingRight: 16, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
          {vendors.map(v => {
            const cat    = CATEGORY_MAP[v.category];
            const status = getOpenStatus(v.openTime, v.closeTime);
            const isPrev = previewVendor?.id === v.id;

            return (
              <button
                key={v.id}
                onClick={() => setPreviewVendor(isPrev ? null : v)}
                style={{
                  flexShrink: 0, width: 140,
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  padding: 12, borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                  background: isPrev ? (cat?.bgColor ?? 'rgba(136,136,136,0.12)') : '#161616',
                  border: `1px solid ${isPrev ? (cat?.color ?? '#888') + '44' : '#1E1E1E'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, width: '100%' }}>
                  <span style={{ fontSize: 18 }}>{cat?.icon ?? '📦'}</span>
                  <span style={{ fontSize: 11, color: '#5C5C5C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.subcategory}
                  </span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', margin: 0 }}>
                  {v.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#5C5C5C' }}>{formatDistance(v.distance)}</span>
                  <span style={{ color: '#2A2A2A', fontSize: 11 }}>·</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: status.isOpen ? '#00C896' : '#5C5C5C' }}>
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

function MapPreviewPopup({ vendor, onClose, onOpen }: { vendor: Vendor; onClose: () => void; onOpen: () => void }) {
  const cat    = CATEGORY_MAP[vendor.category];
  const status = getOpenStatus(vendor.openTime, vendor.closeTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      style={{
        position: 'absolute', top: 60, left: 12, right: 12, zIndex: 1000,
        borderRadius: 20, border: '1px solid #2A2A2A', padding: 16,
        background: 'rgba(22,22,22,0.97)', backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12, background: cat?.bgColor ?? 'rgba(136,136,136,0.12)', fontSize: 22,
        }}>
          {cat?.icon ?? '📦'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vendor.name}</p>
          <p style={{ fontSize: 11, color: '#5C5C5C', margin: '2px 0 0' }}>{vendor.subcategory}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: '#5C5C5C' }}>{formatDistance(vendor.distance)}</span>
            <span style={{ color: '#2A2A2A' }}>·</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: status.isOpen ? '#00C896' : '#5C5C5C' }}>{status.short}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A1A1A', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          <X size={13} color="#5C5C5C" />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {vendor.phone && (
          <a href={`tel:${vendor.phone}`} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 0', borderRadius: 12, fontSize: 12, fontWeight: 600,
            background: '#1A1A1A', color: '#ADADAD', textDecoration: 'none',
          }}>
            <Phone size={13} /> Call
          </a>
        )}
        {vendor.whatsapp && (
          <a href={`https://wa.me/${vendor.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 0', borderRadius: 12, fontSize: 12, fontWeight: 600,
            background: 'rgba(0,200,150,0.08)', color: '#00C896',
            border: '1px solid rgba(0,200,150,0.3)', textDecoration: 'none',
          }}>
            <MessageCircle size={13} /> WhatsApp
          </a>
        )}
        <button onClick={onOpen} style={{
          flex: 1, padding: '8px 0', borderRadius: 12, fontSize: 12, fontWeight: 700,
          background: 'linear-gradient(135deg, #00C896, #0aa87a)', color: 'white',
          border: 'none', cursor: 'pointer',
        }}>
          View Details
        </button>
      </div>
    </motion.div>
  );
}
