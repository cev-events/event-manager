// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, MapPin, Award, ExternalLink, MessageSquare, Sparkles, Users, Globe, Zap, Lock } from 'lucide-react';
import EventAiDrawer from '@/app/components/EventAiDrawer';
import { createClient } from '@/lib/supabase/client';

function formatSingleTime12(t: string): string {
  if (!t) return '';
  const trimmed = t.trim();
  if (trimmed.toUpperCase().includes('AM') || trimmed.toUpperCase().includes('PM')) {
    return trimmed;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return trimmed;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${paddedHours}:${minutes} ${ampm}`;
}

function formatTimeSlotTo12Hr(slot?: string): string {
  if (!slot) return '10:00 AM - 04:00 PM';
  if (slot.includes('-')) {
    const parts = slot.split('-');
    return `${formatSingleTime12(parts[0])} - ${formatSingleTime12(parts[1])}`;
  }
  return formatSingleTime12(slot);
}

function refactorDescription3Lines(text: string | null | undefined): string {
  if (!text || text.trim() === '') {
    return 'Discover event details, workshop modules, and interactive sessions organized for campus students.';
  }

  let cleaned = text
    .replace(/You are the official AI Assistant[\s\S]*/gi, '')
    .replace(/EVENT DETAILS:[\s\S]*/gi, '')
    .replace(/TONE INSTRUCTIONS:[\s\S]*/gi, '')
    .replace(/\*{1,3}/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return 'Discover event details, workshop modules, and interactive sessions organized for campus students.';
  }

  const parts = cleaned
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (parts.length === 0) {
    return cleaned.length > 250 ? cleaned.slice(0, 247) + '...' : cleaned;
  }

  const selected = parts.slice(0, 3).join(' ');
  return selected.length > 280 ? selected.slice(0, 277) + '...' : selected;
}

function getValidRegistrationUrl(url?: string | null): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();

  const [eventData, setEventData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/events');
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const supabase = createClient();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId);

        let data = null;

        if (isUuid) {
          const res = await supabase
            .from('events')
            .select('*, community:communities(name, logo_url)')
            .eq('id', eventId)
            .maybeSingle();
          data = res.data;
        } else {
          const resBySlug = await supabase
            .from('events')
            .select('*, community:communities(name, logo_url)')
            .eq('slug', eventId)
            .maybeSingle();
          data = resBySlug.data;

          if (!data) {
            const resByTitle = await supabase
              .from('events')
              .select('*, community:communities(name, logo_url)')
              .ilike('title', eventId)
              .maybeSingle();
            data = resByTitle.data;
          }
        }

        if (data) {
          setEventData(data);
        }
      } catch (err) {
        console.error('Error fetching event detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center text-[#94a3b8] text-xs">
        Loading event details...
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col items-center justify-center p-6 space-y-4 font-sans">
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-neutral-200 text-center max-w-md space-y-4 shadow-sm">
          <h1 className="text-xl font-bold font-display text-[#0a0a0a]">Event Not Found</h1>
          <p className="text-xs text-neutral-600">The requested event slot may have been removed or updated.</p>
          <Link href="/events" className="inline-block px-5 py-2.5 rounded-full bg-[#0a0a0a] text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-md">
            &larr; Return to Event Directory
          </Link>
        </div>
      </div>
    );
  }

  if (eventData.status !== 'live') {
    return (
      <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col items-center justify-center p-6 space-y-4 font-sans">
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-neutral-200 text-center max-w-md space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-display text-[#0a0a0a]">Event Access Restricted</h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            This event slot is currently in draft or reserved status and is restricted from public access.
          </p>
          <Link href="/events" className="inline-block px-5 py-2.5 rounded-full bg-[#0a0a0a] text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-md">
            &larr; Return to Event Directory
          </Link>
        </div>
      </div>
    );
  }

  const communityName = eventData.community?.name || 'Campus Community';
  const cleanTitle = eventData.title ? eventData.title.replace(/\*\*/g, '').trim() : 'Event Session';
  const publicDescription = refactorDescription3Lines(eventData.description);
  const posterSrc = (eventData.poster_url && eventData.poster_url.trim() !== '')
    ? eventData.poster_url
    : ((eventData.image && eventData.image.trim() !== '') ? eventData.image : '/images/poster.webp');

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] pt-28 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={handleBackClick}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-neutral-500 hover:text-black transition-colors cursor-pointer bg-transparent border-0 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="p-6 sm:p-10 rounded-2xl space-y-8 relative overflow-hidden bg-white border border-neutral-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="order-2 lg:order-1 lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#6366f1] text-white border border-[#4f46e5]">
                  {eventData.category || 'Workshop'}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#6366f1]" />
                  {communityName}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0a0a0a] font-display leading-tight">
                {cleanTitle}
              </h1>

              <div className="space-y-4 border-t border-b border-neutral-200 py-5">
                <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
                  {publicDescription}
                </p>

                <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between gap-3 text-xs text-indigo-950">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6366f1] shrink-0" />
                    <span className="font-medium">Need full guidelines, timeline, or FAQs?</span>
                  </div>
                  <button
                    onClick={() => setAiDrawerOpen(true)}
                    className="text-[#6366f1] hover:text-indigo-800 font-bold uppercase tracking-wider text-[11px] underline shrink-0"
                  >
                    Ask Assistant &rarr;
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-[#6366f1]" />
                  <div>
                    <div className="text-[10px] text-neutral-500 font-bold uppercase">Date</div>
                    <div className="font-bold text-[#0a0a0a] text-sm">{eventData.event_date || eventData.date}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-[10px] text-neutral-500 font-bold uppercase">Time Slot</div>
                    <div className="font-bold text-[#0a0a0a] text-sm">{formatTimeSlotTo12Hr(eventData.time_slot)}</div>
                  </div>
                </div>

                {(() => {
                  const rawVenue = eventData.venue || 'Campus Setup / CEV';
                  const isOnline = rawVenue.toLowerCase().startsWith('online') || rawVenue.toLowerCase().includes('online');
                  const IconComp = isOnline ? Globe : MapPin;
                  const iconColor = isOnline ? 'text-cyan-600' : 'text-indigo-600';
                  const formatTag = isOnline ? 'Online' : 'Offline';
                  const cleanLoc = rawVenue.replace(/^(offline|online|hybrid)\s*•\s*/i, '').trim() || rawVenue;

                  return (
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center space-x-3">
                      <IconComp className={`w-5 h-5 ${iconColor}`} />
                      <div>
                        <div className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                          <span>Venue / Location</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                            isOnline ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}>
                            {formatTag}
                          </span>
                        </div>
                        <div className="font-bold text-[#0a0a0a] text-sm">{cleanLoc}</div>
                      </div>
                    </div>
                  );
                })()}

                {eventData.perks && eventData.perks.trim() !== '' && (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center space-x-3">
                    <Award className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-[10px] text-neutral-500 font-bold uppercase">Highlights / Perks</div>
                      <div className="font-bold text-[#0a0a0a] text-sm">{eventData.perks}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                {(() => {
                  const validRegUrl = getValidRegistrationUrl(eventData.redirect_url);
                  if (validRegUrl) {
                    return (
                      <a
                        href={validRegUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 brutalist-btn-primary py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 text-center"
                      >
                        <span>Register Now</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    );
                  }
                  return (
                    <button
                      onClick={() => setAiDrawerOpen(true)}
                      className="flex-1 brutalist-btn-primary py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 text-center cursor-pointer"
                    >
                      <span>Register Now</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  );
                })()}

                <button
                  onClick={() => setAiDrawerOpen(true)}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-[#0a0a0a] hover:bg-neutral-800 text-white font-bold text-xs border border-black flex items-center justify-center space-x-2 transition-colors uppercase tracking-wider"
                >
                  <MessageSquare className="w-4 h-4 text-[#6366f1]" />
                  <span>Ask Assistant</span>
                </button>
              </div>
            </div>

            {/* Event Poster Image Container - 3:4 Aspect Ratio (1080:1440 portrait) */}
            <div className="order-1 lg:order-2 lg:col-span-5 relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-2xl">
              <img
                src={posterSrc}
                alt={cleanTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/poster.webp';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <EventAiDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        eventTitle={cleanTitle}
        systemPrompt={eventData.system_prompt || eventData.description || `You are the event assistant for ${cleanTitle}.`}
      />
    </div>
  );
}