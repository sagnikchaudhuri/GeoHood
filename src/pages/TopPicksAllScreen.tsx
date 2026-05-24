import React from 'react';
import { ChevronLeft, MapPin, Phone, MessageCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_VENDORS } from '../data/mockVendors';
import { CATEGORY_MAP } from '../constants';
import { getOpenStatus, formatDistance } from '../utils/timeUtils';
import { useAppContext } from '../context/AppContext';

interface Props {
  onBack: () => void;
}

export function TopPicksAllScreen({ onBack }: Props) {
  const { setSelectedVendor } = useAppContext();

  const vendors = MOCK_VENDORS
    .filter(v => v.isVerified && v.rating >= 4.4)
    .sort((a, b) => b.rating - a.rating);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 60,
        display: 'flex', flexDirection: 'column',
        background: '#0D0D0D',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        padding: 'calc(var(--safe-top) + 14px) 16px 14px',
        borderBottom: '1px solid #1A1A1A',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(13,13,13,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1A1A1A', border: 'none', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <ChevronLeft size={20} color="#EBEBEB" />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: 17, fontWeight: 800, color: '#EBEBEB',
            letterSpacing: '-0.02em', margin: 0,
          }}>
            Top Picks Near You
          </h1>
          <p style={{ fontSize: 11, color: '#5C5C5C', margin: '2px 0 0' }}>
            {vendors.length} verified · highest rated
          </p>
        </div>

        <span style={{
          padding: '4px 10px', borderRadius: 9999, fontSize: 10, fontWeight: 700,
          background: 'rgba(245,166,35,0.1)', color: '#F5A623',
          border: '1px solid rgba(245,166,35,0.22)',
        }}>
          ★ Verified
        </span>
      </div>

      {/* ── Vendor list ── */}
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {vendors.map((v, i) => {
            const cat    = CATEGORY_MAP[v.category];
            const status = getOpenStatus(v.openTime, v.closeTime);
            const initials = v.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

            return (
              <motion.button
                key={v.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                onClick={() => setSelectedVendor(v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px', borderRadius: 16,
                  border: '1px solid #1A1A1A', background: '#161616',
                  textAlign: 'left', width: '100%', cursor: 'pointer',
                }}
              >
                {/* Rank badge */}
                <div style={{
                  width: 24, flexShrink: 0, textAlign: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: i < 3 ? '#F5A623' : '#3A3A3A',
                }}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, flexShrink: 0, borderRadius: 12,
                  background: cat?.bgColor ?? 'rgba(136,136,136,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: cat?.color ?? '#ADADAD',
                  position: 'relative',
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

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 600, color: '#EBEBEB',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0,
                  }}>
                    {v.name}
                  </p>
                  <p style={{ fontSize: 11, color: '#5C5C5C', margin: '2px 0 0' }}>{v.subcategory}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                    <Star size={9} color="#F5A623" fill="#F5A623" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#F5A623' }}>{v.rating.toFixed(1)}</span>
                    <span style={{ fontSize: 10, color: '#3A3A3A' }}>({v.reviewCount})</span>
                    <span style={{ color: '#2A2A2A', fontSize: 10 }}>·</span>
                    <MapPin size={9} color="#5C5C5C" />
                    <span style={{ fontSize: 10, color: '#5C5C5C' }}>{formatDistance(v.distance)}</span>
                  </div>
                </div>

                {/* Right */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 9999,
                    background: status.isOpen ? 'rgba(0,200,150,0.1)' : 'rgba(72,72,72,0.1)',
                    color: status.isOpen ? '#00C896' : '#5C5C5C',
                    border: `1px solid ${status.isOpen ? 'rgba(0,200,150,0.22)' : '#222'}`,
                  }}>
                    {status.isOpen ? 'Open' : 'Closed'}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {v.phone && (
                      <a
                        href={`tel:${v.phone}`}
                        onClick={e => e.stopPropagation()}
                        style={{
                          width: 28, height: 28, borderRadius: '50%', background: '#1A1A1A',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          textDecoration: 'none',
                        }}
                      >
                        <Phone size={11} color="#ADADAD" />
                      </a>
                    )}
                    {v.whatsapp && (
                      <a
                        href={`https://wa.me/${v.whatsapp.replace(/\D/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          width: 28, height: 28, borderRadius: '50%', background: '#1A1A1A',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          textDecoration: 'none',
                        }}
                      >
                        <MessageCircle size={11} color="#00C896" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
