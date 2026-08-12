// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Building, CheckCircle2, Lock, ArrowUpRight, User, Sparkles, Activity, Clock, Shield } from 'lucide-react';
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
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#141518] font-display">
          {isScoped ? `${communityName} Overview` : 'Dashboard Overview'}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium">
          {isScoped
            ? `Take control of slot reservations and event publishing for ${communityName} today!`
            : 'Take control of all campus events, slot reservations, and communities today!'}
        </p>
      </div>

      {/* White Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* Metric 1: Live Events */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-neutral-200/60 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-neutral-700">
              <CheckCircle2 className="w-4 h-4 text-[#141518]" />
              <span className="text-xs font-extrabold uppercase tracking-wider">Live Events</span>
            </div>
            <span className="bg-[#141518] text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-sm">
              Published
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-extrabold text-[#141518] font-display tracking-tight">
              {liveCount}
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              {isScoped ? `Live events hosted by ${communityName}` : 'Publicly visible across CE Vadakara'}
            </p>
          </div>
        </div>

        {/* Metric 2: Draft Slots */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-neutral-200/60 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-neutral-700">
              <Lock className="w-4 h-4 text-neutral-600" />
              <span className="text-xs font-extrabold uppercase tracking-wider">Draft Slots</span>
            </div>
            <span className="bg-neutral-100 text-neutral-800 font-extrabold text-[11px] px-3 py-1 rounded-full shadow-sm border border-neutral-200">
              Reserved
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-extrabold text-[#141518] font-display tracking-tight">
              {draftCount}
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Upcoming reserved date slots
            </p>
          </div>
        </div>

        {/* Metric 3: Communities */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-neutral-200/60 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-neutral-700">
              <Building className="w-4 h-4 text-[#141518]" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                {isScoped ? 'Organization' : 'Communities'}
              </span>
            </div>
            <span className="bg-neutral-100 text-neutral-800 font-extrabold text-[11px] px-3 py-1 rounded-full shadow-sm border border-neutral-200">
              {isScoped ? 'Assigned' : `${communities.length} Active`}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#141518] font-display tracking-tight truncate">
              {isScoped ? communityName : 'Campus Network'}
            </div>
            <p className="text-xs text-neutral-500 font-medium truncate">
              {isScoped ? 'Assigned student community' : 'IEEE, IEDC, TinkerHub, FOSS, MuLearn'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Feature Layout Grid (Dark Feature Card + White Quick Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Left: Dark Feature Card */}
        <div className="lg:col-span-7 bg-[#18191c] text-white rounded-[28px] p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm font-display tracking-wide">Campus Event Activity</span>
            </div>

            <span className="bg-[#24262b] text-xs font-bold px-3 py-1 rounded-full text-neutral-300 border border-neutral-700">
              Realtime Sync
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2 relative z-10">
            <div className="bg-[#24262b] rounded-2xl p-4 space-y-1">
              <div className="flex items-center space-x-2 text-neutral-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Active Ratio</span>
              </div>
              <p className="text-2xl font-extrabold text-white font-display">
                {eventsList.length > 0 ? Math.round((liveCount / eventsList.length) * 100) : 100}%
              </p>
            </div>

            <div className="bg-[#24262b] rounded-2xl p-4 space-y-1">
              <div className="flex items-center space-x-2 text-neutral-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span>Total Bookings</span>
              </div>
              <p className="text-2xl font-extrabold text-white font-display">
                {eventsList.length} Events
              </p>
            </div>
          </div>

          <div className="space-y-3 relative z-10 pt-2 border-t border-neutral-800">
            <p className="text-xs text-neutral-400 leading-relaxed">
              Conflict-free scheduling algorithm active across CE Vadakara communities. All slot bookings update in real-time.
            </p>

            <Link
              href="/admin/events"
              className="inline-flex items-center space-x-2 py-3 px-6 rounded-full bg-white hover:bg-neutral-200 text-[#141518] text-xs font-extrabold transition-all shadow-md"
            >
              <span>Open Slot Booking Calendar</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right: Quick Action Cards */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">

          {/* Quick Action 1: Event Slot Booking */}
          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-neutral-200/60 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#141518] font-display flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#141518]" />
                Event Slot Booking
              </h3>
              <span className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold text-xs">
                01
              </span>
            </div>

            <p className="text-xs text-neutral-500 font-medium leading-relaxed">
              Reserve dates and time slots for community events to prevent scheduling overlaps.
            </p>

            <Link
              href="/admin/events"
              className="py-2.5 px-5 rounded-full bg-[#141518] hover:bg-black text-white text-xs font-bold inline-flex items-center justify-between w-full shadow-sm transition-all"
            >
              <span>Manage Event Bookings</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </Link>
          </div>

          {/* Quick Action 2: Community / Profile */}
          {role !== 'editor' ? (
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-neutral-200/60 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#141518] font-display flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#141518]" />
                  My Community
                </h3>
                <span className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold text-xs">
                  02
                </span>
              </div>

              <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                Update community profile bio, logo image, initials badge, and theme details.
              </p>

              <Link
                href="/admin/my-community"
                className="py-2.5 px-5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#141518] text-xs font-bold inline-flex items-center justify-between w-full transition-all"
              >
                <span>Community Workspace</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#141518]" />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-neutral-200/60 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#141518] font-display flex items-center gap-2">
                  <User className="w-4 h-4 text-[#141518]" />
                  Profile
                </h3>
                <span className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold text-xs">
                  02
                </span>
              </div>

              <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                Update profile info and avatar image.
              </p>

              <Link
                href="/admin/profile"
                className="py-2.5 px-5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#141518] text-xs font-bold inline-flex items-center justify-between w-full transition-all"
              >
                <span>Edit Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#141518]" />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
