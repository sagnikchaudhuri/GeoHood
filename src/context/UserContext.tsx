import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  UserProfile, RegisteredVendor, Lead, ResidenceRegistration, LocationState,
} from '../types';
import {
  requestGeolocation, LocationResult,
  mockReverseGeocode, PATULI_FALLBACK_LAT, PATULI_FALLBACK_LNG,
} from '../utils/locationService';

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

const GH_KEYS = [
  'gh_onboarded', 'gh_user', 'gh_vendor', 'gh_leads',
  'gh_residence', 'gh_seen_soc', 'gh_locality', 'gh_locality_manual',
  'gh_saved_vendors', 'gh_notifications',
  'gh_location',        // single LocationState blob (replaces gh_lat/gh_lng/gh_accuracy)
  'gh_loc_perm',        // 'unknown' | 'granted' | 'denied'
];

/* ─── Fallback location (Patuli) ─────────────────────────────────────────── */
const PATULI_LOCATION: LocationState = {
  lat:       PATULI_FALLBACK_LAT,
  lng:       PATULI_FALLBACK_LNG,
  accuracy:  null,
  locality:  'patuli',
  source:    'fallback',
  updatedAt: 0,
};

// ─── Context shape ────────────────────────────────────────────────────────────

export type LocationPermission = 'unknown' | 'granted' | 'denied';
export type LocationStatus = 'idle' | 'detecting' | 'success' | 'denied' | 'error';

interface UserContextValue {
  // Onboarding
  hasOnboarded:       boolean;
  completeOnboarding: (profile: UserProfile) => void;

  // User profile
  user:    UserProfile | null;
  setUser: (u: UserProfile) => void;

  // Vendor
  myVendor:       RegisteredVendor | null;
  registerVendor: (v: Omit<RegisteredVendor, 'id' | 'registeredAt' | 'isLive'>) => void;
  setVendorLive:  (live: boolean) => void;

  // Leads
  leads:     Lead[];
  trackLead: (lead: Omit<Lead, 'id' | 'timestamp'>) => void;
  myLeads:   Lead[];

  // Residence
  residence:                 ResidenceRegistration | null;
  setResidence:              (r: ResidenceRegistration) => void;
  hasSeenSocietyOnboarding:  boolean;
  markSocietyOnboardingSeen: () => void;

  // Locality
  selectedLocality:    string;
  setSelectedLocality: (id: string) => void;

  // Saved vendors
  savedVendorIds:    string[];
  toggleSavedVendor: (vendorId: string) => void;
  isVendorSaved:     (vendorId: string) => boolean;

  // Notifications
  notificationsEnabled: boolean;
  toggleNotifications:  () => void;

  // ── GPS / Location ─────────────────────────────────────────────────────────
  /** Full location state — single source of truth */
  location:           LocationState | null;
  /** Convenience: lat | null */
  userLat:            number | null;
  /** Convenience: lng | null */
  userLng:            number | null;
  /** Convenience: accuracy metres | null */
  userAccuracy:       number | null;
  locationPermission: LocationPermission;
  locationStatus:     LocationStatus;

  /**
   * Calls getCurrentPosition, updates location state, persists.
   * Used by: Onboarding, Profile LocalitySelector, MapScreen recenter.
   */
  requestUserLocation: () => Promise<LocationResult>;

  // Sign out
  signOut: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: React.ReactNode }) {

  const [hasOnboarded, setHasOnboarded]         = useState(() => load('gh_onboarded', false));
  const [user, setUserState]                    = useState<UserProfile | null>(() => load('gh_user', null));
  const [myVendor, setMyVendor]                 = useState<RegisteredVendor | null>(() => load('gh_vendor', null));
  const [leads, setLeads]                       = useState<Lead[]>(() => load('gh_leads', []));
  const [residence, setResidenceState]          = useState<ResidenceRegistration | null>(() => load('gh_residence', null));
  const [hasSeenSocietyOnboarding, setSeenSoc]  = useState(() => load('gh_seen_soc', false));
  const [selectedLocality, setLocalityState]    = useState(() => load('gh_locality', 'patuli'));
  const [localityManualOverride, setLMO]        = useState(() => load('gh_locality_manual', false));
  const [savedVendorIds, setSavedVendorIds]     = useState<string[]>(() => load('gh_saved_vendors', []));
  const [notificationsEnabled, setNotifications]= useState(() => load('gh_notifications', true));

  // ── Single location state blob ─────────────────────────────────────────────
  const [location, setLocationState]       = useState<LocationState | null>(() => load('gh_location', null));
  const [locationPermission, setLocPerm]   = useState<LocationPermission>(() => load('gh_loc_perm', 'unknown'));
  const [locationStatus, setLocStatus]     = useState<LocationStatus>('idle');

  // Derived convenience getters
  const userLat:      number | null = location?.lat      ?? null;
  const userLng:      number | null = location?.lng      ?? null;
  const userAccuracy: number | null = location?.accuracy ?? null;

  // Ref: latest override flag without adding to effect deps
  const lmoRef = useRef(localityManualOverride);
  useEffect(() => { lmoRef.current = localityManualOverride; }, [localityManualOverride]);

  // ── Persist ────────────────────────────────────────────────────────────────
  useEffect(() => { save('gh_onboarded',       hasOnboarded);           }, [hasOnboarded]);
  useEffect(() => { save('gh_user',            user);                   }, [user]);
  useEffect(() => { save('gh_vendor',          myVendor);               }, [myVendor]);
  useEffect(() => { save('gh_leads',           leads);                  }, [leads]);
  useEffect(() => { save('gh_residence',       residence);              }, [residence]);
  useEffect(() => { save('gh_seen_soc',        hasSeenSocietyOnboarding); }, [hasSeenSocietyOnboarding]);
  useEffect(() => { save('gh_locality',        selectedLocality);       }, [selectedLocality]);
  useEffect(() => { save('gh_locality_manual', localityManualOverride); }, [localityManualOverride]);
  useEffect(() => { save('gh_saved_vendors',   savedVendorIds);         }, [savedVendorIds]);
  useEffect(() => { save('gh_notifications',   notificationsEnabled);   }, [notificationsEnabled]);
  useEffect(() => { save('gh_location',        location);               }, [location]);
  useEffect(() => { save('gh_loc_perm',        locationPermission);     }, [locationPermission]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const completeOnboarding = useCallback((profile: UserProfile) => {
    setUserState(profile);
    setHasOnboarded(true);
  }, []);

  const setUser = useCallback((u: UserProfile) => setUserState(u), []);

  const registerVendor = useCallback(
    (v: Omit<RegisteredVendor, 'id' | 'registeredAt' | 'isLive'>) => {
      const vendor: RegisteredVendor = {
        ...v, id: `vendor_${Date.now()}`, registeredAt: Date.now(), isLive: false,
      };
      setMyVendor(vendor);
      setUserState(prev => prev
        ? { ...prev, roles: [...new Set([...prev.roles, 'vendor' as const])] }
        : prev,
      );
    },
    [],
  );

  const setVendorLive = useCallback((live: boolean) => {
    setMyVendor(prev => prev ? { ...prev, isLive: live } : prev);
  }, []);

  const trackLead = useCallback((lead: Omit<Lead, 'id' | 'timestamp'>) => {
    const newLead: Lead = {
      ...lead,
      id:        `lead_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };
    setLeads(prev => [newLead, ...prev].slice(0, 100));
  }, []);

  const setResidence = useCallback((r: ResidenceRegistration) => {
    setResidenceState(r);
    setUserState(prev => prev
      ? { ...prev, roles: [...new Set([...prev.roles, 'society_member' as const])] }
      : prev,
    );
  }, []);

  const markSocietyOnboardingSeen = useCallback(() => setSeenSoc(true), []);

  /** Manual locality selection — locks override so GPS won't overwrite it */
  const setSelectedLocality = useCallback((id: string) => {
    setLocalityState(id);
    setLMO(true);
    console.log('[GeoHood Location] Manual locality selected:', id, '(override locked)');
  }, []);

  const toggleSavedVendor = useCallback((vendorId: string) => {
    setSavedVendorIds(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId],
    );
  }, []);

  const isVendorSaved = useCallback(
    (vendorId: string) => savedVendorIds.includes(vendorId),
    [savedVendorIds],
  );

  const toggleNotifications = useCallback(() => {
    setNotifications(prev => !prev);
  }, []);

  /**
   * requestUserLocation — getCurrentPosition (one-shot).
   * Updates location state + locality + permission. Used everywhere.
   */
  const requestUserLocation = useCallback(async (): Promise<LocationResult> => {
    console.log('[GeoHood Location] requestUserLocation: starting...');
    setLocStatus('detecting');

    const result = await requestGeolocation();

    if (result.status === 'granted') {
      const newLocation: LocationState = {
        lat:       result.lat,
        lng:       result.lng,
        accuracy:  result.accuracy,
        locality:  result.localityId,
        source:    'gps',
        updatedAt: Date.now(),
      };
      setLocationState(newLocation);
      setLocPerm('granted');
      setLocStatus('success');
      console.log('[GeoHood Location] Location updated:', newLocation.lat, newLocation.lng);

      // Only auto-update locality if user hasn't manually picked one
      if (!lmoRef.current) {
        setLocalityState(result.localityId);
        console.log('[GeoHood Location] Locality updated to:', result.localityId);
      }
    } else {
      setLocPerm('denied');
      setLocStatus(result.status === 'denied' ? 'denied' : 'error');
      console.log('[GeoHood Location] Location failed:', result.status);

      // Fall back to Patuli if no location was ever set
      if (!location) {
        setLocationState({ ...PATULI_LOCATION, updatedAt: Date.now() });
        console.log('[GeoHood Location] Using Patuli fallback');
      }
    }

    return result;
  // location ref needed to check "no location was ever set"
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(() => {
    GH_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch {} });
    setHasOnboarded(false);
    setUserState(null);
    setMyVendor(null);
    setLeads([]);
    setResidenceState(null);
    setSeenSoc(false);
    setLocalityState('patuli');
    setLMO(false);
    setSavedVendorIds([]);
    setNotifications(true);
    setLocationState(null);
    setLocPerm('unknown');
    setLocStatus('idle');
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
      savedVendorIds, toggleSavedVendor, isVendorSaved,
      notificationsEnabled, toggleNotifications,
      location, userLat, userLng, userAccuracy,
      locationPermission, locationStatus,
      requestUserLocation,
      signOut,
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
