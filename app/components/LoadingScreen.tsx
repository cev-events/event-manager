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
    }, 35);

    return () => clearInterval(timer);
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0a0a0a] text-white flex items-center justify-center p-6 transition-opacity duration-500 ease-out select-none ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="max-w-md w-full flex flex-col items-center justify-center space-y-10 text-center">
        {/* Centered Brand Logo */}
        <div className="relative">
          <Image
            src="/cev_logo.svg"
            alt="CEV EVENTS Logo"
            width={120}
            height={68}
            className="w-24 sm:w-32 h-auto object-contain animate-pulse"
            priority
          />
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
            <span>Loading...</span>
            <span className="text-xl font-bold font-display text-white">{Math.min(progress, 100)}%</span>
          </div>

          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-150 ease-out rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
