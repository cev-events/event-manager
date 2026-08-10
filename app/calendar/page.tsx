// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React from 'react';
import GoogleCalendarView from '@/app/components/GoogleCalendarView';
import { useRealtimeEvents } from '@/lib/hooks/useRealtimeEvents';
import { useCommunities } from '@/lib/hooks/useCommunities';

export default function PublicCalendarPage() {
  const { eventsList, loading: eventsLoading } = useRealtimeEvents();
  const { communities, loading: communitiesLoading } = useCommunities();

  const loading = eventsLoading || communitiesLoading;

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col pt-24 md:pt-28">
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="p-12 text-center text-neutral-500 text-sm bg-white border border-neutral-200 rounded-2xl italic shadow-sm">
            Loading calendar events...
          </div>
        ) : (
          <GoogleCalendarView events={eventsList} communities={communities} />
        )}
      </main>
    </div>
  );
}
