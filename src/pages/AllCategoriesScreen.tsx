import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { useAppContext } from '../context/AppContext';
import { MOCK_VENDORS } from '../data/mockVendors';
import { VendorCategory } from '../types';

interface Props {
  onBack: () => void;
}

/* Full display labels for the all-categories page */
const CATEGORY_LABELS: Record<string, string> = {
  food:             'Food & Drinks',
  grocery:          'Grocery & Daily Needs',
  fish_meat_veg:    'Fish / Meat / Vegetables',
  medical:          'Medical',
  pharmacy:         'Pharmacy & Medical',
  repair:           'Repairs & Technicians',
  home_services:    'Home Services',
  beauty:           'Beauty & Wellness',
  transport:        'Transport',
  education:        'Education',
  emergency:        'Emergency',
  society_services: 'Society Services',
  local_shops:      'Local Shops',
  professional:     'Professional Services',
  other:            'Other',
};

export function AllCategoriesScreen({ onBack }: Props) {
  const { pushOverlay } = useAppContext();

  // Count vendors per category
  const countMap: Record<string, number> = {};
  MOCK_VENDORS.forEach(v => {
    countMap[v.category] = (countMap[v.category] ?? 0) + 1;
  });

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 60,
        display: 'flex', flexDirection: 'column',
        background: '#0D0D0D',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        padding: 'calc(var(--safe-top) + 14px) 16px 14px',
        borderBottom: '1px solid #1A1A1A',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(13,13,13,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1A1A1A', border: 'none', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <ChevronLeft size={20} color="#EBEBEB" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 17, fontWeight: 800, color: '#EBEBEB', letterSpacing: '-0.02em', margin: 0 }}>
            Categories
          </h1>
          <p style={{ fontSize: 11, color: '#5C5C5C', margin: '2px 0 0' }}>
            {CATEGORIES.length} categories · tap to browse
          </p>
        </div>
      </div>

      {/* ── Category grid ── */}
      <div className="scrollbar-none" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CATEGORIES.map((cat, i) => {
            const count = countMap[cat.id] ?? 0;
            const label = CATEGORY_LABELS[cat.id] ?? cat.label;

            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => pushOverlay({ type: 'category_results', categoryId: cat.id, label })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 16,
                  border: '1px solid #1A1A1A', background: '#161616',
                  textAlign: 'left', width: '100%', cursor: 'pointer',
                }}
              >
                {/* Icon bubble */}
                <div style={{
                  width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: cat.bgColor, fontSize: 22,
                }}>
                  {cat.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 600, color: '#EBEBEB', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 11, color: '#5C5C5C', margin: '3px 0 0' }}>
                    {count > 0 ? `${count} vendor${count !== 1 ? 's' : ''} nearby` : 'Coming soon'}
                  </p>
                </div>

                {/* Count pill */}
                {count > 0 && (
                  <span style={{
                    flexShrink: 0, padding: '3px 9px', borderRadius: 9999,
                    fontSize: 11, fontWeight: 700,
                    background: cat.bgColor,
                    color: cat.color,
                    border: `1px solid ${cat.color}30`,
                  }}>
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
