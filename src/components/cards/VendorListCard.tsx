import React from 'react';
import { Phone, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Vendor } from '../../types';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { StatusPill } from '../ui/StatusPill';
import { LiveIndicator } from '../ui/LiveIndicator';
import { CATEGORY_MAP } from '../../constants';
import { getOpenStatus, formatDistance } from '../../utils/timeUtils';
import { useAppContext } from '../../context/AppContext';

interface VendorListCardProps {
  vendor: Vendor;
  index?: number;
}

export function VendorListCard({ vendor, index = 0 }: VendorListCardProps) {
  const { setSelectedVendor } = useAppContext();
  const cat    = CATEGORY_MAP[vendor.category];
  const status = getOpenStatus(vendor.openTime, vendor.closeTime);

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      onClick={() => setSelectedVendor(vendor)}
      className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[#1E1E1E] bg-[#161616] hover:border-[#2A2A2A] hover:bg-[#1A1A1A] active:scale-[0.99] transition-all"
    >
      {/* Category icon bubble */}
      <div
        className="w-11 h-11 flex-none flex items-center justify-center rounded-xl text-xl"
        style={{ background: cat?.bgColor ?? 'rgba(136,136,136,0.12)' }}
      >
        {cat?.icon ?? '📦'}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-[#EBEBEB] truncate">{vendor.name}</span>
              {vendor.isLive && <LiveIndicator size={7} />}
            </div>
            <span className="text-[11px] text-[#5C5C5C] font-medium">{vendor.subcategory}</span>
          </div>
          <ChevronRight size={16} color="#3A3A3A" className="flex-none mt-0.5" />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <StarRating rating={vendor.rating} reviewCount={vendor.reviewCount} />
          <span className="text-[#2A2A2A]">·</span>
          <span className="flex items-center gap-0.5 text-[11px] text-[#5C5C5C]">
            <MapPin size={10} color="#5C5C5C" />
            {formatDistance(vendor.distance)}
          </span>
          <span className="text-[#2A2A2A]">·</span>
          <StatusPill status={status} />
          {vendor.isVerified && <Badge label="✓" variant="verified" />}
          {vendor.isPremium  && <Badge label="★" variant="premium" />}
        </div>

        {vendor.offers && (
          <div className="mt-1.5 text-[10px] text-[#F5A623] font-medium truncate">
            🎁 {vendor.offers}
          </div>
        )}
      </div>
    </motion.button>
  );
}
