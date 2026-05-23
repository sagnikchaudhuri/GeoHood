// ─── Core Domain Types ──────────────────────────────────────────────────────

export type VendorCategory =
  | 'food' | 'grocery' | 'fish_meat_veg' | 'medical'
  | 'pharmacy' | 'repair' | 'home_services' | 'beauty'
  | 'transport' | 'education' | 'emergency' | 'society_services'
  | 'local_shops' | 'professional' | 'other';

export type TabName = 'home' | 'map' | 'search' | 'society' | 'community';

export interface CategoryGroup {
  id:            VendorCategory;
  label:         string;
  icon:          string;
  color:         string;
  bgColor:       string;
  subcategories: string[];
}

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
  distance:    number;
  address:     string;
  phone?:      string;
  whatsapp?:   string;
  openTime?:   string;
  closeTime?:  string;
  days?:       string;
  lat:         number;
  lng:         number;
  features:    string[];
  tags:        string[];
  offers?:     string;
  locality:    string;
}

export interface Notice {
  id:       string;
  title:    string;
  body:     string;
  category: 'maintenance' | 'event' | 'alert' | 'general';
  date:     string;
  urgent:   boolean;
  author:   string;
}

export interface CategoryDef {
  id:      VendorCategory | 'all';
  label:   string;
  icon:    string;
  color:   string;
  bgColor: string;
}

export interface OpenStatus {
  isOpen:     boolean;
  short:      string;
  label:      string;
  urgent:     boolean;
  minsLeft?:  number;
  minsUntil?: number;
}

export interface LSIData {
  score:           number;
  vendorsActive:   number;
  openNow:         number;
  liveNow:         number;
  avgResponseTime: string;
  locality:        string;
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'guest' | 'user' | 'vendor' | 'society_member';

export interface UserProfile {
  phone:    string;
  name:     string;
  locality: string;
  lat?:     number;
  lng?:     number;
  roles:    UserRole[];
}

// ─── Vendor Registration ──────────────────────────────────────────────────────

export interface RegisteredVendor {
  id:           string;
  businessName: string;
  category:     VendorCategory;
  subcategory:  string;
  locality:     string;
  whatsapp:     string;
  description:  string;
  isLive:       boolean;
  registeredAt: number;
}

// ─── Lead Tracking ────────────────────────────────────────────────────────────

export interface Lead {
  id:         string;
  vendorId:   string;
  vendorName: string;
  userName:   string;
  action:     'whatsapp_click' | 'call_click' | 'view';
  timestamp:  number;
  locality:   string;
}

// ─── Society / Home Registration ──────────────────────────────────────────────

export type SocietyRole = 'resident' | 'family_head' | 'committee';

export interface SocietyRegistration {
  type:        'society';
  societyName: string;
  flatNumber:  string;
  role:        SocietyRole;
  locality:    string;
}

export interface HomeRegistration {
  type:      'home';
  homeLabel: string;
  address:   string;
  locality:  string;
}

export type ResidenceRegistration = SocietyRegistration | HomeRegistration;

// ─── Locality ─────────────────────────────────────────────────────────────────

export interface Locality {
  id:       string;
  name:     string;
  district: string;
  lat:      number;
  lng:      number;
}
