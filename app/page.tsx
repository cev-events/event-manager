// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16">
        
        {/* Nixtio-Style Hero Header Section with GIF background */}
        <section className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] text-white p-8 sm:p-14 lg:p-16 min-h-[520px] sm:min-h-[600px] flex flex-col justify-between shadow-2xl border border-neutral-800">
          {/* Animated Header GIF Background */}
          <img
            src="/header.gif"
            alt="CEV Header Background"
            className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen pointer-events-none z-0"
          />

          {/* Gradient Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-[#0a0a0a]/70 z-[1] pointer-events-none" />

          {/* Top Filler Spacing for Navbar */}
          <div className="relative z-10 hidden sm:block h-6" />

          {/* Hero Main Content */}
          <div className="relative z-10 space-y-8 my-auto pt-6 sm:pt-10">
            {/* Giant Display Headline matching Nixtio reference */}
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-extrabold font-display leading-[0.9] tracking-tight text-white select-none">
              CEV EVENTS
            </h1>

            {/* Stats Line matching Nixtio reference */}
            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-semibold text-neutral-300 border-t border-neutral-800/80 pt-6">
              <span>50+ Campus Events</span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <span>10+ Tech Communities</span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <span>Founded at CE Vadakara</span>
            </div>

            {/* Subtext Description */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-2">
              <p className="md:col-span-8 text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed font-sans font-normal">
                We create digital event experiences that stand out. Unified multi-community event management, conflict-free slot reservation, WebP poster management, and discovery for College of Engineering Vadakara.
              </p>

              {/* Hero Action CTAs */}
              <div className="md:col-span-4 flex flex-wrap items-center gap-3 md:justify-end">
                <Link
                  href="/events"
                  className="py-3.5 px-7 rounded-full bg-white hover:bg-neutral-200 text-[#0a0a0a] font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 shadow-md transition-colors"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/calendar"
                  className="py-3.5 px-7 rounded-full border border-neutral-700 hover:border-white text-white font-extrabold text-xs tracking-wider uppercase hover:bg-neutral-900 transition-colors"
                >
                  View Calendar
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Nixtio "Our Clients" Style Clubs / Communities Grid Cards */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-neutral-300 pb-4">
            <span className="text-xs font-mono text-neutral-500 uppercase font-bold tracking-widest">
              001 / Our Communities
            </span>
            <span className="text-xs text-neutral-500 font-mono font-bold">CE VADAKARA</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {communitiesLoading ? (
              <div className="col-span-full py-12 text-center text-xs text-neutral-500 font-mono">Loading campus communities...</div>
            ) : (
              filteredCommunities.map((c) => (
                <Link
                  key={c.id}
                  href={`/community/${c.slug || c.id}`}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col items-center justify-center space-y-3 shadow-sm hover:shadow-md hover:border-neutral-400 transition-all duration-200 group h-36 min-h-[140px] text-center"
                >
                  {c.logo_url ? (
                    <img
                      src={c.logo_url}
                      alt={c.name}
                      className="h-10 w-auto max-w-[80px] object-contain transition-transform group-hover:scale-110 duration-200"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 text-xs font-bold font-display group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                      {c.initials || c.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <span className="text-xs font-bold text-[#0a0a0a] group-hover:text-black truncate font-heading max-w-full">
                    {c.name}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Upcoming Schedules Section */}
        <section className="space-y-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-300 pb-6">
            <div>
              <span className="text-xs font-mono text-neutral-500 uppercase font-bold tracking-widest">002 / Upcoming Timeline</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0a0a0a] font-display mt-1 tracking-tight">
                SCHEDULES
              </h2>
            </div>
            <Link href="/calendar" className="text-xs text-[#0a0a0a] hover:underline font-bold flex items-center gap-1">
              <span>Open Master Calendar</span> <ArrowRight className="w-3.5 h-3.5" />
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