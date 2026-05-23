import React from 'react';
import { motion } from 'framer-motion';
import { Handshake } from 'lucide-react';

/* Subtle hexagonal grid drawn with SVG — pure ambient texture */
function HexGrid() {
  const cols = 7;
  const rows = 6;
  const size = 28; // hex radius
  const w    = size * Math.sqrt(3);
  const h    = size * 2;
  const hexes: { x: number; y: number }[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * w + (row % 2 === 1 ? w / 2 : 0);
      const y = row * h * 0.75;
      hexes.push({ x, y });
    }
  }

  const hexPath = (cx: number, cy: number, r: number) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const ang = (Math.PI / 180) * (60 * i - 30);
      return `${cx + r * Math.cos(ang)},${cy + r * Math.sin(ang)}`;
    });
    return `M ${pts.join(' L ')} Z`;
  };

  return (
    <svg
      viewBox={`-${w} -${h * 0.5} ${cols * w + w} ${rows * h}`}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.04 }}
      preserveAspectRatio="xMidYMid slice"
    >
      {hexes.map(({ x, y }, i) => (
        <path
          key={i}
          d={hexPath(x, y, size - 2)}
          fill="none"
          stroke="#00C896"
          strokeWidth="0.8"
        />
      ))}
    </svg>
  );
}

const COMING_FEATURES = [
  { icon: '🤝', label: 'Neighbour Network',    desc: 'Connect with verified residents nearby'          },
  { icon: '📣', label: 'Local Announcements',  desc: 'Share and receive hyperlocal community updates'  },
  { icon: '🗳️', label: 'Community Decisions',  desc: 'Participate in neighbourhood-level initiatives'  },
  { icon: '🧩', label: 'Skill Exchange',       desc: 'Find and offer skills within your locality'      },
];

export function CommunityScreen() {
  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] relative overflow-hidden">

      {/* Ambient hex grid texture — top half only */}
      <div className="absolute top-0 left-0 right-0 h-[55%] overflow-hidden pointer-events-none">
        <HexGrid />
        {/* Fade to black at bottom of texture */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{ background: 'linear-gradient(to bottom, transparent, #0D0D0D)' }}
        />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-start pt-16 px-6 pb-8">

        {/* Icon block */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 160, damping: 18 }}
          className="flex flex-col items-center gap-4 mb-8"
        >
          {/* Outer glow ring */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-24 h-24 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0,200,150,0.12) 0%, transparent 70%)',
              }}
            />
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(0,200,150,0.06)',
                border:     '1px solid rgba(0,200,150,0.18)',
              }}
            >
              <Handshake size={36} color="#00C896" strokeWidth={1.4} />
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#EBEBEB] tracking-tight">Community</h1>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{
                  background:  'rgba(0,200,150,0.1)',
                  border:      '1px solid rgba(0,200,150,0.22)',
                  color:       '#00C896',
                }}
              >
                Coming
              </span>
            </div>
            <p className="text-sm text-[#5C5C5C] leading-relaxed max-w-[260px]">
              Your neighbourhood's social infrastructure — built for real locality-level connection.
            </p>
          </div>
        </motion.div>

        {/* Feature preview list */}
        <div className="w-full flex flex-col gap-2.5">
          {COMING_FEATURES.map(({ icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.25 }}
              className="flex items-start gap-3.5 px-4 py-3.5 rounded-2xl border"
              style={{
                background:  '#111111',
                borderColor: '#1A1A1A',
              }}
            >
              <span className="text-xl flex-none mt-0.5">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#EBEBEB]">{label}</p>
                <p className="text-xs text-[#5C5C5C] mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Status line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-8 flex items-center gap-2"
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#2A2A2A',
              boxShadow:  '0 0 0 3px rgba(42,42,42,0.3)',
            }}
          />
          <p className="text-[11px] text-[#3A3A3A] font-medium tracking-wide uppercase">
            In Development · GeoHood V2
          </p>
        </motion.div>
      </div>
    </div>
  );
}
