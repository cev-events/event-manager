// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, Calendar, Building, LayoutDashboard, User, LogOut, ExternalLink, LifeBuoy } from 'lucide-react';
import { UserRole } from '@/types/database.types';

interface AdminSidebarProps {
  currentRole: UserRole;
  onSignOut: () => void;
}

export default function AdminSidebar({ currentRole, onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', shortLabel: 'Overview', href: '/admin', icon: LayoutDashboard, roleRequired: ['dev', 'admin', 'manager', 'editor'] },
    { label: 'Event Booking', shortLabel: 'Events', href: '/admin/events', icon: Calendar, roleRequired: ['dev', 'admin', 'manager', 'editor'] },
    { label: 'My Community', shortLabel: 'Community', href: '/admin/my-community', icon: Building, roleRequired: ['manager', 'editor'] },
    { label: 'My Events', shortLabel: 'My Events', href: '/admin/my-community/events', icon: Calendar, roleRequired: ['manager', 'editor'] },
    { label: 'User Roles', shortLabel: 'Users', href: '/admin/users', icon: Users, roleRequired: ['dev', 'admin', 'manager'] },
    { label: 'Communities', shortLabel: 'Communities', href: '/admin/communities', icon: Building, roleRequired: ['dev', 'admin'] },
    { label: 'Support Inbox', shortLabel: 'Support', href: '/admin/support', icon: LifeBuoy, roleRequired: ['dev', 'admin'] },
    { label: 'Profile', shortLabel: 'Profile', href: '/admin/profile', icon: User, roleRequired: ['dev', 'admin', 'manager', 'editor'] },
  ];

  return (
    <>
      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-[#0a0a0a] border-r border-neutral-800 p-6 flex-col justify-between shrink-0 overflow-y-auto z-40 select-none">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <img src="/cev_logo.svg" alt="CEV EVENTS" className="h-8 w-auto object-contain" />
            <div>
              <h2 className="font-extrabold text-base text-white font-display tracking-tight">CEV EVENTS</h2>
              <span className="text-[10px] uppercase font-bold text-white bg-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-700 font-mono">
                {currentRole} Access
              </span>
            </div>
          </div>

          <nav className="space-y-1.5 pt-4">
            {navItems.map((item) => {
              if (!item.roleRequired.includes(currentRole)) return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-neutral-800 text-white font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-heading">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#1e2436] space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between text-xs text-[#94a3b8] hover:text-white transition-colors py-2 px-1 font-semibold"
          >
            <span>Home</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-between text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg py-2 px-1 font-semibold transition-colors"
          >
            <span>Sign Out</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>

          <div className="pt-3 border-t border-[#1e2436] text-[10px] text-[#94a3b8] flex items-center justify-between font-mono">
            <span>By Shibili Aman TK</span>
            <a href="https://github.com/LordSA" target="_blank" rel="noopener noreferrer" className="hover:text-[#6366f1] transition-colors">@LordSA</a>
          </div>
        </div>
      </aside>

      <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-[#1e2436]/80 bg-[#0f121d]/80 backdrop-blur-xl shrink-0 sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <img src="/cev_logo.svg" alt="CEV EVENTS" className="h-6 w-auto object-contain" />
          <div>
            <h2 className="font-bold text-sm text-white font-display">CEV EVENTS</h2>
            <span className="text-[9px] uppercase font-bold text-white bg-[#6366f1] px-1.5 py-0.2 rounded border border-[#4f46e5] font-mono">
              {currentRole} Access
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="p-2 rounded-xl bg-[#161a29]/80 border border-[#1e2436] text-slate-300 text-xs flex items-center gap-1 font-semibold hover:text-white"
            title="Public Site"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onSignOut}
            className="p-2 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-1 font-semibold"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <nav className="fixed bottom-2.5 left-2 right-2 sm:left-4 sm:right-4 z-50 md:hidden bg-[#0f121d]/85 backdrop-blur-2xl border border-[#1e2436]/90 rounded-2xl p-1 sm:p-1.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.7)] flex items-center justify-between gap-0.5 sm:gap-1 select-none">
        {navItems.map((item) => {
          if (!item.roleRequired.includes(currentRole)) return null;
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-2 rounded-xl transition-all duration-200 border ${
                isActive
                  ? 'bg-[#6366f1] text-white border-[#4f46e5] shadow-[0_0_10px_rgba(99,102,241,0.5)] font-bold'
                  : 'text-[#94a3b8] hover:text-white border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-heading mt-0.5 tracking-tight truncate max-w-full text-center leading-none">
                {item.shortLabel || item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
