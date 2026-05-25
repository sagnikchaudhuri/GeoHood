import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  UserProfile, RegisteredVendor, Lead, ResidenceRegistration, LocationState,
} from '../types';
import {
  requestGeolocation, LocationResult,
  mockReverseGeocode, PATULI_FALLBACK_LAT, PATULI_FALLBACK_LNG,
} from '../utils/locationService';
import {
  supabase, DbProfile, DbVendor, safeQuery, getCurrentUserId,
} from '../lib/supabase';

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
  'gh_location', 'gh_loc_perm', 'gh_profile_photo',
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

/* ─── DbVendor → RegisteredVendor ─────────────────────────────────────────── */
function dbVendorToRegistered(v: DbVendor): RegisteredVendor {
  return {
    id:           v.id,
    businessName: v.business_name,
    category:     v.category as RegisteredVendor['category'],
    subcategory:  v.subcategory,
    locality:     v.locality,
    whatsapp:     v.whatsapp,
    description:  v.description,
    isLive:       v.is_live,
    registeredAt: new Date(v.created_at).getTime(),
    ...(v.lat != null && v.lng != null ? {
      storeLocation: { lat: v.lat, lng: v.lng, locality: v.locality },
    } : {}),
  };
}

// ─── Context shape ────────────────────────────────────────────────────────────

export type LocationPermission = 'unknown' | 'granted' | 'denied';
export type LocationStatus     = 'idle' | 'detecting' | 'success' | 'denied' | 'error';

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
  deleteVendor:   () => void;

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

  // GPS / Location
  location:           LocationState | null;
  userLat:            number | null;
  userLng:            number | null;
  userAccuracy:       number | null;
  locationPermission: LocationPermission;
  locationStatus:     LocationStatus;
  requestUserLocation: () => Promise<LocationResult>;

  // Profile photo
  profilePhoto:    string | null;
  setProfilePhoto: (dataUrl: string | null) => void;

  // Supabase auth id (for Storage uploads etc.)
  supabaseUserId: string | null;

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
  const [supabaseUserId, setSupabaseUserId]     = useState<string | null>(null);

  // ── Profile photo ──────────────────────────────────────────────────────────
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(
    () => { try { return localStorage.getItem('gh_profile_photo') ?? null; } catch { return null; } },
  );

  // ── Location ───────────────────────────────────────────────────────────────
  const [location, setLocationState]     = useState<LocationState | null>(() => load('gh_location', null));
  const [locationPermission, setLocPerm] = useState<LocationPermission>(() => load('gh_loc_perm', 'unknown'));
  const [locationStatus, setLocStatus]   = useState<LocationStatus>('idle');

  const userLat:      number | null = location?.lat      ?? null;
  const userLng:      number | null = location?.lng      ?? null;
  const userAccuracy: number | null = location?.accuracy ?? null;

  const lmoRef = useRef(localityManualOverride);
  useEffect(() => { lmoRef.current = localityManualOverride; }, [localityManualOverride]);

  // ── Persist to localStorage ────────────────────────────────────────────────
  useEffect(() => { save('gh_onboarded',       hasOnboarded);             }, [hasOnboarded]);
  useEffect(() => { save('gh_user',            user);                     }, [user]);
  useEffect(() => { save('gh_vendor',          myVendor);                 }, [myVendor]);
  useEffect(() => { save('gh_leads',           leads);                    }, [leads]);
  useEffect(() => { save('gh_residence',       residence);                }, [residence]);
  useEffect(() => { save('gh_seen_soc',        hasSeenSocietyOnboarding); }, [hasSeenSocietyOnboarding]);
  useEffect(() => { save('gh_locality',        selectedLocality);         }, [selectedLocality]);
  useEffect(() => { save('gh_locality_manual', localityManualOverride);   }, [localityManualOverride]);
  useEffect(() => { save('gh_saved_vendors',   savedVendorIds);           }, [savedVendorIds]);
  useEffect(() => { save('gh_notifications',   notificationsEnabled);     }, [notificationsEnabled]);
  useEffect(() => { save('gh_location',        location);                 }, [location]);
  useEffect(() => { save('gh_loc_perm',        locationPermission);       }, [locationPermission]);
  useEffect(() => {
    try {
      if (profilePhoto && !profilePhoto.startsWith('http')) {
        // Only persist DataURLs locally; remote URLs are stored in DB
        localStorage.setItem('gh_profile_photo', profilePhoto);
      } else if (!profilePhoto) {
        localStorage.removeItem('gh_profile_photo');
      }
    } catch {}
  }, [profilePhoto]);

  // ── Supabase session init & sync ───────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    /** Pull user's full data from Supabase and hydrate local state */
    const syncFromDb = async (userId: string) => {
      try {
        // ── Profile ──
        const profile = await safeQuery<DbProfile>(() =>
          supabase.from('profiles').select('*').eq('id', userId).single()
        );
        if (mounted && profile) {
          setUserState(prev => ({
            phone:    profile.phone,
            name:     profile.name,
            locality: profile.locality,
            roles:    prev?.roles ?? ['user'],
          }));
          setHasOnboarded(true);
          setNotifications(profile.notifications_enabled);
          if (profile.profile_image_url) {
            setProfilePhotoState(profile.profile_image_url);
            try { localStorage.setItem('gh_profile_photo', profile.profile_image_url); } catch {}
          }
        }

        // ── Vendor ──
        const vendor = await safeQuery(() =>
          supabase.from('vendors').select('*').eq('owner_id', userId).maybeSingle()
        ) as DbVendor | null;
        if (mounted && vendor) {
          setMyVendor(dbVendorToRegistered(vendor));
          setUserState(prev => prev
            ? { ...prev, roles: [...new Set([...prev.roles, 'vendor' as const])] }
            : prev,
          );
        }

        // ── Saved vendors ──
        const saved = await safeQuery(() =>
          supabase.from('saved_vendors').select('vendor_id').eq('user_id', userId)
        ) as { vendor_id: string }[] | null;
        if (mounted && saved) {
          setSavedVendorIds(saved.map(s => s.vendor_id));
        }

        // ── Leads ──
        const dbLeads = await safeQuery(() =>
          supabase.from('leads')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100)
        ) as Array<{ id: string; vendor_id: string; vendor_name: string; user_name: string; action: string; locality: string; created_at: string }> | null;
        if (mounted && dbLeads && dbLeads.length > 0) {
          setLeads(dbLeads.map(l => ({
            id:         l.id,
            vendorId:   l.vendor_id,
            vendorName: l.vendor_name,
            userName:   l.user_name,
            action:     l.action as Lead['action'],
            timestamp:  new Date(l.created_at).getTime(),
            locality:   l.locality,
          })));
        }
      } catch (err) {
        console.warn('[GeoHood] Supabase sync error:', err);
      }
    };

    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setSupabaseUserId(session.user.id);
        syncFromDb(session.user.id);
      }
    }).catch(console.warn);

    // Listen for subsequent auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setSupabaseUserId(session.user.id);
        syncFromDb(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setSupabaseUserId(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const completeOnboarding = useCallback((profile: UserProfile) => {
    setUserState(profile);
    setHasOnboarded(true);

    // Async Supabase sync — fire and forget
    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        setSupabaseUserId(userId);
        await supabase.from('profiles').upsert({
          id:                    userId,
          phone:                 profile.phone,
          name:                  profile.name,
          locality:              profile.locality,
          notifications_enabled: true,
          updated_at:            new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch (err) {
        console.warn('[GeoHood] Profile upsert failed:', err);
      }
    })();
  }, []);

  const setUser = useCallback((u: UserProfile) => {
    setUserState(u);
    void (async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;
      await safeQuery(() =>
        supabase.from('profiles').update({
          name:       u.name,
          locality:   u.locality,
          updated_at: new Date().toISOString(),
        }).eq('id', userId)
      );
    })();
  }, []);

  const registerVendor = useCallback(
    (v: Omit<RegisteredVendor, 'id' | 'registeredAt' | 'isLive'>) => {
      const tempId = `vendor_${Date.now()}`;
      const vendor: RegisteredVendor = {
        ...v, id: tempId, registeredAt: Date.now(), isLive: false,
      };
      setMyVendor(vendor);
      setUserState(prev => prev
        ? { ...prev, roles: [...new Set([...prev.roles, 'vendor' as const])] }
        : prev,
      );

      void (async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const result = await safeQuery(() =>
          supabase.from('vendors').insert({
            owner_id:      userId,
            business_name: v.businessName,
            category:      v.category,
            subcategory:   v.subcategory,
            description:   v.description,
            whatsapp:      v.whatsapp,
            locality:      v.locality,
            is_live:       false,
            lat:           v.storeLocation?.lat ?? null,
            lng:           v.storeLocation?.lng ?? null,
          }).select().single()
        ) as DbVendor | null;

        if (result) {
          // Replace temp id with real DB id
          setMyVendor(prev => prev ? { ...prev, id: result.id } : prev);
        }
      })();
    },
    [],
  );

  const setVendorLive = useCallback((live: boolean) => {
    setMyVendor(prev => prev ? { ...prev, isLive: live } : prev);
    void (async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;
      await safeQuery(() =>
        supabase.from('vendors')
          .update({ is_live: live, updated_at: new Date().toISOString() })
          .eq('owner_id', userId)
      );
    })();
  }, []);

  const deleteVendor = useCallback(() => {
    setMyVendor(null);
    setLeads([]);
    setUserState(prev => prev
      ? { ...prev, roles: prev.roles.filter(r => r !== 'vendor') }
      : prev,
    );
    void (async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;
      await safeQuery(() =>
        supabase.from('vendors').delete().eq('owner_id', userId)
      );
    })();
  }, []);

  const trackLead = useCallback((lead: Omit<Lead, 'id' | 'timestamp'>) => {
    const newLead: Lead = {
      ...lead,
      id:        `lead_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };
    setLeads(prev => [newLead, ...prev].slice(0, 100));

    void (async () => {
      const userId = await getCurrentUserId();
      await safeQuery(() =>
        supabase.from('leads').insert({
          vendor_id:   lead.vendorId,
          vendor_name: lead.vendorName,
          user_id:     userId ?? undefined,
          user_name:   lead.userName,
          action:      lead.action,
          locality:    lead.locality,
        })
      );
    })();
  }, []);

  const setResidence = useCallback((r: ResidenceRegistration) => {
    setResidenceState(r);
    setUserState(prev => prev
      ? { ...prev, roles: [...new Set([...prev.roles, 'society_member' as const])] }
      : prev,
    );
  }, []);

  const markSocietyOnboardingSeen = useCallback(() => setSeenSoc(true), []);

  const setSelectedLocality = useCallback((id: string) => {
    setLocalityState(id);
    setLMO(true);
    console.log('[GeoHood Location] Manual locality selected:', id);
  }, []);

  const toggleSavedVendor = useCallback((vendorId: string) => {
    setSavedVendorIds(prev => {
      const isSaved = prev.includes(vendorId);

      void (async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;
        if (isSaved) {
          await safeQuery(() =>
            supabase.from('saved_vendors')
              .delete()
              .eq('user_id', userId)
              .eq('vendor_id', vendorId)
          );
        } else {
          await safeQuery(() =>
            supabase.from('saved_vendors').insert({ user_id: userId, vendor_id: vendorId })
          );
        }
      })();

      return isSaved
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId];
    });
  }, []);

  const isVendorSaved = useCallback(
    (vendorId: string) => savedVendorIds.includes(vendorId),
    [savedVendorIds],
  );

  const toggleNotifications = useCallback(() => {
    setNotifications(prev => {
      const next = !prev;
      void (async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;
        await safeQuery(() =>
          supabase.from('profiles').update({
            notifications_enabled: next,
            updated_at:            new Date().toISOString(),
          }).eq('id', userId)
        );
      })();
      return next;
    });
  }, []);

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

      if (!lmoRef.current) {
        setLocalityState(result.localityId);
      }
    } else {
      setLocPerm('denied');
      setLocStatus(result.status === 'denied' ? 'denied' : 'error');
      if (!location) {
        setLocationState({ ...PATULI_LOCATION, updatedAt: Date.now() });
      }
    }

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setProfilePhoto = useCallback((dataUrl: string | null) => {
    setProfilePhotoState(dataUrl);
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
    setProfilePhotoState(null);
    setSupabaseUserId(null);

    // Supabase sign out
    supabase.auth.signOut().catch(console.warn);
  }, []);

  const myLeads = myVendor
    ? leads.filter(l => l.vendorId === myVendor.id)
    : [];

  return (
    <UserContext.Provider value={{
      hasOnboarded, completeOnboarding,
      user, setUser,
      myVendor, registerVendor, setVendorLive, deleteVendor,
      leads, trackLead, myLeads,
      residence, setResidence,
      hasSeenSocietyOnboarding, markSocietyOnboardingSeen,
      selectedLocality, setSelectedLocality,
      savedVendorIds, toggleSavedVendor, isVendorSaved,
      notificationsEnabled, toggleNotifications,
      location, userLat, userLng, userAccuracy,
      locationPermission, locationStatus,
      requestUserLocation,
      profilePhoto, setProfilePhoto,
      supabaseUserId,
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
