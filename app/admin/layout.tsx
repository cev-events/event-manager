// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types/database.types';
import { createClient } from '@/lib/supabase/client';
import AdminSidebar from '@/app/components/AdminSidebar';
import { usePathname } from "next/navigation";
import { Calendar as CalendarIcon, User as UserIcon } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('editor');
  const [userName, setUserName] = useState<string>('Campus Admin');
  const [userEmail, setUserEmail] = useState<string>('admin@cevadakara.ac.in');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const pathname = usePathname();

  const isProfilePage = pathname === "/admin/profile";

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
    <div
      className="min-h-screen w-full bg-[#edf0f4] flex flex-col md:flex-row font-sans"
      suppressHydrationWarning
    >
      <AdminSidebar
        currentRole={currentRole}
        onSignOut={handleSignOut}
      />

      <main
        className="flex-1 min-w-0 p-2 sm:p-2 lg:p-4 flex flex-col text-[#141518] pb-28 md:pb-8"
        suppressHydrationWarning
      >
        <div className="flex flex-row items-center justify-between gap-4 pb-6 mb-2 border-b border-neutral-200/80">
          {!isProfilePage && (
            <>
              <div className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-sm border border-neutral-200/60 w-fit">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#18191c] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="text-left leading-tight pr-2">
                  <h4 className="font-extrabold text-xs text-[#141518] font-display">
                    {userName}
                  </h4>

                  <p className="text-[10px] text-neutral-400 truncate max-w-[160px] font-mono">
                    {userEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 text-xs font-bold text-neutral-700 shadow-sm border border-neutral-200/60">
                <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>{todayDateStr}</span>
              </div>
            </>
          )}
        </div>

        <div
          className="flex-1 min-w-0 pt-1"
          suppressHydrationWarning
        >
          {children}
        </div>
      </main>
    </div>
  );
}
