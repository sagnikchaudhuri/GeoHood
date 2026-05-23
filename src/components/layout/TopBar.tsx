import React from 'react';
import { Bell, ChevronDown, MapPin } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface TopBarProps {
  scrolled?: boolean;
}

export function TopBar({ scrolled = false }: TopBarProps) {
  const { locality } = useAppContext();

  return (
    <header
      className="flex-none flex items-center justify-between px-5 transition-all duration-200"
      style={{
        height: 'var(--topbar-height)',
        background: scrolled ? 'rgba(13,13,13,0.96)' : 'transparent',
        borderBottom: scrolled ? '1px solid #1A1A1A' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      {/* Locality selector */}
      <button className="flex items-center gap-1.5">
        <MapPin size={14} color="#00C896" />
        <span className="text-sm font-semibold text-[#EBEBEB]">{locality.split(',')[0]}, Kolkata</span>
        <ChevronDown size={13} color="#5C5C5C" />
      </button>

      {/* Bell */}
      <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#1A1A1A] transition-colors">
        <Bell size={18} color="#ADADAD" strokeWidth={1.8} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF4D6A] border-2 border-[#0D0D0D]" />
      </button>
    </header>
  );
}
