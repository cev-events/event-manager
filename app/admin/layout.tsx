// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types/database.types';
import { createClient } from '@/lib/supabase/client';
import AdminSidebar from '@/app/components/AdminSidebar';
import { Search, Bell, ChevronDown, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('editor');
  const [userName, setUserName] = useState<string>('Campus Admin');
  const [userEmail, setUserEmail] = useState<string>('admin@cevadakara.ac.in');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserEmail(session.user.email || 'admin@cevadakara.ac.in');
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name, avatar_url')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            if (profile.role) setCurrentRole(profile.role);
            if (profile.full_name) setUserName(profile.full_name);
            if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
          }
        }
      } catch {
      }
    };

    fetchUserRole();
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const todayDateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen w-full bg-[#edf0f4] flex flex-col md:flex-row font-sans">
      {/* Left Dark Sidebar */}
      <AdminSidebar currentRole={currentRole} onSignOut={handleSignOut} />

      {/* Main Workspace Area (Light Grey Canvas) */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col overflow-y-auto text-[#141518] pb-28 md:pb-8">
        
        {/* Top Navigation Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 mb-2 border-b border-neutral-200/80">
          
          {/* User Profile Card Pill (Left Header) */}
          <div className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-sm border border-neutral-200/60 w-fit">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#18191c] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="text-left leading-tight pr-2">
              <h4 className="font-extrabold text-xs text-[#141518] font-display">{userName}</h4>
              <p className="text-[10px] text-neutral-400 truncate max-w-[140px] font-mono">{userEmail}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </div>

          {/* Top Search Bar & Date Action Pills (Right Header) */}
          <div className="flex items-center space-x-3">
            {/* Search Bar Pill */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search admin..."
                className="bg-white rounded-full pl-9 pr-4 py-2 text-xs border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-56 lg:w-64 placeholder-neutral-400 text-[#141518]"
              />
            </div>

            {/* Notification Bell Pill */}
            <button
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#141518] shadow-sm hover:bg-neutral-100 transition-colors relative shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2.5 h-2.5 rounded-full bg-black absolute top-1 right-1 border-2 border-white" />
            </button>

            {/* Date Badge Pill */}
            <div className="hidden lg:flex items-center space-x-2 bg-white rounded-full px-4 py-2 text-xs font-bold text-neutral-700 shadow-sm border border-neutral-200/60">
              <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
              <span>{todayDateStr}</span>
            </div>
          </div>

        </div>

        {/* Child Page Main View Content */}
        <div className="flex-1 min-w-0 pt-2">
          {children}
        </div>

      </main>
    </div>
  );
}
