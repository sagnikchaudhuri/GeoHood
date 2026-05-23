import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { User } from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';
import { UserProvider, useUser }      from './context/UserContext';
import { BottomNavBar }              from './components/layout/BottomNavBar';
import { VendorDetailSheet }         from './components/cards/VendorDetailSheet';
import { OnboardingScreen }          from './pages/OnboardingScreen';
import { VendorRegistration }        from './pages/VendorRegistration';
import { VendorDashboard }           from './pages/VendorDashboard';
import { ProfileScreen }             from './pages/ProfileScreen';
import { HomeScreen }                from './pages/HomeScreen';
import { MapScreen }                 from './pages/MapScreen';
import { SearchScreen }              from './pages/SearchScreen';
import { SocietyScreen }             from './pages/SocietyScreen';
import { CommunityScreen }           from './pages/CommunityScreen';
import { TabName } from './types';

function renderScreen(tab: TabName) {
  switch (tab) {
    case 'home':      return <HomeScreen />;
    case 'map':       return <MapScreen />;
    case 'search':    return <SearchScreen />;
    case 'society':   return <SocietyScreen />;
    case 'community': return <CommunityScreen />;
    default:          return <HomeScreen />;
  }
}

/* ── Floating profile avatar button ─────────────────────────────────────── */
interface FloatingProfileProps {
  onClick: () => void;
  initials: string | null;
}

function FloatingProfileButton({ onClick, initials }: FloatingProfileProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      aria-label="Open profile"
      style={{
        position:      'absolute',
        right:         16,
        /* 4/5 down the screen area (between top and nav). We position from bottom
           of the screen area so it always sits just above the nav regardless of dvh. */
        bottom:        'calc(var(--nav-height) + 20px)',
        zIndex:        35,
        width:         44,
        height:        44,
        borderRadius:  '50%',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        background:    'rgba(16,16,16,0.88)',
        backdropFilter:'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border:        '1px solid rgba(255,255,255,0.07)',
        boxShadow:     '0 4px 24px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)',
      }}
    >
      {initials ? (
        <span
          style={{
            fontSize:   13,
            fontWeight: 700,
            color:      '#00C896',
            letterSpacing: '-0.02em',
          }}
        >
          {initials}
        </span>
      ) : (
        <User size={18} color="#5C5C5C" strokeWidth={1.8} />
      )}
    </motion.button>
  );
}

/* ── App shell (rendered after onboarding) ───────────────────────────────── */
function AppShell() {
  const { activeTab }    = useAppContext();
  const { user, myVendor } = useUser();

  const [vendorModal,  setVendorModal]  = useState<'register' | 'dashboard' | null>(null);
  const [profileOpen,  setProfileOpen]  = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : null;

  const handleVendorPress = () => {
    setVendorModal(myVendor ? 'dashboard' : 'register');
  };

  return (
    <div
      className="flex flex-col"
      style={{
        width:    '100%',
        maxWidth: '480px',
        height:   '100dvh',
        margin:   '0 auto',
        background: '#0D0D0D',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Screen area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
          >
            {renderScreen(activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating profile button — sits above the nav, right edge */}
      <FloatingProfileButton
        onClick={() => setProfileOpen(true)}
        initials={initials}
      />

      {/* Bottom nav */}
      <BottomNavBar onVendorPress={handleVendorPress} />

      {/* ── Overlays (z-index stacking) ── */}

      {/* Vendor detail sheet */}
      <VendorDetailSheet />

      {/* Vendor Registration / Dashboard */}
      <AnimatePresence>
        {vendorModal === 'register' && (
          <VendorRegistration onClose={() => setVendorModal(null)} />
        )}
        {vendorModal === 'dashboard' && (
          <VendorDashboard onClose={() => setVendorModal(null)} />
        )}
      </AnimatePresence>

      {/* Profile modal */}
      <AnimatePresence>
        {profileOpen && (
          <ProfileScreen onClose={() => setProfileOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Onboarding gate ─────────────────────────────────────────────────────── */
function GatedApp() {
  const { hasOnboarded } = useUser();

  if (!hasOnboarded) {
    return (
      <div
        style={{
          width:    '100%',
          maxWidth: '480px',
          height:   '100dvh',
          margin:   '0 auto',
          background: '#0D0D0D',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <OnboardingScreen />
      </div>
    );
  }

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default function App() {
  return (
    <UserProvider>
      <GatedApp />
    </UserProvider>
  );
}
