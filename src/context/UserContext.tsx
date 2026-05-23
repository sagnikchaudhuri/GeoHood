import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile, RegisteredVendor, Lead, ResidenceRegistration,
  VendorCategory,
} from '../types';

// ─── Persistence helpers ──────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface UserContextValue {
  // Onboarding
  hasOnboarded:    boolean;
  completeOnboarding: (profile: UserProfile) => void;

  // User profile
  user:            UserProfile | null;
  setUser:         (u: UserProfile) => void;

  // Vendor
  myVendor:        RegisteredVendor | null;
  registerVendor:  (v: Omit<RegisteredVendor, 'id' | 'registeredAt' | 'isLive'>) => void;
  setVendorLive:   (live: boolean) => void;

  // Leads
  leads:           Lead[];
  trackLead:       (lead: Omit<Lead, 'id' | 'timestamp'>) => void;
  myLeads:         Lead[];   // leads for my vendor only

  // Residence
  residence:       ResidenceRegistration | null;
  setResidence:    (r: ResidenceRegistration) => void;
  hasSeenSocietyOnboarding: boolean;
  markSocietyOnboardingSeen: () => void;

  // Locality (selected)
  selectedLocality: string;
  setSelectedLocality: (id: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [hasOnboarded, setHasOnboarded]         = useState(() => load('gh_onboarded', false));
  const [user, setUserState]                    = useState<UserProfile | null>(() => load('gh_user', null));
  const [myVendor, setMyVendor]                 = useState<RegisteredVendor | null>(() => load('gh_vendor', null));
  const [leads, setLeads]                       = useState<Lead[]>(() => load('gh_leads', []));
  const [residence, setResidenceState]          = useState<ResidenceRegistration | null>(() => load('gh_residence', null));
  const [hasSeenSocietyOnboarding, setSeenSoc] = useState(() => load('gh_seen_soc', false));
  const [selectedLocality, setLocalityState]    = useState(() => load('gh_locality', 'patuli'));

  // Persist whenever state changes
  useEffect(() => { save('gh_onboarded', hasOnboarded); }, [hasOnboarded]);
  useEffect(() => { save('gh_user', user); }, [user]);
  useEffect(() => { save('gh_vendor', myVendor); }, [myVendor]);
  useEffect(() => { save('gh_leads', leads); }, [leads]);
  useEffect(() => { save('gh_residence', residence); }, [residence]);
  useEffect(() => { save('gh_seen_soc', hasSeenSocietyOnboarding); }, [hasSeenSocietyOnboarding]);
  useEffect(() => { save('gh_locality', selectedLocality); }, [selectedLocality]);

  const completeOnboarding = useCallback((profile: UserProfile) => {
    setUserState(profile);
    setHasOnboarded(true);
  }, []);

  const setUser = useCallback((u: UserProfile) => {
    setUserState(u);
  }, []);

  const registerVendor = useCallback((v: Omit<RegisteredVendor, 'id' | 'registeredAt' | 'isLive'>) => {
    const vendor: RegisteredVendor = {
      ...v,
      id:           `vendor_${Date.now()}`,
      registeredAt: Date.now(),
      isLive:       false,
    };
    setMyVendor(vendor);
    // Also update user roles
    setUserState(prev => prev
      ? { ...prev, roles: [...new Set([...prev.roles, 'vendor' as const])] }
      : prev
    );
  }, []);

  const setVendorLive = useCallback((live: boolean) => {
    setMyVendor(prev => prev ? { ...prev, isLive: live } : prev);
  }, []);

  const trackLead = useCallback((lead: Omit<Lead, 'id' | 'timestamp'>) => {
    const newLead: Lead = {
      ...lead,
      id:        `lead_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };
    setLeads(prev => [newLead, ...prev].slice(0, 100)); // keep last 100
  }, []);

  const setResidence = useCallback((r: ResidenceRegistration) => {
    setResidenceState(r);
    setUserState(prev => prev
      ? { ...prev, roles: [...new Set([...prev.roles, 'society_member' as const])] }
      : prev
    );
  }, []);

  const markSocietyOnboardingSeen = useCallback(() => {
    setSeenSoc(true);
  }, []);

  const setSelectedLocality = useCallback((id: string) => {
    setLocalityState(id);
  }, []);

  const myLeads = myVendor
    ? leads.filter(l => l.vendorId === myVendor.id)
    : [];

  return (
    <UserContext.Provider value={{
      hasOnboarded, completeOnboarding,
      user, setUser,
      myVendor, registerVendor, setVendorLive,
      leads, trackLead, myLeads,
      residence, setResidence,
      hasSeenSocietyOnboarding, markSocietyOnboardingSeen,
      selectedLocality, setSelectedLocality,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
