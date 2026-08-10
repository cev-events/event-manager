// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React from 'react';
import { ArrowRight, ArrowUpRight, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useCommunities } from '@/lib/hooks/useCommunities';
import { useRealtimeEvents } from '@/lib/hooks/useRealtimeEvents';

export default function LandingHomePage() {
  const { communities, loading: communitiesLoading } = useCommunities();
  const { eventsList, loading: eventsLoading } = useRealtimeEvents();

  // Filter out college entity so it is not listed as a student community
  const filteredCommunities = communities.filter(
    (c) => c.slug !== 'college' && c.name.toLowerCase() !== 'college'
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col pt-24 sm:pt-28 font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-20">
        
        {/* Nixtio-Style Dark Hero Canvas Section */}
        <section className="relative w-full rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] text-white p-8 sm:p-16 space-y-10 shadow-xl">
          
          {/* Nixtio Oversized Display Headline */}
          <div className="space-y-6 max-w-4xl pt-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold font-display leading-[0.92] tracking-tight text-white">
              WE CREATE DIGITAL <br />
              <span className="text-neutral-400">EVENT EXPERIENCES</span> <br />
              THAT STAND OUT.
            </h1>

            <p className="text-sm sm:text-lg text-neutral-400 max-w-2xl leading-relaxed font-sans font-normal">
              CEV EVENTS empowers student communities with conflict-free slot booking, multi-day master schedules, direct WebP poster management, and unified campus event discovery.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                href="/events"
                className="nixtio-btn-primary py-4 px-8 text-xs font-bold tracking-widest uppercase text-center flex items-center justify-center gap-2"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/calendar"
                className="nixtio-btn-secondary py-4 px-8 text-xs font-bold text-center tracking-widest uppercase"
              >
                View Schedules
              </Link>
            </div>
          </div>
        </section>

        {/* Nixtio Chapters & Clubs / Communities Section */}
        <section className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-b border-neutral-300 pb-4">
            <span className="text-xs font-mono text-neutral-500 uppercase font-bold tracking-widest">
              001 / Campus Chapters & Clubs
            </span>
            <span className="text-xs text-neutral-500 font-mono">CE VADAKARA</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {communitiesLoading ? (
              <div className="col-span-full py-8 text-center text-xs text-neutral-500 font-mono">Loading communities...</div>
            ) : (
              filteredCommunities.map((c) => (
                <Link
                  key={c.id}
                  href={`/community/${c.slug || c.id}`}
                  className="p-5 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 flex items-center space-x-3 transition-all duration-200 group shadow-sm"
                >
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="w-9 h-9 rounded-xl object-cover border border-neutral-200" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 text-xs font-bold font-display">
                      {c.initials || c.name.slice(0, 2)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-neutral-800 group-hover:text-black truncate font-heading">{c.name}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Nixtio Schedules Section */}
        <section className="space-y-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-300 pb-6">
            <div>
              <span className="text-xs font-mono text-neutral-500 uppercase font-bold tracking-widest">002 / Upcoming Timeline</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0a0a0a] font-display mt-1 tracking-tight">
                SCHEDULES
              </h2>
            </div>
            <Link href="/calendar" className="text-xs text-[#0a0a0a] hover:underline font-bold flex items-center gap-1">
              <span>Open Full Master Calendar</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {eventsLoading ? (
            <div className="p-12 text-neutral-500 text-xs bg-white border border-neutral-200 rounded-2xl text-center italic font-mono">
              Loading campus schedules...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {eventsList.slice(0, 3).map((evt) => (
                <Link
                  key={evt.id}
                  href={`/events/${evt.slug || evt.id}`}
                  className="group rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-100">
                    <img
                      src={evt.poster_url || '/images/poster.webp'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/poster.webp'; }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-mono uppercase font-extrabold text-white bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md">
                        {evt.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
                      <span>{evt.community}</span>
                      <span>{evt.event_date ? new Date(evt.event_date).toLocaleDateString() : 'Scheduled'}</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-[#0a0a0a] font-heading group-hover:text-neutral-600 transition-colors">{evt.title}</h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{evt.description}</p>
                  </div>

                  <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#0a0a0a]">
                    <span>View Schedule Details</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}