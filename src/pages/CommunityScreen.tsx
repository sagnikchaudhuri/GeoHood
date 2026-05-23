import React from 'react';
import { motion } from 'framer-motion';

/* ── Circular glowing handshake illustration ─────────────────────────────
   Matches the reference: circular frame with teal glow, orbit rings,
   and a stylised handshake/partnership SVG inside.                       */
function CommunityIllustration() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>

      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,200,150,0.14) 0%, rgba(0,200,150,0.04) 55%, transparent 75%)',
        }}
      />

      {/* Orbit ring 1 */}
      <div
        className="absolute rounded-full border"
        style={{
          width: 172, height: 172,
          borderColor: 'rgba(0,200,150,0.12)',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
        }}
      />

      {/* Orbit ring 2 */}
      <div
        className="absolute rounded-full border"
        style={{
          width: 140, height: 140,
          borderColor: 'rgba(0,200,150,0.18)',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
        }}
      />

      {/* Inner circle */}
      <div
        className="absolute rounded-full"
        style={{
          width: 110, height: 110,
          background: 'radial-gradient(circle, rgba(0,200,150,0.1) 0%, rgba(0,200,150,0.04) 100%)',
          border: '1.5px solid rgba(0,200,150,0.25)',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
        }}
      />

      {/* Sparkle dots */}
      {[
        { top: '10%',  right: '18%', size: 4, opacity: 0.6 },
        { top: '20%',  left:  '12%', size: 3, opacity: 0.4 },
        { bottom: '18%', right: '12%', size: 3, opacity: 0.5 },
        { bottom: '12%', left:  '20%', size: 4, opacity: 0.35 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: dot.size, height: dot.size,
            background: '#00C896',
            top:    (dot as any).top,
            right:  (dot as any).right,
            bottom: (dot as any).bottom,
            left:   (dot as any).left,
          }}
          animate={{ opacity: [dot.opacity, dot.opacity * 0.3, dot.opacity] }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Handshake SVG illustration */}
      <svg
        width="68" height="68"
        viewBox="0 0 68 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Left hand */}
        <path
          d="M8 36 C8 36 12 28 20 28 L30 28 C32 28 34 30 34 32 L34 34"
          stroke="#00C896"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left fingers */}
        <path d="M20 28 L18 20 M24 28 L23 19 M28 28 L28 19" stroke="#00C896" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

        {/* Right hand */}
        <path
          d="M60 36 C60 36 56 28 48 28 L38 28 C36 28 34 30 34 32 L34 34"
          stroke="#00C896"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right fingers */}
        <path d="M48 28 L50 20 M44 28 L45 19 M40 28 L40 19" stroke="#00C896" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

        {/* Wrists / clasp */}
        <path
          d="M10 40 L20 34 L34 34 L48 34 L58 40"
          stroke="#00C896"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center clasp highlight */}
        <circle cx="34" cy="34" r="5" fill="rgba(0,200,150,0.2)" stroke="#00C896" strokeWidth="1.5" />

        {/* Bottom arc — arms */}
        <path
          d="M8 40 Q8 52 20 54 L48 54 Q60 52 60 40"
          stroke="#00C896"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}

const COMING_FEATURES = [
  { icon: '🤝', label: 'Neighborhood collaboration' },
  { icon: '💬', label: 'Local discussions'           },
  { icon: '📅', label: 'Event & updates'             },
  { icon: '🆘', label: 'Community help'              },
  { icon: '✨', label: 'And much more...'            },
];

export function CommunityScreen() {
  return (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
      {/* Header */}
      <div className="flex-none px-5 pt-5 pb-4 border-b border-[#1A1A1A]">
        <h1 className="text-lg font-bold text-[#EBEBEB]">Community</h1>
        <p className="text-xs text-[#5C5C5C] mt-0.5">Coming Soon</p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 pb-8" style={{ scrollbarWidth: 'none' }}>

        {/* Illustration */}
        <motion.div
          className="mt-10 mb-6"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 140 }}
        >
          <CommunityIllustration />
        </motion.div>

        {/* Heading */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h2
            className="font-bold text-[#EBEBEB] mb-2"
            style={{ fontSize: 28, letterSpacing: '-0.02em' }}
          >
            COMMUNITY
          </h2>
          <p
            className="text-base font-bold mb-3"
            style={{ color: '#00C896' }}
          >
            Coming Soon
          </p>
          <p className="text-sm text-[#5C5C5C] leading-relaxed max-w-[260px] mx-auto">
            We're building something amazing for your neighborhood.
          </p>
        </motion.div>

        {/* Features list */}
        <motion.div
          className="w-full rounded-2xl border border-[#1E1E1E] bg-[#111111] overflow-hidden mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {COMING_FEATURES.map(({ icon, label }, i) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3 border-b border-[#1A1A1A] last:border-0"
            >
              <span className="text-base">{icon}</span>
              <span className="text-sm text-[#ADADAD] font-medium">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* "Stay tuned" card */}
        <motion.div
          className="w-full rounded-2xl border border-[#1E1E1E] bg-[#111111] px-4 py-4 flex items-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-sm font-bold text-[#EBEBEB]">Stay tuned!</p>
            <p className="text-xs text-[#5C5C5C] mt-0.5">Something big is on the way.</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
