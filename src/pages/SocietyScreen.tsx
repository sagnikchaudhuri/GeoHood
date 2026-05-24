import React, { useState } from 'react';
import { Users, Shield, Bell, ChevronRight, Building2, Home, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { SocietyOnboarding } from './SocietyOnboarding';

const NOTICES = [
  { id: 'n1', title: 'Water Supply Interruption',  body: 'Scheduled maintenance on 21st May, 6 AM – 2 PM. Please store water in advance.',         category: 'maintenance', date: '19 May', urgent: true  },
  { id: 'n2', title: 'Patuli Lake Cleaning Drive',  body: 'Join us this Sunday at 7 AM. Gloves and bags will be provided. All residents welcome.',   category: 'event',       date: '18 May', urgent: false },
  { id: 'n3', title: 'New Street Light Installation',body: 'Block D and E will get new LED lights by end of month. Pending municipal approval.',     category: 'general',     date: '17 May', urgent: false },
  { id: 'n4', title: 'Power Cut Alert — Zone B',    body: 'CESC will cut power on 22nd May from 10 AM – 4 PM for grid maintenance.',                category: 'alert',       date: '16 May', urgent: true  },
];

const CATEGORY_COLOR: Record<string, string> = {
  maintenance: '#F5A623',
  event:       '#00C896',
  alert:       '#FF4D6A',
  general:     '#4D9EFF',
};

/* ── Shared section header (matches Home) ─────────────────────────────── */
function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#EBEBEB', letterSpacing: '-0.01em' }}>{title}</p>
      {action && (
        <button onClick={onAction} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600, color: '#00C896' }}>
          {action} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

export function SocietyScreen() {
  const { residence, hasSeenSocietyOnboarding, markSocietyOnboardingSeen } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(
    !hasSeenSocietyOnboarding && !residence
  );

  const handleOnboardingClose = () => {
    markSocietyOnboardingSeen();
    setShowOnboarding(false);
  };

  const residenceLabel = residence
    ? residence.type === 'society'
      ? `${residence.societyName} · ${residence.flatNumber}`
      : residence.homeLabel
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0D0D0D', position: 'relative' }}>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        padding: 'calc(var(--safe-top) + 20px) 20px 16px',
        borderBottom: '1px solid #1A1A1A',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Users size={18} color="#00C896" />
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em' }}>Society</h1>
        </div>
        {residenceLabel ? (
          <p style={{ fontSize: 12, color: '#5C5C5C' }}>{residenceLabel} · 1,240 members</p>
        ) : (
          <button
            onClick={() => setShowOnboarding(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#00C896' }}
          >
            Register your residence <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* ── Scrollable body ── */}
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 96px' }}>

        {/* Residence card */}
        {residence && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 16,
              border: '1px solid #1A1A1A', background: '#161616',
              marginBottom: 16,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: residence.type === 'society' ? 'rgba(0,200,150,0.12)' : 'rgba(77,158,255,0.12)',
            }}>
              {residence.type === 'society'
                ? <Building2 size={18} color="#00C896" />
                : <Home      size={18} color="#4D9EFF" />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                {residence.type === 'society' ? residence.societyName : residence.homeLabel}
              </p>
              <p style={{ fontSize: 11, color: '#5C5C5C', marginTop: 2 }}>
                {residence.type === 'society'
                  ? `Flat ${residence.flatNumber} · ${residence.role}`
                  : residence.address}
              </p>
            </div>
            <button
              onClick={() => setShowOnboarding(true)}
              style={{ fontSize: 11, fontWeight: 600, color: '#3A3A3A', flexShrink: 0 }}
            >
              Edit
            </button>
          </motion.div>
        )}

        {/* ── Trust Score ── */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Community Trust" />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px', borderRadius: 18,
              border: '1px solid #1E1E1E', background: '#111111',
            }}
          >
            {/* Score ring */}
            <div style={{
              width: 64, height: 64, borderRadius: 20, flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.18)',
              gap: 2,
            }}>
              <Shield size={16} color="#00C896" />
              <span style={{ fontSize: 22, fontWeight: 800, color: '#00C896', lineHeight: 1 }}>87</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>High Trust</p>
              <p style={{ fontSize: 11, color: '#5C5C5C', marginTop: 3 }}>Community Trust Score</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                {[
                  { label: 'Members',  value: '1,240' },
                  { label: 'Verified', value: '847'   },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: '4px 10px', borderRadius: 9999,
                    background: 'rgba(0,200,150,0.07)', border: '1px solid rgba(0,200,150,0.15)',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#00C896' }}>{s.value}</span>
                    <span style={{ fontSize: 10, color: '#3A3A3A', marginLeft: 4 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Notice Board ── */}
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Notice Board" action="All notices" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {NOTICES.map((n, i) => {
              const color = CATEGORY_COLOR[n.category];
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    padding: '14px', borderRadius: 16,
                    border: '1px solid #1A1A1A',
                    background: '#161616',
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', margin: 0, flex: 1 }}>{n.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {n.urgent && (
                        <span style={{
                          padding: '2px 7px', borderRadius: 9999,
                          fontSize: 9, fontWeight: 700,
                          background: 'rgba(255,77,106,0.1)', color: '#FF4D6A',
                          border: '1px solid rgba(255,77,106,0.22)',
                        }}>
                          Urgent
                        </span>
                      )}
                      <span style={{
                        padding: '2px 7px', borderRadius: 9999,
                        fontSize: 9, fontWeight: 700,
                        background: `${color}12`, color,
                        border: `1px solid ${color}28`,
                        textTransform: 'capitalize',
                      }}>
                        {n.category}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#ADADAD', lineHeight: 1.5, margin: 0 }}>{n.body}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <Bell size={10} color="#3A3A3A" />
                    <span style={{ fontSize: 10, color: '#3A3A3A' }}>{n.date}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Register CTA if not registered */}
        {!residence && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowOnboarding(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderRadius: 18,
              background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.18)',
              textAlign: 'left',
            }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>Register your residence</p>
              <p style={{ fontSize: 11, color: '#5C5C5C', marginTop: 3 }}>Get personalised local alerts & notices</p>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,200,150,0.12)',
            }}>
              <ChevronRight size={16} color="#00C896" />
            </div>
          </motion.button>
        )}

      </div>

      {/* Society Onboarding overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <SocietyOnboarding onClose={handleOnboardingClose} />
        )}
      </AnimatePresence>
    </div>
  );
}
