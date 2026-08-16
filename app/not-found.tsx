// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Compass, Calendar, Home } from 'lucide-react';

export default function NotFound() {
  useEffect(() => {
    document.body.classList.add('hide-nav-footer');
    return () => {
      document.body.classList.remove('hide-nav-footer');
    };
  }, []);

  return (
    <div id="not-found-page" className="min-h-screen bg-[#08090d] text-white flex flex-col justify-between p-6 sm:p-12 lg:p-16 font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366f1]/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/cev_logo.svg" alt="CEV Logo" className="h-8 w-auto object-contain" />
          <span className="text-lg font-extrabold font-display tracking-tight">
            CEV <span className="text-neutral-400 font-light">EVENTS</span>
          </span>
        </Link>
        <span className="text-xs font-mono text-neutral-400 uppercase font-bold tracking-widest">
          404 / Error Page
        </span>
      </div>

      <div className="relative z-10 my-auto py-16 space-y-8 max-w-4xl mx-auto text-center">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#818cf8] px-3 py-1 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20">
            HTTP 404 • Resource Not Found
          </span>
          <h1 className="text-7xl sm:text-9xl md:text-[12rem] font-extrabold font-display leading-none tracking-tight text-white select-none">
            404
          </h1>
        </div>

        <div className="space-y-4 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            LOOKS LIKE YOU GOT LOST
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans">
            The page, campus event slot, or community resource you are looking for does not exist, has been restricted, or was moved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="py-3.5 px-7 rounded-full bg-white hover:bg-neutral-200 text-[#0a0a0a] font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/events"
            className="py-3.5 px-7 rounded-full bg-[#161a29] hover:bg-[#1e2436] text-white border border-white/15 text-xs font-extrabold tracking-wider uppercase flex items-center gap-2 transition-all active:scale-95"
          >
            <Compass className="w-4 h-4 text-[#818cf8]" />
            <span>Browse Events</span>
          </Link>

          <Link
            href="/calendar"
            className="py-3.5 px-7 rounded-full bg-[#161a29] hover:bg-[#1e2436] text-white border border-white/15 text-xs font-extrabold tracking-wider uppercase flex items-center gap-2 transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>View Calendar</span>
          </Link>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
        <span>College of Engineering Vadakara</span>
        <span>CEV EVENTS • Official Platform</span>
      </div>
    </div>
  );
}
