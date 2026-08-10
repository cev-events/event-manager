// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  ShieldAlert,
  Globe,
  MapPin,
  Clock,
  Sparkles,
  List,
  LayoutGrid,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { EventItem, Community, UserRole } from '@/types/database.types';
import { uploadImageFile } from '@/lib/upload';

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

export default function MyCommunityEventsPage() {
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const [role, setRole] = useState<UserRole>('editor');
  const [events, setEvents] = useState<any[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'closed'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'offline' | 'online'>('all');
  const [viewModeTab, setViewModeTab] = useState<'grid' | 'list'>('grid');

  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State for Booking / Editing Events
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('16:00');
  const [category, setCategory] = useState('Workshop');
  const [customCategory, setCustomCategory] = useState('');
  const [status, setStatus] = useState<'live' | 'closed'>('closed');
  const [desc, setDesc] = useState('');
  const [perks, setPerks] = useState('');
  const [eventType, setEventType] = useState<'offline' | 'online'>('offline');
  const [venue, setVenue] = useState('Campus Setup / CEV');
  const [posterUrl, setPosterUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      // 1. Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, community_id')
        .eq('id', session.user.id)
        .single();

      if (!profile || !profile.community_id) {
        setLoading(false);
        return;
      }

      setRole(profile.role);

      // 2. Fetch community details
      const { data: commData } = await supabase
        .from('communities')
        .select('*')
        .eq('id', profile.community_id)
        .single();

      if (commData) {
        setCommunity(commData);
      }

      // 3. Fetch all communities for calendar reference
      const { data: allComms } = await supabase.from('communities').select('*');
      if (allComms) {
        setCommunities(allComms);
      }

      // 4. Fetch events belonging strictly to this community
      const { data: eventData } = await supabase
        .from('events')
        .select('*, community:communities(name, color, initials)')
        .eq('community_id', profile.community_id)
        .order('event_date', { ascending: false });

      if (eventData) {
        const mappedEvents = eventData.map((item: any) => ({
          ...item,
          date: item.event_date,
          community: item.community?.name || commData?.name || 'Community',
        }));
        setEvents(mappedEvents as any[]);
      }
    } catch (err) {
      console.error('Error loading community events:', err);
      setToastMsg({ type: 'error', text: 'Failed to load community events.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 5 * 1024 * 1024) {
      setToastMsg({ type: 'error', text: 'Poster image size must be under 5MB.' });
      return;
    }

    setUploadingPoster(true);
    setUploadProgress(0);

    try {
      const publicUrl = await uploadImageFile(file, 'posters', (percent) => setUploadProgress(percent));
      setPosterUrl(publicUrl);
      setToastMsg({ type: 'success', text: 'Event poster WebP uploaded successfully!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload poster';
      setToastMsg({ type: 'error', text: msg });
    } finally {
      setUploadingPoster(false);
      setUploadProgress(0);
    }
  };

  const openAddModal = (initialDate?: string, initialStartTime?: string) => {
    setEditingEvent(null);
    setTitle('');
    const targetDate = initialDate || new Date().toISOString().split('T')[0];
    setStartDate(targetDate);
    setEndDate(targetDate);
    setStartTime(initialStartTime || '10:00');
    setEndTime('16:00');
    setCategory('Workshop');
    setCustomCategory('');
    setStatus('closed');
    setDesc('');
    setPerks('');
    setEventType('offline');
    setVenue('Campus Setup / CEV');
    setPosterUrl('');
    setRedirectUrl('');
    setShowModal(true);
  };

  const openEditModal = (evt: EventItem) => {
    setEditingEvent(evt);
    setTitle(evt.title || '');

    const rawDateStr = evt.event_date || (evt as any).date || '';
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

    if (evt.time_slot && evt.time_slot.includes(' - ')) {
      const times = evt.time_slot.split(' - ');
      setStartTime(times[0].trim());
      setEndTime(times[1].trim());
    } else {
      setStartTime('10:00');
      setEndTime('16:00');
    }

    const stdCategories = ['Workshop', 'Hackathon', 'Competition', 'Seminar', 'Exam', 'Meetup', 'Cultural'];
    if (stdCategories.includes(evt.category)) {
      setCategory(evt.category);
      setCustomCategory('');
    } else {
      setCategory('Other');
      setCustomCategory(evt.category);
    }

    setStatus(evt.status || 'closed');
    setDesc(evt.description || '');
    setPerks(evt.perks || '');

    const rawVenue = evt.venue || '';
    if (rawVenue.toLowerCase().startsWith('online')) {
      setEventType('online');
      setVenue(rawVenue.replace(/^online\s*•\s*/i, ''));
    } else {
      setEventType('offline');
      setVenue(rawVenue.replace(/^offline\s*•\s*/i, ''));
    }

    setPosterUrl(evt.poster_url || '');
    setRedirectUrl(evt.redirect_url || '');
    setShowModal(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!community || !title.trim() || !startDate) return;

    setSaving(true);
    setToastMsg(null);

    const finalCategory = category === 'Other' ? customCategory.trim() || 'General' : category;
    const finalEventDate = startDate === endDate || !endDate ? startDate : `${startDate} to ${endDate}`;
    const finalTimeSlot = `${startTime} - ${endTime}`;
    const venuePrefix = eventType === 'online' ? 'Online' : 'Offline';
    const finalVenue = `${venuePrefix} • ${venue.trim() || 'Campus Setup / CEV'}`;

    try {
      const supabase = createClient();

      let targetSlug = editingEvent ? editingEvent.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (!editingEvent) {
        const uniqueSuffix = Date.now().toString(36);
        targetSlug = `${targetSlug}-${uniqueSuffix}`;
      }

      const payload = {
        title: title.trim(),
        slug: targetSlug,
        category: finalCategory,
        community_id: community.id,
        event_date: finalEventDate,
        time_slot: finalTimeSlot,
        venue: finalVenue,
        status,
        description: desc.trim() || null,
        perks: perks.trim() || null,
        poster_url: posterUrl.trim() || null,
        redirect_url: redirectUrl.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (editingEvent) {
        const { error } = await supabase.from('events').update(payload).eq('id', editingEvent.id);
        if (error) throw error;
        setToastMsg({ type: 'success', text: `Updated "${title}" successfully!` });
      } else {
        const { error } = await supabase.from('events').insert([payload]);
        if (error) throw error;
        setToastMsg({ type: 'success', text: `Created "${title}" for ${community.name}!` });
      }

      setShowModal(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save event';
      setToastMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: 'live' | 'closed') => {
    const nextStatus = currentStatus === 'live' ? 'closed' : 'live';
    try {
      const supabase = createClient();
      const { error } = await supabase.from('events').update({ status: nextStatus }).eq('id', id);
      if (error) throw error;
      setToastMsg({
        type: 'success',
        text: `Event status updated to ${nextStatus === 'live' ? 'Live (Publish)' : 'Closed (Draft)'}.`,
      });
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update event status';
      setToastMsg({ type: 'error', text: msg });
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteId) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('events').delete().eq('id', deleteId);
      if (error) throw error;
      setToastMsg({ type: 'success', text: 'Event deleted successfully.' });
      setDeleteId(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete event';
      setToastMsg({ type: 'error', text: msg });
    }
  };

  // Filtered Events for List View
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.venue || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'live' ? evt.status === 'live' : evt.status === 'closed';

    const isOnline = (evt.venue || '').toLowerCase().includes('online');
    const matchesFormat =
      formatFilter === 'all' ? true : formatFilter === 'online' ? isOnline : !isOnline;

    return matchesSearch && matchesStatus && matchesFormat;
  });

  const totalEvents = events.length;
  const liveCount = events.filter((e) => e.status === 'live').length;
  const closedCount = events.filter((e) => e.status === 'closed').length;
  const onlineCount = events.filter((e) => (e.venue || '').toLowerCase().includes('online')).length;

  if (loading) {
    return (
      <div className="p-8 text-center text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-xl">
        Loading community events...
      </div>
    );
  }

  if (!community) {
    return (
      <div className="p-8 text-center text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-xl space-y-3">
        <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
        <h3 className="font-bold text-white text-base">No Community Assigned</h3>
        <p>Your account is not assigned to a specific community entity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2436] pb-4">
        <div className="flex items-center space-x-4">
          {community.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={community.logo_url}
              alt={community.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#1e2436]"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#161a29] border border-[#1e2436] flex items-center justify-center text-white font-bold text-lg font-display">
              {community.initials || community.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white font-display">{community.name} Events</h1>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#6366f1] text-white border border-[#4f46e5]">
                {role}
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Exclusive management hub for {community.name} events & slot bookings.
            </p>
          </div>
        </div>

        <button
          onClick={() => openAddModal()}
          className="brutalist-btn-primary px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Book Slot for {community.name}</span>
        </button>
      </div>

      {toastMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : 'bg-red-950/80 border-red-800 text-red-200'
          }`}
        >
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="text-xs underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="brutalist-card p-4 rounded-xl bg-[#0f121d] border border-[#1e2436] space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Total Events</div>
          <div className="text-2xl font-bold text-white font-mono">{totalEvents}</div>
        </div>
        <div className="brutalist-card p-4 rounded-xl bg-[#0f121d] border border-[#1e2436] space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Live Published</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{liveCount}</div>
        </div>
        <div className="brutalist-card p-4 rounded-xl bg-[#0f121d] border border-[#1e2436] space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Closed Drafts</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{closedCount}</div>
        </div>
        <div className="brutalist-card p-4 rounded-xl bg-[#0f121d] border border-[#1e2436] space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Online Events</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{onlineCount}</div>
        </div>
      </div>

      {/* View Switcher & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0f121d] p-3 rounded-xl border border-[#1e2436]">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            onClick={() => setViewModeTab('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewModeTab === 'grid'
                ? 'bg-[#6366f1] text-white border border-[#4f46e5]'
                : 'bg-[#161a29] text-[#94a3b8] hover:text-white border border-[#1e2436]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>

          <button
            onClick={() => setViewModeTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewModeTab === 'list'
                ? 'bg-[#6366f1] text-white border border-[#4f46e5]'
                : 'bg-[#161a29] text-[#94a3b8] hover:text-white border border-[#1e2436]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
        </div>

        {/* Global Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#161a29] border border-[#1e2436] text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#6366f1]"
          >
            <option value="all">All Statuses</option>
            <option value="live">Live Only</option>
            <option value="closed">Closed Only</option>
          </select>

          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as any)}
            className="bg-[#161a29] border border-[#1e2436] text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#6366f1]"
          >
            <option value="all">All Formats</option>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {viewModeTab === 'grid' ? (
        filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-xl space-y-2">
            <LayoutGrid className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-bold text-white">No Events Found</p>
            <p>No events match your current filter parameters for {community.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => {
              const isOnline = (evt.venue || '').toLowerCase().includes('online');
              const isClosed = evt.status === 'closed';
              const cleanVenue = (evt.venue || '').replace(/^(offline|online)\s*•\s*/i, '');

              return (
                <div
                  key={evt.id}
                  className="brutalist-card p-5 rounded-2xl bg-[#0f121d] border border-[#1e2436] hover:border-[#6366f1]/60 transition-all flex flex-col justify-between space-y-4 shadow-lg group relative"
                >
                  <div className="space-y-3">
                    {/* Poster Thumbnail */}
                    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-[#161a29] border border-[#1e2436]">
                      {evt.poster_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={evt.poster_url}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#6366f1] space-y-1">
                          <Sparkles className="w-6 h-6" />
                          <span className="text-[10px] font-mono font-bold uppercase">{evt.category}</span>
                        </div>
                      )}

                      {/* Status Overlay Badge */}
                      <span
                        className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border shadow-md ${
                          isClosed
                            ? 'bg-amber-950/90 border-amber-800 text-amber-300'
                            : 'bg-emerald-950/90 border-emerald-800 text-emerald-300'
                        }`}
                      >
                        {isClosed ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {isClosed ? 'Closed Draft' : 'Live'}
                      </span>
                    </div>

                    {/* Meta Category & Format */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/40">
                        {evt.category}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                          isOnline
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}
                      >
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white font-display line-clamp-2 leading-snug">
                      {evt.title}
                    </h3>

                    {/* Date, Time & Venue */}
                    <div className="space-y-1.5 text-xs text-[#94a3b8] font-medium pt-1 border-t border-[#1e2436]">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-[#6366f1] shrink-0" />
                        <span className="truncate">{evt.event_date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-[#6366f1] shrink-0" />
                        <span className="truncate">{evt.time_slot}</span>
                      </div>
                      {cleanVenue && (
                        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                          {isOnline ? <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                          <span className="truncate">{cleanVenue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#1e2436] flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleToggleStatus(evt.id, evt.status || 'live')}
                        className="px-2.5 py-1.5 rounded-lg bg-[#161a29] border border-[#1e2436] text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                        title={isClosed ? 'Publish Live' : 'Unpublish to Draft'}
                      >
                        {isClosed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{isClosed ? 'Publish' : 'Draft'}</span>
                      </button>

                      <button
                        onClick={() => openEditModal(evt)}
                        className="p-1.5 rounded-lg bg-[#161a29] border border-[#1e2436] text-slate-400 hover:text-white transition-colors"
                        title="Edit Event"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {evt.status === 'live' && (
                        <a
                          href={`/events/${evt.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#161a29] border border-[#1e2436] text-slate-400 hover:text-white transition-colors"
                          title="View Public Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        </a>
                      )}

                      <button
                        onClick={() => setDeleteId(evt.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-[#0f121d] border border-[#1e2436] rounded-xl overflow-hidden shadow-xl">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-[#94a3b8] text-xs space-y-2">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-bold text-white">No Events Found</p>
              <p>No events match your current filter parameters for {community.name}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161a29] text-[#94a3b8] font-mono text-[10px] uppercase border-b border-[#1e2436]">
                  <tr>
                    <th className="py-3 px-4">Event Details</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Format & Venue</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2436]">
                  {filteredEvents.map((evt) => {
                    const isOnline = (evt.venue || '').toLowerCase().includes('online');
                    const isClosed = evt.status === 'closed';

                    return (
                      <tr key={evt.id} className="hover:bg-[#161a29]/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            {evt.poster_url ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={evt.poster_url}
                                alt={evt.title}
                                className="w-10 h-10 rounded-lg object-cover border border-[#1e2436] shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#161a29] border border-[#1e2436] shrink-0 flex items-center justify-center text-[#6366f1] font-bold">
                                <Sparkles className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-white text-sm line-clamp-1">{evt.title}</div>
                              <span className="text-[10px] font-mono font-bold uppercase text-[#6366f1]">
                                {evt.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300 font-mono">
                          <div>{evt.event_date}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{evt.time_slot}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                                isOnline
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                              }`}
                            >
                              {isOnline ? 'Online' : 'Offline'}
                            </span>
                            <span className="text-slate-300 text-xs truncate max-w-[150px]">
                              {(evt.venue || '').replace(/^(offline|online)\s*•\s*/i, '')}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit border ${
                              isClosed
                                ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                                : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                            }`}
                          >
                            {isClosed ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {isClosed ? 'Closed Draft' : 'Live Published'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleToggleStatus(evt.id, evt.status || 'live')}
                              className="p-1.5 rounded-lg bg-[#161a29] border border-[#1e2436] text-slate-400 hover:text-white transition-colors"
                              title={isClosed ? 'Publish Live' : 'Unpublish to Draft'}
                            >
                              {isClosed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
                            </button>

                            <button
                              onClick={() => openEditModal(evt)}
                              className="p-1.5 rounded-lg bg-[#161a29] border border-[#1e2436] text-slate-400 hover:text-white transition-colors"
                              title="Edit Event"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                            </button>

                            <button
                              onClick={() => setDeleteId(evt.id)}
                              className="p-1.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Booking / Editing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="brutalist-card p-6 sm:p-8 max-w-xl w-full space-y-6 rounded-2xl relative text-white bg-[#0f121d] border-2 border-[#1e2436] shadow-2xl my-auto">
            <h2 className="text-xl font-bold font-display text-white border-b border-[#1e2436] pb-3">
              {editingEvent ? 'Edit Community Event' : `Book Slot for ${community.name}`}
            </h2>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Tech Symposium 2026"
                  className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366f1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366f1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366f1]"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Competition">Competition</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Exam">Exam</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Other">Other / Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Event Mode *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEventType('offline')}
                      className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                        eventType === 'offline'
                          ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                          : 'bg-[#161a29] border-[#1e2436] text-slate-400'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" /> Offline
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventType('online')}
                      className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                        eventType === 'online'
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-[#161a29] border-[#1e2436] text-slate-400'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" /> Online
                    </button>
                  </div>
                </div>
              </div>

              {category === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Custom Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name"
                    className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Venue / Location *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder={eventType === 'online' ? 'Google Meet / Zoom link' : 'Main Auditorium / Lab 2'}
                  className="w-full bg-[#161a29] border border-[#1e2436] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Publishing Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('closed')}
                    className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      status === 'closed'
                        ? 'bg-amber-950 border-amber-500 text-amber-300'
                        : 'bg-[#161a29] border-[#1e2436] text-slate-400'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" /> Closed Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('live')}
                    className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      status === 'live'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-[#161a29] border-[#1e2436] text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live Publish
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1e2436] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#1e2436] text-slate-300 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingPoster}
                  className="brutalist-btn-primary px-6 py-2.5 rounded-xl font-bold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Book Event Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="brutalist-card p-6 max-w-sm w-full space-y-4 rounded-2xl text-white bg-[#0f121d] border-2 border-red-900/60 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display">Delete Community Event?</h3>
            <p className="text-xs text-[#94a3b8]">
              Are you sure you want to permanently delete this event? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-[#1e2436] text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
