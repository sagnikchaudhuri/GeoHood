import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/* ── Circular glowing handshake illustration ─────────────────────────── */
function CommunityIllustration() {
  return (
    <div style={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,200,150,0.16) 0%, rgba(0,200,150,0.04) 55%, transparent 75%)',
      }} />
      {/* Orbit ring 1 */}
      <div style={{
        position: 'absolute', width: 158, height: 158, borderRadius: '50%',
        border: '1px solid rgba(0,200,150,0.1)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      }} />
      {/* Orbit ring 2 */}
      <div style={{
        position: 'absolute', width: 124, height: 124, borderRadius: '50%',
        border: '1px solid rgba(0,200,150,0.16)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      }} />
      {/* Inner circle */}
      <div style={{
        position: 'absolute', width: 92, height: 92, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,200,150,0.1) 0%, rgba(0,200,150,0.03) 100%)',
        border: '1.5px solid rgba(0,200,150,0.22)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      }} />
      {/* Sparkle dots */}
      {[
        { top: '8%',   right: '16%', size: 4, delay: 0   },
        { top: '18%',  left:  '10%', size: 3, delay: 0.5 },
        { bottom: '16%', right: '10%', size: 3, delay: 0.9 },
        { bottom: '10%', left:  '18%', size: 4, delay: 1.3 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: dot.size, height: dot.size, borderRadius: '50%',
            background: '#00C896',
            top:    (dot as any).top,
            right:  (dot as any).right,
            bottom: (dot as any).bottom,
            left:   (dot as any).left,
          }}
          animate={{ opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 2.2, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Handshake SVG */}
      <svg width="60" height="60" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
        <path d="M8 36 C8 36 12 28 20 28 L30 28 C32 28 34 30 34 32 L34 34" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 28 L18 20 M24 28 L23 19 M28 28 L28 19" stroke="#00C896" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M60 36 C60 36 56 28 48 28 L38 28 C36 28 34 30 34 32 L34 34" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M48 28 L50 20 M44 28 L45 19 M40 28 L40 19" stroke="#00C896" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M10 40 L20 34 L34 34 L48 34 L58 40" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="34" cy="34" r="5" fill="rgba(0,200,150,0.2)" stroke="#00C896" strokeWidth="1.5" />
        <path d="M8 40 Q8 52 20 54 L48 54 Q60 52 60 40" stroke="#00C896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    </div>
  );
}

const COMING_FEATURES = [
  { icon: '🤝', label: 'Neighborhood collaboration', desc: 'Organise events, drives, and initiatives together' },
  { icon: '💬', label: 'Local discussions',           desc: 'Talk to your neighbours about what matters'       },
  { icon: '📅', label: 'Events & updates',            desc: 'Community calendar for your locality'             },
  { icon: '🆘', label: 'Community help requests',    desc: 'Offer or ask for help within your area'           },
  { icon: '✨', label: 'And much more…',              desc: 'Exciting features coming very soon'               },
];

export function CommunityScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0D0D0D' }}>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        padding: 'calc(var(--safe-top) + 20px) 20px 16px',
        borderBottom: '1px solid #1A1A1A',
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: 0 }}>Community</h1>
        <p style={{ fontSize: 12, color: '#5C5C5C', marginTop: 3 }}>Kolkata Neighborhood Platform</p>
      </div>

      {/* ── Scrollable body ── */}
      <div
        className="scrollbar-none"
        style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >

        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 140 }}
          style={{ marginBottom: 20 }}
        >
          <CommunityIllustration />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.3 }}
          style={{ textAlign: 'center', marginBottom: 28, width: '100%' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 9999,
            background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)',
            marginBottom: 14,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C896', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#00C896', letterSpacing: '0.04em' }}>Coming Soon</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
            Community
          </h2>
          <p style={{ fontSize: 13, color: '#5C5C5C', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
            We're building something amazing for your Kolkata neighborhood.
          </p>
        </motion.div>

        {/* Features list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.3 }}
          style={{
            width: '100%', borderRadius: 18, border: '1px solid #1A1A1A',
            background: '#111111', overflow: 'hidden', marginBottom: 16,
          }}
        >
          {/* Section header inside card */}
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #1A1A1A' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#3A3A3A', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              What's coming
            </p>
          </div>
          {COMING_FEATURES.map(({ icon, label, desc }, i) => (
            <div
              key={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px',
                borderBottom: i < COMING_FEATURES.length - 1 ? '1px solid #1A1A1A' : 'none',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#161616', border: '1px solid #1E1E1E',
                fontSize: 16,
              }}>
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 11, color: '#5C5C5C', marginTop: 2 }}>{desc}</p>
              </div>
              <ChevronRight size={14} color="#2A2A2A" style={{ flexShrink: 0 }} />
            </div>
          ))}
        </motion.div>

        {/* Stay tuned card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.3 }}
          style={{
            width: '100%', borderRadius: 18,
            border: '1px solid rgba(0,200,150,0.15)',
            background: 'rgba(0,200,150,0.04)',
            padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.18)',
            fontSize: 20,
          }}>
            🎉
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>Stay tuned!</p>
            <p style={{ fontSize: 12, color: '#5C5C5C', marginTop: 3 }}>Something big is on the way for GeoHood neighbors.</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
