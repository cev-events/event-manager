// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState } from 'react';
import { Globe, Coffee, Check, Copy, ExternalLink } from 'lucide-react';

export default function Footer() {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const upiId = "shibiliamantk@oksbi";
  const upiUrl = "upi://pay?pa=shibiliamantk@oksbi&pn=Shibili%20Aman&tn=Buy%20Me%20a%20Coffee&cu=INR";

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-neutral-800 bg-[#0a0a0a] text-neutral-400 pt-10 pb-8 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-2.5">
              <img src="/cev_logo.svg" alt="CEV EVENTS" className="h-8 w-auto object-contain" />
              <span className="text-xl font-extrabold font-display tracking-tight text-white">
                CEV <span className="text-neutral-400 font-light">EVENTS</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The official multi-community event management, publishing, slot booking, and public discovery platform for College of Engineering Vadakara (CE Vadakara).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={upiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-400 text-xs font-bold transition-all shadow-sm active:scale-95 group"
            >
              <Coffee className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Buy Me a Coffee</span>
            </a>

            <button
              onClick={() => setShowQrModal(!showQrModal)}
              className="px-3.5 py-2.5 rounded-xl bg-[#161a29] hover:bg-[#1e2436] text-xs text-[#94a3b8] hover:text-white border border-[#1e2436] transition-colors"
            >
              UPI Info
            </button>
          </div>
        </div>

        {showQrModal && (
          <div className="p-4 bg-[#161a29] border border-[#1e2436] rounded-xl text-xs space-y-2 max-w-md animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Support via UPI:</span>
              <span className="font-mono text-[#6366f1] select-all">{upiId}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={copyUpiId}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#1e2436] hover:bg-[#2a334c] text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'UPI ID Copied!' : 'Copy UPI ID'}</span>
              </button>
              <a
                href={upiUrl}
                className="py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Open Pay App</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-[#1e2436] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-[#94a3b8]">
            <span>Developed by</span>
            <span className="text-white font-bold">Shibili Aman TK</span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-3.5">
              <a
                href="https://www.shibili.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#10b981] hover:underline font-medium transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Website</span>
              </a>
              <a
                href="https://github.com/LordSA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#f8fafc] hover:text-[#6366f1] hover:underline font-medium transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/shibili-aman-tk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#3b82f6] hover:underline font-medium transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current text-[#3b82f6]" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[#94a3b8]">
            <span>&copy; {new Date().getFullYear()} CEV EVENTS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
