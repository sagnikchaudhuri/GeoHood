import React, { useState, useRef, useCallback } from 'react';
import {
  User, MapPin, Star, Bell, Shield, ChevronRight, LogOut, X, Store,
  ChevronLeft, Check, Heart, Lock, AlertCircle, Camera, ImagePlus, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useAppContext } from '../context/AppContext';
import { LOCALITIES } from '../data/localities';
import { MOCK_VENDORS } from '../data/mockVendors';
import { CATEGORY_MAP } from '../constants';
import { getOpenStatus, formatDistance } from '../utils/timeUtils';

interface Props {
  onClose: () => void;
}

type Section = 'main' | 'locality' | 'saved' | 'notifications' | 'privacy';

/* ── Sub-page header ─────────────────────────────────────────────────────── */
function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{
      flexShrink: 0,
      padding: 'calc(var(--safe-top) + 14px) 16px 14px',
      borderBottom: '1px solid #1A1A1A',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <button
        onClick={onBack}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#1A1A1A', border: 'none', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <ChevronLeft size={20} color="#EBEBEB" />
      </button>
      <h1 style={{ fontSize: 17, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: 0 }}>
        {title}
      </h1>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOCALITY SELECTOR
   ═══════════════════════════════════════════════════════════════════════════ */
function LocalitySelector({ onBack }: { onBack: () => void }) {
  const { selectedLocality, setSelectedLocality, requestUserLocation } = useUser();
  const [detecting,  setDetecting]  = useState(false);
  const [locStatus,  setLocStatus]  = useState<'idle' | 'denied' | 'success'>('idle');

  const handleDetect = async () => {
    setDetecting(true);
    setLocStatus('idle');
    const result = await requestUserLocation();
    setDetecting(false);
    setLocStatus(result.status === 'granted' ? 'success' : 'denied');
  };

  return (
    <motion.div
      key="locality"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#0D0D0D', zIndex: 10 }}
    >
      <SubHeader title="My Locality" onBack={onBack} />
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px' }}>
        <p style={{ fontSize: 12, color: '#5C5C5C', margin: '0 0 12px' }}>
          Select your home locality — this updates your neighbourhood feed and vendor list.
        </p>

        {/* Use my location button */}
        <button
          onClick={handleDetect}
          disabled={detecting}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px', borderRadius: 14, marginBottom: 8,
            border: `1px solid ${locStatus === 'denied' ? 'rgba(255,77,106,0.25)' : locStatus === 'success' ? 'rgba(0,200,150,0.35)' : 'rgba(0,200,150,0.22)'}`,
            background: locStatus === 'denied' ? 'rgba(255,77,106,0.06)' : 'rgba(0,200,150,0.05)',
            fontSize: 13, fontWeight: 600,
            color: locStatus === 'denied' ? '#FF4D6A' : '#00C896',
            cursor: detecting ? 'wait' : 'pointer',
          }}
        >
          {detecting ? (
            <>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(0,200,150,0.3)', borderTopColor: '#00C896', animation: 'spin 0.7s linear infinite' }} />
              Detecting…
            </>
          ) : locStatus === 'success' ? (
            <><MapPin size={14} /> Location detected ✓</>
          ) : locStatus === 'denied' ? (
            <><MapPin size={14} /> Permission denied — choose below</>
          ) : (
            <><MapPin size={14} /> Use my current location</>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#1A1A1A' }} />
          <span style={{ fontSize: 10, color: '#3A3A3A', fontWeight: 600 }}>or choose</span>
          <div style={{ flex: 1, height: 1, background: '#1A1A1A' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LOCALITIES.map(loc => {
            const active = loc.id === selectedLocality;
            return (
              <motion.button
                key={loc.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedLocality(loc.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 16,
                  border: `1px solid ${active ? 'rgba(0,200,150,0.4)' : '#1A1A1A'}`,
                  background: active ? 'rgba(0,200,150,0.06)' : '#161616',
                  textAlign: 'left', width: '100%', cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? 'rgba(0,200,150,0.12)' : '#1A1A1A',
                }}>
                  <MapPin size={16} color={active ? '#00C896' : '#5C5C5C'} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', margin: 0 }}>{loc.name}</p>
                  <p style={{ fontSize: 11, color: '#5C5C5C', margin: '2px 0 0' }}>{loc.district}</p>
                </div>
                {active && <Check size={16} color="#00C896" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SAVED VENDORS
   ═══════════════════════════════════════════════════════════════════════════ */
function SavedVendors({ onBack }: { onBack: () => void }) {
  const { savedVendorIds, toggleSavedVendor } = useUser();
  const { setSelectedVendor } = useAppContext();

  const saved = MOCK_VENDORS.filter(v => savedVendorIds.includes(v.id));

  return (
    <motion.div
      key="saved"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#0D0D0D', zIndex: 10 }}
    >
      <SubHeader title="Saved Vendors" onBack={onBack} />
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px' }}>
        {saved.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', paddingTop: 64, gap: 12,
          }}>
            <Heart size={40} color="#2A2A2A" />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>No saved vendors</p>
            <p style={{ fontSize: 13, color: '#5C5C5C', margin: 0, textAlign: 'center', maxWidth: 220 }}>
              Tap the heart icon on any vendor to save them here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {saved.map((v, i) => {
              const cat    = CATEGORY_MAP[v.category];
              const status = getOpenStatus(v.openTime, v.closeTime);
              const initials = v.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <motion.button
                  key={v.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedVendor(v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 16,
                    border: '1px solid #1A1A1A', background: '#161616',
                    textAlign: 'left', width: '100%', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, flexShrink: 0, borderRadius: 12,
                    background: cat?.bgColor ?? 'rgba(136,136,136,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: cat?.color ?? '#ADADAD',
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 600, color: '#EBEBEB',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0,
                    }}>
                      {v.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <span style={{ fontSize: 10, color: '#5C5C5C' }}>{v.subcategory}</span>
                      <span style={{ color: '#2A2A2A', fontSize: 10 }}>·</span>
                      <span style={{ fontSize: 10, color: '#5C5C5C' }}>{formatDistance(v.distance)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 9999,
                      background: status.isOpen ? 'rgba(0,200,150,0.1)' : 'rgba(72,72,72,0.1)',
                      color: status.isOpen ? '#00C896' : '#5C5C5C',
                      border: `1px solid ${status.isOpen ? 'rgba(0,200,150,0.22)' : '#222'}`,
                    }}>
                      {status.isOpen ? 'Open' : 'Closed'}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); toggleSavedVendor(v.id); }}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'rgba(255,77,106,0.12)', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Heart size={12} color="#FF4D6A" fill="#FF4D6A" />
                    </button>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════════════════ */
function NotificationsPage({ onBack }: { onBack: () => void }) {
  const { notificationsEnabled, toggleNotifications } = useUser();

  const notifTypes = [
    { label: 'Vendor Updates', desc: 'New offers, hours changes, and promotions', enabled: notificationsEnabled },
    { label: 'Local Alerts',   desc: 'Maintenance, power cuts, and emergencies', enabled: notificationsEnabled },
    { label: 'Society Notices',desc: 'Messages from your society committee',     enabled: notificationsEnabled },
  ];

  return (
    <motion.div
      key="notifications"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#0D0D0D', zIndex: 10 }}
    >
      <SubHeader title="Notifications" onBack={onBack} />
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>

        {/* Master toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px', borderRadius: 16, border: '1px solid #1A1A1A',
          background: '#161616', marginBottom: 20,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>All Notifications</p>
            <p style={{ fontSize: 11, color: '#5C5C5C', margin: '3px 0 0' }}>
              {notificationsEnabled ? 'Enabled — you\'re staying in the loop' : 'Disabled — you won\'t receive any alerts'}
            </p>
          </div>
          <button
            onClick={toggleNotifications}
            style={{
              width: 50, height: 28, borderRadius: 9999, flexShrink: 0,
              background: notificationsEnabled ? '#00C896' : '#2A2A2A',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <span style={{
              position: 'absolute', top: 3,
              left: notificationsEnabled ? 25 : 3,
              width: 22, height: 22, borderRadius: '50%',
              background: 'white',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }} />
          </button>
        </div>

        {/* Notification types */}
        <p style={{ fontSize: 12, fontWeight: 700, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
          Notification Types
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifTypes.map(item => (
            <div
              key={item.label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: 16,
                border: '1px solid #1A1A1A', background: '#161616',
                opacity: notificationsEnabled ? 1 : 0.45,
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: 11, color: '#5C5C5C', margin: '3px 0 0' }}>{item.desc}</p>
              </div>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: item.enabled ? 'rgba(0,200,150,0.2)' : '#2A2A2A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.enabled && <Check size={10} color="#00C896" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRIVACY & SAFETY
   ═══════════════════════════════════════════════════════════════════════════ */
function PrivacySafetyPage({ onBack }: { onBack: () => void }) {
  const sections = [
    {
      title: 'Data We Collect',
      icon: '📋',
      body: 'GeoHood collects your name, phone number, and locality to provide hyper-local neighbourhood services. No financial data is ever stored.',
    },
    {
      title: 'How We Use It',
      icon: '🔍',
      body: 'Your data is used solely to personalise your neighbourhood feed, show nearby vendors, and send local alerts. We never sell your data to third parties.',
    },
    {
      title: 'Location Access',
      icon: '📍',
      body: 'Location is used only when you open the Map screen and is never tracked in the background. We use your pincode/locality, not GPS coordinates.',
    },
    {
      title: 'Vendor Safety',
      icon: '✅',
      body: 'All vendors on GeoHood are real local businesses. Verified badges indicate businesses we\'ve manually confirmed. Report any suspicious listing using the in-app flag.',
    },
    {
      title: 'Your Rights',
      icon: '🛡️',
      body: 'You can delete your account and all associated data at any time by signing out and not re-registering. For data deletion requests, contact support@geohood.in.',
    },
    {
      title: 'Community Safety',
      icon: '🤝',
      body: 'GeoHood is built for real neighbours. Fake accounts, spam, and harassment are removed. Society notices are moderated by committee members.',
    },
  ];

  return (
    <motion.div
      key="privacy"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#0D0D0D', zIndex: 10 }}
    >
      <SubHeader title="Privacy & Safety" onBack={onBack} />
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 48px' }}>

        {/* Hero */}
        <div style={{
          padding: '16px', borderRadius: 18, marginBottom: 16,
          background: 'rgba(0,200,150,0.05)', border: '1px solid rgba(0,200,150,0.18)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'rgba(0,200,150,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={20} color="#00C896" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>Your privacy matters</p>
            <p style={{ fontSize: 12, color: '#5C5C5C', margin: '3px 0 0' }}>GeoHood V1 · Patuli, Kolkata</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                padding: '14px 16px', borderRadius: 16,
                border: '1px solid #1A1A1A', background: '#161616',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>{s.title}</p>
              </div>
              <p style={{ fontSize: 12, color: '#ADADAD', lineHeight: 1.65, margin: 0 }}>{s.body}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 16, border: '1px solid #2A2A2A', background: '#111111' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertCircle size={14} color="#F5A623" />
            <p style={{ fontSize: 12, fontWeight: 700, color: '#F5A623', margin: 0 }}>Questions or Concerns?</p>
          </div>
          <p style={{ fontSize: 12, color: '#5C5C5C', margin: 0, lineHeight: 1.55 }}>
            Reach us at <span style={{ color: '#00C896' }}>support@geohood.in</span> for any privacy-related queries. We respond within 24 hours.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIGN-OUT CONFIRM MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
function SignOutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 20,
        display: 'flex', alignItems: 'flex-end',
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', background: '#161616',
          borderRadius: '24px 24px 0 0', padding: '24px 20px',
          paddingBottom: 'calc(var(--safe-bottom) + 24px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 4, height: 4, borderRadius: 9999, background: '#3A3A3A',
          }} />
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: 16, background: 'rgba(255,77,106,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <LogOut size={22} color="#FF4D6A" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#EBEBEB', textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Sign Out?
        </h2>
        <p style={{ fontSize: 13, color: '#5C5C5C', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>
          You'll be signed out of GeoHood. Your locality and saved vendors will be cleared.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '14px', borderRadius: 16,
              border: '1px solid #2A2A2A', background: '#1A1A1A',
              fontSize: 14, fontWeight: 600, color: '#ADADAD', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '14px', borderRadius: 16,
              border: 'none', background: '#FF4D6A',
              fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PHOTO OPTIONS BOTTOM SHEET
   ═══════════════════════════════════════════════════════════════════════════ */
function PhotoOptionsSheet({
  hasPhoto,
  onCamera,
  onGallery,
  onRemove,
  onCancel,
}: {
  hasPhoto:  boolean;
  onCamera:  () => void;
  onGallery: () => void;
  onRemove:  () => void;
  onCancel:  () => void;
}) {
  const options = [
    {
      icon:    Camera,
      label:   'Take Photo',
      sub:     'Open device camera',
      color:   '#00C896',
      bgColor: 'rgba(0,200,150,0.1)',
      action:  onCamera,
    },
    {
      icon:    ImagePlus,
      label:   'Choose from Library',
      sub:     'Pick from photos & albums',
      color:   '#4D9EFF',
      bgColor: 'rgba(77,158,255,0.1)',
      action:  onGallery,
    },
    ...(hasPhoto ? [{
      icon:    Trash2,
      label:   'Remove Photo',
      sub:     'Revert to initials avatar',
      color:   '#FF4D6A',
      bgColor: 'rgba(255,77,106,0.08)',
      action:  onRemove,
    }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 30,
        display: 'flex', alignItems: 'flex-end',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          background: '#161616',
          borderRadius: '24px 24px 0 0',
          padding: '8px 16px',
          paddingBottom: 'calc(var(--safe-bottom, 0px) + 20px)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 16px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 9999, background: '#2A2A2A' }} />
        </div>

        {/* Title */}
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#5C5C5C',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          margin: '0 0 12px', paddingLeft: 4,
        }}>
          Profile Photo
        </p>

        {/* Option buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {options.map(opt => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.label}
                whileTap={{ scale: 0.98 }}
                onClick={opt.action}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 18,
                  border: `1px solid ${opt.color}22`,
                  background: opt.bgColor,
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${opt.color}18`,
                }}>
                  <Icon size={18} color={opt.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>{opt.label}</p>
                  <p style={{ fontSize: 11, color: '#5C5C5C', margin: '2px 0 0' }}>{opt.sub}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          style={{
            width: '100%', padding: '14px', borderRadius: 16,
            border: '1px solid #2A2A2A', background: '#1A1A1A',
            fontSize: 14, fontWeight: 600, color: '#5C5C5C', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PROFILE SCREEN
   ═══════════════════════════════════════════════════════════════════════════ */
export function ProfileScreen({ onClose }: Props) {
  const {
    user, myVendor, selectedLocality, savedVendorIds,
    notificationsEnabled, signOut,
    profilePhoto, setProfilePhoto,
  } = useUser();
  const [section, setSection]         = useState<Section>('main');
  const [showSignOut, setShowSignOut]  = useState(false);
  const [showPhotoOpts, setShowPhotoOpts] = useState(false);

  // Hidden file inputs
  const cameraInputRef  = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  /* Read selected file → DataURL → persist */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setProfilePhoto(dataUrl);
        console.log('[GeoHood Profile] Photo saved, size:', Math.round(dataUrl.length / 1024), 'KB');
      }
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-picked
    e.target.value = '';
    setShowPhotoOpts(false);
  }, [setProfilePhoto]);

  const handleCamera = useCallback(() => {
    setShowPhotoOpts(false);
    // Small delay so sheet closes before native picker opens
    setTimeout(() => cameraInputRef.current?.click(), 120);
  }, []);

  const handleGallery = useCallback(() => {
    setShowPhotoOpts(false);
    setTimeout(() => galleryInputRef.current?.click(), 120);
  }, []);

  const handleRemovePhoto = useCallback(() => {
    setProfilePhoto(null);
    setShowPhotoOpts(false);
  }, [setProfilePhoto]);

  const localityName = LOCALITIES.find(l => l.id === selectedLocality)?.name ?? 'Patuli';

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : null;

  const menuItems = [
    {
      icon: MapPin, label: 'My Locality',      sub: `${localityName}, Kolkata`,
      section: 'locality' as Section,
    },
    {
      icon: Heart,  label: 'Saved Vendors',    sub: `${savedVendorIds.length} saved`,
      section: 'saved' as Section,
    },
    {
      icon: Bell,   label: 'Notifications',    sub: notificationsEnabled ? 'On' : 'Off',
      section: 'notifications' as Section,
    },
    {
      icon: Shield, label: 'Privacy & Safety', sub: '',
      section: 'privacy' as Section,
    },
    ...(myVendor ? [{
      icon: Store, label: 'My Business', sub: myVendor.businessName,
      section: 'main' as Section,
    }] : []),
  ];

  const handleSignOut = () => {
    signOut();
    setShowSignOut(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.22, ease: [0.32, 0, 0.18, 1] }}
      style={{
        position: 'absolute', inset: 0, zIndex: 60,
        display: 'flex', flexDirection: 'column',
        background: '#0D0D0D', overflow: 'hidden',
      }}
    >
      {/* ── Main header ── */}
      <div style={{
        flexShrink: 0,
        padding: 'calc(var(--safe-top) + 20px) 20px 16px',
        borderBottom: '1px solid #1A1A1A',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: 0 }}>Profile</h1>
          <p style={{ fontSize: 12, color: '#5C5C5C', marginTop: 3 }}>{localityName} · GeoHood Member</p>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1A1A1A', border: 'none', cursor: 'pointer',
          }}
        >
          <X size={16} color="#ADADAD" />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>

        {/* ── Hidden file inputs (camera + gallery) ── */}
        {/* capture="user" requests front camera on mobile; browser falls back gracefully on desktop */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px 20px' }}>
          {/* Tappable avatar ring */}
          <button
            onClick={() => setShowPhotoOpts(true)}
            style={{
              position: 'relative', width: 88, height: 88,
              borderRadius: '50%', marginBottom: 14,
              padding: 0, border: 'none', cursor: 'pointer', background: 'transparent',
              flexShrink: 0,
            }}
            aria-label="Edit profile photo"
          >
            {/* Avatar face */}
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              background: profilePhoto ? 'transparent' : (initials ? 'rgba(0,200,150,0.1)' : '#161616'),
              border: `2.5px solid ${profilePhoto ? '#00C896' : (initials ? 'rgba(0,200,150,0.3)' : '#2A2A2A')}`,
              boxSizing: 'border-box',
            }}>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : initials ? (
                <span style={{ fontSize: 28, fontWeight: 800, color: '#00C896' }}>{initials}</span>
              ) : (
                <User size={32} color="#3A3A3A" />
              )}
            </div>

            {/* Camera badge (bottom-right) */}
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 26, height: 26, borderRadius: '50%',
              background: '#00C896',
              border: '2px solid #0D0D0D',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Camera size={13} color="#0D0D0D" />
            </div>
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#EBEBEB', margin: 0, letterSpacing: '-0.02em' }}>
            {user?.name ?? 'GeoHood User'}
          </h2>
          {user?.phone && (
            <p style={{ fontSize: 12, color: '#5C5C5C', marginTop: 4 }}>+91 {user.phone}</p>
          )}
          <p style={{ fontSize: 12, color: '#5C5C5C', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={11} color="#5C5C5C" />
            {localityName}, Kolkata
          </p>

          {/* Role chips */}
          {user?.roles && user.roles.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {user.roles.map(role => (
                <span
                  key={role}
                  style={{
                    padding: '4px 10px', borderRadius: 9999, fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    background:  role === 'vendor' ? 'rgba(0,200,150,0.1)' : 'rgba(77,158,255,0.1)',
                    color:       role === 'vendor' ? '#00C896' : '#4D9EFF',
                    border:      role === 'vendor' ? '1px solid rgba(0,200,150,0.22)' : '1px solid rgba(77,158,255,0.22)',
                  }}
                >
                  {role === 'society_member' ? 'Society' : role}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            borderRadius: 18, border: '1px solid #1E1E1E', background: '#111111',
            padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          }}>
            {[
              { value: String(savedVendorIds.length), label: 'Saved',   color: '#00C896' },
              { value: '12',                          label: 'Visited',  color: '#4D9EFF' },
              { value: '87',                          label: 'Trust',    color: '#A855F7' },
            ].map((s, i) => (
              <div key={s.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                borderLeft: i > 0 ? '1px solid #1E1E1E' : 'none',
              }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 11, color: '#5C5C5C', fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div style={{ padding: '0 20px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => item.section !== 'main' && setSection(item.section)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 16,
                  border: '1px solid #1A1A1A', background: '#161616',
                  textAlign: 'left', cursor: 'pointer', width: '100%',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#1A1A1A',
                }}>
                  <Icon size={16} color="#ADADAD" strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', display: 'block' }}>{item.label}</span>
                  {item.sub && (
                    <span style={{ fontSize: 11, color: '#5C5C5C', display: 'block', marginTop: 2 }}>{item.sub}</span>
                  )}
                </div>
                <ChevronRight size={15} color="#2A2A2A" style={{ flexShrink: 0 }} />
              </motion.button>
            );
          })}
        </div>

        {/* Sign out + version */}
        <div style={{ padding: '8px 20px 32px' }}>
          <button
            onClick={() => setShowSignOut(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px', borderRadius: 16, fontSize: 13, fontWeight: 600,
              border: '1px solid rgba(255,77,106,0.2)', background: 'rgba(255,77,106,0.06)',
              color: '#FF4D6A', cursor: 'pointer',
            }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#2A2A2A', marginTop: 16 }}>
            GeoHood V1 · {localityName}, Kolkata
          </p>
        </div>
      </div>

      {/* ── Sub-pages overlay ── */}
      <AnimatePresence>
        {section === 'locality'      && <LocalitySelector   onBack={() => setSection('main')} />}
        {section === 'saved'         && <SavedVendors        onBack={() => setSection('main')} />}
        {section === 'notifications' && <NotificationsPage   onBack={() => setSection('main')} />}
        {section === 'privacy'       && <PrivacySafetyPage   onBack={() => setSection('main')} />}
      </AnimatePresence>

      {/* ── Photo options sheet ── */}
      <AnimatePresence>
        {showPhotoOpts && (
          <PhotoOptionsSheet
            hasPhoto={!!profilePhoto}
            onCamera={handleCamera}
            onGallery={handleGallery}
            onRemove={handleRemovePhoto}
            onCancel={() => setShowPhotoOpts(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sign-out confirm ── */}
      <AnimatePresence>
        {showSignOut && (
          <SignOutModal onConfirm={handleSignOut} onCancel={() => setShowSignOut(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
