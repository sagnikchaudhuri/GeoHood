import React from 'react';
import { MapPin } from 'lucide-react';
import { Vendor } from '../../types';
import { StarRating } from '../ui/StarRating';
import { StatusPill } from '../ui/StatusPill';
import { LiveIndicator } from '../ui/LiveIndicator';
import { CATEGORY_MAP } from '../../constants';
import { getOpenStatus, formatDistance } from '../../utils/timeUtils';
import { useAppContext } from '../../context/AppContext';

interface VendorTopCardProps {
  vendor: Vendor;
}

export function VendorTopCard({ vendor }: VendorTopCardProps) {
  const { setSelectedVendor } = useAppContext();
  const cat    = CATEGORY_MAP[vendor.category];
  const status = getOpenStatus(vendor.openTime, vendor.closeTime);

  return (
    <button
      onClick={() => setSelectedVendor(vendor)}
      className="flex-none w-44 text-left rounded-2xl border border-[#1E1E1E] bg-[#161616] hover:border-[#2A2A2A] hover:bg-[#1A1A1A] overflow-hidden transition-all active:scale-[0.98]"
    >
      {/* Header gradient */}
      <div
        className="h-20 flex items-center justify-center text-4xl"
        style={{ background: `linear-gradient(135deg, ${cat?.bgColor ?? 'rgba(136,136,136,0.12)'}, rgba(0,0,0,0.2))` }}
      >
        {cat?.icon ?? '📦'}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-sm font-semibold text-[#EBEBEB] truncate flex-1">{vendor.name}</span>
          {vendor.isLive && <LiveIndicator size={7} />}
        </div>
        <span className="text-[11px] text-[#5C5C5C] block mb-2">{vendor.subcategory}</span>

        <div className="flex items-center justify-between">
          <StarRating rating={vendor.rating} />
          <span className="flex items-center gap-0.5 text-[11px] text-[#5C5C5C]">
            <MapPin size={9} color="#5C5C5C" />
            {formatDistance(vendor.distance)}
          </span>
        </div>

        <div className="mt-2">
          <StatusPill status={status} />
        </div>

        {vendor.offers && (
          <div className="mt-2 text-[10px] text-[#F5A623] truncate">🎁 {vendor.offers}</div>
        )}
      </div>
    </button>
  );
}
