import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, MessageCircle, ChevronRight,
  Zap, AlertTriangle, Users, ShieldCheck, Star,
} from 'lucide-react';
import { TopBar }          from '../components/layout/TopBar';
import { GeoHoodLogoMark } from '../components/brand/GeoHoodLogo';
import { CATEGORY_MAP }    from '../constants';
import { MOCK_VENDORS, getTopPickVendors, getLiveStats } from '../data/mockVendors';
import { getTimeGreeting, getOpenStatus, formatDistance } from '../utils/timeUtils';
import { useAppContext } from '../context/AppContext';
import { useUser }       from '../context/UserContext';

/* ── Sparkline ────────────────────────────────────────────────────────── */
function Sparkline() {
  const pts = [12,28,18,36,22,14,30,10,38,18,44,8,52,20,58,12,66,24,72,10,80,16,88,6];
  const pairs: [number, number][] = [];
  for (let i = 0; i < pts.length; i += 2) pairs.push([pts[i], pts[i + 1]]);
  const poly = pairs.map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <svg viewBox="0 0 100 40" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00C896" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00C896" stopOpacity="0"   />
        </linearGradient>
      </defs>
      <polygon points={`0,40 ${poly} 88,40`} fill="url(#sg)" />
      <polyline points={poly} fill="none" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="88" cy="6" r="2.5" fill="#00C896" opacity="0.9" />
    </svg>
  );
}

/* ── Top Pick card ─────────────────────────────────────────────────────── */
function TopPickCard({
  vendor, onClick,
}: {
  vendor: typeof MOCK_VENDORS[number];
  onClick: () => void;
}) {
  const cat     = CATEGORY_MAP[vendor.category];
  const status  = getOpenStatus(vendor.openTime, vendor.closeTime);
  const initials = vendor.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        width: 144, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        borderRadius: 16, border: '1px solid #1E1E1E',
        background: '#161616', overflow: 'hidden',
        textAlign: 'left',
      }}
    >
      {/* Image area */}
      <div style={{
        height: 88, width: '100%', position: 'relative',
        background: `linear-gradient(135deg, ${cat?.color ?? '#333'}1a, ${cat?.color ?? '#333'}08)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `${cat?.color ?? '#333'}1e`,
          border: `1.5px solid ${cat?.color ?? '#333'}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: cat?.color ?? '#ADADAD' }}>{initials}</span>
        </div>
        {/* Open/Closed badge */}
        <span style={{
          position: 'absolute', top: 8, right: 8,
          padding: '2px 7px', borderRadius: 9999, fontSize: 9, fontWeight: 700,
          background: status.isOpen ? 'rgba(0,200,150,0.14)' : 'rgba(72,72,72,0.14)',
          color: status.isOpen ? '#00C896' : '#5C5C5C',
          border: `1px solid ${status.isOpen ? 'rgba(0,200,150,0.28)' : '#2A2A2A'}`,
        }}>
          {status.isOpen ? 'Open' : 'Closed'}
        </span>
        {vendor.isLive && (
          <span style={{
            position: 'absolute', top: 8, left: 8,
            width: 7, height: 7, borderRadius: '50%',
            background: '#FF4D6A', boxShadow: '0 0 5px #FF4D6A',
          }} />
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '10px 10px 11px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#EBEBEB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
          {vendor.name}
        </p>
        <p style={{ fontSize: 10, color: '#5C5C5C', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {vendor.subcategory}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <Star size={9} color="#F5A623" fill="#F5A623" />
          <span style={{ fontSize: 10, fontWeight: 600, color: '#EBEBEB' }}>{vendor.rating}</span>
          <span style={{ fontSize: 9, color: '#3A3A3A' }}>({vendor.reviewCount})</span>
          <span style={{ color: '#252525', fontSize: 9 }}>·</span>
          <span style={{ fontSize: 10, color: '#5C5C5C' }}>{formatDistance(vendor.distance)}</span>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Category grid ─────────────────────────────────────────────────────── */
const HOME_CATS = [
  { id: 'food',          icon: '🍽️',  label: 'Food & Drinks'      },
  { id: 'grocery',       icon: '🛒',   label: 'Grocery'            },
  { id: 'fish_meat_veg', icon: '🐟',   label: 'Fish / Meat / Veg'  },
  { id: 'pharmacy',      icon: '💊',   label: 'Pharmacy'           },
  { id: 'repair',        icon: '🔧',   label: 'Repairs'            },
  { id: 'home_services', icon: '🏠',   label: 'Home Services'      },
  { id: 'beauty',        icon: '✂️',  label: 'Beauty'             },
  { id: 'transport',     icon: '🚗',   label: 'Transport'          },
  { id: 'education',     icon: '📚',   label: 'Education'          },
];

/* ── Local alerts ──────────────────────────────────────────────────────── */
const LOCAL_ALERTS = [
  { id: 'a1', icon: '🔧', title: 'Water Supply Maintenance', address: 'Patuli Main Road', time: 'Today, 10 PM – 2 AM',    tag: 'New',   tagColor: '#00C896', tagBg: 'rgba(0,200,150,0.1)'  },
  { id: 'a2', icon: '⚡', title: 'Power Outage — Garia',     address: 'Garia Station Road', time: 'Tomorrow, 6 AM – 10 AM', tag: 'Alert', tagColor: '#FF4D6A', tagBg: 'rgba(255,77,106,0.1)' },
];

/* ── Section header ─────────────────────────────────────────────────────── */
function SectionHeader({
  title, action, onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#EBEBEB', letterSpacing: '-0.01em' }}>{title}</p>
      {action && (
        <button
          onClick={onAction}
          style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600, color: '#00C896' }}
        >
          {action} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HomeScreen
   ═══════════════════════════════════════════════════════════════════════════ */
export function HomeScreen() {
  const { setActiveTab, setSelectedVendor, pushOverlay } = useAppContext();
  const { user }   = useUser();
  const [scrolled, setScrolled] = useState(false);

  const liveStats = getLiveStats();
  const topPicks  = getTopPickVendors().slice(0, 5);
  const greeting  = getTimeGreeting();
  const firstName = user?.name?.split(' ')[0] ?? 'Neighbor';
  const lsiColor  = liveStats.score >= 70 ? '#00C896' : liveStats.score >= 40 ? '#F5A623' : '#FF4D6A';

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 4);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0D0D0D' }}>
      <TopBar scrolled={scrolled} />

      <div
        className="scrollbar-none"
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
      >
        {/* Watermark */}
        <div style={{
          position: 'absolute', top: -10, right: -20,
          width: 200, height: 230, opacity: 0.04,
          pointerEvents: 'none', zIndex: 0,
        }}>
          <GeoHoodLogoMark size={200} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── Greeting + LSI ── */}
          <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, color: '#5C5C5C', fontWeight: 500, marginBottom: 4 }}>
                {greeting}, {firstName}! 👋
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#EBEBEB', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                Here's what's live<br />around you.
              </h1>
            </div>
            {/* LSI badge */}
            <div style={{
              flexShrink: 0, minWidth: 60,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 12px', borderRadius: 18,
              background: `${lsiColor}0c`,
              border: `1px solid ${lsiColor}22`,
              gap: 2,
            }}>
              <ShieldCheck size={12} color={lsiColor} />
              <span style={{ fontSize: 8, color: '#5C5C5C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1 }}>
                LSI°
              </span>
              <span style={{ fontSize: 26, fontWeight: 800, color: lsiColor, lineHeight: 1, marginTop: 1 }}>
                {liveStats.score}
              </span>
              <span style={{ fontSize: 8, color: '#3A3A3A', fontWeight: 500 }}>200m</span>
            </div>
          </div>

          {/* ── 2×2 Metric grid ── */}
          <div style={{ padding: '0 20px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: <Zap size={14} color="#00C896" />,           value: `${liveStats.vendorsActive}+`, label: 'Vendors Active',   color: '#00C896' },
                { icon: <AlertTriangle size={13} color="#F5A623" />, value: '3',                           label: 'Local Alerts',     color: '#F5A623' },
                { icon: <Users size={13} color="#4D9EFF" />,         value: '5',                           label: 'Societies Nearby', color: '#4D9EFF' },
                { icon: <ShieldCheck size={13} color="#A855F7" />,   value: '100',                         label: 'Safety Score',     color: '#A855F7' },
              ].map(({ icon, value, label, color }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 16,
                  background: `${color}09`,
                  border: `1px solid ${color}1c`,
                }}>
                  <div>{icon}</div>
                  <div>
                    <p style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
                    <p style={{ fontSize: 10, color: '#5C5C5C', marginTop: 3, fontWeight: 500 }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Top Picks ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ padding: '0 20px' }}>
              <SectionHeader title="Top Picks Near You" action="See all" />
            </div>
            <div
              className="scrollbar-none"
              style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingLeft: 20, paddingRight: 20, paddingBottom: 2 }}
            >
              {topPicks.map((vendor, i) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <TopPickCard vendor={vendor} onClick={() => setSelectedVendor(vendor)} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Categories ── */}
          <div style={{ padding: '0 20px', marginBottom: 24 }}>
            <SectionHeader title="Categories" action="View all" onAction={() => setActiveTab('search')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {HOME_CATS.map(cat => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => pushOverlay({ type: 'category_results', categoryId: cat.id, label: cat.label })}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 6,
                    padding: '14px 8px',
                    borderRadius: 16, border: '1px solid #1E1E1E',
                    background: '#141414',
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{cat.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#888', textAlign: 'center', lineHeight: 1.3 }}>{cat.label}</span>
                </motion.button>
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('search')}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6,
                  padding: '14px 8px',
                  borderRadius: 16, border: '1px solid #1E1E1E',
                  background: '#141414',
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1, color: '#3A3A3A' }}>···</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: '#484848', textAlign: 'center' }}>More</span>
              </motion.button>
            </div>
          </div>

          {/* ── Live Around You ── */}
          <div style={{ padding: '0 20px', marginBottom: 24 }}>
            <SectionHeader title="Live Around You" action="See all" />
            <div style={{ borderRadius: 18, border: '1px solid #1E1E1E', background: '#111111', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px' }}>
                <div style={{ flex: 1, height: 44 }}>
                  <Sparkline />
                </div>
                <div style={{ flexShrink: 0 }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#EBEBEB', lineHeight: 1 }}>
                    {liveStats.vendorsActive}+
                  </p>
                  <p style={{ fontSize: 10, color: '#5C5C5C', marginTop: 3 }}>open now</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid #1A1A1A' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C896', boxShadow: '0 0 5px #00C896', flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#00C896' }}>
                  Patuli, Kolkata · Live & Safe
                </span>
              </div>
            </div>
          </div>

          {/* ── Nearby Vendors ── */}
          <div style={{ padding: '0 20px', marginBottom: 24 }}>
            <SectionHeader title="Nearby Vendors" action="See all" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_VENDORS.filter(v => v.distance <= 0.6).slice(0, 5).map((v, i) => {
                const cat    = CATEGORY_MAP[v.category];
                const status = getOpenStatus(v.openTime, v.closeTime);
                const initials = v.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <motion.button
                    key={v.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedVendor(v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 16,
                      border: '1px solid #1A1A1A', background: '#161616',
                      textAlign: 'left', width: '100%',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, flexShrink: 0, borderRadius: 12,
                      background: `${cat?.color ?? '#888'}1a`,
                      color: cat?.color ?? '#888',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, position: 'relative',
                    }}>
                      {initials}
                      {v.isLive && (
                        <span style={{
                          position: 'absolute', top: -2, right: -2,
                          width: 9, height: 9, borderRadius: '50%',
                          background: '#FF4D6A', border: '1.5px solid #161616',
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                        {v.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <span style={{ fontSize: 10, color: '#5C5C5C' }}>{v.subcategory}</span>
                        <span style={{ color: '#2A2A2A', fontSize: 10 }}>·</span>
                        <span style={{ fontSize: 10, color: '#5C5C5C' }}>{formatDistance(v.distance)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 9999,
                        background: status.isOpen ? 'rgba(0,200,150,0.1)' : 'rgba(72,72,72,0.1)',
                        color: status.isOpen ? '#00C896' : '#5C5C5C',
                        border: `1px solid ${status.isOpen ? 'rgba(0,200,150,0.22)' : '#222'}`,
                      }}>
                        {status.isOpen ? 'Open' : 'Closed'}
                      </span>
                      {v.phone && (
                        <a href={`tel:${v.phone}`} onClick={e => e.stopPropagation()}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                          <Phone size={11} color="#ADADAD" />
                        </a>
                      )}
                      {v.whatsapp && (
                        <a href={`https://wa.me/${v.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                          <MessageCircle size={11} color="#00C896" />
                        </a>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── Local Alerts ── */}
          <div style={{ padding: '0 20px 96px' }}>
            <SectionHeader title="Local Alerts" action="See all" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LOCAL_ALERTS.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '14px', borderRadius: 16,
                    border: '1px solid #1A1A1A', background: '#161616',
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{alert.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {alert.title}
                    </p>
                    <p style={{ fontSize: 11, color: '#5C5C5C', marginTop: 3 }}>{alert.address}</p>
                    <p style={{ fontSize: 10, color: '#3A3A3A', marginTop: 2 }}>{alert.time}</p>
                  </div>
                  <span style={{
                    flexShrink: 0, padding: '2px 8px', borderRadius: 9999,
                    fontSize: 9, fontWeight: 700,
                    background: alert.tagBg, color: alert.tagColor,
                    border: `1px solid ${alert.tagColor}30`,
                    marginTop: 1,
                  }}>
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
