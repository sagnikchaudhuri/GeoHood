import React from 'react';

interface LiveIndicatorProps {
  size?: number;
  className?: string;
}

export function LiveIndicator({ size = 8, className = '' }: LiveIndicatorProps) {
  return (
    <span className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
      <span
        className="gh-pulse absolute inset-0 rounded-full bg-[#FF4D6A]"
        style={{ width: size, height: size }}
      />
      <span
        className="relative rounded-full bg-[#FF4D6A]"
        style={{ width: size, height: size }}
      />
    </span>
  );
}
