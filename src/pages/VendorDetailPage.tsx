import React, { useState } from 'react';
import {
  Phone, MessageCircle, MapPin, Clock, ChevronLeft, Share2,
  Heart, ChevronDown, ChevronUp, Star, ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vendor } from '../types';
import { CATEGORY_MAP } from '../constants';
import { getOpenStatus, formatDistance } from '../utils/timeUtils';
import { useUser } from '../context/UserContext';
import { useAppContext } from '../context/AppContext';

interface Props {
  vendor: Vendor;
  onBack: () => void;
}

export function VendorDetailPage({ vendor, onBack }: Props) {
  const cat    = CATEGORY_MAP[vendor.category];
  const status = getOpenStatus(vendor.openTime, vendor.closeTime);
  const { toggleSavedVendor, isVendorSaved, trackLead, user } = useUser();
  const saved   = isVendorSaved(vendor.id);
  const [timingsOpen, setTimingsOpen] = useState(false);

  const handleCall = () => {
    if (user) trackLead({ vendorId: vendor.id, vendorName: vendor.name, userName: user.name, action: 'call_click', locality: vendor.locality });
  };
  const handleWA = () => {
    if (user) trackLead({ vendorId: vendor.id, vendorName: vendor.name, userName: user.name, action: 'whatsapp_click', locality: vendor.locality });
  };

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
      {/* ── Hero ── */}
      <div style={{ flexShrink: 0, position: 'relative', height: 220 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${cat?.bgColor ?? 'rgba(136,136,136,0.15)'} 0%, #0D0D0D 100%)`,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.18, fontSize: 96, userSelect: 'none', pointerEvents: 'none',
          }}>
            {cat?.icon ?? '📦'}
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 80,
            background: 'linear-gradient(to top, #0D0D0D 0%, transparent 100%)',
          }} />
        </div>

        {/* Safe-area-aware header row */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          paddingTop: 'calc(var(--safe-top) + 12px)',
          padding: 'calc(var(--safe-top) + 12px) 16px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
              border: 'none', cursor: 'pointer',
            }}
          >
            <ChevronLeft size={20} color="white" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
                border: 'none', cursor: 'pointer',
              }}
            >
              <Share2 size={15} color="white" />
            </button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => toggleSavedVendor(vendor.id)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: saved ? 'rgba(255,77,106,0.5)' : 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(8px)',
                border: 'none', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <Heart size={15} color="white" fill={saved ? 'white' : 'none'} />
            </motion.button>
          </div>
        </div>

        {/* Open/closed pill on hero */}
        <div style={{ position: 'absolute', bottom: 12, right: 16 }}>
          <span style={{
            padding: '4px 10px', borderRadius: 9999,
            fontSize: 11, fontWeight: 700,
            background: status.isOpen ? '#00C896' : '#2A2A2A',
            color: status.isOpen ? 'white' : '#5C5C5C',
          }}>
            {status.isOpen ? '● Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto' }}>

        {/* Identity */}
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #1A1A1A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 9999,
              background: cat?.bgColor ?? 'rgba(136,136,136,0.12)',
              color: cat?.color ?? '#888',
            }}>
              {cat?.icon} {vendor.subcategory}
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            {vendor.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C896' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#00C896' }}>
                LSI {Math.round(50 + vendor.rating * 8)}
              </span>
            </span>
            <span style={{ color: '#2A2A2A' }}>·</span>
            <span style={{ fontSize: 12, color: '#5C5C5C', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} color="#5C5C5C" />
              {formatDistance(vendor.distance)}
            </span>
            <span style={{ color: '#2A2A2A' }}>·</span>
            <span style={{ fontSize: 12, color: '#F5A623', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Star size={11} color="#F5A623" fill="#F5A623" />
              {vendor.rating.toFixed(1)} ({vendor.reviewCount})
            </span>
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ padding: '14px 20px', display: 'flex', gap: 10, borderBottom: '1px solid #1A1A1A' }}>
          {vendor.phone ? (
            <a
              href={`tel:${vendor.phone}`}
              onClick={handleCall}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px', borderRadius: 16, fontSize: 14, fontWeight: 700, color: 'white',
                background: 'linear-gradient(135deg, #00C896, #0aa87a)', textDecoration: 'none',
              }}
            >
              <Phone size={16} /> Call
            </a>
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px', borderRadius: 16, fontSize: 14, fontWeight: 600,
              border: '1px solid #1E1E1E', color: '#3A3A3A',
            }}>
              <Phone size={16} /> No Phone
            </div>
          )}
          {vendor.whatsapp ? (
            <a
              href={`https://wa.me/${vendor.whatsapp.replace(/\D/g,'')}`}
              target="_blank" rel="noopener noreferrer"
              onClick={handleWA}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px', borderRadius: 16, fontSize: 14, fontWeight: 700,
                background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.3)',
                color: '#00C896', textDecoration: 'none',
              }}
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px', borderRadius: 16, fontSize: 14, fontWeight: 600,
              border: '1px solid #1E1E1E', color: '#3A3A3A',
            }}>
              <MessageCircle size={16} /> No WA
            </div>
          )}
        </div>

        {/* About */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1A1A1A' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#EBEBEB', margin: '0 0 8px' }}>About</p>
          <p style={{ fontSize: 13, color: '#ADADAD', lineHeight: 1.6, margin: 0 }}>{vendor.description}</p>
        </div>

        {/* Tags */}
        {vendor.tags.length > 0 && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1A1A1A' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#EBEBEB', margin: '0 0 10px' }}>Popular Items</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {vendor.tags.map(tag => (
                <span key={tag} style={{
                  padding: '6px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 500,
                  background: '#1A1A1A', color: '#ADADAD', border: '1px solid #222',
                  textTransform: 'capitalize',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Offers */}
        {vendor.offers && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1A1A1A' }}>
            <div style={{
              padding: '12px 14px', borderRadius: 14,
              background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
            }}>
              <p style={{ fontSize: 13, color: '#F5A623', fontWeight: 600, margin: 0 }}>🎁 {vendor.offers}</p>
            </div>
          </div>
        )}

        {/* Features */}
        {vendor.features && vendor.features.length > 0 && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1A1A1A' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#EBEBEB', margin: '0 0 10px' }}>Features</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {vendor.features.map(f => (
                <span key={f} style={{
                  padding: '6px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 500,
                  background: 'rgba(0,200,150,0.07)', color: '#00C896',
                  border: '1px solid rgba(0,200,150,0.18)',
                }}>
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1A1A1A' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#EBEBEB', margin: '0 0 8px' }}>Location</p>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#ADADAD', flex: 1, margin: 0, lineHeight: 1.5 }}>{vendor.address}</p>
            <button style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600, padding: '7px 12px', borderRadius: 12,
              color: '#00C896', border: '1px solid rgba(0,200,150,0.25)',
              background: 'rgba(0,200,150,0.06)', cursor: 'pointer',
            }}>
              Maps <ExternalLink size={10} />
            </button>
          </div>
        </div>

        {/* Timings */}
        {vendor.openTime && vendor.closeTime && (
          <div style={{ padding: '14px 20px 40px' }}>
            <button
              onClick={() => setTimingsOpen(!timingsOpen)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', cursor: 'pointer', marginBottom: 8,
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>Timings</p>
              {timingsOpen ? <ChevronUp size={16} color="#5C5C5C" /> : <ChevronDown size={16} color="#5C5C5C" />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: status.isOpen ? '#00C896' : '#484848' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: status.isOpen ? (status.urgent ? '#F5A623' : '#00C896') : '#5C5C5C' }}>
                {status.isOpen ? (status.urgent ? 'Closing Soon' : 'Open') : 'Closed'}
              </span>
              <span style={{ fontSize: 13, color: '#5C5C5C' }}>
                · {status.isOpen ? `Closes ${vendor.closeTime}` : `Opens ${vendor.openTime}`}
              </span>
            </div>
            <AnimatePresence>
              {timingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    marginTop: 10, borderRadius: 14, border: '1px solid #1A1A1A',
                    background: '#161616', padding: '12px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 12, color: '#5C5C5C' }}>{vendor.days ?? 'Mon–Sun'}</span>
                    <span style={{ fontSize: 12, color: '#ADADAD', fontWeight: 500 }}>
                      {vendor.openTime} – {vendor.closeTime}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
