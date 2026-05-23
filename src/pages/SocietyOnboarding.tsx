import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home, ChevronDown, CheckCircle2, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { LOCALITIES } from '../data/localities';
import { SocietyRole } from '../types';

interface Props {
  onClose: () => void;
}

type Mode = 'choose' | 'society' | 'home' | 'done';

const ROLES: { id: SocietyRole; label: string; desc: string }[] = [
  { id: 'resident',     label: 'Resident',     desc: 'I live in this society'         },
  { id: 'family_head',  label: 'Family Head',  desc: 'I manage the household account' },
  { id: 'committee',    label: 'Committee',    desc: 'I\'m on the management committee' },
];

export function SocietyOnboarding({ onClose }: Props) {
  const { setResidence, selectedLocality } = useUser();

  const [mode, setMode] = useState<Mode>('choose');

  // Society form
  const [societyName, setSocietyName] = useState('');
  const [flatNumber,  setFlatNumber]  = useState('');
  const [role, setRole]               = useState<SocietyRole>('resident');
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

  const slideVariants = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0,  opacity: 1 },
    exit:    { x: -40, opacity: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-40 flex flex-col"
      style={{ background: '#0D0D0D' }}
    >
      {/* Header */}
      <div className="flex-none flex items-center gap-3 px-5 pt-5 pb-4 border-b border-[#1A1A1A]">
        {mode !== 'choose' && mode !== 'done' && (
          <button
            onClick={() => setMode('choose')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1A1A1A]"
          >
            <X size={18} color="#ADADAD" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-base font-bold text-[#EBEBEB]">
            {mode === 'choose'  && 'Register your residence'}
            {mode === 'society' && 'Society details'}
            {mode === 'home'    && 'Home details'}
            {mode === 'done'    && 'You\'re registered!'}
          </h1>
          <p className="text-xs text-[#5C5C5C]">
            {mode === 'choose'  && 'Connect with your local community'}
            {mode === 'society' && 'Tell us about your housing society'}
            {mode === 'home'    && 'Add your home address'}
            {mode === 'done'    && 'Welcome to your community'}
          </p>
        </div>
        {(mode === 'choose' || mode === 'done') && (
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1A1A1A]">
            <X size={18} color="#ADADAD" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence mode="wait">

          {/* ── Choose mode ── */}
          {mode === 'choose' && (
            <motion.div
              key="choose"
              {...slideVariants}
              transition={{ duration: 0.22 }}
              className="px-5 pt-8 pb-8 flex flex-col gap-4"
            >
              <div className="text-center mb-4">
                <p className="text-sm text-[#5C5C5C] leading-relaxed max-w-xs mx-auto">
                  Register your home to access society notices, local alerts, and connect with neighbours.
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode('society')}
                className="flex items-center gap-4 p-5 rounded-2xl border text-left transition-all"
                style={{ background: '#161616', borderColor: '#2A2A2A' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none"
                  style={{ background: 'rgba(0,200,150,0.1)' }}>
                  <Building2 size={26} color="#00C896" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#EBEBEB]">Register with Society</p>
                  <p className="text-xs text-[#5C5C5C] mt-1 leading-relaxed">
                    For apartment complexes and gated communities. Access committee notices and resident directory.
                  </p>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode('home')}
                className="flex items-center gap-4 p-5 rounded-2xl border text-left transition-all"
                style={{ background: '#161616', borderColor: '#2A2A2A' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none"
                  style={{ background: 'rgba(77,158,255,0.1)' }}>
                  <Home size={26} color="#4D9EFF" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#EBEBEB]">Register My Home</p>
                  <p className="text-xs text-[#5C5C5C] mt-1 leading-relaxed">
                    For standalone houses and independent residences. Get hyperlocal alerts for your area.
                  </p>
                </div>
              </motion.button>

              <button onClick={onClose} className="text-center text-xs text-[#3A3A3A] mt-2">
                Skip for now
              </button>
            </motion.div>
          )}

          {/* ── Society form ── */}
          {mode === 'society' && (
            <motion.div
              key="society"
              {...slideVariants}
              transition={{ duration: 0.22 }}
              className="px-5 pt-6 pb-8 flex flex-col gap-5"
            >
              {/* Society name */}
              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  Society / Complex Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Patuli Housing Estate"
                  value={societyName}
                  onChange={e => setSocietyName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616] outline-none text-sm text-[#EBEBEB] placeholder:text-[#3A3A3A]"
                />
              </div>

              {/* Flat number */}
              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  Flat / Unit Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. C-204 or Tower B, 12th Floor"
                  value={flatNumber}
                  onChange={e => setFlatNumber(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616] outline-none text-sm text-[#EBEBEB] placeholder:text-[#3A3A3A]"
                />
              </div>

              {/* Role picker */}
              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  Your Role
                </label>
                <div className="relative">
                  <button
                    onClick={() => setRoleOpen(!roleOpen)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616] text-left"
                  >
                    <span className="flex-1 text-sm text-[#EBEBEB]">
                      {ROLES.find(r => r.id === role)?.label}
                    </span>
                    <ChevronDown size={16} color="#5C5C5C"
                      style={{ transform: roleOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                    />
                  </button>

                  <AnimatePresence>
                    {roleOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-1 rounded-2xl border border-[#2A2A2A] bg-[#161616]"
                      >
                        {ROLES.map(r => (
                          <button
                            key={r.id}
                            onClick={() => { setRole(r.id); setRoleOpen(false); }}
                            className="w-full flex items-center justify-between px-4 py-3 text-left border-b border-[#1E1E1E] last:border-0"
                          >
                            <div>
                              <p className="text-sm font-semibold text-[#EBEBEB]">{r.label}</p>
                              <p className="text-xs text-[#5C5C5C]">{r.desc}</p>
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
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  Locality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LOCALITIES.slice(0, 9).map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => setSocietyLocality(loc.id)}
                      className="py-2 px-3 rounded-xl text-xs font-medium border transition-all"
                      style={{
                        background:  societyLocality === loc.id ? 'rgba(0,200,150,0.12)' : '#161616',
                        borderColor: societyLocality === loc.id ? 'rgba(0,200,150,0.35)' : '#1E1E1E',
                        color:       societyLocality === loc.id ? '#00C896' : '#ADADAD',
                      }}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveSociety}
                disabled={!canSaveSociety}
                className="py-3.5 rounded-2xl font-bold text-sm mt-2"
                style={{
                  background: canSaveSociety ? 'linear-gradient(135deg, #00C896, #0aa87a)' : '#1A1A1A',
                  color: canSaveSociety ? 'white' : '#3A3A3A',
                }}
              >
                Register with Society
              </motion.button>
            </motion.div>
          )}

          {/* ── Home form ── */}
          {mode === 'home' && (
            <motion.div
              key="home"
              {...slideVariants}
              transition={{ duration: 0.22 }}
              className="px-5 pt-6 pb-8 flex flex-col gap-5"
            >
              {/* Home label */}
              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  Home Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Home, Family House"
                  value={homeLabel}
                  onChange={e => setHomeLabel(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616] outline-none text-sm text-[#EBEBEB] placeholder:text-[#3A3A3A]"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  Address
                </label>
                <textarea
                  placeholder="e.g. 12 Lake View Road, near Patuli Lake"
                  value={homeAddress}
                  onChange={e => setHomeAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616] outline-none text-sm text-[#EBEBEB] placeholder:text-[#3A3A3A] resize-none"
                />
              </div>

              {/* Locality */}
              <div>
                <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-2 block">
                  Locality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LOCALITIES.slice(0, 9).map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => setHomeLocality(loc.id)}
                      className="py-2 px-3 rounded-xl text-xs font-medium border transition-all"
                      style={{
                        background:  homeLocality === loc.id ? 'rgba(77,158,255,0.12)' : '#161616',
                        borderColor: homeLocality === loc.id ? 'rgba(77,158,255,0.35)' : '#1E1E1E',
                        color:       homeLocality === loc.id ? '#4D9EFF' : '#ADADAD',
                      }}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveHome}
                disabled={!canSaveHome}
                className="py-3.5 rounded-2xl font-bold text-sm mt-2"
                style={{
                  background: canSaveHome ? 'linear-gradient(135deg, #4D9EFF, #1666E8)' : '#1A1A1A',
                  color: canSaveHome ? 'white' : '#3A3A3A',
                }}
              >
                Register My Home
              </motion.button>
            </motion.div>
          )}

          {/* ── Done ── */}
          {mode === 'done' && (
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
                <h2 className="text-2xl font-bold text-[#EBEBEB]">Welcome home!</h2>
                <p className="text-sm text-[#5C5C5C] mt-2 leading-relaxed max-w-xs">
                  You're now connected to your community. Receive local notices, alerts, and stay informed about what's happening nearby.
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #00C896, #0aa87a)' }}
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
