// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types/database.types';
import { createClient } from '@/lib/supabase/client';
import AdminSidebar from '@/app/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('editor');

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profile?.role) {
            setCurrentRole(profile.role);
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans">
      <AdminSidebar currentRole={currentRole} onSignOut={handleSignOut} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 pb-28 md:pb-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
