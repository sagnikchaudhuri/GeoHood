import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export function StarRating({ rating, reviewCount, size = 12 }: StarRatingProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <Star size={size} className="text-[#F5A623] fill-[#F5A623]" />
      <span className="text-[#EBEBEB] font-semibold text-xs">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-[#5C5C5C] text-xs">({reviewCount})</span>
      )}
    </span>
  );
}
