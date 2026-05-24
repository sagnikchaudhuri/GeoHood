import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  UserProfile, RegisteredVendor, Lead, ResidenceRegistration,
} from '../types';
import { requestGeolocation, LocationResult, mockReverseGeocode } from '../utils/locationService';
import { useLiveLocation, LocationStatus } from '../hooks/useLiveLocation';

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
  'gh_lat', 'gh_lng', 'gh_accuracy', 'gh_loc_perm',
];

// ─── Context shape ────────────────────────────────────────────────────────────

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
  setSelectedLocality: (id: string) => void; // manual selection — locks override

  // Saved vendors
  savedVendorIds:    string[];
  toggleSavedVendor: (vendorId: string) => void;
  isVendorSaved:     (vendorId: string) => boolean;

  // Notifications
  notificationsEnabled: boolean;
  toggleNotifications:  () => void;

  // GPS Location — updated live by watchPosition
  userLat:            number | null;
  userLng:            number | null;
  userAccuracy:       number | null; // metres, from GPS
  locationPermission: 'unknown' | 'granted' | 'denied';
  locationStatus:     LocationStatus; // fine-grained UI state

  // One-shot request used by Onboarding / Profile
  requestUserLocation: () => Promise<LocationResult>;
  // Start continuous tracking (called automatically after permission grant)
  startLiveTracking:   () => void;

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
  const [userLat,      setUserLatState]         = useState<number | null>(() => load('gh_lat',      null));
  const [userLng,      setUserLngState]         = useState<number | null>(() => load('gh_lng',      null));
  const [userAccuracy, setUserAccuracyState]    = useState<number | null>(() => load('gh_accuracy', null));
  const [locationPermission, setLocPermission]  = useState<'unknown' | 'granted' | 'denied'>(
    () => load('gh_loc_perm', 'unknown'),
  );

  // ── Live location hook ───────────────────────────────────────────────────
  const { coords: liveCoords, status: liveStatus, startTracking } = useLiveLocation();

  // Ref so sync effects can read latest override without needing it in deps
  const lmoRef = useRef(localityManualOverride);
  useEffect(() => { lmoRef.current = localityManualOverride; }, [localityManualOverride]);

  // ── Auto-start tracking if permission was already granted ─────────────────
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!autoStarted.current && load<string>('gh_loc_perm', 'unknown') === 'granted') {
      autoStarted.current = true;
      console.log('[GeoHood Location] Auto-starting live tracking (permission previously granted)');
      startTracking();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  // ── Sync live coords → context state (runs on every GPS fix) ─────────────
  useEffect(() => {
    if (!liveCoords) return;
    setUserLatState(liveCoords.lat);
    setUserLngState(liveCoords.lng);
    setUserAccuracyState(liveCoords.accuracy);
    setLocPermission('granted');
    // Update locality only when user has NOT manually chosen one
    if (!lmoRef.current) {
      const localityId = mockReverseGeocode(liveCoords.lat, liveCoords.lng);
      setLocalityState(localityId);
    }
  }, [liveCoords]);

  // ── Sync live status → permission state ───────────────────────────────────
  useEffect(() => {
    if (liveStatus === 'denied')   setLocPermission('denied');
    if (liveStatus === 'tracking') setLocPermission('granted');
  }, [liveStatus]);

  // ── Persist ───────────────────────────────────────────────────────────────
  useEffect(() => { save('gh_onboarded',       hasOnboarded);          }, [hasOnboarded]);
  useEffect(() => { save('gh_user',            user);                  }, [user]);
  useEffect(() => { save('gh_vendor',          myVendor);              }, [myVendor]);
  useEffect(() => { save('gh_leads',           leads);                 }, [leads]);
  useEffect(() => { save('gh_residence',       residence);             }, [residence]);
  useEffect(() => { save('gh_seen_soc',        hasSeenSocietyOnboarding); }, [hasSeenSocietyOnboarding]);
  useEffect(() => { save('gh_locality',        selectedLocality);      }, [selectedLocality]);
  useEffect(() => { save('gh_locality_manual', localityManualOverride);}, [localityManualOverride]);
  useEffect(() => { save('gh_saved_vendors',   savedVendorIds);        }, [savedVendorIds]);
  useEffect(() => { save('gh_notifications',   notificationsEnabled);  }, [notificationsEnabled]);
  useEffect(() => { save('gh_lat',             userLat);               }, [userLat]);
  useEffect(() => { save('gh_lng',             userLng);               }, [userLng]);
  useEffect(() => { save('gh_accuracy',        userAccuracy);          }, [userAccuracy]);
  useEffect(() => { save('gh_loc_perm',        locationPermission);    }, [locationPermission]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const completeOnboarding = useCallback((profile: UserProfile) => {
    setUserState(profile);
    setHasOnboarded(true);
  }, []);

  const setUser = useCallback((u: UserProfile) => setUserState(u), []);

  const registerVendor = useCallback((v: Omit<RegisteredVendor, 'id' | 'registeredAt' | 'isLive'>) => {
    const vendor: RegisteredVendor = {
      ...v, id: `vendor_${Date.now()}`, registeredAt: Date.now(), isLive: false,
    };
    setMyVendor(vendor);
    setUserState(prev => prev
      ? { ...prev, roles: [...new Set([...prev.roles, 'vendor' as const])] }
      : prev,
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

  // Manual locality selection — sets override flag so live tracking won't overwrite
  const setSelectedLocality = useCallback((id: string) => {
    setLocalityState(id);
    setLMO(true);
    console.log('[GeoHood Location] Manual locality selected:', id, '— auto-update locked');
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
   * requestUserLocation — one-shot getCurrentPosition used by Onboarding + Profile.
   * On success it immediately starts continuous watchPosition tracking.
   */
  const requestUserLocation = useCallback(async (): Promise<LocationResult> => {
    console.log('[GeoHood Location] requestUserLocation called (one-shot + start tracking)');
    const result = await requestGeolocation();
    if (result.status === 'granted') {
      setUserLatState(result.lat);
      setUserLngState(result.lng);
      setUserAccuracyState(null);
      setLocPermission('granted');
      if (!lmoRef.current) {
        setLocalityState(result.localityId);
      }
      // Begin continuous tracking now that permission is confirmed
      startTracking();
    } else {
      setLocPermission('denied');
    }
    return result;
  }, [startTracking]);

  const startLiveTracking = useCallback(() => {
    startTracking();
  }, [startTracking]);

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
    setUserLatState(null);
    setUserLngState(null);
    setUserAccuracyState(null);
    setLocPermission('unknown');
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
      userLat, userLng, userAccuracy,
      locationPermission, locationStatus: liveStatus,
      requestUserLocation, startLiveTracking,
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
