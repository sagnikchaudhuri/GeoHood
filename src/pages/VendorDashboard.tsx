import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, MessageCircle, Clock, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { CATEGORY_MAP } from '../constants';

interface Props {
  onClose: () => void;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ACTION_LABEL: Record<string, string> = {
  whatsapp_click: 'WhatsApp',
  call_click:     'Called',
  view:           'Viewed',
};

export function VendorDashboard({ onClose }: Props) {
  const { myVendor, setVendorLive, myLeads } = useUser();

  if (!myVendor) return null;

  const cat      = CATEGORY_MAP[myVendor.category];
  const initials = myVendor.businessName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const whatsappLeads = myLeads.filter(l => l.action === 'whatsapp_click').length;
  const callLeads     = myLeads.filter(l => l.action === 'call_click').length;

  /* leads this week (last 7 days) */
  const weekLeads = myLeads.filter(l => Date.now() - l.timestamp < 7 * 86400_000).length;
  /* leads today */
  const todayLeads = myLeads.filter(l => {
    const d = new Date(l.timestamp);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: '#0D0D0D' }}
    >
      {/* ── Header ── */}
      <div className="flex-none flex items-center gap-3 px-5 pt-5 pb-4 border-b border-[#1A1A1A]">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1A1A1A]"
        >
          <X size={18} color="#ADADAD" />
        </button>
        <h1 className="flex-1 text-base font-bold text-[#EBEBEB]">Vendor Dashboard</h1>
        {/* "···" menu placeholder */}
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1A1A1A]">
          <span className="text-[#5C5C5C] text-base tracking-widest leading-none">···</span>
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ scrollbarWidth: 'none' }}>

        {/* Business card */}
        <div className="mt-4 rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4 flex items-center gap-3">
          {/* Initials avatar */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-none"
            style={{
              background: `${cat?.color ?? '#888'}1a`,
              color:       cat?.color ?? '#888',
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-[#EBEBEB] truncate">{myVendor.businessName}</p>
            <p className="text-xs text-[#5C5C5C]">{myVendor.subcategory} · {myVendor.locality}</p>
          </div>
          {/* Open/Closed badge */}
          <span
            className="flex-none px-2.5 py-1 rounded-full text-[11px] font-bold border"
            style={{
              background:  myVendor.isLive ? 'rgba(0,200,150,0.12)' : 'rgba(92,92,92,0.1)',
              color:       myVendor.isLive ? '#00C896' : '#5C5C5C',
              borderColor: myVendor.isLive ? 'rgba(0,200,150,0.3)' : '#2A2A2A',
            }}
          >
            {myVendor.isLive ? 'Open' : 'Closed'}
          </span>
        </div>

        {/* ── Section A: Status ── */}
        <div className="mt-5">
          <p className="text-[10px] font-semibold text-[#5C5C5C] uppercase tracking-widest mb-1">Status</p>
          <p className="text-xs text-[#3A3A3A] mb-3">Set your availability</p>

          <div className="flex gap-2">
            {/* Live pill */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setVendorLive(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border font-bold text-sm transition-all"
              style={{
                background:  myVendor.isLive ? 'linear-gradient(135deg, #00C896, #0aa87a)' : 'transparent',
                borderColor: myVendor.isLive ? 'transparent' : '#2A2A2A',
                color:       myVendor.isLive ? 'white' : '#5C5C5C',
              }}
            >
              <Zap size={14} fill={myVendor.isLive ? 'white' : 'none'} />
              Live
            </motion.button>

            {/* Closed pill */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setVendorLive(false)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border font-bold text-sm transition-all"
              style={{
                background:  !myVendor.isLive ? '#1A1A1A' : 'transparent',
                borderColor: !myVendor.isLive ? '#3A3A3A' : '#2A2A2A',
                color:       !myVendor.isLive ? '#ADADAD' : '#3A3A3A',
              }}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border flex-none"
                style={{ borderColor: !myVendor.isLive ? '#ADADAD' : '#3A3A3A' }}
              />
              Closed
            </motion.button>
          </div>

          <AnimatePresence>
            {myVendor.isLive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-[#00C896] mt-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
                  Live indicator showing on map and listings
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Section B: Verification ── */}
        <div className="mt-5">
          <p className="text-[10px] font-semibold text-[#5C5C5C] uppercase tracking-widest mb-3">Verification</p>

          <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-[#EBEBEB]">Verification</p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background:  'rgba(245,166,35,0.12)',
                    color:       '#F5A623',
                    border:      '1px solid rgba(245,166,35,0.25)',
                  }}
                >
                  Coming Later
                </span>
              </div>
              <p className="text-xs text-[#5C5C5C]">This feature will be available soon.</p>
            </div>
            <ShieldCheck size={22} color="#3A3A3A" className="flex-none" />
          </div>
        </div>

        {/* ── Section C: Leads ── */}
        <div className="mt-5">
          <p className="text-[10px] font-semibold text-[#5C5C5C] uppercase tracking-widest mb-3">
            Leads (WhatsApp Clicks)
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Total Leads',  value: myLeads.length || 42, color: '#00C896' },
              { label: 'Today',        value: todayLeads  || 6,     color: '#00C896' },
              { label: 'This Week',    value: weekLeads   || 18,    color: '#4D9EFF' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-3"
              >
                <p className="text-[10px] text-[#5C5C5C] font-medium mb-1">{label}</p>
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Lead entries */}
          {myLeads.length === 0 ? (
            /* Demo leads when empty */
            <div className="flex flex-col gap-2">
              {[
                { name: 'GeoHood User',  sub: `Clicked via ${myVendor.businessName}`, time: 'Today, 7:30 PM' },
                { name: 'Rahul S.',      sub: `Clicked via ${myVendor.businessName}`, time: 'Today, 6:15 PM' },
                { name: 'Ananya M.',     sub: `Clicked via ${myVendor.businessName}`, time: 'Today, 5:02 PM' },
                { name: 'Sagnik D.',     sub: `Clicked via ${myVendor.businessName}`, time: 'Today, 4:10 PM' },
              ].map((lead, i) => (
                <DemoLeadRow key={i} {...lead} color={cat?.color} />
              ))}

              <button
                className="w-full py-3 mt-1 rounded-xl border border-[#1E1E1E] text-xs font-semibold text-[#5C5C5C] hover:text-[#ADADAD] transition-colors"
              >
                View all leads
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {myLeads.slice(0, 10).map(lead => {
                const initLead = lead.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#1E1E1E] bg-[#161616]"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex-none flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(92,92,92,0.12)', color: '#ADADAD' }}
                    >
                      {initLead}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#EBEBEB] truncate">{lead.userName}</p>
                      <p className="text-[11px] text-[#5C5C5C]">
                        {ACTION_LABEL[lead.action]} via {myVendor.businessName}
                      </p>
                      <p className="text-[10px] text-[#3A3A3A]">{formatRelativeTime(lead.timestamp)}</p>
                    </div>
                    {lead.action === 'whatsapp_click' && (
                      <MessageCircle size={16} color="#00C896" className="flex-none" />
                    )}
                  </div>
                );
              })}

              <button className="w-full py-3 mt-1 rounded-xl border border-[#1E1E1E] text-xs font-semibold text-[#5C5C5C] hover:text-[#ADADAD] transition-colors">
                View all leads
              </button>
            </div>
          )}
        </div>

        {/* No leads empty state overrides demo */}
        {myLeads.length === 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#1A1A1A] px-4 py-3">
            <Clock size={13} color="#3A3A3A" />
            <p className="text-[11px] text-[#3A3A3A]">Toggle Live to start receiving real leads</p>
          </div>
        )}

      </div>
    </motion.div>
  );
}

function DemoLeadRow({
  name, sub, time, color,
}: {
  name: string; sub: string; time: string; color?: string;
}) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#1E1E1E] bg-[#161616]">
      <div
        className="w-9 h-9 rounded-full flex-none flex items-center justify-center text-xs font-bold"
        style={{ background: 'rgba(92,92,92,0.12)', color: '#ADADAD' }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#EBEBEB] truncate">{name}</p>
        <p className="text-[11px] text-[#5C5C5C] truncate">{sub}</p>
        <p className="text-[10px] text-[#3A3A3A]">{time}</p>
      </div>
      <MessageCircle size={16} color="#00C896" className="flex-none" />
    </div>
  );
}
