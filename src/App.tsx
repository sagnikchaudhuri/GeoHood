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

/* ── Floating profile button ─────────────────────────────────────────────── */
interface FloatingProfileProps {
  onClick: () => void;
  initials: string | null;
}

function FloatingProfileButton({ onClick, initials }: FloatingProfileProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      aria-label="Open profile"
      style={{
        width:          40,
        height:         40,
        borderRadius:   '50%',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'rgba(20,20,20,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border:         '1px solid rgba(255,255,255,0.08)',
        boxShadow:      '0 2px 12px rgba(0,0,0,0.5)',
      }}
    >
      {initials ? (
        <span style={{ fontSize: 12, fontWeight: 700, color: '#00C896', letterSpacing: '-0.02em' }}>
          {initials}
        </span>
      ) : (
        <User size={16} color="#5C5C5C" strokeWidth={1.8} />
      )}
    </motion.button>
  );
}

/* ── App shell ───────────────────────────────────────────────────────────── */
function AppShell() {
  const { activeTab } = useAppContext();
  const { user, myVendor } = useUser();

  const [vendorModal, setVendorModal] = useState<'register' | 'dashboard' | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : null;

  /* Profile button only on content tabs — never over map or search */
  const showProfileBtn = activeTab === 'home' || activeTab === 'society' || activeTab === 'community';

  const handleVendorPress = () => {
    setVendorModal(myVendor ? 'dashboard' : 'register');
  };

  return (
    <div
      style={{
        width:      '100%',
        maxWidth:   '480px',
        height:     '100dvh',
        margin:     '0 auto',
        background: '#0D0D0D',
        position:   'relative',
        overflow:   'hidden',
        display:    'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Screen area ── */}
      <div
        style={{
          flex:     1,
          minHeight: 0,
          overflow:  'hidden',
          position:  'relative',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {renderScreen(activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Floating profile button — top-right of content area ── */}
      <AnimatePresence>
        {showProfileBtn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              right:    16,
              /* Sits just above the nav, well clear of content */
              bottom:   `calc(var(--nav-height) + var(--safe-bottom) + 14px)`,
              zIndex:   45, /* --z-float */
            }}
          >
            <FloatingProfileButton onClick={() => setProfileOpen(true)} initials={initials} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom navigation ── */}
      <BottomNavBar onVendorPress={handleVendorPress} />

      {/* ══════════════════════════════════════════
          OVERLAY STACK  — z-index 40–80
          All overlays sit above the screen area.
          z-40 = VendorDetailSheet
          z-60 = full-screen modals
          ══════════════════════════════════════════ */}

      {/* Vendor detail sheet (z-40) */}
      <VendorDetailSheet />

      {/* Vendor Registration / Dashboard (z-60) */}
      <AnimatePresence>
        {vendorModal === 'register' && (
          <VendorRegistration onClose={() => setVendorModal(null)} />
        )}
        {vendorModal === 'dashboard' && (
          <VendorDashboard onClose={() => setVendorModal(null)} />
        )}
      </AnimatePresence>

      {/* Profile modal (z-60) */}
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
          width:      '100%',
          maxWidth:   '480px',
          height:     '100dvh',
          margin:     '0 auto',
          background: '#0D0D0D',
          position:   'relative',
          overflow:   'hidden',
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
