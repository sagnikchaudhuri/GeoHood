import React from 'react';
import { OpenStatus } from '../../types';

interface StatusPillProps {
  status: OpenStatus;
  size?: 'sm' | 'md';
}

export function StatusPill({ status, size = 'sm' }: StatusPillProps) {
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';

  if (status.isOpen) {
    const cls = status.urgent
      ? 'bg-[rgba(245,166,35,0.12)] text-[#F5A623] border border-[rgba(245,166,35,0.28)]'
      : 'bg-[rgba(0,200,150,0.10)] text-[#00C896] border border-[rgba(0,200,150,0.25)]';
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${pad} ${cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status.urgent ? 'bg-[#F5A623]' : 'bg-[#00C896]'}`} />
        {status.short}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-[rgba(72,72,72,0.16)] text-[#5C5C5C] border border-[rgba(72,72,72,0.22)] ${pad}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#484848]" />
      {status.short}
    </span>
  );
}
