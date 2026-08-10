// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React from 'react';
import { ArrowRight, Calendar as CalendarIcon, MessageSquare, Layers, Sparkles, Building, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useCommunities } from '@/lib/hooks/useCommunities';
import { useRealtimeEvents } from '@/lib/hooks/useRealtimeEvents';

export default function LandingHomePage() {
  const { communities, loading: communitiesLoading } = useCommunities();
  const { eventsList, loading: eventsLoading } = useRealtimeEvents();

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f8fafc] flex flex-col pt-28 md:pt-36">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-28">
        
        {/* Nixtio Editorial Hero Section */}
        <section className="space-y-12 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161a29] border border-[#1e2436] text-xs font-mono text-[#6366f1]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>000 / CE Vadakara Unified Hub</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display leading-[0.95] max-w-4xl">
            THE CENTRAL <br />
            <span className="text-[#6366f1]">EVENT ECOSYSTEM</span> <br />
            FOR CE VADAKARA
          </h1>

          <p className="text-base sm:text-lg text-[#94a3b8] max-w-2xl leading-relaxed font-sans font-normal">
            Discover technical symposiums, hackathons, workshops, and cultural events published by IEEE, IEDC, TinkerHub, FOSS Club, and MuLearn at College of Engineering Vadakara.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              href="/events"
              className="brutalist-btn-primary py-4 px-8 rounded-xl text-xs font-extrabold tracking-widest uppercase text-center flex items-center justify-center gap-2"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/calendar"
              className="brutalist-btn-secondary py-4 px-8 rounded-xl text-xs font-bold text-center tracking-widest uppercase"
            >
              Master Calendar
            </Link>
          </div>

          {/* Nixtio Credibility Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 border-t border-[#1e2436]">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-display">05+</div>
              <div className="text-xs text-[#94a3b8] uppercase font-mono mt-1">Student Communities</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#6366f1] font-display">100%</div>
              <div className="text-xs text-[#94a3b8] uppercase font-mono mt-1">Verified Schedules</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-display">2026</div>
              <div className="text-xs text-[#94a3b8] uppercase font-mono mt-1">Platform Edition</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-display">24/7</div>
              <div className="text-xs text-[#94a3b8] uppercase font-mono mt-1">Realtime Discovery</div>
            </div>
          </div>
        </section>

        {/* Section 001: Core Platform Architecture */}
        <section className="space-y-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1e2436] pb-6">
            <div>
              <span className="text-xs font-mono text-[#6366f1] uppercase font-bold tracking-widest">001 / Capabilities</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display mt-1">
                ENGINEERED FOR CAMPUS IMPACT
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="brutalist-card p-8 rounded-2xl space-y-4 bg-[#0f121d] border border-[#1e2436] hover:border-[#6366f1]/50 transition-all">
              <div className="p-3 w-fit rounded-xl bg-[#161a29] text-white border border-[#1e2436]">
                <CalendarIcon className="w-6 h-6 text-[#6366f1]" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading">Master Calendar & Slot Booking</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Conflict-free slot booking engine for community managers with connected multi-day banners and real-time public synchronization.
              </p>
            </div>

            <div className="brutalist-card p-8 rounded-2xl space-y-4 bg-[#0f121d] border border-[#1e2436] hover:border-[#6366f1]/50 transition-all">
              <div className="p-3 w-fit rounded-xl bg-[#161a29] text-white border border-[#1e2436]">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading">Contextual Event AI Assistant</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Instant intelligence regarding event venues, prerequisites, registration links, schedules, and community leads.
              </p>
            </div>

            <div className="brutalist-card p-8 rounded-2xl space-y-4 bg-[#0f121d] border border-[#1e2436] hover:border-[#6366f1]/50 transition-all">
              <div className="p-3 w-fit rounded-xl bg-[#161a29] text-white border border-[#1e2436]">
                <Layers className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading">Multi-Community Network</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Centralized discovery portal uniting IEEE, IEDC, TinkerHub, FOSS, and MuLearn initiatives under one digital roof.
              </p>
            </div>
          </div>
        </section>

        {/* Section 002: Student Communities Directory */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1e2436] pb-6">
            <div>
              <span className="text-xs font-mono text-[#6366f1] uppercase font-bold tracking-widest">002 / Organizations</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display mt-1">
                CAMPUS COMMUNITIES & CLUBS
              </h2>
            </div>
            <Link href="/community" className="text-xs text-[#6366f1] hover:underline font-bold flex items-center gap-1">
              <span>All Communities</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {communitiesLoading ? (
            <div className="p-12 text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-2xl text-center italic">
              Loading technical communities...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {communities.map((c, index) => (
                <Link
                  key={c.id}
                  href={`/community/${c.slug || c.id}`}
                  className="brutalist-card p-6 rounded-2xl flex flex-col justify-between space-y-4 bg-[#0f121d] border border-[#1e2436] hover:border-[#6366f1] transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">00{index + 1}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-[#6366f1] transition-colors" />
                    </div>
                    {c.logo_url ? (
                      <img
                        src={c.logo_url}
                        alt={c.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#1e2436]"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#161a29] border border-[#1e2436] flex items-center justify-center text-white font-extrabold text-sm font-display">
                        {c.initials || c.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white text-base font-heading group-hover:text-[#6366f1] transition-colors">{c.name}</h3>
                      <p className="text-xs text-[#94a3b8] line-clamp-2 mt-1">{c.description || 'Campus community chapter.'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Section 003: Featured Events Showcase */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1e2436] pb-6">
            <div>
              <span className="text-xs font-mono text-[#6366f1] uppercase font-bold tracking-widest">003 / Showcase</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display mt-1">
                FEATURED INITIATIVES
              </h2>
            </div>
            <Link href="/events" className="text-xs text-[#6366f1] hover:underline font-bold flex items-center gap-1">
              <span>View All Events</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {eventsLoading ? (
            <div className="p-12 text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-2xl text-center italic">
              Loading upcoming initiatives...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventsList.slice(0, 3).map((evt) => (
                <Link
                  key={evt.id}
                  href={`/events/${evt.slug || evt.id}`}
                  className="brutalist-card p-6 rounded-2xl flex flex-col justify-between space-y-6 bg-[#0f121d] border border-[#1e2436] hover:border-[#6366f1] transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#6366f1] bg-[#161a29] px-2.5 py-1 rounded-md border border-[#1e2436]">
                        {evt.category}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{evt.event_date || evt.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white font-heading group-hover:text-[#6366f1] transition-colors">{evt.title}</h3>
                    <p className="text-xs text-[#94a3b8] line-clamp-3 leading-relaxed">{evt.description}</p>
                  </div>

                  <div className="pt-4 border-t border-[#1e2436] flex items-center justify-between text-xs text-[#94a3b8]">
                    <span className="hover:text-white font-semibold transition-colors">
                      {evt.community}
                    </span>
                    <span className="text-[#6366f1] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>View</span> &rarr;
                    </span>
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