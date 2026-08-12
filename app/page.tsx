// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCommunities } from '@/lib/hooks/useCommunities';
import { useRealtimeEvents } from '@/lib/hooks/useRealtimeEvents';

export default function LandingHomePage() {
  const { communities, loading: communitiesLoading } = useCommunities();
  const { eventsList, loading: eventsLoading } = useRealtimeEvents();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter out college entity so it is not listed as a student community
  const filteredCommunities = communities.filter(
    (c) => c.slug !== 'college' && c.name.toLowerCase() !== 'college'
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col font-sans">
      <main className="flex-1 w-full pb-24 space-y-5">

        {/* Full-Screen Nixtio-Style Hero Header Card Container (All 4 Corners Rounded in State 1) */}
        <div className={`mx-auto pt-1 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? "w-[92%] sm:w-[94%] lg:w-[95%]" : "w-[99%]"}`}>
          <section
            id="hero-section"
            className={`relative w-full overflow-hidden bg-[#0a0a0a] text-white flex flex-col justify-between shadow-2xl border border-neutral-800/80 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled
              ? `min-h-[70vh] sm:min-h-[72vh] lg:min-h-[75vh] rounded-[0.8rem] sm:rounded-[0.9rem] lg:rounded-[1rem] p-4 sm:p-7 lg:p-9` : `min-h-[92vh] sm:min-h-[95vh] lg:min-h-[99vh] rounded-[0.9rem] sm:rounded-[1.1rem] lg:rounded-[1.3rem] p-6 sm:p-12 lg:p-16`}`}
          >
            {/* Animated Header GIF Background */}
            <img
              src="/header.gif"
              alt="CEV Header Background"
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-screen pointer-events-none z-0"
            />

            {/* Gradient Overlay for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-[#0a0a0a]/70 z-[1] pointer-events-none" />

            {/* Top Filler Spacing for Layered Floating Navbar */}
            <div className={`relative z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? "pt-8 sm:pt-10" : "pt-24 sm:pt-28"}`} />

            {/* Hero Oversized Display Title matching Nixtio reference */}
            <div className={`relative z-10 my-auto transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? "pt-1" : "pt-4"}`}>
              <h1 className={`font-extrabold font-display leading-[0.82] tracking-tight text-white select-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? "text-5xl sm:text-7xl md:text-[8rem] lg:text-[9rem] xl:text-[10rem]" : "text-7xl sm:text-9xl md:text-[11rem] lg:text-[13rem] xl:text-[15rem]"}`} >
                CEV EVENTS
              </h1>
            </div>

            {/* Alignment of Title and Content of Header matching Nixtio Web */}
            <div className={`relative z-10 grid grid-cols-1 md:grid-cols-12 items-end border-t border-neutral-800/80 mt-auto transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? "gap-5 pt-4 sm:pt-5" : "gap-8 pt-8"}`}>

              {/* Left Column: Stats Line & Subtext */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold text-neutral-300">
                  <span>50+ Campus Events</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                  <span>10+ Tech Communities</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                  <span>Founded at CE Vadakara</span>
                </div>

                <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl leading-relaxed font-sans">
                  We create digital event experiences that stand out. Unified multi-community event management, conflict-free slot reservation, WebP poster management, and discovery for College of Engineering Vadakara.
                </p>
              </div>

              {/* Right Column: Hero Action CTAs & Bottom Corner Widget */}
              <div className="md:col-span-5 flex flex-col items-start md:items-end justify-end space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/events"
                    className="py-4 px-8 rounded-full bg-white hover:bg-neutral-200 text-[#0a0a0a] font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg transition-colors"
                  >
                    <span>Explore Events</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/calendar"
                    className="py-4 px-8 rounded-full border border-neutral-700 hover:border-white text-white font-extrabold text-xs tracking-wider uppercase hover:bg-neutral-900 transition-colors"
                  >
                    View Calendar
                  </Link>
                </div>



              </div>
            </div>
          </section>
        </div>

        {/* Nixtio "Our Clients" Style Clubs / Communities Grid Cards */}
        <section className="space-y-8 pt-8 px-4 sm:px-8 max-w-[1800px] mx-auto">

          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <span className="text-xs font-mono text-neutral-500 uppercase font-bold tracking-widest">
              Our Communities
            </span>

            <span className="text-xs text-neutral-500 font-mono font-bold">
              CE VADAKARA
            </span>
          </div>

          {/* Community Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2">

            {communitiesLoading ? (
              <div className="col-span-full py-12 text-center text-xs text-neutral-500 font-mono">
                Loading campus communities...
              </div>
            ) : (
              filteredCommunities.map((c) => (
                <Link
                  key={c.id}
                  href={`/community/${c.slug || c.id}`}
                  className="group bg-white rounded-[24px] h-[150px] sm:h-[165px] flex items-center justify-center p-6 overflow-hidden transition-all duration-300 hover:scale-[1.015] hover:shadow-lg"
                >
                  {c.logo_url ? (
                    <img
                      src={c.logo_url}
                      alt={c.name}
                      className="max-h-12 sm:max-h-14 max-w-[150px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800 text-sm font-bold font-display transition-all duration-300 group-hover:bg-neutral-900 group-hover:text-white">
                      {c.initials || c.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </Link>
              ))
            )}

          </div>
        </section>

        {/* Upcoming Schedules Section */}
        <section className="space-y-8 pt-4 px-4 sm:px-8 max-w-[1800px] mx-auto">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-300 pb-6">
            <div>
              <span className="text-xs font-mono text-neutral-500 uppercase font-bold tracking-widest">
                002 / Upcoming Timeline
              </span>

              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0a0a0a] font-display mt-1 tracking-tight">
                SCHEDULES
              </h2>
            </div>

            <Link
              href="/calendar"
              className="text-xs text-[#0a0a0a] hover:underline font-bold flex items-center gap-1 mb-1"
            >
              <span>Open Master Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {eventsLoading ? (
            <div className="p-12 text-neutral-500 text-xs bg-white rounded-[24px] text-center italic font-mono">
              Loading campus schedules...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 sm:gap-2">

              {eventsList
                .filter((evt) => evt.status === "live")
                .slice(0, 3)
                .map((evt, index) => (
                  <Link
                    key={evt.id}
                    href={`/events/${evt.slug || evt.id}`}
                    className="group relative bg-white rounded-[24px] overflow-hidden min-h-[520px] sm:min-h-[600px] lg:min-h-[680px] flex flex-col justify-between p-6 sm:p-8 transition-all duration-500 hover:scale-[0.99] hover:shadow-xl"
                  >

                    {/* Poster */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={evt.poster_url || "/images/poster.webp"}
                        alt={evt.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/images/poster.webp";
                        }}
                      />

                      {/* Image overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
                    </div>

                    {/* Top information */}
                    <div className="relative z-10 flex items-start justify-between gap-4">

                      <span className="text-[10px] font-mono uppercase font-extrabold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                        {evt.category}
                      </span>

                      <span className="text-[10px] font-mono uppercase font-bold text-white bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">
                        {evt.community}
                      </span>

                    </div>

                    {/* Bottom information */}
                    <div className="relative z-10 text-white space-y-4">

                      <div className="flex items-center gap-3 text-xs font-mono text-white/70">
                        <span>{evt.date || evt.event_date}</span>
                      </div>

                      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[0.95] tracking-tight font-display">
                        {evt.title}
                      </h3>

                      <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          View Event
                        </span>

                        <span className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-300 group-hover:rotate-[-45deg]">
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>

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