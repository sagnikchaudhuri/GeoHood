import React from 'react';
import { Users, Shield, Bell, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const NOTICES = [
  { id: 'n1', title: 'Water Supply Interruption', body: 'Scheduled maintenance on 21st May, 6 AM – 2 PM. Please store water in advance.', category: 'maintenance', date: '19 May', urgent: true },
  { id: 'n2', title: 'Patuli Lake Cleaning Drive', body: 'Join us this Sunday at 7 AM. Gloves and bags will be provided. All residents welcome.', category: 'event', date: '18 May', urgent: false },
  { id: 'n3', title: 'New Street Light Installation', body: 'Block D and E will get new LED lights by end of month. Pending municipal approval.', category: 'general', date: '17 May', urgent: false },
  { id: 'n4', title: 'Power Cut Alert — Zone B', body: 'CESC will cut power on 22nd May from 10 AM – 4 PM for grid maintenance.', category: 'alert', date: '16 May', urgent: true },
];

const CATEGORY_COLOR: Record<string, string> = {
  maintenance: '#F5A623',
  event:       '#00C896',
  alert:       '#FF4D6A',
  general:     '#4D9EFF',
};

export function SocietyScreen() {
  return (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
      {/* Header */}
      <div className="flex-none px-5 pt-5 pb-4 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} color="#00C896" />
          <h1 className="text-lg font-bold text-[#EBEBEB]">Society</h1>
        </div>
        <p className="text-xs text-[#5C5C5C]">Patuli Housing Estate · 1,240 members</p>
      </div>

      {/* Trust score card */}
      <div className="px-5 pt-4 pb-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#1E1E1E] bg-[#161616] p-4 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[rgba(0,200,150,0.1)]">
            <Shield size={24} color="#00C896" />
          </div>
          <div>
            <p className="text-[10px] text-[#5C5C5C] uppercase tracking-widest font-semibold">Trust Score</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[#00C896]">87</span>
              <span className="text-sm text-[#5C5C5C]">/100</span>
            </div>
            <p className="text-xs text-[#ADADAD]">High trust community</p>
          </div>
        </motion.div>
      </div>

      {/* Notices */}
      <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center gap-2 mb-3">
          <Bell size={14} color="#5C5C5C" />
          <p className="text-xs text-[#5C5C5C] uppercase tracking-widest font-semibold">Notice Board</p>
        </div>

        <div className="flex flex-col gap-2">
          {NOTICES.map((n, i) => {
            const color = CATEGORY_COLOR[n.category];
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-[#1E1E1E] bg-[#161616] p-4"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#EBEBEB]">{n.title}</span>
                  {n.urgent && (
                    <span className="flex-none px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[rgba(255,77,106,0.12)] text-[#FF4D6A] border border-[rgba(255,77,106,0.25)]">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#ADADAD] leading-relaxed mb-2">{n.body}</p>
                <span className="text-[10px] text-[#3A3A3A] font-medium">{n.date}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
