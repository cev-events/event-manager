// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Plus, Lock, CheckCircle2, Trash2, Edit3, AlertCircle, Clock, Upload, Link as LinkIcon, Globe, MapPin, Zap, X } from 'lucide-react';
import { UserRole } from '@/types/database.types';
import { useRealtimeEvents } from '@/lib/hooks/useRealtimeEvents';
import { useCommunities } from '@/lib/hooks/useCommunities';
import { createClient } from '@/lib/supabase/client';
import { uploadImageFile } from '@/lib/upload';
import GoogleCalendarView from '@/app/components/GoogleCalendarView';

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

function parseTimeTo24Hr(timeStr?: string): string {
  if (!timeStr) return '10:00';
  const trimmed = timeStr.trim().toUpperCase();

  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const ampm = match12[3].toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${paddedHours}:${minutes}`;
  }

  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    let hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${paddedHours}:${minutes}`;
  }

  return '10:00';
}

function toIsoDateString(str?: string | null): string {
  if (!str) return new Date().toISOString().split('T')[0];
  const s = String(str).trim();
  const isoMatch = s.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch) {
    return isoMatch[0];
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return new Date().toISOString().split('T')[0];
}

export default function EventBookingEnginePage() {
  const [mounted, setMounted] = useState(false);
  const { eventsList, setEventsList, loading: eventsLoading } = useRealtimeEvents();
  const { communities, loading: communitiesLoading } = useCommunities();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loading = eventsLoading || communitiesLoading;

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('editor');
  const [currentUserCommunityId, setCurrentUserCommunityId] = useState<string | null>(null);
  const [currentUserCommunityName, setCurrentUserCommunityName] = useState<string>('');

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('16:00');

  const [category, setCategory] = useState('Workshop');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [status, setStatus] = useState<'closed' | 'live'>('closed');
  const [desc, setDesc] = useState('');
  const [perks, setPerks] = useState('');
  const [venue, setVenue] = useState('Campus Setup / CEV');
  const [eventType, setEventType] = useState<'offline' | 'online'>('offline');
  const [submitting, setSubmitting] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Poster image file size must be under 5MB.' });
      return;
    }

    setUploadingPoster(true);
    setUploadProgress(0);
    setFeedback(null);

    try {
      const publicUrl = await uploadImageFile(file, 'posters', (percent) => {
        setUploadProgress(percent);
      });
      setPosterUrl(publicUrl);
      setFeedback({ type: 'success', message: 'Event poster uploaded successfully!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload poster image';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setUploadingPoster(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    const fetchActiveUser = async () => {
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
            setCurrentUserRole(profile.role);
            setCurrentUserCommunityId(profile.community_id || null);
            if ((profile as any).community?.name) {
              setCurrentUserCommunityName((profile as any).community.name);
            }
          }
        }
      } catch {
      }
    };

    fetchActiveUser();
  }, []);

  const isSuperAdmin = currentUserRole === 'dev' || currentUserRole === 'admin';

  const openAddModal = (initialDate?: string, initialStartTime?: string) => {
    setEditingEvent(null);
    setTitle('');
    const targetDate = initialDate || new Date().toISOString().split('T')[0];
    setStartDate(targetDate);
    setEndDate(targetDate);
    setStartTime(initialStartTime || '10:00');
    if (initialStartTime) {
      const parts = initialStartTime.split(':');
      let hour = parseInt(parts[0], 10);
      if (!isNaN(hour)) {
        hour = (hour + 2) % 24;
        const endHourStr = hour < 10 ? `0${hour}` : `${hour}`;
        setEndTime(`${endHourStr}:${parts[1] || '00'}`);
      } else {
        setEndTime('16:00');
      }
    } else {
      setEndTime('16:00');
    }
    setCategory('Workshop');
    setCustomCategory('');
    setSelectedCommunityId(currentUserCommunityId || '');
    setStatus('closed');
    setDesc('');
    setPerks('');
    setEventType('offline');
    setVenue('Campus Setup / CEV');
    setPosterUrl('');
    setRedirectUrl('');
    setShowModal(true);
  };

  const openEditModal = (evt: any) => {
    const isOwnCommunity = isSuperAdmin || (
      currentUserCommunityName &&
      (evt.community || '').toLowerCase() === currentUserCommunityName.toLowerCase()
    );

    if (!isOwnCommunity) {
      setFeedback({ type: 'error', message: 'RBAC Violation: You are only permitted to edit events belonging to your own community.' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    setEditingEvent(evt);
    setTitle(evt.title || '');

    const rawDateStr = evt.event_date || evt.date || '';
    let startStr = rawDateStr;
    let endStr = rawDateStr;

    if (typeof rawDateStr === 'string') {
      if (rawDateStr.toLowerCase().includes(' to ')) {
        const parts = rawDateStr.split(/ to /i);
        startStr = parts[0].trim();
        endStr = parts[1].trim();
      } else if (rawDateStr.includes(' - ')) {
        const parts = rawDateStr.split(/\s+-\s+/);
        startStr = parts[0].trim();
        endStr = parts[1].trim();
      } else if (rawDateStr.includes(' / ')) {
        const parts = rawDateStr.split(/\s+\/\s+/);
        startStr = parts[0].trim();
        endStr = parts[1].trim();
      }
    }

    setStartDate(toIsoDateString(startStr));
    setEndDate(toIsoDateString(endStr));

    if (evt.time_slot && evt.time_slot.includes('-')) {
      const parts = evt.time_slot.split('-');
      setStartTime(parseTimeTo24Hr(parts[0]));
      setEndTime(parseTimeTo24Hr(parts[1]));
    } else if (evt.time_slot) {
      setStartTime(parseTimeTo24Hr(evt.time_slot));
      setEndTime('16:00');
    } else {
      setStartTime('10:00');
      setEndTime('16:00');
    }

    const standardCategories = isSuperAdmin
      ? ['Workshop', 'Hackathon', 'Seminar', 'Tech Fest', 'Webinar', 'Competition', 'Exam', 'College Schedule']
      : ['Workshop', 'Hackathon', 'Seminar', 'Tech Fest', 'Webinar', 'Competition'];

    if (standardCategories.includes(evt.category)) {
      setCategory(evt.category);
      setCustomCategory('');
    } else {
      setCategory('Other');
      setCustomCategory(evt.category || '');
    }

    const matchedComm = communities.find((c) => c.name.toLowerCase() === (evt.community || '').toLowerCase());
    setSelectedCommunityId(matchedComm ? matchedComm.id : (evt.community === 'College' ? 'college' : (currentUserCommunityId || '')));
    setStatus(evt.status || 'closed');
    setDesc(evt.description || '');
    setPerks(evt.perks || '');

    const rawVenue = evt.venue || '';
    if (rawVenue.toLowerCase().startsWith('online') || rawVenue.toLowerCase().includes('online')) {
      setEventType('online');
    } else {
      setEventType('offline');
    }

    const cleanedVenue = rawVenue.replace(/^(offline|online|hybrid)\s*•\s*/i, '').trim() || 'Campus Setup / CEV';
    setVenue(cleanedVenue);
    setPosterUrl(evt.poster_url || evt.image || '');
    setRedirectUrl(evt.redirect_url || '');
    setShowModal(true);
  };

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || submitting) return;

    setSubmitting(true);
    const finalCategory = category === 'Other' ? (customCategory || 'Custom Event') : category;

    const targetCommunityId = isSuperAdmin ? (selectedCommunityId || currentUserCommunityId) : currentUserCommunityId;
    let matchedComm = communities.find((c) => c.id === targetCommunityId || c.name.toLowerCase() === (targetCommunityId || '').toLowerCase());
    if (!matchedComm && isSuperAdmin && (selectedCommunityId === 'college' || targetCommunityId === 'college')) {
      matchedComm = { id: null as any, name: 'College', slug: 'college', color: '#0ea5e9', initials: 'CLG' } as any;
    }
    const commName = matchedComm ? matchedComm.name : (currentUserCommunityName || 'CEV Community');

    const formattedStartTime = formatSingleTime12(startTime);
    const formattedEndTime = formatSingleTime12(endTime);
    const formattedTimeSlot = `${formattedStartTime} - ${formattedEndTime}`;
    const dateRangeString = startDate === endDate ? startDate : `${startDate} to ${endDate}`;

    const cleanVenueText = venue.trim().replace(/^(offline|online|hybrid)\s*•\s*/i, '') || (eventType === 'online' ? 'Google Meet / Online Stream' : 'Campus Setup / CEV');
    const formatLabel = eventType === 'online' ? 'Online' : 'Offline';
    const finalVenue = `${formatLabel} • ${cleanVenueText}`;

    const aiSystemPrompt = `You are the official AI Assistant for "${title}", organized by ${commName}.\n\nEVENT DETAILS:\n- Name: ${title}\n- Organizer: ${commName}\n- Format/Mode: ${formatLabel.toUpperCase()}\n- Date: ${dateRangeString}\n- Time: ${formattedTimeSlot}\n- Venue: ${cleanVenueText}\n- Category: ${finalCategory}\n${perks ? `- Highlights/Perks: ${perks}\n` : ''}\nDESCRIPTION & RULES:\n${desc}`;

    try {
      const supabase = createClient();
      const baseSlug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'event';
      const uniqueSuffix = Math.random().toString(36).substring(2, 7);

      if (editingEvent) {
        const isOwnCommunity = isSuperAdmin || (
          currentUserCommunityName &&
          (editingEvent.community || '').toLowerCase() === currentUserCommunityName.toLowerCase()
        );

        if (!isOwnCommunity) {
          setFeedback({ type: 'error', message: 'RBAC Violation: You can only modify events belonging to your own community.' });
          setSubmitting(false);
          setTimeout(() => setFeedback(null), 4000);
          return;
        }
        const generatedSlug = (editingEvent.slug && editingEvent.title === title)
          ? editingEvent.slug
          : `${baseSlug}-${uniqueSuffix}`;

        const updatedEvt = {
          ...editingEvent,
          title,
          category: finalCategory,
          community: commName,
          date: dateRangeString,
          time_slot: formattedTimeSlot,
          venue: finalVenue,
          description: desc || 'Full event details and schedule.',
          perks: perks.trim() || null,
          status,
          system_prompt: aiSystemPrompt,
          poster_url: posterUrl || null,
          image: posterUrl || '/images/poster.webp',
          redirect_url: redirectUrl.trim() || null,
          slug: generatedSlug,
        };

        setEventsList(eventsList.map((e) => (e.id === editingEvent.id ? updatedEvt : e)));

        const eventPayload: any = {
          title,
          category: finalCategory,
          event_date: startDate,
          time_slot: formattedTimeSlot,
          venue: finalVenue,
          status,
          description: desc,
          system_prompt: aiSystemPrompt,
          poster_url: posterUrl || null,
          redirect_url: redirectUrl.trim() || null,
          slug: generatedSlug,
          community_id: matchedComm ? matchedComm.id : (currentUserCommunityId || null),
        };

        let { error: updateErr } = await supabase.from('events').update(eventPayload).eq('id', editingEvent.id);

        if (updateErr && (updateErr.message.includes('unique constraint') || updateErr.message.includes('slug') || updateErr.code === '23505')) {
          eventPayload.slug = `${baseSlug}-${Date.now()}`;
          const retrySlug = await supabase.from('events').update(eventPayload).eq('id', editingEvent.id);
          updateErr = retrySlug.error;
        }

        if (updateErr && updateErr.message.includes('schema cache')) {
          delete eventPayload.perks;
          const retry = await supabase.from('events').update(eventPayload).eq('id', editingEvent.id);
          updateErr = retry.error;
        }

        if (updateErr) {
          throw new Error(updateErr.message);
        }

        setFeedback({ type: 'success', message: 'Event slot updated successfully!' });
      } else {
        const generatedSlug = `${baseSlug}-${uniqueSuffix}`;

        const newEvt: any = {
          id: Date.now().toString(),
          title,
          category: finalCategory,
          community: commName,
          date: dateRangeString,
          time_slot: formattedTimeSlot,
          venue: finalVenue,
          poster_url: posterUrl || '/images/poster.webp',
          image: posterUrl || '/images/poster.webp',
          description: desc || 'Full event details and schedule.',
          perks: perks.trim() || null,
          status,
          system_prompt: aiSystemPrompt,
          redirect_url: redirectUrl.trim() || null,
          slug: generatedSlug,
        };

        const insertPayload: any = {
          title,
          category: finalCategory,
          event_date: startDate,
          time_slot: formattedTimeSlot,
          venue: finalVenue,
          status,
          description: desc,
          system_prompt: aiSystemPrompt,
          poster_url: posterUrl || null,
          redirect_url: redirectUrl.trim() || null,
          slug: generatedSlug,
          community_id: matchedComm ? matchedComm.id : (currentUserCommunityId || null),
        };

        let { data: insertedData, error: insertErr } = await supabase.from('events').insert(insertPayload).select();

        if (insertErr && (insertErr.message.includes('unique constraint') || insertErr.message.includes('slug') || insertErr.code === '23505')) {
          insertPayload.slug = `${baseSlug}-${Date.now()}`;
          const retrySlug = await supabase.from('events').insert(insertPayload).select();
          insertedData = retrySlug.data;
          insertErr = retrySlug.error;
        }

        if (insertErr && insertErr.message.includes('schema cache')) {
          delete insertPayload.perks;
          const retry = await supabase.from('events').insert(insertPayload).select();
          insertedData = retry.data;
          insertErr = retry.error;
        }

        if (insertErr) {
          throw new Error(insertErr.message);
        }

        if (insertedData && insertedData[0]) {
          newEvt.id = insertedData[0].id;
          if (insertedData[0].poster_url) {
            newEvt.poster_url = insertedData[0].poster_url;
            newEvt.image = insertedData[0].poster_url;
          }
        }

        setEventsList([newEvt, ...eventsList]);
        setFeedback({ type: 'success', message: 'Slot booked and event details saved successfully!' });
      }

      setEditingEvent(null);
      setTitle('');
      setDesc('');
      setPerks('');
      setVenue('Campus Setup / CEV');
      setCustomCategory('');
      setPosterUrl('');
      setRedirectUrl('');
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while saving event slot.';
      console.error(err);
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: 'closed' | 'live', evtCommunity: string) => {
    const isOwnCommunity = isSuperAdmin || (
      currentUserCommunityName &&
      evtCommunity.toLowerCase() === currentUserCommunityName.toLowerCase()
    );

    if (!isOwnCommunity) {
      setFeedback({ type: 'error', message: 'RBAC Violation: You can only modify events belonging to your own community.' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    const nextStatus = currentStatus === 'live' ? 'closed' : 'live';

    setEventsList(
      eventsList.map((e) => (e.id === id ? { ...e, status: nextStatus } : e))
    );

    try {
      const supabase = createClient();
      await supabase.from('events').update({ status: nextStatus }).eq('id', id);
      setFeedback({ type: 'success', message: `Event status toggled to ${nextStatus}!` });
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = async (id: string, evtCommunity: string) => {
    if (currentUserRole === 'editor') {
      setFeedback({ type: 'error', message: 'RBAC Violation: Editors are not permitted to delete events.' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    const isOwnCommunity = isSuperAdmin || (
      currentUserCommunityName &&
      evtCommunity.toLowerCase() === currentUserCommunityName.toLowerCase()
    );

    if (!isOwnCommunity) {
      setFeedback({ type: 'error', message: 'RBAC Violation: Managers can only delete events belonging to their own community.' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    setEventsList(eventsList.filter((e) => e.id !== id));

    try {
      const supabase = createClient();
      await supabase.from('events').delete().eq('id', id);
      setFeedback({ type: 'success', message: 'Event deleted successfully.' });
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-8 pb-20 md:pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141518] font-display">
            Event Slot Reservation
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Reserve dates in <span className="text-amber-700 font-bold">closed</span> draft state to avoid conflicts, then toggle to <span className="text-emerald-700 font-bold">live</span> for public release.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => openAddModal()}
            className="py-2.5 px-6 rounded-full bg-[#141518] hover:bg-black text-white font-extrabold text-xs tracking-wider uppercase flex items-center space-x-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Book Event Slot</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm bg-slate-900/60 border border-slate-800 rounded-2xl">
            Syncing calendar slots......
          </div>
        ) : (
          <GoogleCalendarView
            events={eventsList}
            communities={communities}
            isAdminMode={true}
            currentUserRole={currentUserRole}
            currentUserCommunityName={currentUserCommunityName}
            onSelectDateSlot={(dateStr, timeStr) => openAddModal(dateStr, timeStr)}
            onEditEvent={(evt) => openEditModal(evt)}
            onToggleStatus={(id, currentStatus, comm) => handleToggleStatus(id, currentStatus, comm)}
            onDeleteEvent={(id, comm) => handleDelete(id, comm)}
          />
        )}
      </div>

      {showModal && mounted && typeof document !== 'undefined' && createPortal(
        <div
          data-lenis-prevent
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setEditingEvent(null);
            }
          }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
        >
          <div
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            className="brutalist-card p-5 sm:p-8 w-full max-w-3xl rounded-t-2xl sm:rounded-2xl text-white space-y-5 sm:space-y-6 my-0 sm:my-auto max-h-[92vh] sm:max-h-[88vh] overflow-y-auto relative shadow-2xl border-t-2 sm:border-2 border-[#1e2436] bg-[#0f121d]"
          >
            <div className="flex items-center justify-between border-b border-[#1e2436] pb-3.5">
              <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                {editingEvent ? 'Modify Event / Reserved Slot' : 'Book Date / Time Slot'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingEvent(null);
                }}
                className="text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-[#161a29] transition-colors text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleBookSlot} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. BitBurst Hackathon 2.0"
                    required
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#6366f1]" /> Event Format / Mode *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEventType('offline')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${eventType === 'offline'
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                        : 'bg-[#161a29] border-[#1e2436] text-slate-400 hover:text-white'
                        }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Offline</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEventType('online')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${eventType === 'online'
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-[#161a29] border-[#1e2436] text-slate-400 hover:text-white'
                        }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Online</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Venue / Stream Link *
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder={eventType === 'online' ? "e.g. Google Meet / Zoom Stream" : "e.g. Main Auditorium / Lab 2 / CEV"}
                    required
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Tech Fest">Tech Fest</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Competition">Competition</option>
                    {isSuperAdmin && (
                      <>
                        <option value="Exam">Exam</option>
                        <option value="College Schedule">College Schedule</option>
                      </>
                    )}
                    <option value="Other">Other (Custom Category)</option>
                  </select>

                  {category === 'Other' && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Specify custom category name..."
                      required
                      className="mt-2 w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Organizing Community *
                  </label>
                  {isSuperAdmin ? (
                    <select
                      value={selectedCommunityId}
                      onChange={(e) => setSelectedCommunityId(e.target.value)}
                      required
                      className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                    >
                      <option value="">-- Select Organizing Entity --</option>
                      <optgroup label="Institution">
                        {(() => {
                          const collegeComm = communities.find((c) => c.slug === 'college' || c.name.toLowerCase() === 'college');
                          const val = collegeComm ? collegeComm.id : 'college';
                          return (
                            <option value={val}>College</option>
                          );
                        })()}
                      </optgroup>
                      <optgroup label="Student Communities">
                        {communities.filter((c) => c.slug !== 'college' && c.name.toLowerCase() !== 'college').map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[#161a29] border border-[#1e2436] text-xs text-slate-300 flex items-center justify-between h-[42px]">
                      <span className="text-[#94a3b8]">Community:</span>
                      <span className="font-bold text-[#6366f1]">{currentUserCommunityName || 'Assigned Community'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#6366f1]" /> Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#6366f1]" /> End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> Start Time (12-Hr Format) *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> End Time (12-Hr Format) *
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Publishing Status *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('closed')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${status === 'closed'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                        : 'bg-[#161a29] border-[#1e2436] text-slate-400'
                        }`}
                    >
                      <Lock className="w-3.5 h-3.5" /> Closed (Draft)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('live')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${status === 'live'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-[#161a29] border-[#1e2436] text-slate-400'
                        }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Live (Publish)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Event Poster Image
                    </label>
                    {posterUrl && posterUrl.trim() !== '' && (
                      <button
                        type="button"
                        onClick={() => setPosterUrl('')}
                        className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3 h-3" /> Remove Poster
                      </button>
                    )}
                  </div>

                  <div className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterFileUpload}
                      disabled={uploadingPoster}
                      id="poster-file-upload"
                      className="hidden"
                    />
                    <label
                      htmlFor="poster-file-upload"
                      className="w-full bg-[#161a29] hover:bg-[#1e2436] text-slate-300 hover:text-white rounded-xl px-4 py-2.5 text-xs border border-[#1e2436] flex flex-col justify-center space-y-1.5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Upload className="w-4 h-4 text-[#6366f1] shrink-0" />
                          <span className="truncate font-bold">
                            {uploadingPoster ? `Uploading Poster...` : posterUrl ? 'Change Poster Image' : 'Upload Poster Image'}
                          </span>
                        </div>
                        {uploadingPoster && (
                          <span className="text-[10px] font-mono font-bold text-[#6366f1]">{uploadProgress}%</span>
                        )}
                      </div>
                      {uploadingPoster && (
                        <div className="w-full h-1.5 bg-[#0f121d] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#6366f1] transition-all duration-150 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </label>
                  </div>

                  {posterUrl && posterUrl.trim() !== '' && (
                    <div className="mt-2.5 relative w-full h-32 rounded-xl overflow-hidden border border-[#1e2436] bg-[#161a29] group">
                      <img
                        src={posterUrl}
                        alt="Poster Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setPosterUrl('')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Remove Poster Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-400" /> Registration / Form Link (Optional)
                </label>
                <input
                  type="url"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="e.g. https://forms.google.com/your-event-form or https://unstop.com/..."
                  className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  If provided, a &quot;Register Now&quot; button will redirect users to your form. If left empty, no registration button will be shown on the event page.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Detailed Description of Event *
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Explain event details, schedule, venue rules, food info, prize details..."
                  required
                  className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] h-24 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Optional Highlights / Perks (Optional)
                </label>
                <input
                  type="text"
                  value={perks}
                  onChange={(e) => setPerks(e.target.value)}
                  placeholder="e.g. KTU Activity Points, Certificates, Free Refreshments"
                  className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                />
                <p className="text-[10px] text-[#94a3b8] mt-1">Leave blank if no special perks apply.</p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#1e2436]">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-[#94a3b8] hover:text-white text-xs font-bold hover:bg-[#161a29] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="brutalist-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Saving Event...' : (editingEvent ? 'Save Changes' : 'Reserve & Save Slot')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
