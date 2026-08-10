// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventItemData } from '@/app/components/MasterCalendar';

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

export function formatTimeSlotTo12Hr(slot?: string): string {
  if (!slot) return '10:00 AM - 04:00 PM';
  if (slot.includes('-')) {
    const parts = slot.split('-');
    return `${formatSingleTime12(parts[0])} - ${formatSingleTime12(parts[1])}`;
  }
  return formatSingleTime12(slot);
}

export function useRealtimeEvents() {
  const [eventsList, setEventsList] = useState<EventItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('events')
        .select('*, community:communities(id, name, slug, color)')
        .order('event_date', { ascending: true });

      if (!error && data) {
        const mapped: EventItemData[] = data.map((item: any) => {
          let dateStr = item.event_date;
          if (item.system_prompt) {
            const match = item.system_prompt.match(/- Date:\s*([^\n]+)/i);
            if (match && match[1]) {
              dateStr = match[1].trim();
            }
          }

          return {
            id: item.id,
            title: item.title,
            category: item.category || 'workshop',
            community: item.community?.name || 'CEV Community',
            community_id: item.community_id || item.community?.id || null,
            community_slug: item.community?.slug || item.community_id || item.community?.id || null,
            community_color: item.community?.color || null,
            date: dateStr,
            event_date: item.event_date || null,
            time_slot: formatTimeSlotTo12Hr(item.time_slot),
            description: item.description || '',
            status: item.status as 'closed' | 'live',
            image: item.poster_url || '/images/poster.webp',
            poster_url: item.poster_url || '/images/poster.webp',
            venue: item.venue || 'Campus Setup / CEV',
            redirect_url: item.redirect_url || null,
            perks: item.perks || null,
            start_date: item.start_date || null,
            end_date: item.end_date || null,
            slug: item.slug || item.id,
          };
        });
        setEventsList(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch events from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    try {
      const supabase = createClient();
      const channel = supabase
        .channel('realtime-events')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
          fetchEvents();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
    }
  }, []);

  return { eventsList, setEventsList, loading, refetch: fetchEvents };
}
