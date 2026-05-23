import React from 'react';
import { Home, Map, Users, User, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

type NavTab = 'home' | 'map' | 'add' | 'society' | 'profile';

const TABS: { id: NavTab; icon?: React.ElementType; label: string }[] = [
  { id: 'home',    icon: Home,  label: 'Home'         },
  { id: 'map',     icon: Map,   label: 'Map'          },
  { id: 'add',                  label: '+ for Vendor' },
  { id: 'society', icon: Users, label: 'Society'      },
  { id: 'profile', icon: User,  label: 'Profile'      },
];

export function BottomNavBar() {
  const { activeTab, setActiveTab } = useAppContext();

  const handlePress = (id: NavTab) => {
    if (id === 'add') return; // FAB — future modal
    setActiveTab(id as any);
  };

  return (
    <nav
      className="flex-none flex items-stretch"
      style={{
        height: 'var(--nav-height)',
        background: '#111111',
        borderTop: '1px solid #1A1A1A',
      }}
    >
      {TABS.map(tab => {
        const isAdd    = tab.id === 'add';
        const isActive = !isAdd && activeTab === tab.id;
        const Icon     = tab.icon;

        if (isAdd) {
          return (
            <button
              key="add"
              className="flex-1 flex flex-col items-center justify-center gap-1"
              onClick={() => handlePress('add')}
            >
              {/* Raised teal FAB */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center -mt-5 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #00C896, #0aa87a)' }}
              >
                <Plus size={22} color="white" strokeWidth={2.5} />
              </div>
              <span className="text-[9px] font-semibold text-[#5C5C5C] uppercase tracking-wide">
                + for Vendor
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => handlePress(tab.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
          >
            {isActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                style={{ background: '#00C896' }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            {Icon && (
              <Icon
                size={21}
                strokeWidth={isActive ? 2.2 : 1.7}
                color={isActive ? '#00C896' : '#5C5C5C'}
              />
            )}
            <span
              className="text-[9px] font-semibold uppercase tracking-wide"
              style={{ color: isActive ? '#00C896' : '#5C5C5C' }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
