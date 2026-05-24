import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, ArrowRight, RefreshCw, ChevronLeft, User } from 'lucide-react';
import { GeoHoodLogoMark } from '../components/brand/GeoHoodLogo';
import { useUser } from '../context/UserContext';
import { LOCALITIES, DEFAULT_LOCALITY } from '../data/localities';
import { UserProfile } from '../types';

type Step = 'welcome' | 'phone' | 'otp' | 'location' | 'name' | 'loading';

const MOCK_OTP = '1234';
const RESEND_SECONDS = 30;

/* ── Shared CTA button (modular/premium) ──────────────────────────────────── */
function PrimaryCTA({
  label,
  onClick,
  disabled = false,
  icon,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      style={{
        width: '100%',
        padding: '17px 24px',
        borderRadius: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: disabled
          ? '1px solid #222'
          : '1px solid rgba(0,200,150,0.22)',
        background: disabled
          ? '#161616'
          : 'linear-gradient(135deg, rgba(139,26,42,0.18) 0%, rgba(0,200,150,0.10) 100%)',
        color: disabled ? '#3A3A3A' : '#EBEBEB',
        boxShadow: disabled
          ? 'none'
          : '0 8px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)',
        transition: 'all 0.2s',
      }}
    >
      {label}
      {icon}
    </motion.button>
  );
}

/* ── Step progress dots ───────────────────────────────────────────────────── */
function StepDots({ current }: { current: Step }) {
  const steps: Step[] = ['phone', 'otp', 'location', 'name'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
      paddingTop: 20, flexShrink: 0,
    }}>
      {steps.map(s => {
        const idx = steps.indexOf(s);
        const curIdx = steps.indexOf(current);
        const active = s === current;
        const done = curIdx > idx;
        return (
          <div
            key={s}
            style={{
              height: 6, borderRadius: 9999,
              width: active ? 22 : 6,
              background: active ? '#00C896' : done ? 'rgba(0,200,150,0.35)' : '#252525',
              transition: 'all 0.3s',
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Back row ─────────────────────────────────────────────────────────────── */
function BackRow({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      style={{
        position: 'absolute', top: 'calc(var(--safe-top, 0px) + 14px)', left: 16,
        width: 38, height: 38, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1A1A1A', border: '1px solid #222', cursor: 'pointer',
      }}
    >
      <ChevronLeft size={18} color="#ADADAD" />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN ONBOARDING SCREEN
   ═══════════════════════════════════════════════════════════════════════════ */
export function OnboardingScreen() {
  const { completeOnboarding } = useUser();

  const [step,       setStep]     = useState<Step>('welcome');
  const [phone,      setPhone]    = useState('');
  const [digits,     setDigits]   = useState(['', '', '', '']);
  const [otpError,   setOtpError] = useState(false);
  const [shake,      setShake]    = useState(false);
  const [locality,   setLocality] = useState(DEFAULT_LOCALITY.id);
  const [detecting,   setDetecting]   = useState(false);
  const [locDenied,   setLocDenied]   = useState(false);
  const [locDetected, setLocDetected] = useState(false);
  const [userName,    setUserName]    = useState('');
  const [resendSec,  setResendSec]= useState(0);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);

  /* ── Digit refs for OTP auto-advance ── */
  const d0 = useRef<HTMLInputElement>(null);
  const d1 = useRef<HTMLInputElement>(null);
  const d2 = useRef<HTMLInputElement>(null);
  const d3 = useRef<HTMLInputElement>(null);
  const digitRefs = [d0, d1, d2, d3];

  const otp = digits.join('');

  /* ── Resend countdown ── */
  useEffect(() => {
    if (step !== 'otp') return;
    setResendSec(RESEND_SECONDS);
    const id = setInterval(() => {
      setResendSec(s => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  /* ── Auto-complete after loading screen ── */
  useEffect(() => {
    if (step !== 'loading' || !pendingProfile) return;
    const t = setTimeout(() => completeOnboarding(pendingProfile), 2400);
    return () => clearTimeout(t);
  }, [step, pendingProfile, completeOnboarding]);

  /* ── Handlers ── */
  const sendOtp = () => {
    if (phone.length < 10) return;
    setDigits(['', '', '', '']);
    setStep('otp');
    setTimeout(() => d0.current?.focus(), 100);
  };

  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 3) digitRefs[i + 1].current?.focus();
  };

  const handleDigitKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      digitRefs[i - 1].current?.focus();
    }
  };

  const verifyOtp = () => {
    if (otp === MOCK_OTP) {
      setStep('location');
    } else {
      setOtpError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setOtpError(false), 2200);
    }
  };

  const { requestUserLocation } = useUser();

  const detectLocation = async () => {
    setDetecting(true);
    setLocDenied(false);
    setLocDetected(false);
    const result = await requestUserLocation();
    setDetecting(false);
    if (result.status === 'granted') {
      setLocality(result.localityId);
      setLocDetected(true);
    } else {
      setLocDenied(true);
    }
  };

  const goToName = () => setStep('name');

  const goToLoading = () => {
    if (!userName.trim()) return;
    const profile: UserProfile = {
      phone,
      name: userName.trim(),
      locality: LOCALITIES.find(l => l.id === locality)?.name ?? 'Patuli',
      roles: ['user'],
    };
    setPendingProfile(profile);
    setStep('loading');
  };

  /* ── Slide transition variants ── */
  const slide = {
    initial: { x: 40,  opacity: 0 },
    animate: { x: 0,   opacity: 1 },
    exit:    { x: -40, opacity: 0 },
  };
  const slideBack = {
    initial: { x: -40, opacity: 0 },
    animate: { x: 0,   opacity: 1 },
    exit:    { x: 40,  opacity: 0 },
  };

  /* ── Loading screen ── */
  if (step === 'loading') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', background: '#080808', gap: 0,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
        >
          <GeoHoodLogoMark size={64} />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Welcome, {pendingProfile?.name ?? userName}
            </h2>
            <p style={{ fontSize: 13, color: '#5C5C5C', margin: 0 }}>Setting up your neighbourhood…</p>
          </div>
          {/* Pulse dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C896' }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#0D0D0D', overflowY: 'auto',
      scrollbarWidth: 'none',
      position: 'relative',
    }}>
      {/* ── Logo lockup ── */}
      {step !== 'welcome' && (
        <div style={{
          flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 8, paddingTop: 'calc(var(--safe-top, 0px) + 40px)', paddingBottom: 20, paddingLeft: 24, paddingRight: 24,
        }}>
          <GeoHoodLogoMark size={40} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#EBEBEB', letterSpacing: '-0.01em', margin: 0 }}>GeoHood</p>
            <p style={{ fontSize: 9, color: '#3A3A3A', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '2px 0 0' }}>Hyperlocal</p>
          </div>
        </div>
      )}

      {/* ── Step content ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: step === 'welcome' ? 'center' : 'stretch',
        justifyContent: step === 'welcome' ? 'center' : 'flex-start',
        padding: step === 'welcome' ? '0 28px' : '8px 28px 8px',
        position: 'relative',
      }}>

        <AnimatePresence mode="wait">

          {/* ════════════════════ WELCOME ════════════════════ */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              {...slide}
              transition={{ duration: 0.28 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, textAlign: 'center', width: '100%' }}
            >
              {/* Logo */}
              <div style={{ marginBottom: 32 }}>
                <GeoHoodLogoMark size={72} />
              </div>

              {/* Wordmark */}
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.03em', margin: '0 0 4px', lineHeight: 1 }}>
                GeoHood
              </h1>
              <p style={{ fontSize: 10, color: '#3A3A3A', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 24px', fontWeight: 600 }}>
                Hyperlocal
              </p>

              {/* Hero tagline */}
              <p style={{ fontSize: 17, fontWeight: 700, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: 1.4 }}>
                Your neighbourhood,<br />all in one place.
              </p>
              <p style={{ fontSize: 13, color: '#5C5C5C', lineHeight: 1.65, margin: '0 0 40px', maxWidth: 280 }}>
                Find local vendors, track live activity,<br />and stay connected with your community.
              </p>

              {/* Feature mini-pills */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['🏪 Local Vendors', '🗺️ Live Map', '🏘️ Community'].map(f => (
                  <span key={f} style={{
                    padding: '6px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 500,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid #222', color: '#5C5C5C',
                  }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* Premium Get Started CTA */}
              <div style={{ width: '100%', maxWidth: 320 }}>
                <PrimaryCTA
                  label="Get Started"
                  onClick={() => setStep('phone')}
                  icon={<ArrowRight size={17} />}
                />
              </div>

              <p style={{ fontSize: 11, color: '#2A2A2A', marginTop: 16 }}>
                No ads · No spam · Just your neighbourhood
              </p>
            </motion.div>
          )}

          {/* ════════════════════ PHONE ════════════════════ */}
          {step === 'phone' && (
            <motion.div key="phone" {...slide} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <BackRow onBack={() => setStep('welcome')} />

              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 32, marginTop: 8 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.15)',
                }}>
                  <Phone size={22} color="#00C896" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                    Enter your number
                  </h2>
                  <p style={{ fontSize: 13, color: '#5C5C5C', margin: 0 }}>We'll send a one-time password to verify.</p>
                </div>
              </div>

              {/* Input label */}
              <p style={{ fontSize: 11, fontWeight: 700, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                Mobile Number
              </p>

              {/* Phone input */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 0,
                borderRadius: 18, border: '1px solid #2A2A2A',
                background: '#161616', overflow: 'hidden', marginBottom: 24,
                height: 60,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: '0 16px', borderRight: '1px solid #2A2A2A',
                  height: '100%', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>🇮🇳</span>
                  <span style={{ fontSize: 14, color: '#ADADAD', fontWeight: 600 }}>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  style={{
                    flex: 1, height: '100%', padding: '0 16px',
                    background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 16, color: '#EBEBEB',
                    caretColor: '#00C896',
                  }}
                />
                {phone.length > 0 && (
                  <span style={{
                    padding: '0 14px', fontSize: 11, fontWeight: 600, flexShrink: 0,
                    color: phone.length === 10 ? '#00C896' : '#3A3A3A',
                  }}>
                    {phone.length}/10
                  </span>
                )}
              </div>

              <PrimaryCTA
                label="Send OTP"
                onClick={sendOtp}
                disabled={phone.length < 10}
                icon={<ArrowRight size={17} />}
              />

              {/* Mock OTP hint */}
              <div style={{
                marginTop: 16, padding: '10px 14px', borderRadius: 12,
                background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 14 }}>🔑</span>
                <p style={{ fontSize: 11, color: '#5C5C5C', margin: 0 }}>
                  Demo mode — OTP is <span style={{ color: '#F5A623', fontWeight: 700, fontFamily: 'monospace' }}>{MOCK_OTP}</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* ════════════════════ OTP ════════════════════ */}
          {step === 'otp' && (
            <motion.div key="otp" {...slide} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <BackRow onBack={() => setStep('phone')} />

              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 36, marginTop: 8 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.15)',
                  fontSize: 22,
                }}>
                  💬
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                    Verify OTP
                  </h2>
                  <p style={{ fontSize: 13, color: '#5C5C5C', margin: 0 }}>
                    Sent to <span style={{ color: '#ADADAD', fontWeight: 600 }}>+91 {phone}</span>
                  </p>
                </div>
              </div>

              {/* 4 individual OTP boxes */}
              <p style={{ fontSize: 11, fontWeight: 700, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px', textAlign: 'center' }}>
                Enter 4-Digit Code
              </p>
              <motion.div
                animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.45 }}
                style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 8 }}
              >
                {[d0, d1, d2, d3].map((ref, i) => (
                  <input
                    key={i}
                    ref={ref}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i]}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleDigitKey(i, e)}
                    style={{
                      width: 64, height: 68, borderRadius: 16, textAlign: 'center',
                      fontSize: 26, fontWeight: 800, letterSpacing: '0.05em',
                      border: `2px solid ${
                        digits[i] ? 'rgba(0,200,150,0.45)' :
                        otpError  ? 'rgba(255,77,106,0.4)' :
                                    '#2A2A2A'
                      }`,
                      background: digits[i] ? 'rgba(0,200,150,0.06)' : '#161616',
                      color: '#EBEBEB',
                      outline: 'none', caretColor: '#00C896',
                      transition: 'border-color 0.18s, background 0.18s',
                    }}
                  />
                ))}
              </motion.div>

              {otpError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', fontSize: 12, color: '#FF4D6A', margin: '4px 0 0' }}
                >
                  Incorrect OTP. Try <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{MOCK_OTP}</span>
                </motion.p>
              )}

              <div style={{ marginTop: 28, marginBottom: 0 }}>
                <PrimaryCTA
                  label="Verify & Continue"
                  onClick={verifyOtp}
                  disabled={otp.length < 4}
                  icon={<ArrowRight size={17} />}
                />
              </div>

              {/* Resend + edit */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                <button
                  onClick={() => setStep('phone')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: '#5C5C5C', background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  <Phone size={12} /> Edit number
                </button>
                <button
                  onClick={() => {
                    if (resendSec > 0) return;
                    setDigits(['', '', '', '']);
                    setResendSec(RESEND_SECONDS);
                    setTimeout(() => d0.current?.focus(), 80);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600,
                    color: resendSec > 0 ? '#3A3A3A' : '#00C896',
                    background: 'none', border: 'none', cursor: resendSec > 0 ? 'default' : 'pointer',
                  }}
                >
                  <RefreshCw size={12} />
                  {resendSec > 0 ? `Resend in ${resendSec}s` : 'Resend OTP'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════ LOCATION ════════════════════ */}
          {step === 'location' && (
            <motion.div key="location" {...slide} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <BackRow onBack={() => setStep('otp')} />

              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 24, marginTop: 8 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.15)',
                }}>
                  <MapPin size={22} color="#00C896" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                    Your locality
                  </h2>
                  <p style={{ fontSize: 13, color: '#5C5C5C', margin: 0 }}>
                    For hyper-local vendor and alert feeds.
                  </p>
                </div>
              </div>

              {/* Use my location */}
              <button
                onClick={detectLocation}
                disabled={detecting}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px', borderRadius: 16, marginBottom: locDenied ? 8 : 16,
                  border: `1px solid ${locDenied ? 'rgba(255,77,106,0.25)' : locDetected ? 'rgba(0,200,150,0.35)' : 'rgba(0,200,150,0.25)'}`,
                  background: locDenied ? 'rgba(255,77,106,0.06)' : locDetected ? 'rgba(0,200,150,0.08)' : 'rgba(0,200,150,0.06)',
                  fontSize: 13, fontWeight: 600,
                  color: locDenied ? '#FF4D6A' : '#00C896',
                  cursor: detecting ? 'wait' : 'pointer',
                }}
              >
                {detecting ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                      <RefreshCw size={15} color="#00C896" />
                    </motion.div>
                    Detecting location…
                  </>
                ) : locDetected ? (
                  <><MapPin size={15} /> Location detected ✓</>
                ) : (
                  <><MapPin size={15} /> Use my location</>
                )}
              </button>
              {locDenied && (
                <p style={{ fontSize: 11, color: '#FF4D6A', textAlign: 'center', marginBottom: 12 }}>
                  Permission denied — please choose manually below.
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: '#1E1E1E' }} />
                <p style={{ fontSize: 11, color: '#3A3A3A', fontWeight: 600, margin: 0 }}>or select manually</p>
                <div style={{ flex: 1, height: 1, background: '#1E1E1E' }} />
              </div>

              {/* Locality cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {LOCALITIES.slice(0, 7).map(loc => {
                  const active = loc.id === locality;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => setLocality(loc.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px', borderRadius: 16,
                        border: `1px solid ${active ? 'rgba(0,200,150,0.35)' : '#1E1E1E'}`,
                        background: active ? 'rgba(0,200,150,0.06)' : '#161616',
                        cursor: 'pointer', transition: 'border-color 0.18s, background 0.18s',
                        textAlign: 'left', width: '100%',
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: active ? 'rgba(0,200,150,0.12)' : '#1A1A1A',
                        fontSize: 16,
                      }}>
                        📍
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: active ? '#EBEBEB' : '#ADADAD', margin: 0 }}>
                          {loc.name}
                        </p>
                        <p style={{ fontSize: 11, color: '#5C5C5C', margin: '2px 0 0' }}>{loc.district}</p>
                      </div>
                      {active && (
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(0,200,150,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C896' }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <PrimaryCTA
                label="Continue"
                onClick={goToName}
                icon={<ArrowRight size={17} />}
              />
            </motion.div>
          )}

          {/* ════════════════════ NAME ════════════════════ */}
          {step === 'name' && (
            <motion.div key="name" {...slide} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <BackRow onBack={() => setStep('location')} />

              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 32, marginTop: 8 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.15)',
                }}>
                  <User size={22} color="#00C896" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                    What should we call you?
                  </h2>
                  <p style={{ fontSize: 13, color: '#5C5C5C', margin: 0 }}>
                    Your name is shown to neighbours and vendors.
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 11, fontWeight: 700, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                Your Name
              </p>

              <div style={{
                display: 'flex', alignItems: 'center',
                borderRadius: 18, border: `1px solid ${userName.trim() ? 'rgba(0,200,150,0.25)' : '#2A2A2A'}`,
                background: '#161616', height: 60, marginBottom: 24,
                paddingLeft: 16, paddingRight: 16,
                transition: 'border-color 0.18s',
              }}>
                <input
                  type="text"
                  maxLength={40}
                  placeholder="Enter your name"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') goToLoading(); }}
                  autoFocus
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 16, color: '#EBEBEB', caretColor: '#00C896',
                  }}
                />
              </div>

              <PrimaryCTA
                label="Continue"
                onClick={goToLoading}
                disabled={!userName.trim()}
                icon={<ArrowRight size={17} />}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Step dots (visible only during real steps) ── */}
      {(step === 'phone' || step === 'otp' || step === 'location' || step === 'name') && (
        <StepDots current={step} />
      )}
      {step === 'welcome' && (
        <div style={{ flexShrink: 0, height: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }} />
      )}
    </div>
  );
}
