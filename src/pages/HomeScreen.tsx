import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, MessageCircle, ChevronRight,
  Zap, AlertTriangle, Users, ShieldCheck, Star,
} from 'lucide-react';
import { TopBar }    from '../components/layout/TopBar';
import { GeoHoodLogoMark } from '../components/brand/GeoHoodLogo';
import { CATEGORY_MAP } from '../constants';
import {
  MOCK_VENDORS,
  getTopPickVendors,
  getLiveStats,
} from '../data/mockVendors';
import { getTimeGreeting, getOpenStatus, formatDistance } from '../utils/timeUtils';
import { useAppContext } from '../context/AppContext';
import { useUser }       from '../context/UserContext';

/* ── mini sparkline SVG ─────────────────────────────────────────────────── */
function Sparkline() {
  const pts = [12,28,18,36,22,14,30,10,38,18,44,8,52,20,58,12,66,24,72,10,80,16,88,6];
  const pairs: [number, number][] = [];
  for (let i = 0; i < pts.length; i += 2) pairs.push([pts[i], pts[i + 1]]);
  const polyline = pairs.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
      {/* Gradient fill */}
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00C896" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00C896" stopOpacity="0"   />
        </linearGradient>
      </defs>
      <polygon
        points={`0,40 ${polyline} 88,40`}
        fill="url(#sparkGrad)"
      />
      <polyline
        points={polyline}
        fill="none"
        stroke="#00C896"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Live dot at end */}
      <circle cx="88" cy="6" r="2.5" fill="#00C896" opacity="0.9" />
    </svg>
  );
}

/* ── Top Pick card ───────────────────────────────────────────────────────── */
function TopPickCard({ vendor, onClick }: { vendor: typeof MOCK_VENDORS[number]; onClick: () => void }) {
  const cat    = CATEGORY_MAP[vendor.category];
  const status = getOpenStatus(vendor.openTime, vendor.closeTime);
  const initials = vendor.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-none flex flex-col rounded-2xl border overflow-hidden text-left"
      style={{
        width:       148,
        background:  '#161616',
        borderColor: '#1E1E1E',
      }}
    >
      {/* Image area */}
      <div
        className="w-full flex items-center justify-center relative"
        style={{
          height:     96,
          background: `linear-gradient(135deg, ${cat?.color ?? '#333'}22, ${cat?.color ?? '#333'}08)`,
        }}
      >
        {/* Large initials circle */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: `${cat?.color ?? '#333'}20`,
            border:     `1.5px solid ${cat?.color ?? '#333'}35`,
          }}
        >
          <span className="text-lg font-bold" style={{ color: cat?.color ?? '#ADADAD' }}>
            {initials}
          </span>
        </div>

        {/* Open/closed badge */}
        <span
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{
            background: status.isOpen ? 'rgba(0,200,150,0.15)' : 'rgba(92,92,92,0.15)',
            color:      status.isOpen ? '#00C896' : '#5C5C5C',
            border:     `1px solid ${status.isOpen ? 'rgba(0,200,150,0.3)' : '#2A2A2A'}`,
          }}
        >
          {status.isOpen ? 'Open' : 'Closed'}
        </span>

        {/* Live dot */}
        {vendor.isLive && (
          <span
            className="absolute top-2 left-2 w-2 h-2 rounded-full"
            style={{ background: '#FF4D6A', boxShadow: '0 0 6px #FF4D6A' }}
          />
        )}
      </div>

      {/* Info area */}
      <div className="px-3 pb-3 pt-2.5">
        <p className="text-[13px] font-bold text-[#EBEBEB] truncate leading-tight">{vendor.name}</p>
        <p className="text-[11px] text-[#5C5C5C] mt-0.5 truncate">{vendor.subcategory}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Star size={10} color="#F5A623" fill="#F5A623" />
          <span className="text-[11px] font-semibold text-[#EBEBEB]">{vendor.rating}</span>
          <span className="text-[10px] text-[#3A3A3A]">({vendor.reviewCount})</span>
          <span className="text-[#2A2A2A]">·</span>
          <span className="text-[11px] text-[#5C5C5C]">{formatDistance(vendor.distance)}</span>
        </div>
      </div>
    </motion.button>
  );
}

/* ── category grid item ───────────────────────────────────────────────────── */
const HOME_CAT_GRID = [
  { id: 'food',          icon: '🍽️',  label: 'Food & Drinks'           },
  { id: 'grocery',       icon: '🛒',   label: 'Grocery & Daily Needs'   },
  { id: 'fish_meat_veg', icon: '🐟',   label: 'Fish / Meat / Veg'       },
  { id: 'pharmacy',      icon: '💊',   label: 'Pharmacy & Medical'      },
  { id: 'repair',        icon: '🔧',   label: 'Repairs & Technicians'   },
  { id: 'home_services', icon: '🏠',   label: 'Home Services'           },
  { id: 'beauty',        icon: '✂️',  label: 'Beauty & Wellness'       },
  { id: 'transport',     icon: '🚗',   label: 'Transport'               },
  { id: 'education',     icon: '📚',   label: 'Education'               },
];

/* ── local alerts mock ───────────────────────────────────────────────────── */
const LOCAL_ALERTS = [
  {
    id: 'a1',
    icon: '🔧',
    title: 'Water Supply Maintenance',
    address: 'Patuli Main Road',
    time: 'Today, 10:00 PM – 2:00 AM',
    tag: 'New',
    tagColor: '#00C896',
    tagBg: 'rgba(0,200,150,0.12)',
  },
  {
    id: 'a2',
    icon: '⚡',
    title: 'Power Outage in Garia',
    address: 'Garia Station Road',
    time: 'Tomorrow, 6:00 AM – 10:00 AM',
    tag: 'Alert',
    tagColor: '#FF4D6A',
    tagBg: 'rgba(255,77,106,0.12)',
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

export function HomeScreen() {
  const { setActiveTab, setSelectedVendor } = useAppContext();
  const { user }   = useUser();
  const [scrolled, setScrolled] = useState(false);

  const liveStats  = getLiveStats();
  const topPicks   = getTopPickVendors().slice(0, 5);
  const greeting   = getTimeGreeting();
  const firstName  = user?.name?.split(' ')[0] ?? 'Neighbor';
  const lsiColor   = liveStats.score >= 70 ? '#00C896' : liveStats.score >= 40 ? '#F5A623' : '#FF4D6A';

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 4);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#0D0D0D' }}>
      <TopBar scrolled={scrolled} />

      <div
        className="flex-1 overflow-y-auto relative"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none' }}
      >
        {/* ── Logo watermark ── */}
        <div
          className="pointer-events-none absolute"
          style={{
            top:    -20,
            right:  -30,
            width:  220,
            height: 277,
            opacity: 0.05,
            zIndex: 0,
          }}
        >
          <GeoHoodLogoMark size={220} />
        </div>

        {/* All content is relative above watermark */}
        <div className="relative" style={{ zIndex: 1 }}>

          {/* ── Greeting + LSI badge ── */}
          <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] text-[#5C5C5C] font-medium">
                {greeting}, {firstName}! 👋
              </p>
              <h1 className="text-[19px] font-bold text-[#EBEBEB] leading-tight mt-0.5">
                Here's what's live<br />around you.
              </h1>
            </div>

            {/* LSI badge */}
            <div
              className="flex-none flex flex-col items-center px-3 py-2.5 rounded-2xl border gap-0.5"
              style={{
                background:  `rgba(${liveStats.score >= 70 ? '0,200,150' : '245,166,35'},0.08)`,
                borderColor: `rgba(${liveStats.score >= 70 ? '0,200,150' : '245,166,35'},0.2)`,
                minWidth: 68,
              }}
            >
              <ShieldCheck size={13} color={lsiColor} />
              <span className="text-[10px] text-[#5C5C5C] font-semibold uppercase tracking-widest leading-none">
                LSI°
              </span>
              <span className="text-[26px] font-bold leading-none mt-0.5" style={{ color: lsiColor }}>
                {liveStats.score}
              </span>
              <span className="text-[9px] text-[#3A3A3A] font-medium">200m radius</span>
            </div>
          </div>

          {/* ── 4-metric strip ── */}
          <div className="px-5 mb-5">
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: <Zap size={13} color="#00C896" />,           value: `${liveStats.vendorsActive}+`, label: 'Vendors\nActive',      color: '#00C896' },
                { icon: <AlertTriangle size={12} color="#F5A623" />, value: '3',                           label: 'Local Alerts\nToday', color: '#F5A623' },
                { icon: <Users size={12} color="#4D9EFF" />,         value: '5',                           label: 'Societies\nOnboarded', color: '#4D9EFF' },
                { icon: <ShieldCheck size={12} color="#A855F7" />,   value: '100',                         label: 'Safety\nScore',        color: '#A855F7' },
              ].map(({ icon, value, label, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl border"
                  style={{
                    background:  `${color}0d`,
                    borderColor: `${color}22`,
                  }}
                >
                  {icon}
                  <span className="text-[15px] font-bold leading-none" style={{ color }}>{value}</span>
                  <span
                    className="text-[9px] text-[#5C5C5C] font-medium text-center leading-tight"
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Top Picks Near You ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between px-5 mb-3">
              <p className="text-[14px] font-bold text-[#EBEBEB]">Top Picks Near You</p>
              <button className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#00C896' }}>
                See all <ChevronRight size={13} />
              </button>
            </div>

            {/* Horizontal scroll */}
            <div
              className="flex gap-3 overflow-x-auto pl-5 pr-5"
              style={{ scrollbarWidth: 'none', paddingBottom: 4 }}
            >
              {topPicks.map((vendor, i) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <TopPickCard
                    vendor={vendor}
                    onClick={() => setSelectedVendor(vendor)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Categories ── */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-bold text-[#EBEBEB]">Categories</p>
              <button
                onClick={() => setActiveTab('search')}
                className="flex items-center gap-0.5 text-xs font-semibold"
                style={{ color: '#00C896' }}
              >
                View all <ChevronRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {HOME_CAT_GRID.map(cat => {
                const meta = CATEGORY_MAP[cat.id];
                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveTab('search')}
                    className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border transition-all"
                    style={{ background: '#161616', borderColor: '#1E1E1E' }}
                  >
                    <span className="text-2xl leading-none">{cat.icon}</span>
                    <span
                      className="text-[10px] font-semibold text-center leading-tight"
                      style={{ color: '#ADADAD', maxWidth: 88 }}
                    >
                      {cat.label}
                    </span>
                  </motion.button>
                );
              })}

              {/* More Categories */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab('search')}
                className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border transition-all"
                style={{ background: '#161616', borderColor: '#1E1E1E' }}
              >
                <span className="text-2xl leading-none">···</span>
                <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: '#5C5C5C' }}>
                  More{'\n'}Categories
                </span>
              </motion.button>
            </div>
          </div>

          {/* ── Live Around You ── */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-bold text-[#EBEBEB]">Live Around You</p>
              <button className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#00C896' }}>
                See all <ChevronRight size={13} />
              </button>
            </div>

            <div
              className="rounded-2xl border border-[#1E1E1E] overflow-hidden"
              style={{ background: '#111111' }}
            >
              {/* Graph row */}
              <div className="flex items-center gap-4 px-4 pt-4 pb-3">
                <div style={{ flex: 1, height: 48 }}>
                  <Sparkline />
                </div>
                <div className="flex-none">
                  <p className="text-[22px] font-bold text-[#EBEBEB] leading-none">
                    {liveStats.vendorsActive}+
                    <span className="text-[12px] font-medium text-[#5C5C5C] ml-1">vendors</span>
                  </p>
                  <p className="text-[11px] text-[#5C5C5C] mt-1">open now</p>
                </div>
              </div>

              {/* Status footer */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 border-t border-[#1A1A1A]"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#00C896', boxShadow: '0 0 6px #00C896' }}
                />
                <span className="text-[11px] font-semibold text-[#00C896]">
                  Patuli, Kolkata · Live & Safe
                </span>
              </div>
            </div>
          </div>

          {/* ── Nearby vendors quick list ── */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-bold text-[#EBEBEB]">Nearby Vendors</p>
              <button className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#00C896' }}>
                See all <ChevronRight size={13} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {MOCK_VENDORS.filter(v => v.distance <= 0.6).slice(0, 5).map((v, i) => {
                const cat    = CATEGORY_MAP[v.category];
                const status = getOpenStatus(v.openTime, v.closeTime);
                const initials = v.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

                return (
                  <motion.button
                    key={v.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedVendor(v)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-[#1A1A1A] bg-[#161616] text-left active:scale-[0.99] transition-all"
                  >
                    {/* Avatar circle */}
                    <div
                      className="w-10 h-10 flex-none flex items-center justify-center rounded-xl text-[13px] font-bold relative"
                      style={{
                        background: `${cat?.color ?? '#888'}1a`,
                        color:      cat?.color ?? '#888',
                      }}
                    >
                      {initials}
                      {v.isLive && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#161616]"
                          style={{ background: '#FF4D6A', boxShadow: '0 0 4px #FF4D6A' }}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#EBEBEB] truncate">{v.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-[#5C5C5C]">{v.subcategory}</span>
                        <span className="text-[#2A2A2A]">·</span>
                        <span className="text-[11px] text-[#5C5C5C]">{formatDistance(v.distance)}</span>
                      </div>
                    </div>

                    {/* Open badge + actions */}
                    <div className="flex items-center gap-2 flex-none">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background:  status.isOpen ? 'rgba(0,200,150,0.1)' : 'rgba(92,92,92,0.1)',
                          color:       status.isOpen ? '#00C896' : '#5C5C5C',
                          border:      `1px solid ${status.isOpen ? 'rgba(0,200,150,0.25)' : '#2A2A2A'}`,
                        }}
                      >
                        {status.isOpen ? 'Open' : 'Closed'}
                      </span>
                      {v.phone && (
                        <a
                          href={`tel:${v.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1A1A1A]"
                        >
                          <Phone size={12} color="#ADADAD" />
                        </a>
                      )}
                      {v.whatsapp && (
                        <a
                          href={`https://wa.me/${v.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1A1A1A]"
                        >
                          <MessageCircle size={12} color="#00C896" />
                        </a>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── Local Alerts ── */}
          <div className="px-5 pb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-bold text-[#EBEBEB]">Local Alerts</p>
              <button className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#00C896' }}>
                See all <ChevronRight size={13} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {LOCAL_ALERTS.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-[#1A1A1A] bg-[#161616]"
                >
                  <span className="text-lg flex-none mt-0.5">{alert.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#EBEBEB] truncate">{alert.title}</p>
                    <p className="text-[11px] text-[#5C5C5C] mt-0.5">{alert.address}</p>
                    <p className="text-[11px] text-[#3A3A3A] mt-0.5">{alert.time}</p>
                  </div>
                  <span
                    className="flex-none mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    style={{
                      background:  alert.tagBg,
                      color:       alert.tagColor,
                      borderColor: `${alert.tagColor}35`,
                    }}
                  >
                    {alert.tag}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
