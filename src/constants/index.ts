import { CategoryDef } from '../types';

// ─── Brand Colors (mirrors CSS custom properties) ───────────────────────────

export const Colors = {
  teal:           '#00C896',
  tealDim:        'rgba(0,200,150,0.12)',
  tealBorder:     'rgba(0,200,150,0.28)',
  maroon:         '#8B1A2A',
  maroonDim:      'rgba(139,26,42,0.18)',
  ocean:          '#1666E8',
  amber:          '#F5A623',
  redLive:        '#FF4D6A',
  bgRoot:         '#0D0D0D',
  bgSurface:      '#111111',
  bgCard:         '#161616',
  bgInput:        '#1A1A1A',
  bgElevated:     '#202020',
  borderSubtle:   '#222222',
  borderMid:      '#2A2A2A',
  textPrimary:    '#EBEBEB',
  textSecondary:  '#ADADAD',
  textMuted:      '#5C5C5C',
  statusOpen:     '#00C896',
  statusClosed:   '#484848',
  statusUrgent:   '#F5A623',
  statusLive:     '#FF4D6A',
} as const;

// ─── Category definitions (full set — mirrors data/categories.ts) ────────────

export const CATEGORIES: CategoryDef[] = [
  { id: 'food',            label: 'Food',           icon: '🍽️',  color: '#00C896', bgColor: 'rgba(0,200,150,0.12)'   },
  { id: 'grocery',         label: 'Grocery',        icon: '🛒',   color: '#4D9EFF', bgColor: 'rgba(77,158,255,0.12)'  },
  { id: 'fish_meat_veg',   label: 'Fish/Meat',      icon: '🐟',   color: '#FF7043', bgColor: 'rgba(255,112,67,0.12)'  },
  { id: 'medical',         label: 'Medical',        icon: '🏥',   color: '#FF4D6A', bgColor: 'rgba(255,77,106,0.12)'  },
  { id: 'pharmacy',        label: 'Pharmacy',       icon: '💊',   color: '#E040FB', bgColor: 'rgba(224,64,251,0.10)'  },
  { id: 'repair',          label: 'Repair',         icon: '🔧',   color: '#F5A623', bgColor: 'rgba(245,166,35,0.12)'  },
  { id: 'home_services',   label: 'Home',           icon: '🏠',   color: '#26C6DA', bgColor: 'rgba(38,198,218,0.12)'  },
  { id: 'beauty',          label: 'Beauty',         icon: '✂️',  color: '#A855F7', bgColor: 'rgba(168,85,247,0.12)'  },
  { id: 'transport',       label: 'Transport',      icon: '🚗',   color: '#1666E8', bgColor: 'rgba(22,102,232,0.12)'  },
  { id: 'education',       label: 'Education',      icon: '📚',   color: '#43A047', bgColor: 'rgba(67,160,71,0.12)'   },
  { id: 'emergency',       label: 'Emergency',      icon: '🚨',   color: '#FF1744', bgColor: 'rgba(255,23,68,0.12)'   },
  { id: 'society_services',label: 'Society',        icon: '🏢',   color: '#78909C', bgColor: 'rgba(120,144,156,0.12)' },
  { id: 'local_shops',     label: 'Shops',          icon: '🏪',   color: '#8D6E63', bgColor: 'rgba(141,110,99,0.12)'  },
  { id: 'professional',    label: 'Professional',   icon: '💼',   color: '#546E7A', bgColor: 'rgba(84,110,122,0.12)'  },
  { id: 'other',           label: 'Other',          icon: '📦',   color: '#888888', bgColor: 'rgba(136,136,136,0.12)' },
];

export const CATEGORY_MAP: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c])
);

// Quick access grid (top 8 for home screen)
export const HOME_CATEGORIES = CATEGORIES.slice(0, 8);

// Map pin colors by category
export const PIN_COLORS: Record<string, string> = {
  food:             '#00C896',
  grocery:          '#4D9EFF',
  fish_meat_veg:    '#FF7043',
  medical:          '#FF4D6A',
  pharmacy:         '#E040FB',
  repair:           '#F5A623',
  home_services:    '#26C6DA',
  beauty:           '#A855F7',
  transport:        '#1666E8',
  education:        '#43A047',
  emergency:        '#FF1744',
  society_services: '#78909C',
  local_shops:      '#8D6E63',
  professional:     '#546E7A',
  other:            '#888888',
};
