import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VendorListCard } from '../components/cards/VendorListCard';
import { Chip } from '../components/ui/Chip';
import { CATEGORIES } from '../constants';
import { searchVendors, getVendorsByCategory } from '../data/mockVendors';
import { useAppContext } from '../context/AppContext';

const QUICK_SEARCHES = ['doctor', 'food', 'ATM', 'laundry', 'AC repair', 'salon'];

export function SearchScreen() {
  const { searchQuery, setSearchQuery } = useAppContext();
  const [localQuery, setLocalQuery]     = useState(searchQuery);
  const [activeCategory, setActiveCategory] = useState('all');

  const results = useMemo(() => {
    const bySearch = localQuery.trim()
      ? searchVendors(localQuery)
      : getVendorsByCategory(activeCategory);
    if (!localQuery.trim() && activeCategory !== 'all') {
      return getVendorsByCategory(activeCategory);
    }
    return localQuery.trim() ? bySearch : getVendorsByCategory(activeCategory);
  }, [localQuery, activeCategory]);

  const handleChange = (val: string) => {
    setLocalQuery(val);
    setSearchQuery(val);
    if (val) setActiveCategory('all');
  };

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
      {/* Search header */}
      <div className="flex-none px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #1A1A1A' }}>
        <div className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-[#161616] border border-[#222222] focus-within:border-[rgba(0,200,150,0.4)] transition-colors">
          <Search size={17} color="#5C5C5C" />
          <input
            type="text"
            placeholder="Search vendors, services, tags…"
            value={localQuery}
            onChange={e => handleChange(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent outline-none text-sm text-[#EBEBEB] placeholder:text-[#5C5C5C]"
          />
          {localQuery && (
            <button onClick={() => handleChange('')}>
              <X size={15} color="#5C5C5C" />
            </button>
          )}
        </div>

        {/* Category pills */}
        {!localQuery && (
          <div className="flex gap-2 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <Chip
              label="All"
              icon="🏘️"
              active={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              color="#00C896"
              bgColor="rgba(0,200,150,0.12)"
            />
            {CATEGORIES.map(cat => (
              <Chip
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                color={cat.color}
                bgColor={cat.bgColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {!localQuery && activeCategory === 'all' ? (
          /* Quick search suggestions */
          <div className="px-5 pt-5">
            <p className="text-xs text-[#5C5C5C] uppercase tracking-widest font-semibold mb-3">Quick Searches</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map(q => (
                <button
                  key={q}
                  onClick={() => handleChange(q)}
                  className="px-3 py-1.5 rounded-full border border-[#222222] bg-[#161616] text-sm text-[#ADADAD] hover:border-[#3A3A3A] hover:text-[#EBEBEB] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            <p className="text-xs text-[#5C5C5C] uppercase tracking-widest font-semibold mt-6 mb-3">All Vendors</p>
            <div className="flex flex-col gap-2 pb-6">
              {results.map((v, i) => <VendorListCard key={v.id} vendor={v} index={i} />)}
            </div>
          </div>
        ) : (
          <div className="px-5 pt-4 pb-6">
            <p className="text-xs text-[#5C5C5C] font-medium mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''}
              {localQuery ? ` for "${localQuery}"` : ''}
            </p>
            <AnimatePresence mode="popLayout">
              {results.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-[#5C5C5C] text-sm">No vendors found</p>
                  <p className="text-[#3A3A3A] text-xs mt-1">Try a different keyword</p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-2">
                  {results.map((v, i) => <VendorListCard key={v.id} vendor={v} index={i} />)}
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
