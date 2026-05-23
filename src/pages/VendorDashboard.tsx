import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, ShieldCheck, Users, Phone, MessageCircle, Clock, TrendingUp } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { CATEGORY_GROUPS } from '../data/categories';

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

const ACTION_COLOR: Record<string, string> = {
  whatsapp_click: '#00C896',
  call_click:     '#4D9EFF',
  view:           '#5C5C5C',
};

export function VendorDashboard({ onClose }: Props) {
  const { myVendor, setVendorLive, myLeads } = useUser();
  const [isToggling, setIsToggling] = useState(false);

  if (!myVendor) return null;

  const catGroup = CATEGORY_GROUPS.find(g => g.id === myVendor.category);

  const handleToggleLive = () => {
    setIsToggling(true);
    setTimeout(() => {
      setVendorLive(!myVendor.isLive);
      setIsToggling(false);
    }, 400);
  };

  const whatsappLeads = myLeads.filter(l => l.action === 'whatsapp_click').length;
  const callLeads     = myLeads.filter(l => l.action === 'call_click').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: '#0D0D0D' }}
    >
      {/* Header */}
      <div className="flex-none flex items-center gap-3 px-5 pt-5 pb-4 border-b border-[#1A1A1A]">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1A1A1A]"
        >
          <X size={18} color="#ADADAD" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-[#EBEBEB]">Vendor Dashboard</h1>
          <p className="text-xs text-[#5C5C5C]">{myVendor.businessName}</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold"
          style={{
            background:   myVendor.isLive ? 'rgba(0,200,150,0.1)'  : 'rgba(92,92,92,0.1)',
            borderColor:  myVendor.isLive ? 'rgba(0,200,150,0.3)'  : '#2A2A2A',
            color:        myVendor.isLive ? '#00C896' : '#5C5C5C',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: myVendor.isLive ? '#00C896' : '#3A3A3A',
              boxShadow:  myVendor.isLive ? '0 0 6px #00C896' : 'none',
            }}
          />
          {myVendor.isLive ? 'Live' : 'Closed'}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ scrollbarWidth: 'none' }}>

        {/* ── Business info card ── */}
        <div className="mt-4 rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-none"
            style={{ background: catGroup?.bgColor ?? 'rgba(136,136,136,0.12)' }}
          >
            {catGroup?.icon ?? '📦'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#EBEBEB] truncate">{myVendor.businessName}</p>
            <p className="text-xs text-[#5C5C5C]">{myVendor.subcategory}</p>
            <p className="text-xs text-[#3A3A3A] mt-0.5">{myVendor.locality}</p>
          </div>
        </div>

        {/* ── Section A: Live/Closed Toggle ── */}
        <div className="mt-5">
          <p className="text-[10px] font-semibold text-[#5C5C5C] uppercase tracking-widest mb-3">
            A · Status
          </p>
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#EBEBEB]">
                  {myVendor.isLive ? 'You\'re Live' : 'You\'re Closed'}
                </p>
                <p className="text-xs text-[#5C5C5C] mt-0.5">
                  {myVendor.isLive
                    ? 'Customers can see you\'re available now'
                    : 'Toggle Live when you\'re open and ready'}
                </p>
              </div>

              {/* Toggle switch */}
              <button
                onClick={handleToggleLive}
                disabled={isToggling}
                className="relative w-14 h-7 rounded-full transition-all duration-300 flex-none"
                style={{
                  background: myVendor.isLive
                    ? 'linear-gradient(135deg, #00C896, #0aa87a)'
                    : '#2A2A2A',
                }}
              >
                <motion.div
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                  animate={{ left: myVendor.isLive ? '28px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <AnimatePresence>
              {myVendor.isLive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-[#2A2A2A] flex items-center gap-2">
                    <Radio size={12} color="#00C896" className="animate-pulse" />
                    <p className="text-xs text-[#00C896] font-medium">
                      Live indicator showing on map and listings
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Section B: Verification ── */}
        <div className="mt-5">
          <p className="text-[10px] font-semibold text-[#5C5C5C] uppercase tracking-widest mb-3">
            B · Verification
          </p>
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
              style={{ background: 'rgba(92,92,92,0.1)' }}>
              <ShieldCheck size={20} color="#5C5C5C" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#EBEBEB]">Business Verification</p>
              <p className="text-xs text-[#5C5C5C] mt-0.5">Build trust with a verified badge</p>
            </div>
            <span className="flex-none px-2.5 py-1 rounded-full text-[10px] font-bold border"
              style={{
                background:   'rgba(92,92,92,0.1)',
                borderColor:  '#2A2A2A',
                color:        '#5C5C5C',
              }}
            >
              Coming Soon
            </span>
          </div>
        </div>

        {/* ── Section C: Leads ── */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-[#5C5C5C] uppercase tracking-widest">
              C · Leads
            </p>
            {myLeads.length > 0 && (
              <p className="text-xs text-[#5C5C5C]">{myLeads.length} total</p>
            )}
          </div>

          {/* Stats row */}
          {myLeads.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'WhatsApp', count: whatsappLeads, color: '#00C896', icon: MessageCircle },
                { label: 'Calls',    count: callLeads,     color: '#4D9EFF', icon: Phone },
                { label: 'Views',    count: myLeads.filter(l => l.action === 'view').length, color: '#5C5C5C', icon: TrendingUp },
              ].map(({ label, count, color, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-[#2A2A2A] bg-[#161616] p-3 text-center">
                  <Icon size={14} color={color} className="mx-auto mb-1" />
                  <p className="text-lg font-bold" style={{ color }}>{count}</p>
                  <p className="text-[10px] text-[#5C5C5C]">{label}</p>
                </div>
              ))}
            </div>
          )}

          {myLeads.length === 0 ? (
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-6 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(92,92,92,0.08)' }}>
                <Users size={22} color="#3A3A3A" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#EBEBEB]">No leads yet</p>
                <p className="text-xs text-[#5C5C5C] mt-1 leading-relaxed">
                  When customers tap WhatsApp or Call on your listing, they'll appear here.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#5C5C5C]">
                <Clock size={11} />
                <span>Toggle Live to start getting leads</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {myLeads.slice(0, 20).map(lead => (
                <div
                  key={lead.id}
                  className="rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex-none flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(92,92,92,0.12)', color: '#ADADAD' }}
                  >
                    {lead.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#EBEBEB] truncate">{lead.userName}</p>
                    <p className="text-[11px] text-[#5C5C5C]">{lead.locality}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${ACTION_COLOR[lead.action]}18`,
                        color:      ACTION_COLOR[lead.action],
                      }}
                    >
                      {ACTION_LABEL[lead.action]}
                    </span>
                    <span className="text-[10px] text-[#3A3A3A]">{formatRelativeTime(lead.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WhatsApp number display */}
        <div className="mt-4 rounded-xl border border-[#1E1E1E] bg-[#111111] px-4 py-3 flex items-center gap-2">
          <MessageCircle size={14} color="#00C896" />
          <p className="text-xs text-[#5C5C5C]">
            Customers reach you at{' '}
            <span className="text-[#EBEBEB] font-semibold">{myVendor.whatsapp}</span>
          </p>
        </div>

      </div>
    </motion.div>
  );
}
