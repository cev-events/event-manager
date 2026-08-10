// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, ArrowUpRight, Lock, CheckCircle2, ListFilter, Users } from 'lucide-react';
import { generate2LineSummary } from '@/lib/summary';
import { Community } from '@/types/database.types';

export interface EventItemData {
  id: string;
  title: string;
  community: string;
  community_id?: string;
  community_slug?: string;
  category: string;
  date: string;
  event_date?: string;
  start_date?: string;
  end_date?: string;
  time_slot: string;
  venue: string;
  description: string;
  status: 'live' | 'closed';
  slug?: string;
  is_multi_day?: boolean;
  poster_url?: string;
  image?: string;
}

interface MasterCalendarProps {
  events: EventItemData[];
  communities: Community[];
  isManagerView?: boolean;
}

export default function MasterCalendar({
  events,
  communities,
  isManagerView = false,
}: MasterCalendarProps) {
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'community'>('list');

  const filteredEvents = events.filter((evt) => {
    if (selectedCommunity === 'all') return true;
    return (evt.community || '').toLowerCase() === selectedCommunity.toLowerCase();
  });

  const formatTimeSlotTo12Hr = (slot?: string | null): string => {
    if (!slot) return 'Full Day';
    const cleanSlot = slot.trim();
    if (cleanSlot.includes('-')) {
      const parts = cleanSlot.split('-');
      const formatPart = (p: string) => {
        const trimmed = p.trim();
        if (trimmed.includes(':')) {
          const [h, m] = trimmed.split(':').map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            const period = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 === 0 ? 12 : h % 12;
            return `${h12}:${String(m).padStart(2, '0')} ${period}`;
          }
        }
        return trimmed;
      };
      return `${formatPart(parts[0])} - ${formatPart(parts[1])}`;
    }
    return cleanSlot;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-300 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0a0a0a] flex items-center gap-2 font-display">
            <CalendarIcon className="w-5 h-5 text-neutral-700" />
            Event List
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            Filter and browse all scheduled community events.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 rounded-full bg-white border border-neutral-200 shadow-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'list'
                ? 'bg-[#0a0a0a] text-white font-bold shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>All Events</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'community'
                ? 'bg-[#0a0a0a] text-white font-bold shadow-sm'
                : 'text-neutral-600 hover:text-black'
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
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              selectedCommunity === 'all'
                ? 'bg-[#0a0a0a] text-white font-bold'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:text-black shadow-sm'
            }`}
          >
            All Communities
          </button>
          {communities.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCommunity(c.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                selectedCommunity.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-[#0a0a0a] text-white font-bold'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-black shadow-sm'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full p-12 text-center text-neutral-500 text-xs bg-white border border-neutral-200 rounded-2xl space-y-1 shadow-sm">
            <p className="font-bold text-[#0a0a0a] text-sm">No scheduled events found.</p>
            <p className="text-xs text-neutral-500">No slot bookings match the selected community filter.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <Link
              key={evt.id}
              href={`/events/${evt.slug || evt.id}`}
              className="p-6 rounded-2xl space-y-4 hover:border-neutral-400 transition-all cursor-pointer flex flex-col justify-between h-full group bg-white border border-neutral-200 shadow-sm hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {evt.category}
                  </span>

                  {isManagerView && evt.status === 'closed' ? (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Draft Slot
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-[#0a0a0a] group-hover:text-neutral-600 transition-colors font-heading">
                    {evt.title}
                  </h3>
                  {evt.description && (
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                      {generate2LineSummary(evt.description)}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span
                    onClick={(e) => {
                      if (evt.community_slug || evt.community_id) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/community/${evt.community_slug || evt.community_id}`;
                      }
                    }}
                    className="font-bold text-[#0a0a0a] hover:underline cursor-pointer transition-colors"
                  >
                    {evt.community}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-500">
                    <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
                    {evt.date}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-500 font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    {formatTimeSlotTo12Hr(evt.time_slot)}
                  </span>

                  <span className="text-xs font-bold text-[#0a0a0a] group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
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
