import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'verified' | 'premium' | 'live' | 'open' | 'closed' | 'urgent' | 'default';
  size?: 'sm' | 'md';
}

const VARIANT_STYLES: Record<string, string> = {
  verified: 'bg-[rgba(0,200,150,0.12)] text-[#00C896] border border-[rgba(0,200,150,0.25)]',
  premium:  'bg-[rgba(245,166,35,0.12)] text-[#F5A623] border border-[rgba(245,166,35,0.25)]',
  live:     'bg-[rgba(255,77,106,0.14)] text-[#FF4D6A] border border-[rgba(255,77,106,0.28)]',
  open:     'bg-[rgba(0,200,150,0.10)] text-[#00C896] border border-[rgba(0,200,150,0.22)]',
  closed:   'bg-[rgba(72,72,72,0.18)] text-[#5C5C5C] border border-[rgba(72,72,72,0.25)]',
  urgent:   'bg-[rgba(245,166,35,0.12)] text-[#F5A623] border border-[rgba(245,166,35,0.25)]',
  default:  'bg-[rgba(255,255,255,0.06)] text-[#ADADAD] border border-[rgba(255,255,255,0.08)]',
};

export function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';
  return (
    <span className={`inline-flex items-center rounded-full font-semibold tracking-wide ${pad} ${VARIANT_STYLES[variant]}`}>
      {label}
    </span>
  );
}
