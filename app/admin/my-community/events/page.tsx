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
  Upload,
  X,
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
    if (role === 'editor') {
      setToastMsg({ type: 'error', text: 'RBAC Restriction: Editors are not permitted to delete events.' });
      setDeleteId(null);
      return;
    }
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
      <div className="p-8 text-center text-neutral-500 text-xs bg-white border border-neutral-100 rounded-[28px] space-y-3">
        <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="font-bold text-[#141518] text-base">No Community Assigned</h3>
        <p>Your account is not assigned to a specific community entity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {community.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={community.logo_url}
              alt={community.name}
              className="w-12 h-12 rounded-2xl object-cover border border-neutral-200 shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-[#141518] text-white flex items-center justify-center font-extrabold text-lg font-display shadow-sm">
              {community.initials || community.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141518] font-display leading-none">{community.name.toUpperCase()} EVENTS</h1>
                <span className="text-[10px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-[#141518] text-white">
                  {role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                Exclusive management hub for {community.name} events & slot bookings.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => openAddModal()}
          className="px-6 py-3 rounded-full bg-[#141518] hover:bg-black text-white text-xs font-extrabold flex items-center gap-2 shadow-md hover:scale-105 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Slot for {community.name}</span>
        </button>
      </div>

      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
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
        <div className="p-5 rounded-[28px] bg-white border border-neutral-200/60 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Total Events</div>
          <div className="text-3xl font-extrabold text-[#141518] font-display">{totalEvents}</div>
        </div>
        <div className="p-5 rounded-[28px] bg-emerald-50 border border-emerald-200/60 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Live Published</div>
          <div className="text-3xl font-extrabold text-emerald-900 font-display">{liveCount}</div>
        </div>
        <div className="p-5 rounded-[28px] bg-amber-50 border border-amber-200/60 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Closed Drafts</div>
          <div className="text-3xl font-extrabold text-amber-900 font-display">{closedCount}</div>
        </div>
        <div className="p-5 rounded-[28px] bg-sky-50 border border-sky-200/60 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-sky-700">Online Events</div>
          <div className="text-3xl font-extrabold text-sky-900 font-display">{onlineCount}</div>
        </div>
      </div>

      {/* View Switcher & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-[28px] border border-neutral-200/60 shadow-sm">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setViewModeTab('grid')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              viewModeTab === 'grid'
                ? 'bg-[#141518] text-white shadow-md'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>

          <button
            onClick={() => setViewModeTab('list')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              viewModeTab === 'list'
                ? 'bg-[#141518] text-white shadow-md'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
        </div>

        {/* Global Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 border border-neutral-200 text-[#141518] placeholder-neutral-400 rounded-full pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-neutral-100 border border-neutral-200 text-[#141518] font-bold text-xs rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="live">Live Only</option>
            <option value="closed">Closed Only</option>
          </select>

          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as any)}
            className="bg-neutral-100 border border-neutral-200 text-[#141518] font-bold text-xs rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
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
          <div className="p-8 text-center text-neutral-500 text-xs bg-white border border-neutral-200/60 rounded-[28px] space-y-2">
            <LayoutGrid className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="font-extrabold text-[#141518]">No Events Found</p>
            <p>No events match your current filter parameters for {community.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => {
              const isOnline = (evt.venue || '').toLowerCase().includes('online');
              return (
                <div
                  key={evt.id}
                  className="p-6 rounded-[28px] bg-white border border-neutral-200/60 hover:shadow-md transition-all space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {evt.category}
                      </span>

                      <button
                        onClick={() => handleToggleStatus(evt.id, evt.status)}
                        className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${
                          evt.status === 'live'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {evt.status === 'live' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
                        <span>{evt.status === 'live' ? 'Live' : 'Draft'}</span>
                      </button>
                    </div>

                    <h3 className="text-lg font-extrabold text-[#141518] font-display line-clamp-2">{evt.title}</h3>

                    <div className="space-y-1.5 text-xs text-neutral-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{evt.event_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{evt.time_slot}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        {isOnline ? <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" /> : <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                        <span className="truncate">{evt.venue || 'Campus Setup'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <a
                      href={`/events/${evt.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-extrabold text-[#141518] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Event
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(evt)}
                        className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                        title="Edit Event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(evt.id)}
                        className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* List View */
        <div className="bg-white rounded-[28px] border border-neutral-200/60 shadow-sm overflow-hidden">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs italic">
              No events found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-400 font-extrabold uppercase border-b border-neutral-100 text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Title & Category</th>
                    <th className="px-6 py-4">Schedule</th>
                    <th className="px-6 py-4">Venue / Mode</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-[#141518]">
                  {filteredEvents.map((evt) => {
                    const isOnline = (evt.venue || '').toLowerCase().includes('online');
                    return (
                      <tr key={evt.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-sm text-[#141518]">{evt.title}</div>
                          <div className="text-[10px] font-bold text-neutral-400 uppercase">{evt.category}</div>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 font-medium">
                          <div>{evt.event_date}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{evt.time_slot}</div>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            {isOnline ? <Globe className="w-3.5 h-3.5 text-sky-600" /> : <MapPin className="w-3.5 h-3.5 text-rose-500" />}
                            <span>{evt.venue || 'Campus Setup'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(evt.id, evt.status)}
                            className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border transition-all ${
                              evt.status === 'live'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {evt.status === 'live' ? 'Live' : 'Draft'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(evt)}
                              className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                              title="Edit Event"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(evt.id)}
                              className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                              title="Delete Event"
                            >
                              <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="p-6 sm:p-8 max-w-xl w-full space-y-6 rounded-[28px] relative text-[#141518] bg-white border border-neutral-200/80 shadow-2xl my-auto">
            <h2 className="text-xl font-extrabold font-display text-[#141518] border-b border-neutral-100 pb-3">
              {editingEvent ? 'Edit Community Event' : `Book Slot for ${community.name}`}
            </h2>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-extrabold text-[#141518] uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Tech Symposium 2026"
                  className="w-full bg-neutral-100 border border-neutral-200 text-[#141518] rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#141518] uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-neutral-100 border border-neutral-200 text-[#141518] font-bold rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#141518] uppercase tracking-wider mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-neutral-100 border border-neutral-200 text-[#141518] font-bold rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#141518] uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-neutral-100 border border-neutral-200 text-[#141518] font-bold rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#141518] uppercase tracking-wider mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-neutral-100 border border-neutral-200 text-[#141518] font-bold rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#141518] uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-100 border border-neutral-200 text-[#141518] font-bold rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
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
                  <label className="block text-xs font-extrabold text-[#141518] uppercase tracking-wider mb-1">
                    Event Mode *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEventType('offline')}
                      className={`py-2 rounded-full border text-xs font-extrabold flex items-center justify-center gap-1 transition-colors ${
                        eventType === 'offline'
                          ? 'bg-[#141518] text-white border-black shadow-sm'
                          : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" /> Offline
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventType('online')}
                      className={`py-2 rounded-full border text-xs font-extrabold flex items-center justify-center gap-1 transition-colors ${
                        eventType === 'online'
                          ? 'bg-[#141518] text-white border-black shadow-sm'
                          : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" /> Online
                    </button>
                  </div>
                </div>
              </div>

              {category === 'Other' && (
                <div>
                  <label className="block text-xs font-extrabold text-[#141518] uppercase tracking-wider mb-1">
                    Custom Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name"
                    className="w-full bg-neutral-100 border border-neutral-200 text-[#141518] rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-[#141518] uppercase tracking-wider mb-1">
                  Venue / Location *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder={eventType === 'online' ? 'Google Meet / Zoom link' : 'Main Auditorium / Lab 2'}
                  className="w-full bg-neutral-100 border border-neutral-200 text-[#141518] rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-[#141518] uppercase tracking-wider">
                    Event Poster Image
                  </label>
                  {posterUrl && posterUrl.trim() !== '' && (
                    <button
                      type="button"
                      onClick={() => setPosterUrl('')}
                      className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1 transition-colors"
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
                    id="my-comm-poster-file-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="my-comm-poster-file-upload"
                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-[#141518] rounded-full px-4 py-2.5 text-xs border border-neutral-200 flex flex-col justify-center space-y-1.5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Upload className="w-4 h-4 text-[#141518] shrink-0" />
                        <span className="truncate font-extrabold">
                          {uploadingPoster ? `Uploading Poster...` : posterUrl ? 'Change Poster Image' : 'Upload Poster Image'}
                        </span>
                      </div>
                      {uploadingPoster && (
                        <span className="text-[10px] font-mono font-bold text-[#141518]">{uploadProgress}%</span>
                      )}
                    </div>
                    {uploadingPoster && (
                      <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black transition-all duration-150 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </label>
                </div>

                {posterUrl && posterUrl.trim() !== '' && (
                  <div className="mt-2.5 relative w-full h-32 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 group">
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
                        className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Remove Poster Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#141518] uppercase tracking-wider mb-1">
                  Publishing Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('closed')}
                    className={`py-2 rounded-full border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors ${
                      status === 'closed'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" /> Closed Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('live')}
                    className={`py-2 rounded-full border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors ${
                      status === 'live'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live Publish
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-neutral-500 hover:text-[#141518] font-bold rounded-full hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingPoster}
                  className="py-2.5 px-6 rounded-full bg-[#141518] hover:bg-black text-white text-xs font-extrabold shadow-md disabled:opacity-50 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="p-6 max-w-sm w-full space-y-4 rounded-[28px] text-[#141518] bg-white border border-neutral-200/80 shadow-2xl">
            <h3 className="text-lg font-extrabold text-[#141518] font-display">Delete Community Event?</h3>
            <p className="text-xs text-neutral-500 font-medium">
              Are you sure you want to permanently delete this event? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-xs text-neutral-500 hover:text-[#141518] font-bold rounded-full hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-full font-extrabold text-xs shadow-md transition-colors"
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
