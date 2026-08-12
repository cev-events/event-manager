// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Calendar,
  Building,
  LayoutDashboard,
  User,
  LogOut,
  ArrowLeft,
  LifeBuoy,
} from 'lucide-react';
import { UserRole } from '@/types/database.types';

interface AdminSidebarProps {
  currentRole: UserRole;
  onSignOut: () => void;
}

export default function AdminSidebar({ currentRole, onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: 'Dashboard', shortLabel: 'Dashboard', href: '/admin', icon: LayoutDashboard, roleRequired: ['dev', 'admin', 'manager', 'editor'] },
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
      {/* Desktop Sidebar (Dark Charcoal Container) */}
      <aside
        suppressHydrationWarning
        className="hidden md:flex w-64 lg:w-72 h-screen sticky top-0 overflow-y-auto bg-[#18191c] text-white p-6 flex-col justify-between shrink-0 select-none border-r border-[#24262b] z-40"
      >
        <div className="space-y-8">

          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/cev_logo.svg" alt="CEV Logo" className="h-7 w-auto object-contain transition-transform group-hover:scale-105" />
              <span className="font-extrabold text-xl text-white tracking-tight font-display">Admin Panel</span>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              if (!item.roleRequired.includes(currentRole)) return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (isActive) {
                // Active State: White Rounded Pill Container with Dark Active Dot
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-5 py-3 rounded-full bg-white text-[#141518] font-bold text-xs shadow-lg transition-all duration-300 transform scale-[1.02]"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 text-[#141518]" />
                      <span className="font-heading">{item.label}</span>
                    </div>

                    <span className="w-2 h-2 rounded-full bg-[#141518] shrink-0" />
                  </Link>
                );
              }

              // Inactive State: Dark text link with soft hover rounded pill
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-5 py-3 rounded-full text-xs font-semibold text-neutral-400 hover:text-white hover:bg-[#25262c] transition-all duration-200"
                >
                  <Icon className="w-4 h-4 text-neutral-400" />
                  <span className="font-heading">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Back to Home Button & Sign Out */}
        <div className="space-y-4 pt-4 border-t border-[#24262b]">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-full bg-white hover:bg-neutral-200 text-[#141518] text-xs font-extrabold transition-all flex items-center justify-center space-x-2 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-[#141518]" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center justify-between px-2 pt-1 text-xs">
            <button
              type="button"
              suppressHydrationWarning
              onClick={onSignOut}
              className="flex items-center space-x-2 text-rose-400 hover:text-rose-300 font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold">
              {currentRole}
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-neutral-300 bg-white shrink-0 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <img src="/cev_logo_b.svg" alt="CEV Logo" className="h-6 w-auto object-contain" />
          <span className="font-extrabold text-sm text-[#141518] font-display">Admin Panel</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="p-2 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1"
            title="Back to Home"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onSignOut}
            className="p-2 rounded-full bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Glass Floating Navigation Bar */}
      {mounted &&
        createPortal(
          <nav className="fixed bottom-3 left-3 right-3 z-40 md:hidden bg-[#18191c]/90 backdrop-blur-2xl border border-neutral-800 rounded-full p-1.5 shadow-2xl flex items-center justify-between gap-1 select-none">
            {navItems.map((item) => {
              if (!item.roleRequired.includes(currentRole)) return null;

              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 min-w-0 flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-300 ${isActive
                    ? 'bg-white text-[#141518] font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />

                  <span className="text-[9px] font-heading mt-0.5 tracking-tight truncate max-w-full text-center leading-none">
                    {item.shortLabel || item.label}
                  </span>
                </Link>
              );
            })}
          </nav>,
          document.body
        )}
    </>
  );
}
