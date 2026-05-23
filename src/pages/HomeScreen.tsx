import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Phone, MessageCircle, Zap, Users, ShieldCheck, Radio } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { HOME_CATEGORIES, CATEGORY_MAP } from '../constants';
import {
  MOCK_VENDORS,
  getVendorsByCategory,
  getLiveStats,
} from '../data/mockVendors';
import { getTimeGreeting, getOpenStatus, formatDistance } from '../utils/timeUtils';
import { useAppContext } from '../context/AppContext';
import { useUser } from '../context/UserContext';

export function HomeScreen() {
  const { setActiveTab, setSelectedVendor } = useAppContext();
  const { user } = useUser();
  const [scrolled, setScrolled]       = useState(false);
  const [selectedCat, setSelectedCat] = useState('all');

  const liveStats = getLiveStats();
  const greeting  = getTimeGreeting();
  const vendors   = selectedCat === 'all' ? MOCK_VENDORS : getVendorsByCategory(selectedCat);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const lsiColor  = liveStats.score >= 70 ? '#00C896' : liveStats.score >= 40 ? '#F5A623' : '#FF4D6A';

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 4);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#0D0D0D' }}>
      <TopBar scrolled={scrolled} />

      <div
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none' }}
      >
        {/* ── Greeting + LSI ── */}
        <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] text-[#5C5C5C] font-medium">{greeting}, {firstName}</p>
            <h1 className="text-[18px] font-bold text-[#EBEBEB] leading-snug mt-0.5">
              Here's what's happening nearby
            </h1>
          </div>

          {/* LSI badge */}
          <div
            className="flex-none flex flex-col items-center px-3 py-2 rounded-2xl border"
            style={{
              background:  `rgba(${liveStats.score >= 70 ? '0,200,150' : '245,166,35'},0.08)`,
              borderColor: `rgba(${liveStats.score >= 70 ? '0,200,150' : '245,166,35'},0.2)`,
              minWidth: 64,
            }}
          >
            <span className="text-[10px] text-[#5C5C5C] font-semibold uppercase tracking-widest">LSI</span>
            <span className="text-2xl font-bold leading-none mt-0.5" style={{ color: lsiColor }}>
              {liveStats.score}
            </span>
            <span className="text-[9px] text-[#5C5C5C] mt-0.5">200m radius</span>
          </div>
        </div>

        {/* ── Live metrics strip ── */}
        <div className="px-5 mb-5">
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                icon: <Zap size={13} color="#00C896" />,
                value: `${liveStats.vendorsActive}`,
                label: 'Active',
                color: '#00C896',
                bg: 'rgba(0,200,150,0.08)',
                border: 'rgba(0,200,150,0.18)',
              },
              {
                icon: <Radio size={13} color="#FF4D6A" />,
                value: `${liveStats.liveNow}`,
                label: 'Live Now',
                color: '#FF4D6A',
                bg: 'rgba(255,77,106,0.08)',
                border: 'rgba(255,77,106,0.18)',
              },
              {
                icon: <ShieldCheck size={13} color="#F5A623" />,
                value: `${liveStats.score}`,
                label: 'LSI Safe',
                color: lsiColor,
                bg: 'rgba(245,166,35,0.08)',
                border: 'rgba(245,166,35,0.18)',
              },
              {
                icon: <Users size={13} color="#4D9EFF" />,
                value: '5',
                label: 'Societies',
                color: '#4D9EFF',
                bg: 'rgba(77,158,255,0.08)',
                border: 'rgba(77,158,255,0.18)',
              },
            ].map(({ icon, value, label, color, bg, border }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl border"
                style={{ background: bg, borderColor: border }}
              >
                {icon}
                <span className="text-base font-bold leading-none" style={{ color }}>{value}</span>
                <span className="text-[9px] text-[#5C5C5C] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="px-5 mb-5">
          <button
            onClick={() => setActiveTab('search')}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-[#1E1E1E] bg-[#161616] text-left"
          >
            <Search size={16} color="#5C5C5C" />
            <span className="flex-1 text-sm text-[#5C5C5C]">Search for places, services...</span>
            <SlidersHorizontal size={15} color="#3A3A3A" />
          </button>
        </div>

        {/* ── Nearby Categories ── */}
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-bold text-[#EBEBEB]">Nearby Categories</p>
            <button
              onClick={() => setActiveTab('search')}
              className="text-xs font-semibold"
              style={{ color: '#00C896' }}
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {HOME_CATEGORIES.slice(0, 4).map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id === selectedCat ? 'all' : cat.id)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all"
                style={{
                  background:  selectedCat === cat.id ? cat.bgColor : '#161616',
                  borderColor: selectedCat === cat.id ? cat.color + '44' : '#1E1E1E',
                }}
              >
                <span className="text-xl leading-none">{cat.icon}</span>
                <span
                  className="text-[10px] font-semibold text-center leading-tight"
                  style={{ color: selectedCat === cat.id ? cat.color : '#ADADAD' }}
                >
                  {cat.label}
                </span>
              </button>
            ))}
            {/* "More" tile */}
            <button
              onClick={() => setActiveTab('search')}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-[#1E1E1E] bg-[#161616] active:bg-[#1A1A1A] transition-all"
            >
              <span className="text-lg font-bold text-[#5C5C5C] leading-none">···</span>
              <span className="text-[10px] font-semibold text-[#5C5C5C]">More</span>
            </button>
          </div>
        </div>

        {/* ── Nearby Vendors ── */}
        <div className="px-5 pb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-bold text-[#EBEBEB]">
              {selectedCat === 'all' ? 'Nearby Vendors' : (CATEGORY_MAP[selectedCat]?.label ?? 'Vendors')}
            </p>
            <button className="text-xs font-semibold" style={{ color: '#00C896' }}>View all</button>
          </div>

          <div className="flex flex-col gap-2">
            {vendors.slice(0, 10).map((v, i) => {
              const cat    = CATEGORY_MAP[v.category];
              const status = getOpenStatus(v.openTime, v.closeTime);

              return (
                <motion.button
                  key={v.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  onClick={() => setSelectedVendor(v)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-[#1A1A1A] bg-[#161616] text-left active:scale-[0.99] transition-all"
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 flex-none flex items-center justify-center rounded-xl text-xl relative"
                    style={{ background: cat?.bgColor ?? 'rgba(136,136,136,0.12)' }}
                  >
                    {cat?.icon ?? '📦'}
                    {v.isLive && (
                      <span
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-[#0D0D0D]"
                        style={{ background: '#FF4D6A', boxShadow: '0 0 4px #FF4D6A' }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#EBEBEB] truncate">{v.name}</p>
                    <p className="text-[11px] text-[#5C5C5C]">{v.subcategory}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-[#5C5C5C]">{formatDistance(v.distance)}</span>
                      <span className="text-[#2A2A2A]">·</span>
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: status.isOpen ? (status.urgent ? '#F5A623' : '#00C896') : '#5C5C5C' }}
                      >
                        {status.isOpen ? (status.urgent ? status.label : 'Open') : status.short}
                      </span>
                      {v.locality && (
                        <>
                          <span className="text-[#2A2A2A]">·</span>
                          <span className="text-[10px] text-[#3A3A3A]">{v.locality}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-none">
                    {v.phone && (
                      <a
                        href={`tel:${v.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1A1A] hover:bg-[#222222] transition-colors"
                      >
                        <Phone size={14} color="#ADADAD" />
                      </a>
                    )}
                    {v.whatsapp && (
                      <a
                        href={`https://wa.me/${v.whatsapp.replace(/\D/g,'')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1A1A] hover:bg-[#222222] transition-colors"
                      >
                        <MessageCircle size={14} color="#00C896" />
                      </a>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
