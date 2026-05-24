import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronRight, Store, Phone, MapPin, CheckCircle2, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { CATEGORY_GROUPS } from '../data/categories';
import { LOCALITIES } from '../data/localities';
import { VendorCategory } from '../types';

interface Props {
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ['Basic Info', 'Category', 'Locality', 'Confirm'];

/* ── Step indicator ────────────────────────────────────────────────────── */
function StepIndicator({ current }: { current: Step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '12px 16px' }}>
      {STEP_LABELS.map((label, i) => {
        const num    = (i + 1) as Step;
        const done   = num < current;
        const active = num === current;

        return (
          <React.Fragment key={num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background:  active ? '#00C896' : done ? 'rgba(0,200,150,0.15)' : 'transparent',
                border:      `1.5px solid ${active ? '#00C896' : done ? 'rgba(0,200,150,0.4)' : '#2A2A2A'}`,
                color:       active ? 'white'   : done ? '#00C896'              : '#3A3A3A',
                transition: 'all 0.2s',
              }}>
                {done ? <CheckCircle2 size={14} /> : num}
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                textAlign: 'center', maxWidth: 52, lineHeight: 1.2,
                color: active ? '#00C896' : done ? 'rgba(0,200,150,0.7)' : '#3A3A3A',
              }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{
                flex: 1, height: 1.5, marginBottom: 16, marginLeft: 4, marginRight: 4,
                minWidth: 12, maxWidth: 36,
                background: num < current ? '#00C896' : '#1E1E1E',
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Reusable field label ───────────────────────────────────────────────── */
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
      {children}{required && <span style={{ color: '#FF4D6A', marginLeft: 4 }}>*</span>}
    </p>
  );
}

/* ── Reusable CTA button ───────────────────────────────────────────────── */
function CTAButton({ label, onClick, disabled, icon }: {
  label: string; onClick: () => void; disabled?: boolean; icon?: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '15px', borderRadius: 16,
        fontSize: 14, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: !disabled ? 'linear-gradient(135deg, #00C896, #0aa87a)' : '#1A1A1A',
        color: !disabled ? 'white' : '#3A3A3A',
        border: 'none', cursor: !disabled ? 'pointer' : 'default',
        transition: 'background 0.2s',
      }}
    >
      {icon}{label}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VendorRegistration
   ═══════════════════════════════════════════════════════════════════════════ */
export function VendorRegistration({ onClose }: Props) {
  const { registerVendor, user, selectedLocality } = useUser();

  const [step, setStep]                             = useState<Step>(1);
  const [businessName, setBusinessName]             = useState('');
  const [selectedCategory, setSelectedCategory]     = useState<VendorCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [locality, setLocality]                     = useState(
    // Prefer persisted selectedLocality, fallback to user.locality name lookup, then Patuli
    selectedLocality
      || (user?.locality ? LOCALITIES.find(l => l.name === user.locality)?.id ?? 'patuli' : 'patuli')
  );
  const [whatsapp, setWhatsapp]   = useState(user?.phone ?? '');
  const [description, setDescription] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const selectedCatGroup = CATEGORY_GROUPS.find(g => g.id === selectedCategory);
  const localityName     = LOCALITIES.find(l => l.id === locality)?.name ?? 'Patuli';

  const canStep1  = businessName.trim().length >= 2;
  const canStep2  = selectedCategory !== null && selectedSubcategory !== '';
  const canFinish = whatsapp.replace(/\D/g, '').length >= 10;

  const handleFinish = () => {
    if (!selectedCategory) return;
    registerVendor({
      businessName: businessName.trim(),
      category:     selectedCategory,
      subcategory:  selectedSubcategory,
      locality:     localityName,
      whatsapp:     '+91 ' + whatsapp.replace(/\D/g, '').slice(-10),
      description:  description.trim(),
    });
    setStep(4);
  };

  const slide = {
    initial: { x: 32, opacity: 0 },
    animate: { x: 0,  opacity: 1 },
    exit:    { x: -32, opacity: 0 },
  };

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
        padding: 'calc(var(--safe-top) + 20px) 20px 12px',
        borderBottom: '1px solid #1A1A1A',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
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
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#EBEBEB', margin: 0 }}>Register as Vendor</h1>
        </div>
        {step < 4 && <StepIndicator current={step} />}
      </div>

      {/* ── Step content + sticky CTA shell ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">

          {/* ─── Step 1: Basic Info ─── */}
          {step === 1 && (
            <motion.div key="s1" {...slide} transition={{ duration: 0.2 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              {/* Scrollable content */}
              <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Basic Information</h2>
                <p style={{ fontSize: 13, color: '#5C5C5C', marginBottom: 24 }}>Tell us about your business</p>

                {/* Business name */}
                <div style={{ marginBottom: 20 }}>
                  <FieldLabel required>Vendor / Business Name</FieldLabel>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0 16px', borderRadius: 16,
                    border: `1px solid ${businessName ? 'rgba(0,200,150,0.35)' : '#2A2A2A'}`,
                    background: '#161616', transition: 'border-color 0.2s',
                  }}>
                    <Store size={15} color="#5C5C5C" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Enter your business name"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      style={{
                        flex: 1, padding: '14px 0', background: 'transparent', outline: 'none',
                        fontSize: 14, color: '#EBEBEB',
                      }}
                    />
                  </div>
                </div>

                {/* Category (nav to step 2) */}
                <div style={{ marginBottom: 20 }}>
                  <FieldLabel required>Category</FieldLabel>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '14px 16px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                      border: `1px solid ${selectedCategory ? 'rgba(0,200,150,0.35)' : '#2A2A2A'}`,
                      background: '#161616',
                    }}
                  >
                    {selectedCategory && selectedCatGroup ? (
                      <>
                        <span style={{ fontSize: 16 }}>{selectedCatGroup.icon}</span>
                        <span style={{ flex: 1, fontSize: 14, color: '#EBEBEB' }}>{selectedSubcategory}</span>
                      </>
                    ) : (
                      <>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🏪</div>
                        <span style={{ flex: 1, fontSize: 14, color: '#3A3A3A' }}>Select primary category</span>
                      </>
                    )}
                    <ChevronRight size={15} color="#3A3A3A" style={{ flexShrink: 0 }} />
                  </button>
                </div>

                {/* WhatsApp */}
                <div style={{ marginBottom: 20 }}>
                  <FieldLabel required>WhatsApp Number</FieldLabel>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0 16px', borderRadius: 16,
                    border: `1px solid ${whatsapp.replace(/\D/g, '').length >= 10 ? 'rgba(0,200,150,0.35)' : '#2A2A2A'}`,
                    background: '#161616', transition: 'border-color 0.2s',
                  }}>
                    <Phone size={14} color="#00C896" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#ADADAD', fontWeight: 600 }}>+91</span>
                    <div style={{ width: 1, height: 16, background: '#2A2A2A' }} />
                    <input
                      type="tel" maxLength={10}
                      placeholder="98765 43210"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                      style={{
                        flex: 1, padding: '14px 0', background: 'transparent', outline: 'none',
                        fontSize: 14, color: '#EBEBEB',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: '#3A3A3A', marginTop: 6, paddingLeft: 4 }}>Leads will contact you on WhatsApp</p>
                </div>

                {/* Go Live info card */}
                <div style={{
                  borderRadius: 18, border: '1px solid rgba(0,200,150,0.15)',
                  background: 'rgba(0,200,150,0.04)', padding: '16px', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#EBEBEB', margin: '0 0 10px' }}>Go Live. Get Leads.</p>
                      {['Appear in nearby searches', 'Get WhatsApp leads', 'Build trust in your locality', 'Grow your business'].map(tip => (
                        <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <CheckCircle2 size={12} color="#00C896" />
                          <span style={{ fontSize: 12, color: '#ADADAD' }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.15)',
                    }}>
                      <Store size={24} color="#00C896" strokeWidth={1.4} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky CTA */}
              <div style={{ flexShrink: 0, padding: '12px 20px 24px', borderTop: '1px solid #1A1A1A' }}>
                <CTAButton
                  label="Next: Category"
                  onClick={() => setStep(2)}
                  disabled={!canStep1}
                  icon={<ChevronRight size={16} />}
                />
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: Category ─── */}
          {step === 2 && (
            <motion.div key="s2" {...slide} transition={{ duration: 0.2 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Select Category</h2>
                <p style={{ fontSize: 13, color: '#5C5C5C', marginBottom: 20 }}>Pick the best match for your service</p>

                {/* Selected chip */}
                {selectedCategory && selectedSubcategory && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', borderRadius: 16, marginBottom: 16,
                    background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.25)',
                  }}>
                    <span style={{ fontSize: 18 }}>{selectedCatGroup?.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#00C896', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{selectedCatGroup?.label}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedSubcategory}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedCategory(null); setSelectedSubcategory(''); }}
                      style={{ fontSize: 11, fontWeight: 600, color: '#5C5C5C', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Category groups */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
                  {CATEGORY_GROUPS.filter(g => g.id !== 'emergency' && g.id !== 'society_services').map(group => (
                    <div key={group.id} style={{ borderRadius: 16, border: '1px solid #1A1A1A', overflow: 'hidden' }}>
                      <button
                        onClick={() => setExpandedCat(expandedCat === group.id ? null : group.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '13px 16px', background: '#161616', cursor: 'pointer', textAlign: 'left',
                          border: 'none',
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{group.icon}</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#EBEBEB' }}>{group.label}</span>
                        {selectedCategory === group.id && selectedSubcategory && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 9999,
                            background: 'rgba(0,200,150,0.12)', color: '#00C896',
                          }}>✓</span>
                        )}
                        {expandedCat === group.id
                          ? <ChevronDown size={14} color="#5C5C5C" />
                          : <ChevronRight size={14} color="#5C5C5C" />
                        }
                      </button>
                      <AnimatePresence>
                        {expandedCat === group.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '10px 14px 14px', display: 'flex', flexWrap: 'wrap', gap: 8, background: '#111111' }}>
                              {group.subcategories.map(sub => {
                                const sel = selectedCategory === group.id && selectedSubcategory === sub;
                                return (
                                  <button
                                    key={sub}
                                    onClick={() => { setSelectedCategory(group.id as VendorCategory); setSelectedSubcategory(sub); setExpandedCat(null); }}
                                    style={{
                                      padding: '7px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 500,
                                      cursor: 'pointer',
                                      background:  sel ? 'rgba(0,200,150,0.15)' : '#1A1A1A',
                                      border:      `1px solid ${sel ? 'rgba(0,200,150,0.4)' : '#2A2A2A'}`,
                                      color:       sel ? '#00C896' : '#ADADAD',
                                      transition: 'all 0.15s',
                                    }}
                                  >
                                    {sub}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky CTA */}
              <div style={{ flexShrink: 0, padding: '12px 20px 24px', borderTop: '1px solid #1A1A1A', display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flexShrink: 0, padding: '15px 18px', borderRadius: 16,
                    fontSize: 14, fontWeight: 700, color: '#ADADAD',
                    background: '#1A1A1A', border: 'none', cursor: 'pointer',
                  }}
                >← Back</button>
                <CTAButton label="Next: Locality" onClick={() => setStep(3)} disabled={!canStep2} icon={<ChevronRight size={16} />} />
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Locality ─── */}
          {step === 3 && (
            <motion.div key="s3" {...slide} transition={{ duration: 0.2 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Your Locality</h2>
                <p style={{ fontSize: 13, color: '#5C5C5C', marginBottom: 20 }}>Where is your business located?</p>

                {/* Detected locality */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 16, marginBottom: 20,
                  background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.2)',
                }}>
                  <MapPin size={16} color="#00C896" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#EBEBEB', margin: 0 }}>Detected: {localityName}, Kolkata</p>
                    <p style={{ fontSize: 11, color: '#5C5C5C', marginTop: 3 }}>You can change it below</p>
                  </div>
                </div>

                {/* Locality grid */}
                <div style={{ marginBottom: 20 }}>
                  <FieldLabel>Select Locality</FieldLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {LOCALITIES.slice(0, 9).map(loc => {
                      const sel = locality === loc.id;
                      return (
                        <button
                          key={loc.id}
                          onClick={() => setLocality(loc.id)}
                          style={{
                            padding: '10px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                            textAlign: 'center', cursor: 'pointer',
                            background:  sel ? 'rgba(0,200,150,0.12)' : '#161616',
                            border:      `1px solid ${sel ? 'rgba(0,200,150,0.35)' : '#1E1E1E'}`,
                            color:       sel ? '#00C896' : '#ADADAD',
                            transition: 'all 0.15s',
                          }}
                        >
                          {loc.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 8 }}>
                  <FieldLabel>Description <span style={{ fontWeight: 400, textTransform: 'none', color: '#3A3A3A' }}>(optional)</span></FieldLabel>
                  <textarea
                    placeholder="Tell customers what makes your business special…"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 16,
                      border: '1px solid #2A2A2A', background: '#161616',
                      outline: 'none', fontSize: 14, color: '#EBEBEB',
                      resize: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Sticky CTA */}
              <div style={{ flexShrink: 0, padding: '12px 20px 24px', borderTop: '1px solid #1A1A1A', display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    flexShrink: 0, padding: '15px 18px', borderRadius: 16,
                    fontSize: 14, fontWeight: 700, color: '#ADADAD',
                    background: '#1A1A1A', border: 'none', cursor: 'pointer',
                  }}
                >← Back</button>
                <CTAButton
                  label="Go Live"
                  onClick={handleFinish}
                  disabled={!canFinish}
                  icon={<Zap size={15} fill={canFinish ? 'white' : 'none'} color={canFinish ? 'white' : '#3A3A3A'} />}
                />
              </div>
            </motion.div>
          )}

          {/* ─── Step 4: Done ─── */}
          {step === 4 && (
            <motion.div
              key="s4"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, type: 'spring' }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', padding: '48px 20px 32px', textAlign: 'center',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                style={{
                  width: 80, height: 80, borderRadius: '50%', marginBottom: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.2)',
                }}
              >
                <CheckCircle2 size={40} color="#00C896" />
              </motion.div>

              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                You're registered!
              </h2>
              <p style={{ fontSize: 13, color: '#5C5C5C', lineHeight: 1.6, maxWidth: 280, margin: '0 auto 28px' }}>
                <span style={{ color: '#EBEBEB', fontWeight: 600 }}>{businessName}</span> is now live on GeoHood.
                Customers in {localityName} can find you.
              </p>

              {/* Next steps card */}
              <div style={{
                width: '100%', borderRadius: 18, border: '1px solid #1A1A1A', background: '#161616',
                padding: '16px', textAlign: 'left', marginBottom: 20,
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  Next steps
                </p>
                {[
                  'Go to Vendor Dashboard to set yourself Live',
                  'Share your profile to attract customers',
                  'Get verified for a trusted badge',
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < 2 ? 12 : 0 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, marginTop: 1,
                      background: 'rgba(0,200,150,0.12)', color: '#00C896',
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: 12, color: '#ADADAD', margin: 0, lineHeight: 1.5 }}>{tip}</p>
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                style={{
                  width: '100%', padding: '15px', borderRadius: 16,
                  fontSize: 14, fontWeight: 700, color: 'white',
                  background: 'linear-gradient(135deg, #00C896, #0aa87a)',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Go to Dashboard →
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
