// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setFadeOut(true), 200);
          setTimeout(() => setHidden(true), 700);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#08090d] text-white flex flex-col justify-between p-8 sm:p-12 transition-opacity duration-500 ease-out select-none ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/cev_logo.svg"
            alt="CEV EVENTS Logo"
            width={48}
            height={27}
            className="w-10 h-auto animate-pulse"
            priority
          />
          <span className="font-bold text-xs tracking-widest uppercase text-slate-400 font-mono">
            CEV EVENTS Platform
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-[#6366f1] bg-[#6366f1]/10 px-3 py-1 rounded-full border border-[#6366f1]/30">
          2026 Edition
        </span>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#6366f1] font-mono">
            000 / Loading System
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white font-display tracking-tight leading-none">
            ENGINEERING CAMPUS <br />
            <span className="text-[#6366f1]">EVENT ECOSYSTEM</span>
          </h1>
        </div>

        <div className="space-y-3 pt-4">
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-xs text-slate-400">Loading modules & realtime slots...</span>
            <span className="text-4xl sm:text-6xl font-extrabold text-white font-display">
              {Math.min(progress, 100)}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#161a29] rounded-full overflow-hidden border border-[#1e2436]">
            <div
              className="h-full bg-gradient-to-r from-[#6366f1] via-indigo-400 to-cyan-400 transition-all duration-150 ease-out rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] text-slate-500 font-mono border-t border-[#1e2436] pt-4">
        <span>COLLEGE OF ENGINEERING VADAKARA</span>
        <span>IEEE • IEDC • TINKERHUB • FOSS • MULEARN</span>
      </div>
    </div>
  );
}
