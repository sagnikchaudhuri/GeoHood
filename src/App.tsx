import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import { UserProvider, useUser }      from './context/UserContext';
import { BottomNavBar }              from './components/layout/BottomNavBar';
import { VendorDetailSheet }         from './components/cards/VendorDetailSheet';
import { OnboardingScreen }          from './pages/OnboardingScreen';
import { VendorRegistration }        from './pages/VendorRegistration';
import { VendorDashboard }           from './pages/VendorDashboard';
import { HomeScreen }                from './pages/HomeScreen';
import { MapScreen }                 from './pages/MapScreen';
import { SearchScreen }              from './pages/SearchScreen';
import { SocietyScreen }             from './pages/SocietyScreen';
import { ProfileScreen }             from './pages/ProfileScreen';
import { TabName } from './types';

function renderScreen(tab: TabName) {
  switch (tab) {
    case 'home':    return <HomeScreen />;
    case 'map':     return <MapScreen />;
    case 'search':  return <SearchScreen />;
    case 'society': return <SocietyScreen />;
    case 'profile': return <ProfileScreen />;
    default:        return <HomeScreen />;
  }
}

function AppShell() {
  const { activeTab }        = useAppContext();
  const { myVendor }         = useUser();
  const [vendorModal, setVendorModal] = useState<'register' | 'dashboard' | null>(null);

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

      {/* Bottom nav */}
      <BottomNavBar onVendorPress={handleVendorPress} />

      {/* Global vendor detail overlay */}
      <VendorDetailSheet />

      {/* Vendor Registration / Dashboard overlay */}
      <AnimatePresence>
        {vendorModal === 'register' && (
          <VendorRegistration onClose={() => setVendorModal(null)} />
        )}
        {vendorModal === 'dashboard' && (
          <VendorDashboard onClose={() => setVendorModal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

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
