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
      className="absolute inset-0 flex flex-col bg-[#0D0D0D]"
      style={{ zIndex: 60 }}
    >
      {/* Header bar */}
      <div
        className="flex-none flex items-center justify-between px-5 pb-4 border-b border-[#1A1A1A]"
        style={{ paddingTop: 'calc(var(--safe-top) + 20px)' }}
      >
        <div>
          <h1 className="text-base font-bold text-[#EBEBEB]">Profile</h1>
          <p className="text-xs text-[#5C5C5C]">{localityName} · GeoHood Member</p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1A1A1A]"
        >
          <X size={17} color="#ADADAD" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Avatar + name */}
        <div className="flex flex-col items-center px-5 pt-8 pb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3 border-2"
            style={{
              background:   initials ? 'rgba(0,200,150,0.1)' : '#161616',
              borderColor:  initials ? 'rgba(0,200,150,0.25)' : '#2A2A2A',
            }}
          >
            {initials
              ? <span className="text-2xl font-bold" style={{ color: '#00C896' }}>{initials}</span>
              : <User size={32} color="#3A3A3A" />
            }
          </div>
          <h2 className="text-lg font-bold text-[#EBEBEB]">
            {user?.name ?? 'GeoHood User'}
          </h2>
          {user?.phone && (
            <p className="text-xs text-[#5C5C5C] mt-0.5">+91 {user.phone}</p>
          )}
          <p className="text-xs text-[#5C5C5C] mt-0.5 flex items-center gap-1">
            <MapPin size={11} color="#5C5C5C" />
            {localityName}, Kolkata 700094
          </p>

          {/* Role chips */}
          {user?.roles && user.roles.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
              {user.roles.map(role => (
                <span
                  key={role}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background:  role === 'vendor' ? 'rgba(0,200,150,0.1)' : 'rgba(77,158,255,0.1)',
                    color:       role === 'vendor' ? '#00C896' : '#4D9EFF',
                    border:      role === 'vendor' ? '1px solid rgba(0,200,150,0.2)' : '1px solid rgba(77,158,255,0.2)',
                  }}
                >
                  {role === 'society_member' ? 'Society' : role}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="px-5 pb-5">
          <div className="rounded-2xl border border-[#1E1E1E] bg-[#161616] p-4 grid grid-cols-3 divide-x divide-[#1E1E1E]">
            {[
              { value: '4',  label: 'Saved'   },
              { value: '12', label: 'Visited' },
              { value: '87', label: 'Trust'   },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="text-xl font-bold text-[#EBEBEB]">{s.value}</span>
                <span className="text-[11px] text-[#5C5C5C] font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="px-5 pb-6 flex flex-col gap-1">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[#1E1E1E] bg-[#161616] hover:border-[#2A2A2A] hover:bg-[#1A1A1A] transition-all text-left"
              >
                <div className="w-9 h-9 flex-none flex items-center justify-center rounded-xl bg-[#1A1A1A]">
                  <Icon size={17} color="#ADADAD" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-[#EBEBEB]">{item.label}</span>
                  {item.sub && (
                    <span className="text-xs text-[#5C5C5C] block mt-0.5">{item.sub}</span>
                  )}
                </div>
                <ChevronRight size={16} color="#3A3A3A" />
              </motion.button>
            );
          })}

          <button className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#1E1E1E] bg-[#161616] text-[#5C5C5C] text-sm hover:text-[#FF4D6A] hover:border-[rgba(255,77,106,0.2)] transition-colors">
            <LogOut size={16} />
            Sign Out
          </button>

          <p className="text-center text-[11px] text-[#3A3A3A] mt-6">
            GeoHood V1 · {localityName}, Kolkata
          </p>
        </div>
      </div>
    </motion.div>
  );
}
