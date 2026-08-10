// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState } from 'react';
import { ArrowRight, Calendar as CalendarIcon, MessageSquare, Layers, Sparkles, Building, ArrowUpRight, ChevronDown, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCommunities } from '@/lib/hooks/useCommunities';
import { useRealtimeEvents } from '@/lib/hooks/useRealtimeEvents';

export default function LandingHomePage() {
  const { communities, loading: communitiesLoading } = useCommunities();
  const { eventsList, loading: eventsLoading } = useRealtimeEvents();

  const [expandedService, setExpandedService] = useState<number | null>(1);

  const toggleService = (id: number) => {
    setExpandedService(expandedService === id ? null : id);
  };

  const services = [
    {
      id: 1,
      num: '001',
      title: 'Master Calendar & Slot Booking Engine',
      subtitle: 'Conflict-Free Event Reservations & Multi-Day Timeline',
      description:
        'Unified master scheduling platform with connected multi-day horizontal banners, real-time Supabase synchronization, and automated slot reservation rules.',
      tags: ['Month & Week Views', 'Conflict Prevention', 'Reserved Slot Privacy', 'Multi-Day Horizontal Banners', 'W3C Color Contrast'],
    },
    {
      id: 2,
      num: '002',
      title: 'AI Contextual Event Assistant',
      subtitle: 'Real-Time Campus Event Intelligence',
      description:
        'Contextual AI assistant powered by multi-provider LLM fallbacks (Gemini, Grok, OpenRouter) providing instant answers on venue locations, schedules, guidelines, and registration forms.',
      tags: ['Venue Guidance', 'Schedule FAQs', 'Multi-Provider Fallback', 'Direct Registration Links', 'Contextual Drawers'],
    },
    {
      id: 3,
      num: '003',
      title: 'Multi-Community Publishing Network',
      subtitle: 'Unified Campus Organizations Directory',
      description:
        'Centralized showcase for IEEE SB, IEDC, TinkerHub, FOSS Club, and MuLearn at College of Engineering Vadakara, allowing leads to publish initiatives seamlessly.',
      tags: ['IEEE SB CEV', 'IEDC CEV', 'TinkerHub CEV', 'FOSS Club CEV', 'MuLearn CEV', 'College Entity Isolation'],
    },
    {
      id: 4,
      num: '004',
      title: 'Direct WebP Image Asset Uploads',
      subtitle: 'High-Performance Dual Storage Pipeline',
      description:
        'Automated client-side WebP image conversion with live progress bar feedback (`Uploading 65%...`) utilizing Vercel Blob Storage with Supabase Storage fallbacks.',
      tags: ['WebP Auto-Conversion', '@vercel/blob Storage', 'Supabase Bucket Fallback', 'Live Progress Tracker', 'Zero Quality Loss'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f8fafc] flex flex-col pt-24 sm:pt-28">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-24">
        
        {/* Nixtio-Style Hero Canvas Section */}
        <section className="relative w-full rounded-[2rem] overflow-hidden bg-[#0f121d] border-2 border-[#1e2436] p-8 sm:p-14 lg:p-16 space-y-12 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 via-transparent to-transparent pointer-events-none" />

          {/* Top Logo & Pill Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e2436] pb-6 relative z-10">
            <div className="flex items-center gap-3">
              <img src="/cev_logo.svg" alt="CEV EVENTS" className="h-8 w-auto object-contain" />
              <span className="font-mono text-xs text-slate-400 font-bold uppercase tracking-widest">
                CEVadakara Official Event System
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#6366f1] bg-[#161a29] px-3 py-1 rounded-full border border-[#1e2436]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>2026 Edition</span>
            </div>
          </div>

          {/* Nixtio Oversized Display Headline */}
          <div className="space-y-6 relative z-10 max-w-5xl">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white font-display leading-[0.92] tracking-tight">
              WE CREATE DIGITAL <br />
              <span className="text-[#6366f1]">EVENT EXPERIENCES</span> <br />
              THAT STAND OUT.
            </h1>

            <p className="text-sm sm:text-lg text-[#94a3b8] max-w-2xl leading-relaxed font-sans font-normal">
              CEV EVENTS empowers campus communities with conflict-free slot booking, AI event intelligence, WebP asset pipelines, and unified public discovery.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                href="/events"
                className="brutalist-btn-primary py-4 px-8 rounded-xl text-xs font-extrabold tracking-widest uppercase text-center flex items-center justify-center gap-2"
              >
                <span>Explore All Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/calendar"
                className="brutalist-btn-secondary py-4 px-8 rounded-xl text-xs font-bold text-center tracking-widest uppercase"
              >
                Master Calendar
              </Link>
            </div>
          </div>

          {/* Nixtio Stat Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[#1e2436] relative z-10">
            <div>
              <div className="text-2xl sm:text-4xl font-extrabold text-white font-display">05+</div>
              <div className="text-xs text-[#94a3b8] uppercase font-mono mt-1">Campus Communities</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-extrabold text-[#6366f1] font-display">100%</div>
              <div className="text-xs text-[#94a3b8] uppercase font-mono mt-1">Conflict-Free Slots</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 font-display">WebP</div>
              <div className="text-xs text-[#94a3b8] uppercase font-mono mt-1">Vercel Blob Storage</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-extrabold text-cyan-400 font-display">2026</div>
              <div className="text-xs text-[#94a3b8] uppercase font-mono mt-1">CE Vadakara Hub</div>
            </div>
          </div>
        </section>

        {/* Nixtio Client / Community Marquee Logo Strip */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-[#1e2436] pb-4">
            <span className="text-xs font-mono text-[#6366f1] uppercase font-bold tracking-widest">
              001 / Our Technical Chapters & Clubs
            </span>
            <span className="text-xs text-slate-500 font-mono">CE VADAKARA</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {communitiesLoading ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-500 font-mono">Loading communities...</div>
            ) : (
              communities.map((c) => (
                <Link
                  key={c.id}
                  href={`/community/${c.slug || c.id}`}
                  className="p-4 rounded-xl bg-[#0f121d] border border-[#1e2436] hover:border-[#6366f1] flex items-center space-x-3 transition-all group"
                >
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="w-8 h-8 rounded-lg object-cover border border-[#1e2436]" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#161a29] border border-[#1e2436] flex items-center justify-center text-white text-xs font-bold font-display">
                      {c.initials || c.name.slice(0, 2)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white truncate font-heading">{c.name}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Nixtio Numbered Services Accordion Section */}
        <section className="space-y-8 pt-6">
          <div className="border-b border-[#1e2436] pb-6">
            <span className="text-xs font-mono text-[#6366f1] uppercase font-bold tracking-widest">002 / Platform Architecture</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display mt-1">
              SERVICES & CAPABILITIES
            </h2>
          </div>

          <div className="space-y-4">
            {services.map((s) => {
              const isOpen = expandedService === s.id;
              return (
                <div
                  key={s.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen ? 'bg-[#0f121d] border-[#6366f1]' : 'bg-[#0f121d]/60 border-[#1e2436] hover:border-slate-600'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className="w-full p-6 sm:p-8 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <div className="flex items-center space-x-6">
                      <span className="text-lg sm:text-2xl font-mono font-bold text-[#6366f1]">{s.num}</span>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading">{s.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{s.subtitle}</p>
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-full border border-[#1e2436] text-white transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-[#6366f1]' : 'bg-[#161a29]'
                      }`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-8 sm:px-8 sm:pb-8 pt-0 border-t border-[#1e2436]/60 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed max-w-3xl pt-4">
                        {s.description}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {s.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-mono text-[#6366f1] bg-[#161a29] px-3 py-1 rounded-full border border-[#1e2436]"
                          >
                            • {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Nixtio Featured Projects / Case Studies Showcase */}
        <section className="space-y-8 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1e2436] pb-6">
            <div>
              <span className="text-xs font-mono text-[#6366f1] uppercase font-bold tracking-widest">003 / Selected Case Studies</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display mt-1">
                FEATURED INITIATIVES
              </h2>
            </div>
            <Link href="/events" className="text-xs text-[#6366f1] hover:underline font-bold flex items-center gap-1">
              <span>View All Projects</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {eventsLoading ? (
            <div className="p-12 text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-2xl text-center italic font-mono">
              Loading selected event cases...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {eventsList.slice(0, 3).map((evt) => (
                <Link
                  key={evt.id}
                  href={`/events/${evt.slug || evt.id}`}
                  className="group rounded-2xl bg-[#0f121d] border-2 border-[#1e2436] hover:border-[#6366f1] overflow-hidden flex flex-col justify-between transition-all duration-300"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#161a29]">
                    <img
                      src={evt.poster_url || '/images/poster.webp'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/poster.webp'; }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-mono uppercase font-extrabold text-white bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                        {evt.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>{evt.community}</span>
                      <span>2026</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white font-heading group-hover:text-[#6366f1] transition-colors">{evt.title}</h3>
                    <p className="text-xs text-[#94a3b8] line-clamp-2 leading-relaxed">{evt.description}</p>
                  </div>

                  <div className="px-6 py-4 border-t border-[#1e2436] flex items-center justify-between text-xs font-bold text-[#6366f1]">
                    <span>View Case Study</span>
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