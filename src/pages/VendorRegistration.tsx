import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronRight, Store, Phone, FileText, MapPin, CheckCircle2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { CATEGORY_GROUPS } from '../data/categories';
import { LOCALITIES } from '../data/localities';
import { VendorCategory } from '../types';

interface Props {
  onClose: () => void;
}

type RegistrationStep = 'basics' | 'category' | 'details' | 'done';

export function VendorRegistration({ onClose }: Props) {
  const { registerVendor, user } = useUser();

  const [step, setStep] = useState<RegistrationStep>('basics');
  const [businessName, setBusinessName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [locality, setLocality] = useState(user?.locality ? LOCALITIES.find(l => l.name === user.locality)?.id ?? 'patuli' : 'patuli');
  const [whatsapp, setWhatsapp] = useState(user?.phone ?? '');
  const [description, setDescription] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const selectedCatGroup = CATEGORY_GROUPS.find(g => g.id === selectedCategory);

  const canProceedBasics = businessName.trim().length >= 2;
  const canProceedCategory = selectedCategory !== null && selectedSubcategory !== '';
  const canProceedDetails = whatsapp.replace(/\D/g, '').length >= 10;

  const handleFinish = () => {
    if (!selectedCategory || !selectedSubcategory) return;
    registerVendor({
      businessName: businessName.trim(),
      category: selectedCategory,
      subcategory: selectedSubcategory,
      locality: LOCALITIES.find(l => l.id === locality)?.name ?? 'Patuli',
      whatsapp: '+91 ' + whatsapp.replace(/\D/g, '').slice(-10),
      description: description.trim(),
    });
    setStep('done');
  };

  const slideVariants = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0,  opacity: 1 },
    exit:    { x: -40, opacity: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: '#0D0D0D' }}
    >
      {/* Header */}
      <div className="flex-none flex items-center gap-3 px-5 pt-5 pb-4 border-b border-[#1A1A1A]">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1A1A1A]"
        >
          <X size={18} color="#ADADAD" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-[#EBEBEB]">Register as Vendor</h1>
          <p className="text-xs text-[#5C5C5C]">
            {step === 'basics'   && 'Step 1 of 3 — Business name'}
            {step === 'category' && 'Step 2 of 3 — Category & service'}
            {step === 'details'  && 'Step 3 of 3 — Contact & description'}
            {step === 'done'     && 'All done!'}
          </p>
        </div>

        {/* Progress dots */}
        {step !== 'done' && (
          <div className="flex items-center gap-1.5">
            {(['basics', 'category', 'details'] as RegistrationStep[]).map(s => (
              <div
                key={s}
                className="rounded-full transition-all"
                style={{
                  width:      step === s ? 16 : 5,
                  height:     5,
                  background: step === s ? '#00C896'
                    : (['basics', 'category', 'details'].indexOf(step) > ['basics', 'category', 'details'].indexOf(s))
                      ? '#00C896' : '#2A2A2A',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence mode="wait">

          {/* ── Step 1: Basics ── */}
          {step === 'basics' && (
            <motion.div
              key="basics"
              {...slideVariants}
              transition={{ duration: 0.22 }}
              className="px-5 pt-6 pb-8 flex flex-col gap-5"
            >
              <div className="flex flex-col items-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(0,200,150,0.1)' }}>
                  <Store size={26} color="#00C896" />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-[#EBEBEB]">What's your business name?</h2>
                  <p className="text-sm text-[#5C5C5C] mt-1">This is how customers will find you</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul's Tea Stall"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616] outline-none text-sm text-[#EBEBEB] placeholder:text-[#3A3A3A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">Your Locality</label>
                <div className="grid grid-cols-3 gap-2">
                  {LOCALITIES.slice(0, 9).map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => setLocality(loc.id)}
                      className="py-2 px-3 rounded-xl text-xs font-medium border transition-all"
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

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep('category')}
                disabled={!canProceedBasics}
                className="py-3.5 rounded-2xl font-bold text-sm mt-2"
                style={{
                  background: canProceedBasics ? 'linear-gradient(135deg, #00C896, #0aa87a)' : '#1A1A1A',
                  color: canProceedBasics ? 'white' : '#3A3A3A',
                }}
              >
                Continue →
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 2: Category ── */}
          {step === 'category' && (
            <motion.div
              key="category"
              {...slideVariants}
              transition={{ duration: 0.22 }}
              className="px-5 pt-6 pb-8 flex flex-col gap-4"
            >
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-[#EBEBEB]">What do you offer?</h2>
                <p className="text-sm text-[#5C5C5C] mt-1">Select a category, then pick your service</p>
              </div>

              {selectedCategory && selectedSubcategory && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border"
                  style={{ background: 'rgba(0,200,150,0.08)', borderColor: 'rgba(0,200,150,0.25)' }}
                >
                  <span className="text-base">{selectedCatGroup?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#00C896]">{selectedCatGroup?.label}</p>
                    <p className="text-sm font-medium text-[#EBEBEB] truncate">{selectedSubcategory}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedCategory(null); setSelectedSubcategory(''); }}
                    className="text-xs text-[#5C5C5C]"
                  >
                    Change
                  </button>
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
                          style={{ background: 'rgba(0,200,150,0.12)', color: '#00C896' }}>
                          Selected
                        </span>
                      )}
                      {expandedCat === group.id
                        ? <ChevronDown size={16} color="#5C5C5C" />
                        : <ChevronRight size={16} color="#5C5C5C" />
                      }
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
                                onClick={() => {
                                  setSelectedCategory(group.id as VendorCategory);
                                  setSelectedSubcategory(sub);
                                  setExpandedCat(null);
                                }}
                                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                                style={{
                                  background:  selectedCategory === group.id && selectedSubcategory === sub
                                    ? 'rgba(0,200,150,0.15)' : '#1A1A1A',
                                  borderColor: selectedCategory === group.id && selectedSubcategory === sub
                                    ? 'rgba(0,200,150,0.4)' : '#2A2A2A',
                                  color:       selectedCategory === group.id && selectedSubcategory === sub
                                    ? '#00C896' : '#ADADAD',
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

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep('basics')}
                  className="flex-none px-5 py-3.5 rounded-2xl font-bold text-sm bg-[#1A1A1A] text-[#ADADAD]"
                >
                  ← Back
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep('details')}
                  disabled={!canProceedCategory}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm"
                  style={{
                    background: canProceedCategory ? 'linear-gradient(135deg, #00C896, #0aa87a)' : '#1A1A1A',
                    color: canProceedCategory ? 'white' : '#3A3A3A',
                  }}
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Details ── */}
          {step === 'details' && (
            <motion.div
              key="details"
              {...slideVariants}
              transition={{ duration: 0.22 }}
              className="px-5 pt-6 pb-8 flex flex-col gap-5"
            >
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-[#EBEBEB]">Contact & description</h2>
                <p className="text-sm text-[#5C5C5C] mt-1">Help customers reach you</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  WhatsApp Number
                </label>
                <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616]">
                  <Phone size={15} color="#5C5C5C" />
                  <span className="text-sm text-[#ADADAD] font-medium">+91</span>
                  <div className="w-px h-4 bg-[#2A2A2A]" />
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit number"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-transparent outline-none text-sm text-[#EBEBEB] placeholder:text-[#3A3A3A]"
                  />
                </div>
                <p className="text-xs text-[#3A3A3A] mt-1.5 px-1">Customers will reach you on WhatsApp</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  Description <span className="text-[#3A3A3A] font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  placeholder="Tell customers what makes your business special..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616] outline-none text-sm text-[#EBEBEB] placeholder:text-[#3A3A3A] resize-none"
                />
              </div>

              {/* Summary card */}
              <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4 flex flex-col gap-2">
                <p className="text-[10px] font-semibold text-[#5C5C5C] uppercase tracking-widest mb-1">Summary</p>
                <div className="flex items-center gap-2">
                  <Store size={13} color="#5C5C5C" />
                  <span className="text-sm font-semibold text-[#EBEBEB]">{businessName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{selectedCatGroup?.icon}</span>
                  <span className="text-xs text-[#ADADAD]">{selectedSubcategory}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} color="#5C5C5C" />
                  <span className="text-xs text-[#ADADAD]">
                    {LOCALITIES.find(l => l.id === locality)?.name}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('category')}
                  className="flex-none px-5 py-3.5 rounded-2xl font-bold text-sm bg-[#1A1A1A] text-[#ADADAD]"
                >
                  ← Back
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleFinish}
                  disabled={!canProceedDetails}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm"
                  style={{
                    background: canProceedDetails ? 'linear-gradient(135deg, #00C896, #0aa87a)' : '#1A1A1A',
                    color: canProceedDetails ? 'white' : '#3A3A3A',
                  }}
                >
                  Register Business
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <motion.div
              key="done"
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
                  Customers in {LOCALITIES.find(l => l.id === locality)?.name} can find you.
                </p>
              </div>

              <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4 w-full text-left">
                <p className="text-[10px] font-semibold text-[#5C5C5C] uppercase tracking-widest mb-3">Next steps</p>
                <div className="flex flex-col gap-2">
                  {['Go to Vendor Dashboard to toggle Live/Closed', 'Share your GeoHood profile with customers', 'Get verified for a trusted badge'].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full flex-none flex items-center justify-center text-[10px] font-bold mt-0.5"
                        style={{ background: 'rgba(0,200,150,0.12)', color: '#00C896' }}>
                        {i + 1}
                      </div>
                      <p className="text-xs text-[#ADADAD]">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mt-2"
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
