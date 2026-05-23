import React from 'react';

interface ChipProps {
  label: string;
  icon?: string;
  active?: boolean;
  onClick?: () => void;
  color?: string;
  bgColor?: string;
}

export function Chip({ label, icon, active, onClick, color, bgColor }: ChipProps) {
  const activeStyle = active
    ? {
        background: bgColor ?? 'rgba(0,200,150,0.14)',
        color:      color   ?? '#00C896',
        borderColor: color  ?? '#00C896',
      }
    : {};

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium
        whitespace-nowrap transition-all duration-150
        ${active
          ? 'border-opacity-50'
          : 'bg-[#161616] text-[#ADADAD] border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-[#EBEBEB]'
        }
      `}
      style={activeStyle}
    >
      {icon && <span className="text-base leading-none">{icon}</span>}
      {label}
    </button>
  );
}
