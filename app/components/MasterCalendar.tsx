// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ListFilter, Users, ArrowUpRight, Lock, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { generate2LineSummary } from '@/lib/summary';

export interface EventItemData {
  id: string;
  title: string;
  category: string;
  community: string;
  date: string;
  event_date?: string;
  time_slot?: string;
  image?: string;
  poster_url?: string;
  venue?: string;
  redirect_url?: string | null;
  perks?: string | null;
  system_prompt?: string | null;
  description?: string;
  status?: 'closed' | 'live';
  slug?: string;
  community_id?: string;
  community_slug?: string;
  community_color?: string | null;
}

function formatSingleTime12(t: string): string {
  if (!t) return '';
  const trimmed = t.trim();
  if (trimmed.toUpperCase().includes('AM') || trimmed.toUpperCase().includes('PM')) {
    return trimmed;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return trimmed;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${paddedHours}:${minutes} ${ampm}`;
}

function formatTimeSlotTo12Hr(slot?: string): string {
  if (!slot) return '10:00 AM - 04:00 PM';
  if (slot.includes('-')) {
    const parts = slot.split('-');
    return `${formatSingleTime12(parts[0])} - ${formatSingleTime12(parts[1])}`;
  }
  return formatSingleTime12(slot);
}

interface MasterCalendarProps {
  events: EventItemData[];
  communities: Array<{ id: string; name: string; color: string; initials: string }>;
  isManagerView?: boolean;
}

export default function MasterCalendar({ events, communities, isManagerView = false }: MasterCalendarProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'community'>('list');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');

  const filteredEvents = events.filter((evt) => {
    if (!isManagerView && evt.status === 'closed') return false;
    if (selectedCommunity === 'all') return true;
    return evt.community.toLowerCase() === selectedCommunity.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1e2436] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
            <CalendarIcon className="w-5 h-5 text-[#6366f1]" />
            Event List
          </h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Filter and browse all scheduled community events.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#0f121d] border border-[#1e2436]">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
              activeTab === 'list'
                ? 'bg-[#6366f1] text-white font-bold shadow-md border border-[#4f46e5]'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>All Events</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
              activeTab === 'community'
                ? 'bg-[#6366f1] text-white font-bold shadow-md border border-[#4f46e5]'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>By Community</span>
          </button>
        </div>
      </div>

      {activeTab === 'community' && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCommunity('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
              selectedCommunity === 'all'
                ? 'bg-[#6366f1] text-white font-bold border border-[#4f46e5]'
                : 'bg-[#161a29] border border-[#1e2436] text-[#94a3b8] hover:text-white'
            }`}
          >
            All Communities
          </button>
          {communities.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCommunity(c.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                selectedCommunity.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-[#6366f1] text-white font-bold border border-[#4f46e5]'
                  : 'bg-[#161a29] border border-[#1e2436] text-[#94a3b8] hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full p-12 text-center text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-2xl space-y-1">
            <p className="font-semibold text-white text-sm">No scheduled events found.</p>
            <p className="text-xs text-[#94a3b8]">No slot bookings match the selected community filter.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <Link
              key={evt.id}
              href={`/events/${evt.slug || evt.id}`}
              className="brutalist-card p-6 rounded-2xl space-y-4 hover:border-[#6366f1] transition-all cursor-pointer flex flex-col justify-between h-full group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded bg-[#161a29] text-[#6366f1] border border-[#1e2436]">
                    {evt.category}
                  </span>

                  {isManagerView && evt.status === 'closed' ? (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Draft Slot
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#6366f1] transition-colors font-display">
                    {evt.title}
                  </h3>
                  {evt.description && (
                    <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2 leading-relaxed">
                      {generate2LineSummary(evt.description)}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e2436] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                  <span
                    onClick={(e) => {
                      if (evt.community_slug || evt.community_id) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/community/${evt.community_slug || evt.community_id}`;
                      }
                    }}
                    className="font-medium text-white hover:text-[#6366f1] hover:underline cursor-pointer transition-colors"
                  >
                    {evt.community}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#6366f1]" />
                    {evt.date}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#94a3b8] font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatTimeSlotTo12Hr(evt.time_slot)}
                  </span>

                  <span className="text-xs font-semibold text-[#6366f1] group-hover:underline flex items-center space-x-1">
                    <span>Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
