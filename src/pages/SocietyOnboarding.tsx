import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home, ChevronDown, CheckCircle2, X, ChevronRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { LOCALITIES } from '../data/localities';
import { SocietyRole } from '../types';

interface Props {
  onClose: () => void;
}

type Mode = 'choose' | 'society' | 'home' | 'done';

const ROLES: { id: SocietyRole; label: string; desc: string }[] = [
  { id: 'resident',    label: 'Resident',    desc: 'I live in this society'          },
  { id: 'family_head', label: 'Family Head', desc: 'I manage the household account'  },
  { id: 'committee',   label: 'Committee',   desc: "I'm on the management committee" },
];

/* ── Shared label above inputs ─────────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
      {children}
    </p>
  );
}

/* ── Text input ────────────────────────────────────────────────────────── */
function TextInput({ placeholder, value, onChange, type = 'text' }: {
  placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '14px 16px', borderRadius: 16,
        border: '1px solid #2A2A2A', background: '#161616',
        outline: 'none', fontSize: 14, color: '#EBEBEB',
        boxSizing: 'border-box',
      }}
    />
  );
}

export function SocietyOnboarding({ onClose }: Props) {
  const { setResidence, selectedLocality } = useUser();

  const [mode, setMode] = useState<Mode>('choose');

  // Society form
  const [societyName,     setSocietyName]     = useState('');
  const [flatNumber,      setFlatNumber]      = useState('');
  const [role,            setRole]            = useState<SocietyRole>('resident');
  const [societyLocality, setSocietyLocality] = useState(selectedLocality);

  // Home form
  const [homeLabel,    setHomeLabel]    = useState('');
  const [homeAddress,  setHomeAddress]  = useState('');
  const [homeLocality, setHomeLocality] = useState(selectedLocality);

  const [roleOpen, setRoleOpen] = useState(false);

  const canSaveSociety = societyName.trim().length >= 2 && flatNumber.trim().length >= 1;
  const canSaveHome    = homeLabel.trim().length >= 2 && homeAddress.trim().length >= 3;

  const handleSaveSociety = () => {
    setResidence({
      type:        'society',
      societyName: societyName.trim(),
      flatNumber:  flatNumber.trim(),
      role,
      locality:    LOCALITIES.find(l => l.id === societyLocality)?.name ?? 'Patuli',
    });
    setMode('done');
  };

  const handleSaveHome = () => {
    setResidence({
      type:      'home',
      homeLabel: homeLabel.trim(),
      address:   homeAddress.trim(),
      locality:  LOCALITIES.find(l => l.id === homeLocality)?.name ?? 'Patuli',
    });
    setMode('done');
  };

  const slide = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0,  opacity: 1 },
    exit:    { x: -40, opacity: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 40,
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
        {(mode === 'society' || mode === 'home') && (
          <button
            onClick={() => setMode('choose')}
            style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#1A1A1A', border: 'none', cursor: 'pointer',
            }}
          >
            <X size={16} color="#ADADAD" />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>
            {mode === 'choose'  && 'Register your residence'}
            {mode === 'society' && 'Society details'}
            {mode === 'home'    && 'Home details'}
            {mode === 'done'    && "You're registered!"}
          </h1>
          <p style={{ fontSize: 12, color: '#5C5C5C', marginTop: 2 }}>
            {mode === 'choose'  && 'Connect with your local community'}
            {mode === 'society' && 'Tell us about your housing society'}
            {mode === 'home'    && 'Add your home address'}
            {mode === 'done'    && 'Welcome to your community'}
          </p>
        </div>
        {(mode === 'choose' || mode === 'done') && (
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
        )}
      </div>

      {/* ── Content ── */}
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto' }}>
        <AnimatePresence mode="wait">

          {/* ─── Choose mode ─── */}
          {mode === 'choose' && (
            <motion.div
              key="choose"
              {...slide}
              transition={{ duration: 0.22 }}
              style={{ padding: '24px 20px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <p style={{ fontSize: 13, color: '#5C5C5C', lineHeight: 1.6, textAlign: 'center', marginBottom: 8 }}>
                Register your home to access society notices, local alerts, and connect with neighbours.
              </p>

              {/* Society option */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode('society')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 16px', borderRadius: 18,
                  border: '1px solid rgba(0,200,150,0.18)',
                  background: 'rgba(0,200,150,0.05)',
                  textAlign: 'left', cursor: 'pointer', width: '100%',
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.2)',
                }}>
                  <Building2 size={24} color="#00C896" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>Register with Society</p>
                  <p style={{ fontSize: 12, color: '#5C5C5C', marginTop: 4, lineHeight: 1.5 }}>
                    For apartments & gated communities. Access committee notices and resident directory.
                  </p>
                </div>
                <ChevronRight size={16} color="#00C896" style={{ flexShrink: 0 }} />
              </motion.button>

              {/* Home option */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode('home')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 16px', borderRadius: 18,
                  border: '1px solid rgba(77,158,255,0.18)',
                  background: 'rgba(77,158,255,0.05)',
                  textAlign: 'left', cursor: 'pointer', width: '100%',
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(77,158,255,0.12)', border: '1px solid rgba(77,158,255,0.2)',
                }}>
                  <Home size={24} color="#4D9EFF" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>Register My Home</p>
                  <p style={{ fontSize: 12, color: '#5C5C5C', marginTop: 4, lineHeight: 1.5 }}>
                    For standalone houses & independent residences. Get hyperlocal alerts for your area.
                  </p>
                </div>
                <ChevronRight size={16} color="#4D9EFF" style={{ flexShrink: 0 }} />
              </motion.button>

              <button onClick={onClose} style={{ textAlign: 'center', fontSize: 12, color: '#3A3A3A', marginTop: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
                Skip for now
              </button>
            </motion.div>
          )}

          {/* ─── Society form ─── */}
          {mode === 'society' && (
            <motion.div
              key="society"
              {...slide}
              transition={{ duration: 0.22 }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              {/* Scrollable fields */}
              <div style={{ flex: 1, padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <FieldLabel>Society / Complex Name *</FieldLabel>
                  <TextInput placeholder="e.g. Patuli Housing Estate" value={societyName} onChange={setSocietyName} />
                </div>
                <div>
                  <FieldLabel>Flat / Unit Number *</FieldLabel>
                  <TextInput placeholder="e.g. C-204 or Tower B, 12th Floor" value={flatNumber} onChange={setFlatNumber} />
                </div>

                {/* Role picker */}
                <div>
                  <FieldLabel>Your Role</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setRoleOpen(!roleOpen)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px', borderRadius: 16,
                        border: '1px solid #2A2A2A', background: '#161616',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ flex: 1, fontSize: 14, color: '#EBEBEB' }}>
                        {ROLES.find(r => r.id === role)?.label}
                      </span>
                      <ChevronDown size={15} color="#5C5C5C"
                        style={{ transform: roleOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }}
                      />
                    </button>
                    <AnimatePresence>
                      {roleOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{
                            overflow: 'hidden', marginTop: 4, borderRadius: 16,
                            border: '1px solid #2A2A2A', background: '#161616',
                          }}
                        >
                          {ROLES.map(r => (
                            <button
                              key={r.id}
                              onClick={() => { setRole(r.id); setRoleOpen(false); }}
                              style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                                borderBottom: '1px solid #1E1E1E', background: 'none',
                              }}
                            >
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', margin: 0 }}>{r.label}</p>
                                <p style={{ fontSize: 11, color: '#5C5C5C', marginTop: 2 }}>{r.desc}</p>
                              </div>
                              {role === r.id && <CheckCircle2 size={16} color="#00C896" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Locality */}
                <div>
                  <FieldLabel>Locality</FieldLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {LOCALITIES.slice(0, 9).map(loc => (
                      <button
                        key={loc.id}
                        onClick={() => setSocietyLocality(loc.id)}
                        style={{
                          padding: '10px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                          textAlign: 'center', cursor: 'pointer',
                          background:  societyLocality === loc.id ? 'rgba(0,200,150,0.12)' : '#161616',
                          border:      `1px solid ${societyLocality === loc.id ? 'rgba(0,200,150,0.35)' : '#1E1E1E'}`,
                          color:       societyLocality === loc.id ? '#00C896' : '#ADADAD',
                        }}
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky CTA */}
              <div style={{ flexShrink: 0, padding: '16px 20px 24px', borderTop: '1px solid #1A1A1A', marginTop: 20 }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveSociety}
                  disabled={!canSaveSociety}
                  style={{
                    width: '100%', padding: '15px', borderRadius: 16,
                    fontSize: 14, fontWeight: 700,
                    background: canSaveSociety ? 'linear-gradient(135deg, #00C896, #0aa87a)' : '#1A1A1A',
                    color: canSaveSociety ? 'white' : '#3A3A3A',
                    border: 'none', cursor: canSaveSociety ? 'pointer' : 'default',
                  }}
                >
                  Register with Society
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── Home form ─── */}
          {mode === 'home' && (
            <motion.div
              key="home"
              {...slide}
              transition={{ duration: 0.22 }}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {/* Scrollable fields */}
              <div style={{ flex: 1, padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <FieldLabel>Home Label *</FieldLabel>
                  <TextInput placeholder="e.g. My Home, Family House" value={homeLabel} onChange={setHomeLabel} />
                </div>
                <div>
                  <FieldLabel>Address *</FieldLabel>
                  <textarea
                    placeholder="e.g. 12 Lake View Road, near Patuli Lake"
                    value={homeAddress}
                    onChange={e => setHomeAddress(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 16,
                      border: '1px solid #2A2A2A', background: '#161616',
                      outline: 'none', fontSize: 14, color: '#EBEBEB',
                      resize: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <FieldLabel>Locality</FieldLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {LOCALITIES.slice(0, 9).map(loc => (
                      <button
                        key={loc.id}
                        onClick={() => setHomeLocality(loc.id)}
                        style={{
                          padding: '10px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                          textAlign: 'center', cursor: 'pointer',
                          background:  homeLocality === loc.id ? 'rgba(77,158,255,0.12)' : '#161616',
                          border:      `1px solid ${homeLocality === loc.id ? 'rgba(77,158,255,0.35)' : '#1E1E1E'}`,
                          color:       homeLocality === loc.id ? '#4D9EFF' : '#ADADAD',
                        }}
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky CTA */}
              <div style={{ flexShrink: 0, padding: '16px 20px 24px', borderTop: '1px solid #1A1A1A', marginTop: 20 }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveHome}
                  disabled={!canSaveHome}
                  style={{
                    width: '100%', padding: '15px', borderRadius: 16,
                    fontSize: 14, fontWeight: 700,
                    background: canSaveHome ? 'linear-gradient(135deg, #4D9EFF, #1666E8)' : '#1A1A1A',
                    color: canSaveHome ? 'white' : '#3A3A3A',
                    border: 'none', cursor: canSaveHome ? 'pointer' : 'default',
                  }}
                >
                  Register My Home
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── Done ─── */}
          {mode === 'done' && (
            <motion.div
              key="done"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, type: 'spring' }}
              style={{
                padding: '56px 20px 32px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.2)',
                }}
              >
                <CheckCircle2 size={40} color="#00C896" />
              </motion.div>

              <div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: 0 }}>
                  Welcome home!
                </h2>
                <p style={{ fontSize: 13, color: '#5C5C5C', marginTop: 10, lineHeight: 1.6, maxWidth: 280 }}>
                  You're now connected to your community. Receive local notices, alerts, and stay informed about what's happening nearby.
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                style={{
                  width: '100%', maxWidth: 320,
                  padding: '15px', borderRadius: 16,
                  fontSize: 14, fontWeight: 700, color: 'white',
                  background: 'linear-gradient(135deg, #00C896, #0aa87a)',
                  border: 'none', cursor: 'pointer',
                }}
              >
                View Society Board →
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
