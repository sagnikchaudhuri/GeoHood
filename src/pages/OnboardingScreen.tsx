import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { GeoHoodLogoMark } from '../components/brand/GeoHoodLogo';
import { useUser } from '../context/UserContext';
import { LOCALITIES, DEFAULT_LOCALITY } from '../data/localities';
import { UserProfile } from '../types';

type Step = 'welcome' | 'phone' | 'otp' | 'location' | 'done';

const MOCK_OTP = '1234';

export function OnboardingScreen() {
  const { completeOnboarding } = useUser();
  const [step, setStep]         = useState<Step>('welcome');
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState('');
  const [otpError, setOtpError] = useState(false);
  const [otpSent, setOtpSent]   = useState(false);
  const [locality, setLocality] = useState(DEFAULT_LOCALITY.id);
  const [detecting, setDetecting] = useState(false);
  const [shake, setShake]       = useState(false);

  const sendOtp = () => {
    if (phone.length < 10) return;
    setOtpSent(true);
    setStep('otp');
  };

  const verifyOtp = () => {
    if (otp === MOCK_OTP) {
      setStep('location');
    } else {
      setOtpError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setOtpError(false), 2000);
    }
  };

  const detectLocation = () => {
    setDetecting(true);
    // Mock geolocation — snap to Patuli
    setTimeout(() => {
      setLocality('patuli');
      setDetecting(false);
    }, 1200);
  };

  const finish = () => {
    const profile: UserProfile = {
      phone,
      name:     `User ${phone.slice(-4)}`,
      locality: LOCALITIES.find(l => l.id === locality)?.name ?? 'Patuli',
      roles:    ['user'],
    };
    completeOnboarding(profile);
  };

  const slideVariants = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0,  opacity: 1 },
    exit:    { x: -40, opacity: 0 },
  };

  return (
    <div
      className="flex flex-col h-full items-center justify-between px-6 py-10"
      style={{ background: '#0D0D0D' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 pt-6">
        <GeoHoodLogoMark size={52} />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#EBEBEB]">GeoHood</h1>
          <p className="text-xs text-[#5C5C5C] tracking-widest uppercase mt-0.5">Hyperlocal</p>
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            {...slideVariants}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: 'rgba(0,200,150,0.1)' }}>
              🏘️
            </div>
            <h2 className="text-xl font-bold text-[#EBEBEB]">Your neighborhood,<br/>all in one place</h2>
            <p className="text-sm text-[#5C5C5C] max-w-xs leading-relaxed">
              Find local vendors, track live activity, and stay connected with your community.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep('phone')}
              className="mt-2 flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #00C896, #0aa87a)' }}
            >
              Get Started <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {step === 'phone' && (
          <motion.div
            key="phone"
            {...slideVariants}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4 w-full"
          >
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(0,200,150,0.1)' }}>
                <Phone size={22} color="#00C896" />
              </div>
              <h2 className="text-xl font-bold text-[#EBEBEB]">Enter your number</h2>
              <p className="text-sm text-[#5C5C5C]">We'll send an OTP to verify</p>
            </div>

            <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-[#2A2A2A] bg-[#161616]">
              <span className="text-sm text-[#ADADAD] font-medium">+91</span>
              <div className="w-px h-4 bg-[#2A2A2A]" />
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-transparent outline-none text-sm text-[#EBEBEB] placeholder:text-[#3A3A3A]"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={sendOtp}
              disabled={phone.length < 10}
              className="py-3.5 rounded-2xl font-bold text-sm transition-all"
              style={{
                background: phone.length >= 10
                  ? 'linear-gradient(135deg, #00C896, #0aa87a)'
                  : '#1A1A1A',
                color: phone.length >= 10 ? 'white' : '#3A3A3A',
              }}
            >
              Send OTP
            </motion.button>

            <p className="text-center text-xs text-[#3A3A3A]">
              Mock OTP: <span className="text-[#5C5C5C] font-mono">{MOCK_OTP}</span>
            </p>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div
            key="otp"
            {...slideVariants}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4 w-full"
          >
            <div className="flex flex-col items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-[#EBEBEB]">Verify OTP</h2>
              <p className="text-sm text-[#5C5C5C]">Sent to +91 {phone}</p>
            </div>

            <motion.div
              animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border bg-[#161616]"
              style={{ borderColor: otpError ? '#FF4D6A' : '#2A2A2A' }}
            >
              <input
                type="tel"
                maxLength={4}
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-transparent outline-none text-lg text-[#EBEBEB] text-center tracking-[0.4em] placeholder:text-[#3A3A3A] placeholder:tracking-normal"
              />
            </motion.div>

            {otpError && (
              <p className="text-center text-xs text-[#FF4D6A]">Incorrect OTP. Try 1234</p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={verifyOtp}
              disabled={otp.length < 4}
              className="py-3.5 rounded-2xl font-bold text-sm"
              style={{
                background: otp.length >= 4
                  ? 'linear-gradient(135deg, #00C896, #0aa87a)'
                  : '#1A1A1A',
                color: otp.length >= 4 ? 'white' : '#3A3A3A',
              }}
            >
              Verify
            </motion.button>

            <button
              onClick={() => setStep('phone')}
              className="text-center text-xs text-[#5C5C5C]"
            >
              Resend OTP
            </button>
          </motion.div>
        )}

        {step === 'location' && (
          <motion.div
            key="location"
            {...slideVariants}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4 w-full"
          >
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(0,200,150,0.1)' }}>
                <MapPin size={22} color="#00C896" />
              </div>
              <h2 className="text-xl font-bold text-[#EBEBEB]">Your locality</h2>
              <p className="text-sm text-[#5C5C5C]">For better hyperlocal results</p>
            </div>

            <button
              onClick={detectLocation}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[rgba(0,200,150,0.25)] text-sm font-semibold"
              style={{ background: 'rgba(0,200,150,0.08)', color: '#00C896' }}
            >
              {detecting
                ? <><RefreshCw size={14} className="animate-spin" /> Detecting...</>
                : <><MapPin size={14} /> Use my location</>
              }
            </button>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 w-px bg-[#1E1E1E] ml-4" />
              <p className="text-center text-xs text-[#3A3A3A] mb-2">or select</p>
            </div>

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

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={finish}
              className="mt-2 py-3.5 rounded-2xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #00C896, #0aa87a)' }}
            >
              Enter GeoHood →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step dots */}
      <div className="flex items-center gap-2">
        {(['welcome', 'phone', 'otp', 'location'] as Step[]).map(s => (
          <div
            key={s}
            className="rounded-full transition-all"
            style={{
              width:   step === s ? 20 : 6,
              height:  6,
              background: step === s ? '#00C896' : '#2A2A2A',
            }}
          />
        ))}
      </div>
    </div>
  );
}
