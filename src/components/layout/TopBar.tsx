import React from 'react';
import { Bell, ChevronDown, Menu } from 'lucide-react';
import { GeoHoodLogoMark } from '../brand/GeoHoodLogo';
import { useAppContext } from '../../context/AppContext';
import { useUser } from '../../context/UserContext';
import { LOCALITIES } from '../../data/localities';

interface TopBarProps {
  scrolled?: boolean;
}

export function TopBar({ scrolled = false }: TopBarProps) {
  const { locality }         = useAppContext();
  const { selectedLocality } = useUser();

  const localityName = LOCALITIES.find(l => l.id === selectedLocality)?.name
    ?? locality.split(',')[0];

  return (
    <header
      className="flex-none flex items-center gap-3 px-4 transition-all duration-200"
      style={{
        height:       'var(--topbar-height)',
        background:   scrolled ? 'rgba(13,13,13,0.96)' : 'transparent',
        borderBottom: scrolled ? '1px solid #1A1A1A' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      {/* Hamburger */}
      <button
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#1A1A1A] transition-colors flex-none"
        aria-label="Menu"
      >
        <Menu size={20} color="#ADADAD" strokeWidth={1.8} />
      </button>

      {/* Logo mark + wordmark */}
      <div className="flex items-center gap-2 flex-none">
        <GeoHoodLogoMark size={26} />
        <span
          className="font-bold text-[#EBEBEB]"
          style={{ fontSize: 16, letterSpacing: '-0.02em' }}
        >
          GeoHood
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Locality selector pill */}
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
        style={{
          background:   'rgba(22,22,22,0.9)',
          borderColor:  '#2A2A2A',
        }}
      >
        <span className="text-xs font-semibold text-[#EBEBEB]">{localityName}, Kolkata</span>
        <ChevronDown size={12} color="#5C5C5C" />
      </button>

      {/* Bell */}
      <button
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#1A1A1A] transition-colors flex-none"
        aria-label="Notifications"
      >
        <Bell size={18} color="#ADADAD" strokeWidth={1.8} />
        {/* Notification badge */}
        <span
          className="absolute flex items-center justify-center text-[9px] font-bold text-white"
          style={{
            top:          3,
            right:        3,
            width:        16,
            height:       16,
            borderRadius: '50%',
            background:   '#FF4D6A',
            border:       '1.5px solid #0D0D0D',
          }}
        >
          2
        </span>
      </button>
    </header>
  );
}
