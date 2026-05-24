import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import { UserProvider, useUser }      from './context/UserContext';
import { BottomNavBar }              from './components/layout/BottomNavBar';
import { OnboardingScreen }          from './pages/OnboardingScreen';
import { VendorRegistration }        from './pages/VendorRegistration';
import { VendorDashboard }           from './pages/VendorDashboard';
import { ProfileScreen }             from './pages/ProfileScreen';
import { HomeScreen }                from './pages/HomeScreen';
import { MapScreen }                 from './pages/MapScreen';
import { SearchScreen }              from './pages/SearchScreen';
import { SocietyScreen }             from './pages/SocietyScreen';
import { CommunityScreen }           from './pages/CommunityScreen';
import { VendorDetailPage }          from './pages/VendorDetailPage';
import { CategoryResultsScreen }     from './pages/CategoryResultsScreen';
import { TopPicksAllScreen }         from './pages/TopPicksAllScreen';
import { AllCategoriesScreen }       from './pages/AllCategoriesScreen';
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

/* ── App shell ───────────────────────────────────────────────────────────── */
function AppShell() {
  const { activeTab, overlayStack, popOverlay } = useAppContext();
  const { myVendor } = useUser();

  const [vendorModal, setVendorModal] = useState<'register' | 'dashboard' | null>(null);

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
          flex:      1,
          minHeight: 0,
          overflow:  'hidden',
          position:  'relative',
          isolation: 'isolate',   // ← contains MapScreen z-indexes; VendorModal z-60 at AppShell level wins
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

        {/* ══════════════════════════════════════════
            OVERLAY STACK — rendered inside screen area
            so they sit above tab content but below nav
            z-60 for all overlay screens
            ══════════════════════════════════════════ */}
        <AnimatePresence>
          {overlayStack.map((screen, i) => {
            const isTop = i === overlayStack.length - 1;

            if (screen.type === 'vendor_detail') {
              return (
                <VendorDetailPage
                  key={`vendor_${screen.vendor.id}_${i}`}
                  vendor={screen.vendor}
                  onBack={popOverlay}
                />
              );
            }

            if (screen.type === 'category_results') {
              return (
                <CategoryResultsScreen
                  key={`cat_${screen.categoryId}_${i}`}
                  categoryId={screen.categoryId}
                  label={screen.label}
                  onBack={popOverlay}
                />
              );
            }

            if (screen.type === 'profile') {
              return (
                <ProfileScreen
                  key={`profile_${i}`}
                  onClose={popOverlay}
                />
              );
            }

            if (screen.type === 'top_picks_all') {
              return (
                <TopPicksAllScreen
                  key={`top_picks_${i}`}
                  onBack={popOverlay}
                />
              );
            }

            if (screen.type === 'all_categories') {
              return (
                <AllCategoriesScreen
                  key={`all_cats_${i}`}
                  onBack={popOverlay}
                />
              );
            }

            return null;
          })}
        </AnimatePresence>
      </div>

      {/* ── Bottom navigation ── */}
      <BottomNavBar onVendorPress={handleVendorPress} />

      {/* ── Vendor Registration / Dashboard (z-60) ── */}
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
