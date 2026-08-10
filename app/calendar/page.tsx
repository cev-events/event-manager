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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col pt-20 md:pt-24 pb-0">
      <main className="flex-1 w-full px-2 sm:px-4 lg:px-6 pb-6">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 text-sm bg-neutral-900 border border-neutral-800 rounded-2xl italic shadow-sm">
            Loading calendar events...
          </div>
        ) : (
          <GoogleCalendarView events={eventsList} communities={communities} />
        )}
      </main>
    </div>
  );
}
