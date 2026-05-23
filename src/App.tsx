import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { VendorDetailSheet } from './components/cards/VendorDetailSheet';
import { HomeScreen }    from './pages/HomeScreen';
import { MapScreen }     from './pages/MapScreen';
import { SearchScreen }  from './pages/SearchScreen';
import { SocietyScreen } from './pages/SocietyScreen';
import { ProfileScreen } from './pages/ProfileScreen';
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
  const { activeTab } = useAppContext();

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
      <BottomNavBar />

      {/* Global overlays */}
      <VendorDetailSheet />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
