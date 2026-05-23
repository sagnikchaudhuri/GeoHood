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

/* ── Numbered step indicator (matches reference) ───────────────────────── */
function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 px-4 py-3">
      {STEP_LABELS.map((label, i) => {
        const num     = (i + 1) as Step;
        const done    = num < current;
        const active  = num === current;
        const future  = num > current;

        return (
          <React.Fragment key={num}>
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all"
                style={{
                  background:  active ? '#00C896' : done ? 'rgba(0,200,150,0.15)' : 'transparent',
                  borderColor: active ? '#00C896' : done ? 'rgba(0,200,150,0.4)' : '#2A2A2A',
                  color:       active ? 'white'   : done ? '#00C896'              : '#3A3A3A',
                }}
              >
                {done ? <CheckCircle2 size={14} /> : num}
              </div>
              <span
                className="text-[9px] font-semibold uppercase tracking-wider text-center"
                style={{
                  color:     active ? '#00C896' : done ? 'rgba(0,200,150,0.7)' : '#3A3A3A',
                  maxWidth:  52,
                  lineHeight: 1.2,
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEP_LABELS.length - 1 && (
              <div
                className="flex-1 h-px mx-1.5 mb-4 transition-all"
                style={{
                  background: num < current ? '#00C896' : '#1E1E1E',
                  minWidth: 16,
                  maxWidth: 40,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function VendorRegistration({ onClose }: Props) {
  const { registerVendor, user } = useUser();

  const [step, setStep]                       = useState<Step>(1);
  const [businessName, setBusinessName]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [locality, setLocality]               = useState(
    user?.locality ? LOCALITIES.find(l => l.name === user.locality)?.id ?? 'patuli' : 'patuli'
  );
  const [whatsapp, setWhatsapp]               = useState(user?.phone ?? '');
  const [description, setDescription]         = useState('');
  const [expandedCat, setExpandedCat]         = useState<string | null>(null);
  const [catMenuOpen, setCatMenuOpen]         = useState(false);

  const selectedCatGroup = CATEGORY_GROUPS.find(g => g.id === selectedCategory);
  const localityName     = LOCALITIES.find(l => l.id === locality)?.name ?? 'Patuli';

  const canStep1 = businessName.trim().length >= 2;
  const canStep2 = selectedCategory !== null && selectedSubcategory !== '';
  const canStep3 = true; // locality always has a default
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
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: '#0D0D0D' }}
    >
      {/* ── Header ── */}
      <div className="flex-none px-5 pt-5 pb-2 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1A1A1A]"
          >
            <X size={18} color="#ADADAD" />
          </button>
          <h1 className="text-base font-bold text-[#EBEBEB]">Register as Vendor</h1>
        </div>

        {/* Step indicator */}
        {step < 4 && <StepIndicator current={step} />}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence mode="wait">

          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <motion.div key="s1" {...slide} transition={{ duration: 0.2 }} className="px-5 pt-6 pb-8 flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-bold text-[#EBEBEB] mb-1">Basic Information</h2>
                <p className="text-sm text-[#5C5C5C]">Tell us about your business</p>
              </div>

              {/* Business Name */}
              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  Vendor / Business Name <span className="text-[#FF4D6A]">*</span>
                </label>
                <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616]">
                  <Store size={15} color="#5C5C5C" />
                  <input
                    type="text"
                    placeholder="Enter your business name"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-[#EBEBEB] placeholder:text-[#3A3A3A]"
                  />
                </div>
              </div>

              {/* Category (dropdown-style) */}
              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  Category <span className="text-[#FF4D6A]">*</span>
                </label>
                <button
                  onClick={() => setStep(2)}
                  className="w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616] text-left"
                >
                  {selectedCategory && selectedCatGroup ? (
                    <>
                      <span className="text-base">{selectedCatGroup.icon}</span>
                      <span className="flex-1 text-sm text-[#EBEBEB]">{selectedSubcategory}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-[#2A2A2A]">
                        <span className="text-[10px]">🏪</span>
                      </div>
                      <span className="flex-1 text-sm text-[#3A3A3A]">Select primary category</span>
                    </>
                  )}
                  <ChevronRight size={16} color="#3A3A3A" />
                </button>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  WhatsApp Number <span className="text-[#FF4D6A]">*</span>
                </label>
                <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616]">
                  <Phone size={15} color="#00C896" />
                  <span className="text-sm text-[#ADADAD] font-medium">+91</span>
                  <div className="w-px h-4 bg-[#2A2A2A]" />
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-transparent outline-none text-sm text-[#EBEBEB] placeholder:text-[#3A3A3A]"
                  />
                </div>
                <p className="text-[11px] text-[#3A3A3A] mt-1.5 px-1">Leads will contact you on WhatsApp</p>
              </div>

              {/* Go Live section — matches reference illustration area */}
              <div
                className="rounded-2xl border border-[rgba(0,200,150,0.15)] p-4"
                style={{ background: 'rgba(0,200,150,0.04)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#EBEBEB] mb-2">
                      Go Live. Get Leads.
                    </p>
                    {[
                      'Appear in nearby searches',
                      'Get WhatsApp leads',
                      'Build trust in your locality',
                      'Grow your business',
                    ].map(tip => (
                      <div key={tip} className="flex items-center gap-2 mb-1.5">
                        <CheckCircle2 size={12} color="#00C896" />
                        <span className="text-xs text-[#ADADAD]">{tip}</span>
                      </div>
                    ))}
                  </div>
                  {/* Mini store illustration */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-none"
                    style={{ background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.15)' }}
                  >
                    <Store size={28} color="#00C896" strokeWidth={1.4} />
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                disabled={!canStep1}
                className="py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  background: canStep1 ? 'linear-gradient(135deg, #00C896, #0aa87a)' : '#1A1A1A',
                  color: canStep1 ? 'white' : '#3A3A3A',
                }}
              >
                Next: Category <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 2: Category ── */}
          {step === 2 && (
            <motion.div key="s2" {...slide} transition={{ duration: 0.2 }} className="px-5 pt-6 pb-8 flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#EBEBEB] mb-1">Select Category</h2>
                <p className="text-sm text-[#5C5C5C]">Pick the best match for your service</p>
              </div>

              {selectedCategory && selectedSubcategory && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border"
                  style={{ background: 'rgba(0,200,150,0.08)', borderColor: 'rgba(0,200,150,0.25)' }}
                >
                  <span>{selectedCatGroup?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#00C896]">{selectedCatGroup?.label}</p>
                    <p className="text-sm font-medium text-[#EBEBEB] truncate">{selectedSubcategory}</p>
                  </div>
                  <button onClick={() => { setSelectedCategory(null); setSelectedSubcategory(''); }} className="text-xs text-[#5C5C5C]">Change</button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {CATEGORY_GROUPS.filter(g => g.id !== 'emergency' && g.id !== 'society_services').map(group => (
                  <div key={group.id} className="rounded-xl border border-[#1E1E1E] overflow-hidden">
                    <button
                      onClick={() => setExpandedCat(expandedCat === group.id ? null : group.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-[#161616]"
                    >
                      <span className="text-lg">{group.icon}</span>
                      <span className="flex-1 text-left text-sm font-semibold text-[#EBEBEB]">{group.label}</span>
                      {selectedCategory === group.id && selectedSubcategory && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(0,200,150,0.12)', color: '#00C896' }}>✓</span>
                      )}
                      {expandedCat === group.id ? <ChevronDown size={15} color="#5C5C5C" /> : <ChevronRight size={15} color="#5C5C5C" />}
                    </button>

                    <AnimatePresence>
                      {expandedCat === group.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2 bg-[#111111]">
                            {group.subcategories.map(sub => (
                              <button
                                key={sub}
                                onClick={() => { setSelectedCategory(group.id as VendorCategory); setSelectedSubcategory(sub); setExpandedCat(null); }}
                                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                                style={{
                                  background:  selectedCategory === group.id && selectedSubcategory === sub ? 'rgba(0,200,150,0.15)' : '#1A1A1A',
                                  borderColor: selectedCategory === group.id && selectedSubcategory === sub ? 'rgba(0,200,150,0.4)'  : '#2A2A2A',
                                  color:       selectedCategory === group.id && selectedSubcategory === sub ? '#00C896' : '#ADADAD',
                                }}
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-none px-5 py-4 rounded-2xl font-bold text-sm bg-[#1A1A1A] text-[#ADADAD]">← Back</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(3)} disabled={!canStep2}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: canStep2 ? 'linear-gradient(135deg, #00C896, #0aa87a)' : '#1A1A1A',
                    color: canStep2 ? 'white' : '#3A3A3A',
                  }}>
                  Next: Locality <ChevronRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Locality ── */}
          {step === 3 && (
            <motion.div key="s3" {...slide} transition={{ duration: 0.2 }} className="px-5 pt-6 pb-8 flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-bold text-[#EBEBEB] mb-1">Your Locality</h2>
                <p className="text-sm text-[#5C5C5C]">Where is your business located?</p>
              </div>

              {/* Detected locality */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border"
                style={{ background: 'rgba(0,200,150,0.06)', borderColor: 'rgba(0,200,150,0.2)' }}
              >
                <MapPin size={18} color="#00C896" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#EBEBEB]">Detected: {localityName}, Kolkata</p>
                  <p className="text-xs text-[#5C5C5C] mt-0.5">You can change it if needed</p>
                </div>
                <button className="text-[#5C5C5C]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M11.333 2a1.5 1.5 0 0 1 2.12 2.12L5.667 11.908 2 12.667l.76-3.667L11.333 2z" stroke="#5C5C5C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2.5 block">
                  Select Locality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LOCALITIES.slice(0, 9).map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => setLocality(loc.id)}
                      className="py-2.5 px-2 rounded-xl text-xs font-medium border transition-all text-center"
                      style={{
                        background:  locality === loc.id ? 'rgba(0,200,150,0.12)' : '#161616',
                        borderColor: locality === loc.id ? 'rgba(0,200,150,0.35)' : '#1E1E1E',
                        color:       locality === loc.id ? '#00C896' : '#ADADAD',
                      }}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  Description <span className="font-normal normal-case text-[#3A3A3A]">(optional)</span>
                </label>
                <textarea
                  placeholder="Tell customers what makes your business special..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616] outline-none text-sm text-[#EBEBEB] placeholder:text-[#3A3A3A] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-none px-5 py-4 rounded-2xl font-bold text-sm bg-[#1A1A1A] text-[#ADADAD]">← Back</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleFinish} disabled={!canFinish}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: canFinish ? 'linear-gradient(135deg, #00C896, #0aa87a)' : '#1A1A1A',
                    color: canFinish ? 'white' : '#3A3A3A',
                  }}>
                  <Zap size={15} fill={canFinish ? 'white' : 'none'} /> Go Live
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Done ── */}
          {step === 4 && (
            <motion.div
              key="s4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="px-5 pt-16 pb-8 flex flex-col items-center gap-5 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,200,150,0.12)' }}
              >
                <CheckCircle2 size={40} color="#00C896" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-[#EBEBEB]">You're registered!</h2>
                <p className="text-sm text-[#5C5C5C] mt-2 leading-relaxed max-w-xs">
                  <span className="text-[#EBEBEB] font-semibold">{businessName}</span> is now live on GeoHood.
                  Customers in {localityName} can find you.
                </p>
              </div>

              <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4 w-full text-left">
                <p className="text-[10px] font-semibold text-[#5C5C5C] uppercase tracking-widest mb-3">Next steps</p>
                {['Go to Vendor Dashboard to set yourself Live', 'Share your profile to attract customers', 'Get verified for a trusted badge'].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                    <div className="w-4 h-4 rounded-full flex-none flex items-center justify-center text-[10px] font-bold mt-0.5"
                      style={{ background: 'rgba(0,200,150,0.12)', color: '#00C896' }}>
                      {i + 1}
                    </div>
                    <p className="text-xs text-[#ADADAD]">{tip}</p>
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #00C896, #0aa87a)' }}
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
