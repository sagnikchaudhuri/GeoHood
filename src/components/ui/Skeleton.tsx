import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: string;
  className?: string;
}

export function Skeleton({ width, height, rounded = 'rounded-lg', className = '' }: SkeletonProps) {
  return (
    <div
      className={`gh-shimmer bg-[#222222] ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
}
