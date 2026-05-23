import React, { useState } from 'react';
import { X, Phone, MessageCircle, MapPin, Clock, ChevronLeft, Share2, Heart, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Vendor } from '../../types';
import { CATEGORY_MAP } from '../../constants';
import { getOpenStatus, formatDistance } from '../../utils/timeUtils';
import { useAppContext } from '../../context/AppContext';

export function VendorDetailSheet() {
  const { selectedVendor, setSelectedVendor } = useAppContext();
  const close = () => setSelectedVendor(null);

  return (
    <AnimatePresence>
      {selectedVendor && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl overflow-hidden"
            style={{ background: '#111111', maxHeight: '92vh', maxWidth: 480, margin: '0 auto' }}
          >
            <SheetContent vendor={selectedVendor} onClose={close} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SheetContent({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const cat    = CATEGORY_MAP[vendor.category];
  const status = getOpenStatus(vendor.openTime, vendor.closeTime);
  const [timingsOpen, setTimingsOpen] = useState(false);

  return (
    <div className="flex flex-col" style={{ maxHeight: '92vh' }}>
      {/* ── Hero area ── */}
      <div className="relative flex-none" style={{ height: 200 }}>
        {/* Gradient placeholder (no real image in mock) */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${cat?.bgColor ?? 'rgba(136,136,136,0.15)'} 0%, #0D0D0D 100%)`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span style={{ fontSize: 96 }}>{cat?.icon ?? '📦'}</span>
          </div>
          {/* Vendor name overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-3"
            style={{ background: 'linear-gradient(to top, rgba(17,17,17,1) 0%, transparent 100%)', paddingTop: 40 }}
          />
        </div>

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          >
            <ChevronLeft size={20} color="white" />
          </button>
          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            >
              <Share2 size={16} color="white" />
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            >
              <Heart size={16} color="white" />
            </button>
          </div>
        </div>

        {/* Open/Closed pill on hero */}
        <div className="absolute bottom-3 right-4">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{
              background: status.isOpen ? '#00C896' : '#2A2A2A',
              color: status.isOpen ? 'white' : '#5C5C5C',
            }}
          >
            {status.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Vendor identity */}
        <div className="px-5 pt-4 pb-3 border-b border-[#1A1A1A]">
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: cat?.bgColor ?? 'rgba(136,136,136,0.12)', color: cat?.color ?? '#888' }}
            >
              {cat?.icon} {vendor.subcategory}
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#EBEBEB] mb-1">{vendor.name}</h2>

          {/* LSI · Distance · Rating row */}
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: '#00C896' }} />
              <span className="text-[#00C896] font-bold">LSI {Math.round(50 + vendor.rating * 8)}</span>
            </span>
            <span className="text-[#2A2A2A]">·</span>
            <span className="text-[#5C5C5C]">{formatDistance(vendor.distance)}</span>
            <span className="text-[#2A2A2A]">·</span>
            <span className="text-[#F5A623]">★ {vendor.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="px-5 py-4 flex gap-3 border-b border-[#1A1A1A]">
          {vendor.phone ? (
            <a
              href={`tel:${vendor.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #00C896, #0aa87a)' }}
            >
              <Phone size={16} />
              Call
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#1E1E1E] text-sm text-[#3A3A3A]">
              <Phone size={16} />
              No Phone
            </div>
          )}
          {vendor.whatsapp ? (
            <a
              href={`https://wa.me/${vendor.whatsapp.replace(/\D/g,'')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold"
              style={{
                background: 'rgba(0,200,150,0.08)',
                borderColor: 'rgba(0,200,150,0.3)',
                color: '#00C896',
              }}
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#1E1E1E] text-sm text-[#3A3A3A]">
              <MessageCircle size={16} />
              No WhatsApp
            </div>
          )}
        </div>

        {/* About */}
        <div className="px-5 py-4 border-b border-[#1A1A1A]">
          <p className="text-[13px] font-bold text-[#EBEBEB] mb-2">About</p>
          <p className="text-sm text-[#ADADAD] leading-relaxed">{vendor.description}</p>
        </div>

        {/* Popular Tags */}
        {vendor.tags.length > 0 && (
          <div className="px-5 py-4 border-b border-[#1A1A1A]">
            <p className="text-[13px] font-bold text-[#EBEBEB] mb-3">Popular Items</p>
            <div className="flex flex-wrap gap-2">
              {vendor.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-xs font-medium capitalize"
                  style={{ background: '#1A1A1A', color: '#ADADAD', border: '1px solid #222222' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Offers */}
        {vendor.offers && (
          <div className="px-5 py-4 border-b border-[#1A1A1A]">
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}
            >
              <p className="text-sm text-[#F5A623] font-semibold">🎁 {vendor.offers}</p>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="px-5 py-4 border-b border-[#1A1A1A]">
          <p className="text-[13px] font-bold text-[#EBEBEB] mb-3">Location</p>
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-[#ADADAD] flex-1">{vendor.address}</p>
            <button
              className="flex-none flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border"
              style={{ color: '#00C896', borderColor: 'rgba(0,200,150,0.25)', background: 'rgba(0,200,150,0.06)' }}
            >
              Open in Maps
              <ExternalLink size={11} />
            </button>
          </div>
        </div>

        {/* Timings */}
        {vendor.openTime && vendor.closeTime && (
          <div className="px-5 py-4 pb-8">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setTimingsOpen(!timingsOpen)}
            >
              <p className="text-[13px] font-bold text-[#EBEBEB]">Timings</p>
              {timingsOpen ? <ChevronUp size={16} color="#5C5C5C" /> : <ChevronDown size={16} color="#5C5C5C" />}
            </button>

            <div className="mt-2 flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: status.isOpen ? '#00C896' : '#484848' }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: status.isOpen ? (status.urgent ? '#F5A623' : '#00C896') : '#5C5C5C' }}
              >
                {status.isOpen ? (status.urgent ? 'Closing Soon' : 'Open') : 'Closed'}
              </span>
              <span className="text-sm text-[#5C5C5C]">
                · {status.isOpen ? `Closes ${vendor.closeTime}` : `Opens ${vendor.openTime}`}
              </span>
            </div>

            <AnimatePresence>
              {timingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-2xl border border-[#1A1A1A] bg-[#161616] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#5C5C5C]">{vendor.days ?? 'Mon–Sun'}</span>
                      <span className="text-xs text-[#ADADAD] font-medium">
                        {vendor.openTime} – {vendor.closeTime}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
