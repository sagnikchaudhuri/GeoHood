import React from 'react';
import { User, MapPin, Star, Bell, Shield, ChevronRight, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const MENU_ITEMS = [
  { icon: MapPin, label: 'My Locality',         sub: 'Patuli, Kolkata' },
  { icon: Star,   label: 'Saved Vendors',        sub: '4 saved' },
  { icon: Bell,   label: 'Notifications',        sub: 'On' },
  { icon: Shield, label: 'Privacy & Safety',     sub: '' },
];

export function ProfileScreen() {
  return (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
      {/* Header */}
      <div className="flex-none px-5 pt-8 pb-6 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-[#161616] border-2 border-[#2A2A2A] flex items-center justify-center mb-3">
          <User size={32} color="#3A3A3A" />
        </div>
        <h2 className="text-lg font-bold text-[#EBEBEB]">Guest User</h2>
        <p className="text-xs text-[#5C5C5C] mt-0.5 flex items-center gap-1">
          <MapPin size={11} color="#5C5C5C" />
          Patuli, Kolkata 700094
        </p>
      </div>

      {/* Stats */}
      <div className="px-5 pb-5">
        <div className="rounded-2xl border border-[#1E1E1E] bg-[#161616] p-4 grid grid-cols-3 divide-x divide-[#1E1E1E]">
          {[
            { value: '4', label: 'Saved' },
            { value: '12', label: 'Visited' },
            { value: '87', label: 'Trust' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-0.5">
              <span className="text-xl font-bold text-[#EBEBEB]">{s.value}</span>
              <span className="text-[11px] text-[#5C5C5C] font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ scrollbarWidth: 'none' }}>
        <div className="flex flex-col gap-1">
          {MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
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
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#1E1E1E] bg-[#161616] text-[#5C5C5C] text-sm hover:text-[#FF4D6A] hover:border-[rgba(255,77,106,0.2)] transition-colors">
          <LogOut size={16} />
          Sign Out
        </button>

        <p className="text-center text-[11px] text-[#3A3A3A] mt-6">GeoHood V1 · Patuli, Kolkata</p>
      </div>
    </div>
  );
}
