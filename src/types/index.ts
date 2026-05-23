// ─── Core Domain Types ──────────────────────────────────────────────────────

export type VendorCategory =
  | 'food' | 'grocery' | 'medical' | 'pharmacy'
  | 'repair' | 'salon' | 'transport' | 'other';

export type TabName = 'home' | 'map' | 'search' | 'society' | 'profile';

export interface Vendor {
  id:          string;
  name:        string;
  category:    VendorCategory;
  subcategory: string;
  description: string;
  rating:      number;
  reviewCount: number;
  isOpen:      boolean;
  isVerified:  boolean;
  isPremium:   boolean;
  isLive:      boolean;
  distance:    number;        // km
  address:     string;
  phone?:      string;
  whatsapp?:   string;
  openTime?:   string;        // "9:00 AM"
  closeTime?:  string;        // "10:00 PM"
  days?:       string;        // "Mon–Sat"
  lat:         number;
  lng:         number;
  features:    string[];
  tags:        string[];
  offers?:     string;
}

export interface Notice {
  id:        string;
  title:     string;
  body:      string;
  category:  'maintenance' | 'event' | 'alert' | 'general';
  date:      string;
  urgent:    boolean;
  author:    string;
}

export interface Society {
  id:         string;
  name:       string;
  locality:   string;
  members:    number;
  trustScore: number;
}

export interface CategoryDef {
  id:      VendorCategory | 'all';
  label:   string;
  icon:    string;
  color:   string;
  bgColor: string;
}

export interface OpenStatus {
  isOpen:    boolean;
  short:     string;
  label:     string;
  urgent:    boolean;
  minsLeft?: number;
  minsUntil?: number;
}

export interface LSIData {
  score:          number;   // 0–100
  vendorsActive:  number;
  openNow:        number;
  liveNow:        number;
  avgResponseTime: string;
  locality:       string;
}
