import React from 'react';
import { User, MapPin, Star, Bell, Shield, ChevronRight, LogOut, X, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { LOCALITIES } from '../data/localities';

interface Props {
  onClose: () => void;
}

export function ProfileScreen({ onClose }: Props) {
  const { user, myVendor, selectedLocality } = useUser();

  const localityName = LOCALITIES.find(l => l.id === selectedLocality)?.name
    ?? user?.locality
    ?? 'Patuli';

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : null;

  const menuItems = [
    { icon: MapPin, label: 'My Locality',     sub: `${localityName}, Kolkata`            },
    { icon: Star,   label: 'Saved Vendors',   sub: '4 saved'                             },
    { icon: Bell,   label: 'Notifications',   sub: 'On'                                  },
    { icon: Shield, label: 'Privacy & Safety',sub: ''                                    },
    ...(myVendor ? [{ icon: Store, label: 'My Business', sub: myVendor.businessName }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.22, ease: [0.32, 0, 0.18, 1] }}
      style={{
        position: 'absolute', inset: 0, zIndex: 60,
        display: 'flex', flexDirection: 'column',
        background: '#0D0D0D',
      }}
    >
      {/* ── Header ── */}
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

      {/* ── Body ── */}
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto' }}>

        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px 20px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', marginBottom: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: initials ? 'rgba(0,200,150,0.1)' : '#161616',
            border: `2px solid ${initials ? 'rgba(0,200,150,0.25)' : '#2A2A2A'}`,
          }}>
            {initials
              ? <span style={{ fontSize: 26, fontWeight: 800, color: '#00C896' }}>{initials}</span>
              : <User size={32} color="#3A3A3A" />
            }
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#EBEBEB', margin: 0, letterSpacing: '-0.02em' }}>
            {user?.name ?? 'GeoHood User'}
          </h2>
          {user?.phone && (
            <p style={{ fontSize: 12, color: '#5C5C5C', marginTop: 4 }}>+91 {user.phone}</p>
          )}
          <p style={{ fontSize: 12, color: '#5C5C5C', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={11} color="#5C5C5C" />
            {localityName}, Kolkata 700094
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
              { value: '4',  label: 'Saved',   color: '#00C896' },
              { value: '12', label: 'Visited',  color: '#4D9EFF' },
              { value: '87', label: 'Trust',    color: '#A855F7' },
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
          <button style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px', borderRadius: 16, fontSize: 13, fontWeight: 600,
            border: '1px solid #1A1A1A', background: '#161616',
            color: '#5C5C5C', cursor: 'pointer',
          }}>
            <LogOut size={15} />
            Sign Out
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#2A2A2A', marginTop: 16 }}>
            GeoHood V1 · {localityName}, Kolkata
          </p>
        </div>
      </div>
    </motion.div>
  );
}
