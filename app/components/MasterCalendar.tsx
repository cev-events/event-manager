// Created by Shibili Aman TK | GitHub: [https://github.com/LordSA](https://github.com/LordSA)
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowUpRight,
  Lock,
  CheckCircle2,
  ListFilter,
  Users,
} from 'lucide-react';
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
    if (!isManagerView && evt.status !== 'live') return false;

    if (
      !isManagerView &&
      ['college schedule', 'exam'].includes(
        evt.category?.trim().toLowerCase()
      )
    ) {
      return false;
    }

    if (selectedCommunity === 'all') return true;

    return (
      (evt.community || '').toLowerCase() ===
      selectedCommunity.toLowerCase()
    );
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
    <div className="space-y-8">
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
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-2 transition-all ${activeTab === 'list'
                ? 'bg-[#0a0a0a] text-white font-bold shadow-sm'
                : 'text-neutral-600 hover:text-black'
              }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>All Events</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-2 transition-all ${activeTab === 'community'
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
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${selectedCommunity === 'all'
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${selectedCommunity.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-[#0a0a0a] text-white font-bold'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-black shadow-sm'
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 sm:gap-1">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full min-h-[400px] p-12 text-center text-neutral-500 text-xs bg-white rounded-[24px] flex flex-col items-center justify-center space-y-1">
            <p className="font-bold text-[#0a0a0a] text-sm">
              No scheduled events found.
            </p>

            <p className="text-xs text-neutral-500">
              No slot bookings match the selected community filter.
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <Link
              key={evt.id}
              href={`/events/${evt.slug || evt.id}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-[24px] bg-white block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-2xl"
            >
              <div className="absolute inset-0 overflow-hidden opacity-100 scale-100 md:opacity-0 md:scale-[1.04] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:group-hover:opacity-100 md:group-hover:scale-100">
                <img
                  src={
                    evt.poster_url ||
                    evt.image ||
                    '/images/poster.webp'
                  }
                  alt={evt.title}
                  className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out md:group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/images/poster.webp';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
              </div>

              <div className="relative z-10 h-full p-6 sm:p-7 lg:p-8 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-white md:text-neutral-500 md:group-hover:text-white transition-colors duration-500">
                    {evt.category || 'EVENT'}
                  </span>

                  {isManagerView && evt.status === 'closed' ? (
                    <span className="text-[10px] font-semibold text-white bg-white/15 border border-white/30 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 md:text-amber-700 md:bg-amber-50 md:border-amber-200 md:group-hover:bg-white/15 md:group-hover:text-white md:group-hover:border-white/20 transition-all duration-500">
                      <Lock className="w-3 h-3" />
                      Draft
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-white bg-white/15 border border-white/30 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 md:text-emerald-700 md:bg-emerald-50 md:border-emerald-200 md:group-hover:bg-white/15 md:group-hover:text-white md:group-hover:border-white/20 transition-all duration-500">
                      <CheckCircle2 className="w-3 h-3" />
                      Live
                    </span>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl sm:text-2xl lg:text-[2rem] font-extrabold leading-[0.95] tracking-[-0.035em] font-display text-white md:text-[#0a0a0a] md:group-hover:text-white transition-colors duration-500">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="mt-4 text-sm leading-relaxed text-white/75 md:text-neutral-500 md:group-hover:text-white/70 transition-colors duration-500 line-clamp-3">
                        {generate2LineSummary(evt.description)}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/20 md:border-neutral-200 md:group-hover:border-white/20 transition-colors duration-500">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        onClick={(e) => {
                          if (evt.community_slug || evt.community_id) {
                            e.preventDefault();
                            e.stopPropagation();

                            window.location.href = `/community/${evt.community_slug || evt.community_id
                              }`;
                          }
                        }}
                        className="text-xs font-bold text-white md:text-[#0a0a0a] hover:underline cursor-pointer md:group-hover:text-white transition-colors duration-500 truncate"
                      >
                        {evt.community}
                      </span>

                      <span className="text-[10px] font-mono text-white/70 md:text-neutral-500 md:group-hover:text-white/70 transition-colors duration-500 shrink-0">
                        {evt.date}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[11px] text-white/70 md:text-neutral-500 font-mono flex items-center gap-1.5 md:group-hover:text-white/70 transition-colors duration-500">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimeSlotTo12Hr(evt.time_slot)}
                      </span>

                      <span className="w-10 h-10 rounded-full bg-white text-black md:bg-[#0a0a0a] md:text-white flex items-center justify-center transition-all duration-500 md:group-hover:bg-white md:group-hover:text-black md:group-hover:rotate-[-45deg]">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}