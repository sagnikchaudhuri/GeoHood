import { createClient } from '@supabase/supabase-js';

/* ─── Env vars ─────────────────────────────────────────────────────────────── */
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[GeoHood] Supabase env vars missing — running in offline / mock mode');
}

/* ─── Client ───────────────────────────────────────────────────────────────── */
export const supabase = createClient(
  SUPABASE_URL      ?? 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY ?? 'placeholder-key',
  {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: false,
      storageKey:         'gh_sb_session',
    },
  },
);

/**
 * true  → real Supabase project configured
 * false → placeholder / offline mode
 */
export const SUPABASE_CONFIGURED =
  !!(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('placeholder'));

/* ─── Database row types ───────────────────────────────────────────────────── */

export interface DbProfile {
  id:                    string;   // auth.users uuid
  phone:                 string;
  name:                  string;
  locality:              string;   // locality id e.g. 'patuli'
  profile_image_url:     string | null;
  notifications_enabled: boolean;
  created_at:            string;
  updated_at:            string;
}

export interface DbVendor {
  id:            string;   // uuid (gen_random_uuid)
  owner_id:      string;   // profiles.id
  business_name: string;
  category:      string;
  subcategory:   string;
  description:   string;
  whatsapp:      string;
  locality:      string;
  is_live:       boolean;
  lat:           number | null;
  lng:           number | null;
  created_at:    string;
  updated_at:    string;
}

export interface DbSavedVendor {
  id:         string;
  user_id:    string;
  vendor_id:  string;   // mock id ('v001') OR real uuid
  created_at: string;
}

export interface DbLead {
  id:          string;
  vendor_id:   string;
  vendor_name: string;
  user_id:     string | null;
  user_name:   string;
  action:      'whatsapp_click' | 'call_click' | 'view';
  locality:    string;
  created_at:  string;
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/** Graceful wrapper — returns null on any Supabase error instead of throwing.
 *  Accepts `any` fn return so Supabase PostgREST builders (PromiseLike, not
 *  full Promise) are accepted without TS2739 errors. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeQuery<T>(fn: () => any): Promise<T | null> {
  try {
    const { data, error } = await fn();
    if (error) { console.warn('[GeoHood DB]', error); return null; }
    return data;
  } catch (err) {
    console.warn('[GeoHood DB] Exception:', err);
    return null;
  }
}

/** Returns current auth user id, or null if not signed in */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
