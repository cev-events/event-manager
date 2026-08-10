// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Building, CheckCircle2, Lock, ArrowUpRight, User } from 'lucide-react';
import Link from 'next/link';
import { useRealtimeEvents } from '@/lib/hooks/useRealtimeEvents';
import { useCommunities } from '@/lib/hooks/useCommunities';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/types/database.types';

export default function AdminDashboardPage() {
  const { eventsList } = useRealtimeEvents();
  const { communities } = useCommunities();

  const [role, setRole] = useState<UserRole>('editor');
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communityName, setCommunityName] = useState<string>('My Community');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, community_id, community:communities(name)')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setRole(profile.role);
            setCommunityId(profile.community_id || null);
            if ((profile as any).community?.name) {
              setCommunityName((profile as any).community.name);
            }
          }
        }
      } catch {
      }
    };

    fetchProfile();
  }, []);

  const isScoped = role === 'manager' || role === 'editor';

  const filteredEvents = eventsList.filter((e) => {
    if (!isScoped || !communityId) return true;
    const targetComm = communities.find((c) => c.id === communityId);
    return e.community === targetComm?.name;
  });

  const liveCount = filteredEvents.filter((e) => e.status === 'live').length;
  const draftCount = filteredEvents.filter((e) => e.status === 'closed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5 space-y-1">
        <span className="text-xs font-mono text-neutral-400 uppercase font-bold tracking-widest">
          001 / Operations Console
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display leading-none">
          {isScoped ? `${communityName.toUpperCase()} OVERVIEW` : 'CAMPUS DASHBOARD OVERVIEW'}
        </h1>
        <p className="text-xs text-neutral-400">
          {isScoped
            ? `Overview metrics, slot reservations, and event status for ${communityName}.`
            : 'Overview of All Campus Events and Communities.'}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">Live Events</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-display">{liveCount}</div>
          <p className="text-[11px] text-neutral-400">
            {isScoped ? `Published by ${communityName}` : 'Publicly visible across campus'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">Draft Slots</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-display">{draftCount}</div>
          <p className="text-[11px] text-neutral-400">Reserved</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">
              {isScoped ? 'My Organization' : 'Communities'}
            </span>
            <Building className="w-4 h-4 text-white" />
          </div>
          <div className="text-lg font-bold text-white truncate font-display">
            {isScoped ? communityName : `${communities.length} Active`}
          </div>
          <p className="text-[11px] text-neutral-400">
            {isScoped ? 'Assigned campus community' : 'IEEE, IEDC, TinkerHub, FOSS, MuLearn'}
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="brutalist-card p-5 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
              <Calendar className="w-4 h-4 text-[#6366f1]" />
              Slot Booking
            </h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Reserve dates and time slots for community events to prevent scheduling overlaps.
            </p>
          </div>
          <Link
            href="/admin/events"
            className="brutalist-btn-primary px-3.5 py-2 rounded-full text-xs inline-flex items-center space-x-1.5 w-fit"
          >
            <span>Manage Events</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {role !== 'editor' && (
          <div className="brutalist-card p-5 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
                <Building className="w-4 h-4 text-emerald-400" />
                My Community
              </h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Update community profile bio, logo image, initials badge, and theme details.
              </p>
            </div>
            <Link
              href="/admin/my-community"
              className="brutalist-btn-secondary px-3.5 py-2 rounded-full text-xs inline-flex items-center space-x-1.5 w-fit"
            >
              <span>Community Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="brutalist-card p-5 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
              <User className="w-4 h-4 text-[#6366f1]" />
              Profile
            </h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Update profile info.
            </p>
          </div>
          <Link
            href="/admin/profile"
            className="brutalist-btn-secondary px-3.5 py-2 rounded-full text-xs inline-flex items-center space-x-1.5 w-fit"
          >
            <span>Edit Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
