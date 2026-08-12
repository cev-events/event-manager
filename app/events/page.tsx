// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React from 'react';
import MasterCalendar from '@/app/components/MasterCalendar';
import { Calendar } from 'lucide-react';
import { useRealtimeEvents } from '@/lib/hooks/useRealtimeEvents';
import { useCommunities } from '@/lib/hooks/useCommunities';

export default function EventsDiscoveryPage() {
  const { eventsList, loading: eventsLoading } = useRealtimeEvents();
  const { communities, loading: communitiesLoading } = useCommunities();

  const loading = eventsLoading || communitiesLoading;

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col pt-28 md:pt-32 pb-20 md:pb-12 font-sans">
      <main className="flex-1 w-[96%] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-300 pb-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono text-neutral-500 uppercase font-bold tracking-widest">
              001 / Campus Event Directory
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0a0a0a] font-display leading-[0.95]">
              DISCOVER CAMPUS INITIATIVES
            </h1>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed font-sans">
              Explore live workshops, hackathons, guest lectures, and technical sessions organized by student chapters across CE Vadakara.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[400px] rounded-[24px] bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" />

              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                Loading events
              </span>
            </div>
          </div>
        ) : (
          <MasterCalendar events={eventsList} communities={communities} isManagerView={false} />
        )}
      </main>
    </div>
  );
}
