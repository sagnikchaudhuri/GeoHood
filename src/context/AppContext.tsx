import React, { createContext, useContext, useState, useCallback } from 'react';
import { TabName, Vendor, OverlayScreen } from '../types';

interface AppContextValue {
  // Bottom nav
  activeTab:    TabName;
  setActiveTab: (tab: TabName) => void;

  // Overlay navigation stack
  overlayStack:  OverlayScreen[];
  pushOverlay:   (s: OverlayScreen) => void;
  popOverlay:    () => void;
  clearOverlays: () => void;

  // Backward-compat: vendor detail via overlay
  selectedVendor:    Vendor | null;
  setSelectedVendor: (v: Vendor | null) => void;

  // Search
  searchQuery:    string;
  setSearchQuery: (q: string) => void;

  // Active category filter (used by SearchScreen when navigating from Home)
  activeCategory:    string;
  setActiveCategory: (cat: string) => void;

  locality: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab,     setActiveTab]     = useState<TabName>('home');
  const [overlayStack,  setOverlayStack]  = useState<OverlayScreen[]>([]);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [activeCategory,setActiveCategory]= useState('all');

  const pushOverlay = useCallback((s: OverlayScreen) => {
    setOverlayStack(prev => [...prev, s]);
  }, []);

  const popOverlay = useCallback(() => {
    setOverlayStack(prev => prev.slice(0, -1));
  }, []);

  const clearOverlays = useCallback(() => {
    setOverlayStack([]);
  }, []);

  // Backward-compat: setSelectedVendor → push/pop vendor_detail overlay
  const setSelectedVendor = useCallback((v: Vendor | null) => {
    if (v) {
      setOverlayStack(prev => {
        // Don't double-push the same vendor
        const top = prev[prev.length - 1];
        if (top?.type === 'vendor_detail' && top.vendor.id === v.id) return prev;
        return [...prev, { type: 'vendor_detail', vendor: v }];
      });
    } else {
      setOverlayStack(prev => {
        const top = prev[prev.length - 1];
        if (top?.type === 'vendor_detail') return prev.slice(0, -1);
        return prev;
      });
    }
  }, []);

  // selectedVendor derived from overlay stack
  const topOverlay = overlayStack[overlayStack.length - 1];
  const selectedVendor = topOverlay?.type === 'vendor_detail' ? topOverlay.vendor : null;

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      overlayStack, pushOverlay, popOverlay, clearOverlays,
      selectedVendor, setSelectedVendor,
      searchQuery, setSearchQuery,
      activeCategory, setActiveCategory,
      locality: 'Patuli, Kolkata',
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
