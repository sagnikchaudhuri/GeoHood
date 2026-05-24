import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, MessageCircle, Clock, Zap, ChevronRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { CATEGORY_MAP } from '../constants';

interface Props {
  onClose: () => void;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ACTION_LABEL: Record<string, string> = {
  whatsapp_click: 'WhatsApp',
  call_click:     'Called',
  view:           'Viewed',
};

/* ── Shared section header (matches Home) ─────────────────────────────── */
function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#EBEBEB', letterSpacing: '-0.01em' }}>{title}</p>
      {action && (
        <button style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600, color: '#00C896' }}>
          {action} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

export function VendorDashboard({ onClose }: Props) {
  const { myVendor, setVendorLive, myLeads } = useUser();
  if (!myVendor) return null;

  const cat      = CATEGORY_MAP[myVendor.category];
  const initials = myVendor.businessName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const weekLeads  = myLeads.filter(l => Date.now() - l.timestamp < 7 * 86400_000).length;
  const todayLeads = myLeads.filter(l => {
    const d = new Date(l.timestamp), n = new Date();
    return d.toDateString() === n.toDateString();
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 60,
        display: 'flex', flexDirection: 'column',
        background: '#0D0D0D',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        padding: 'calc(var(--safe-top) + 20px) 20px 16px',
        borderBottom: '1px solid #1A1A1A',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1A1A1A', border: 'none', cursor: 'pointer',
          }}
        >
          <X size={16} color="#ADADAD" />
        </button>
        <h1 style={{ flex: 1, fontSize: 17, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>Vendor Dashboard</h1>
        <button style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#1A1A1A', border: 'none', cursor: 'pointer',
        }}>
          <span style={{ color: '#5C5C5C', fontSize: 14, letterSpacing: '0.1em' }}>···</span>
        </button>
      </div>

      {/* ── Body ── */}
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 40px' }}>

        {/* ── Business card ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px', borderRadius: 18,
          border: '1px solid #1E1E1E', background: '#111111',
          marginBottom: 24,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800,
            background: `${cat?.color ?? '#888'}1a`,
            color: cat?.color ?? '#888',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#EBEBEB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {myVendor.businessName}
            </p>
            <p style={{ fontSize: 11, color: '#5C5C5C', marginTop: 3 }}>{myVendor.subcategory} · {myVendor.locality}</p>
          </div>
          <span style={{
            flexShrink: 0, padding: '4px 10px', borderRadius: 9999,
            fontSize: 11, fontWeight: 700,
            background:  myVendor.isLive ? 'rgba(0,200,150,0.12)' : 'rgba(92,92,92,0.1)',
            color:       myVendor.isLive ? '#00C896' : '#5C5C5C',
            border:      `1px solid ${myVendor.isLive ? 'rgba(0,200,150,0.28)' : '#2A2A2A'}`,
          }}>
            {myVendor.isLive ? '● Open' : 'Closed'}
          </span>
        </div>

        {/* ── Status ── */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Availability" />
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Live */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setVendorLive(true)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 16, fontSize: 14, fontWeight: 700,
                background:  myVendor.isLive ? 'linear-gradient(135deg, #00C896, #0aa87a)' : '#161616',
                border:      `1px solid ${myVendor.isLive ? 'transparent' : '#1E1E1E'}`,
                color:       myVendor.isLive ? 'white' : '#5C5C5C',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Zap size={14} fill={myVendor.isLive ? 'white' : 'none'} color={myVendor.isLive ? 'white' : '#5C5C5C'} />
              Go Live
            </motion.button>
            {/* Closed */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setVendorLive(false)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 16, fontSize: 14, fontWeight: 700,
                background:  !myVendor.isLive ? '#161616' : 'transparent',
                border:      `1px solid ${!myVendor.isLive ? '#2A2A2A' : '#1A1A1A'}`,
                color:       !myVendor.isLive ? '#ADADAD' : '#3A3A3A',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <span style={{
                width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${!myVendor.isLive ? '#ADADAD' : '#3A3A3A'}`,
                flexShrink: 0,
              }} />
              Closed
            </motion.button>
          </div>

          <AnimatePresence>
            {myVendor.isLive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginTop: 10, padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.15)',
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C896', flexShrink: 0, boxShadow: '0 0 5px #00C896' }} />
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#00C896', margin: 0 }}>
                    Live indicator showing on map and listings
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Verification ── */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Verification" />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 16px', borderRadius: 16,
            border: '1px solid #1A1A1A', background: '#161616',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#1A1A1A',
            }}>
              <ShieldCheck size={20} color="#3A3A3A" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', margin: 0 }}>Verification</p>
                <span style={{
                  padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700,
                  background: 'rgba(245,166,35,0.12)', color: '#F5A623',
                  border: '1px solid rgba(245,166,35,0.25)',
                }}>
                  Coming Later
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#5C5C5C', margin: 0 }}>This feature will be available soon.</p>
            </div>
          </div>
        </div>

        {/* ── Leads ── */}
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Leads" action="View all" />

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Total',     value: myLeads.length || 42, color: '#00C896' },
              { label: 'Today',     value: todayLeads  || 6,    color: '#00C896' },
              { label: 'This Week', value: weekLeads   || 18,   color: '#4D9EFF' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: '14px 12px', borderRadius: 16,
                background: `${color}09`, border: `1px solid ${color}1c`,
              }}>
                <p style={{ fontSize: 10, color: '#5C5C5C', fontWeight: 500, margin: '0 0 4px' }}>{label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color, margin: 0, lineHeight: 1 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Lead list */}
          {myLeads.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'GeoHood User', time: 'Today, 7:30 PM' },
                { name: 'Rahul S.',     time: 'Today, 6:15 PM' },
                { name: 'Ananya M.',    time: 'Today, 5:02 PM' },
                { name: 'Sagnik D.',    time: 'Today, 4:10 PM' },
              ].map((lead, i) => (
                <DemoLeadRow key={i} name={lead.name} time={lead.time} sub={`Clicked via ${myVendor.businessName}`} color={cat?.color} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myLeads.slice(0, 10).map(lead => {
                const initLead = lead.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div
                    key={lead.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 16,
                      border: '1px solid #1A1A1A', background: '#161616',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      background: 'rgba(92,92,92,0.12)', color: '#ADADAD',
                    }}>
                      {initLead}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                        {lead.userName}
                      </p>
                      <p style={{ fontSize: 11, color: '#5C5C5C', marginTop: 2 }}>
                        {ACTION_LABEL[lead.action]} via {myVendor.businessName}
                      </p>
                      <p style={{ fontSize: 10, color: '#3A3A3A', marginTop: 1 }}>{formatRelativeTime(lead.timestamp)}</p>
                    </div>
                    {lead.action === 'whatsapp_click' && (
                      <MessageCircle size={15} color="#00C896" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* No real leads hint */}
          {myLeads.length === 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginTop: 10, padding: '10px 14px', borderRadius: 12,
              border: '1px solid #1A1A1A',
            }}>
              <Clock size={13} color="#3A3A3A" />
              <p style={{ fontSize: 11, color: '#3A3A3A', margin: 0 }}>Toggle Live to start receiving real leads</p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}

function DemoLeadRow({ name, sub, time, color }: { name: string; sub: string; time: string; color?: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', borderRadius: 16,
      border: '1px solid #1A1A1A', background: '#161616',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700,
        background: 'rgba(92,92,92,0.12)', color: '#ADADAD',
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
          {name}
        </p>
        <p style={{ fontSize: 11, color: '#5C5C5C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{sub}</p>
        <p style={{ fontSize: 10, color: '#3A3A3A', marginTop: 1 }}>{time}</p>
      </div>
      <MessageCircle size={15} color="#00C896" style={{ flexShrink: 0 }} />
    </div>
  );
}
