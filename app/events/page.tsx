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
    <div className="min-h-screen bg-[#08090d] text-[#f8fafc] flex flex-col pt-28 md:pt-32 pb-20 md:pb-12 font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1e2436] pb-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono text-[#6366f1] uppercase font-bold tracking-widest">
              001 / Campus Event Directory
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-display leading-[0.95]">
              DISCOVER CAMPUS INITIATIVES
            </h1>
            <p className="text-[#94a3b8] text-xs sm:text-sm leading-relaxed font-sans">
              Explore live workshops, hackathons, guest lectures, and technical sessions organized by student chapters across CE Vadakara.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-2xl">
            Loading campus events...
          </div>
        ) : (
          <MasterCalendar events={eventsList} communities={communities} isManagerView={false} />
        )}
      </main>
    </div>
  );
}
