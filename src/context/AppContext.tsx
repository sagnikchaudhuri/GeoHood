import React, { createContext, useContext, useState } from 'react';
import { TabName, Vendor } from '../types';

interface AppContextValue {
  activeTab:        TabName;
  setActiveTab:     (tab: TabName) => void;
  selectedVendor:   Vendor | null;
  setSelectedVendor:(v: Vendor | null) => void;
  searchQuery:      string;
  setSearchQuery:   (q: string) => void;
  locality:         string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab]           = useState<TabName>('home');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchQuery, setSearchQuery]       = useState('');

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      selectedVendor, setSelectedVendor,
      searchQuery, setSearchQuery,
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
