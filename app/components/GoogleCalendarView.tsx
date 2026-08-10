// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  X,
  ArrowUpRight,
  Lock,
  CheckCircle2,
  Edit3,
  Trash2,
  Plus,
  Grid as GridIcon,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import { generate2LineSummary } from '@/lib/summary';
import { UserRole } from '@/types/database.types';

export interface CalendarEvent {
  id: string;
  title: string;
  category: string;
  community: string;
  date: string;
  time_slot?: string | null;
  description?: string | null;
  status?: 'closed' | 'live' | null;
  slug?: string | null;
  venue?: string | null;
  perks?: string | null;
  poster_url?: string | null;
  image?: string | null;
  community_color?: string | null;
}

export interface CommunityOption {
  id: string;
  name: string;
  color: string;
  initials: string;
}

const getEventCommunityColor = (evt: CalendarEvent, communitiesList: CommunityOption[]): string => {
  if (evt.community_color && evt.community_color.startsWith('#')) {
    return evt.community_color;
  }
  const matched = communitiesList.find(
    (c) => c.name.toLowerCase() === (evt.community || '').toLowerCase()
  );
  if (matched?.color && matched.color.startsWith('#')) {
    return matched.color;
  }
  if ((evt.community || '').toLowerCase() === 'college') {
    return '#0ea5e9';
  }
  return '#6366f1';
};

const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || !hex.startsWith('#')) return `rgba(99, 102, 241, ${alpha})`;
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(99, 102, 241, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isDarkColor = (hex: string): boolean => {
  if (!hex || !hex.startsWith('#')) return true;
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return true;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.6;
};

const getReadableTextColor = (hex: string): string => {
  if (isDarkColor(hex)) {
    return '#f8fafc';
  }
  return hex;
};

interface GoogleCalendarViewProps {
  events: CalendarEvent[];
  communities: CommunityOption[];
  isManagerView?: boolean;
  isAdminMode?: boolean;
  currentUserRole?: UserRole;
  currentUserCommunityName?: string;
  onSelectDateSlot?: (dateStr: string, timeStr?: string) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onToggleStatus?: (id: string, currentStatus: 'closed' | 'live', community: string) => void;
  onDeleteEvent?: (id: string, community: string) => void;
}

function parseTimeSlot(slot?: string | null): { startHour: number; endHour: number; displayTime: string } {
  if (!slot || !slot.includes('-')) {
    return { startHour: 10, endHour: 12, displayTime: slot || '10:00 AM - 12:00 PM' };
  }

  const parts = slot.split('-');
  const rawStart = parts[0].trim();
  const rawEnd = parts[1].trim();

  const parseHour = (str: string): number => {
    const isPM = str.toUpperCase().includes('PM');
    const isAM = str.toUpperCase().includes('AM');
    const cleanStr = str.replace(/(AM|PM)/gi, '').trim();
    const timeParts = cleanStr.split(':');
    let hour = parseInt(timeParts[0], 10);
    if (isNaN(hour)) return 9;
    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;
    return hour;
  };

  const startHour = parseHour(rawStart);
  let endHour = parseHour(rawEnd);
  if (endHour <= startHour) endHour = startHour + 1;

  return { startHour, endHour, displayTime: `${rawStart} - ${rawEnd}` };
}

export default function GoogleCalendarView({
  events,
  communities,
  isAdminMode = false,
  currentUserRole = 'editor',
  currentUserCommunityName = '',
  onSelectDateSlot,
  onEditEvent,
  onToggleStatus,
  onDeleteEvent,
}: GoogleCalendarViewProps) {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'grid'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeModalEvent, setActiveModalEvent] = useState<CalendarEvent | null>(null);
  const [gridPage, setGridPage] = useState<number>(1);
  const EVENTS_PER_PAGE = 6;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setGridPage(1);
  }, [currentDate, selectedCommunity, selectedStatus]);

  const isEventInMonth = (evt: CalendarEvent, year: number, month: number): boolean => {
    const parts = evt.date.split(' to ');
    const startD = new Date(parts[0].trim());
    if (!isNaN(startD.getTime())) {
      if (startD.getFullYear() === year && startD.getMonth() === month) {
        return true;
      }
    }
    if (parts.length > 1) {
      const endD = new Date(parts[1].trim());
      if (!isNaN(endD.getTime())) {
        if (endD.getFullYear() === year && endD.getMonth() === month) {
          return true;
        }
        const targetStart = new Date(year, month, 1);
        const targetEnd = new Date(year, month + 1, 0);
        if (startD <= targetEnd && endD >= targetStart) {
          return true;
        }
      }
    }
    return false;
  };

  const isSuperAdmin = currentUserRole === 'dev' || currentUserRole === 'admin';

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const filteredEvents = events.filter((evt) => {
    if (!isAdminMode && (evt.status || 'closed') === 'closed') {
      return false;
    }
    if (selectedCommunity !== 'all' && (evt.community || '').toLowerCase() !== selectedCommunity.toLowerCase()) {
      return false;
    }
    if (selectedStatus !== 'all' && (evt.status || 'closed') !== selectedStatus) {
      return false;
    }
    return true;
  });

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month' || viewMode === 'grid') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month' || viewMode === 'grid') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => setCurrentDate(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const startDay = getFirstDayOfMonth(currentYear, currentMonth);

  const getWeekDays = (refDate: Date) => {
    const startOfWeek = new Date(refDate);
    startOfWeek.setDate(refDate.getDate() - refDate.getDay());
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const isEventOnDate = (evt: CalendarEvent, dateObj: Date): boolean => {
    if (!evt.date) return false;

    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const targetStr = `${y}-${m}-${d}`;

    const cleanStr = evt.date.trim();

    let startPart = cleanStr;
    let endPart = cleanStr;

    if (cleanStr.toLowerCase().includes(' to ')) {
      const parts = cleanStr.split(/ to /i);
      startPart = parts[0].trim();
      endPart = parts[1].trim();
    } else if (cleanStr.includes(' - ')) {
      const parts = cleanStr.split(/\s+-\s+/);
      startPart = parts[0].trim();
      endPart = parts[1].trim();
    } else if (cleanStr.includes(' / ')) {
      const parts = cleanStr.split(/\s+\/\s+/);
      startPart = parts[0].trim();
      endPart = parts[1].trim();
    }

    const extractIsoDate = (str: string): string => {
      if (!str) return '';
      const match = str.match(/\d{4}-\d{2}-\d{2}/);
      if (match) return match[0];
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        const py = parsed.getFullYear();
        const pm = String(parsed.getMonth() + 1).padStart(2, '0');
        const pd = String(parsed.getDate()).padStart(2, '0');
        return `${py}-${pm}-${pd}`;
      }
      return str.split('T')[0];
    };

    const isoStart = extractIsoDate(startPart);
    const isoEnd = extractIsoDate(endPart) || isoStart;

    if (!isoStart) return false;

    return targetStr >= isoStart && targetStr <= isoEnd;
  };

  const getEventDatePosition = (evt: CalendarEvent, dateObj: Date) => {
    if (!evt.date) return { isMultiDay: false, isStart: true, isEnd: true, isActualStart: true, isActualEnd: true };

    const cleanStr = evt.date.trim();
    let startPart = cleanStr;
    let endPart = cleanStr;

    if (cleanStr.toLowerCase().includes(' to ')) {
      const parts = cleanStr.split(/ to /i);
      startPart = parts[0].trim();
      endPart = parts[1].trim();
    } else if (cleanStr.includes(' - ')) {
      const parts = cleanStr.split(/\s+-\s+/);
      startPart = parts[0].trim();
      endPart = parts[1].trim();
    } else if (cleanStr.includes(' / ')) {
      const parts = cleanStr.split(/\s+\/\s+/);
      startPart = parts[0].trim();
      endPart = parts[1].trim();
    }

    const extractIsoDate = (str: string): string => {
      if (!str) return '';
      const match = str.match(/\d{4}-\d{2}-\d{2}/);
      if (match) return match[0];
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        const py = parsed.getFullYear();
        const pm = String(parsed.getMonth() + 1).padStart(2, '0');
        const pd = String(parsed.getDate()).padStart(2, '0');
        return `${py}-${pm}-${pd}`;
      }
      return str.split('T')[0];
    };

    const isoStart = extractIsoDate(startPart);
    const isoEnd = extractIsoDate(endPart) || isoStart;

    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const currentIso = `${y}-${m}-${d}`;

    const isMultiDay = Boolean(isoStart && isoEnd && isoStart !== isoEnd);

    if (!isMultiDay) {
      return { isMultiDay: false, isStart: true, isEnd: true, isActualStart: true, isActualEnd: true };
    }

    const isActualStart = currentIso === isoStart;
    const isActualEnd = currentIso === isoEnd;
    const isWeekStart = dateObj.getDay() === 0;
    const isWeekEnd = dateObj.getDay() === 6;

    const isStart = isActualStart || (currentIso > isoStart && currentIso <= isoEnd && isWeekStart);
    const isEnd = isActualEnd || (currentIso >= isoStart && currentIso < isoEnd && isWeekEnd);

    return { isMultiDay: true, isStart, isEnd, isActualStart, isActualEnd };
  };

  const formatDateForSlot = (dateObj: Date): string => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="brutalist-card rounded-2xl overflow-hidden flex flex-col font-sans border-2 border-[#1e2436] bg-[#0f121d]">
      <div className="p-3 sm:p-4 border-b border-[#1e2436] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161a29]">
        <div className="flex items-center justify-between sm:justify-start space-x-2 sm:space-x-3">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-[#0f121d] border border-[#1e2436] text-xs font-bold text-white hover:border-[#6366f1] transition-colors shrink-0"
          >
            Today
          </button>
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl text-[#94a3b8] hover:text-white hover:bg-[#0f121d] transition-colors border border-transparent hover:border-[#1e2436]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl text-[#94a3b8] hover:text-white hover:bg-[#0f121d] transition-colors border border-transparent hover:border-[#1e2436]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={currentMonth}
              onChange={(e) => {
                const newD = new Date(currentDate);
                newD.setMonth(parseInt(e.target.value, 10));
                setCurrentDate(newD);
              }}
              className="bg-[#0f121d] border border-[#1e2436] text-white text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#6366f1] transition-colors cursor-pointer"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => {
                const newD = new Date(currentDate);
                newD.setFullYear(parseInt(e.target.value, 10));
                setCurrentDate(newD);
              }}
              className="bg-[#0f121d] border border-[#1e2436] text-white text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#6366f1] transition-colors cursor-pointer"
            >
              {Array.from({ length: 8 }, (_, i) => 2024 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between sm:justify-end">
          {isAdminMode && onSelectDateSlot && viewMode === 'day' && (
            <button
              onClick={() => onSelectDateSlot(formatDateForSlot(currentDate))}
              className="px-3 py-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0"
              title="Book Slot on this Date"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Slot</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="px-2.5 py-1.5 bg-[#0f121d] border border-[#1e2436] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#6366f1] w-full sm:w-auto"
            >
              <option value="all">All Communities</option>
              {communities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {isAdminMode && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-[#0f121d] border border-[#1e2436] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#6366f1] w-full sm:w-auto"
              >
                <option value="all">All Statuses</option>
                <option value="closed">Closed Draft Slots</option>
                <option value="live">Live Published</option>
              </select>
            )}
          </div>

          <div className="flex items-center bg-[#0f121d] border border-[#1e2436] rounded-xl p-1 shrink-0 overflow-x-auto">
            {(['month', 'week', 'day', 'grid'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 text-xs font-semibold capitalize rounded-lg transition-all ${
                  viewMode === mode
                    ? 'bg-[#6366f1] text-white shadow-sm font-bold'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'month' && (
        <div className="flex-1 flex flex-col min-h-[500px]">
          <div className="grid grid-cols-7 border-b border-[#1e2436] bg-[#0f121d] text-center text-xs font-bold text-[#94a3b8] py-2 uppercase tracking-wider">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-[#08090d]">
            {Array.from({ length: startDay }).map((_, idx) => (
              <div key={`empty-${idx}`} className="border-r border-b border-[#1e2436]/60 bg-[#0f121d]/40 min-h-[90px]" />
            ))}

            {Array.from({ length: totalDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateObj = new Date(currentYear, currentMonth, dayNum);
              const dayEvents = filteredEvents.filter((evt) => isEventOnDate(evt, dateObj));
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === currentMonth &&
                new Date().getFullYear() === currentYear;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => {
                    setCurrentDate(dateObj);
                    setViewMode('day');
                  }}
                  className="border-r border-b border-[#1e2436] py-1 px-0 min-h-[90px] flex flex-col justify-start hover:bg-[#161a29]/60 cursor-pointer transition-colors group relative"
                  title={`Click to view Day schedule for ${monthNames[currentMonth]} ${dayNum}`}
                >
                  <div className="flex items-center justify-between mb-1 px-1.5">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
                        isToday ? 'bg-[#6366f1] text-white' : 'text-[#94a3b8] group-hover:text-white'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#161a29] text-slate-400 border border-[#1e2436]">
                        {dayEvents.length} {dayEvents.length === 1 ? 'evt' : 'evts'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[72px] scrollbar-hide flex-1 w-full">
                    {dayEvents.map((evt) => {
                      const { displayTime } = parseTimeSlot(evt.time_slot);
                      const isClosed = evt.status === 'closed';
                      const isOwnCommunity = isSuperAdmin || (
                        currentUserCommunityName &&
                        (evt.community || '').toLowerCase() === currentUserCommunityName.toLowerCase()
                      );

                      const { isMultiDay, isStart, isEnd, isActualEnd } = getEventDatePosition(evt, dateObj);
                      const commColor = getEventCommunityColor(evt, communities);

                      let shapeClass = 'w-[calc(100%-8px)] mx-1 rounded-md border z-10';
                      if (isMultiDay) {
                        if (isStart && !isEnd) {
                          shapeClass = 'w-[calc(100%-4px)] ml-1 mr-0 rounded-l-md rounded-r-none border-l border-t border-b border-r-0 z-10';
                        } else if (!isStart && !isEnd) {
                          shapeClass = 'w-full mx-0 rounded-none border-x-0 border-t border-b z-10';
                        } else if (!isStart && isEnd) {
                          shapeClass = 'w-[calc(100%-4px)] mr-1 ml-0 rounded-r-md rounded-l-none border-r border-t border-b border-l-0 z-10';
                        } else if (isStart && isEnd) {
                          shapeClass = 'w-[calc(100%-8px)] mx-1 rounded-md border z-10';
                        }
                      }

                      if (isAdminMode && !isOwnCommunity && isClosed) {
                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModalEvent(evt);
                            }}
                            style={{
                              backgroundColor: hexToRgba(commColor, isMultiDay ? 0.6 : 0.2),
                              borderColor: hexToRgba(commColor, 0.7),
                            }}
                            className={`text-left border transition-all block box-border ${shapeClass} ${
                              isMultiDay ? 'h-5 sm:h-6 py-0 px-1' : 'px-1.5 py-0.5'
                            }`}
                          >
                            <div className="text-[10px] font-bold text-amber-300 truncate flex items-center justify-between gap-1 h-full">
                              <span className="flex items-center gap-1 truncate">
                                <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>{isStart ? 'Slot Reserved' : `Reserved (${evt.community})`}</span>
                              </span>
                              {isActualEnd && isMultiDay && (
                                <span className="text-[7px] font-extrabold px-1 rounded uppercase bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                                  END
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }

                      if (isMultiDay) {
                        return (
                          <button
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModalEvent(evt);
                            }}
                            style={{
                              backgroundColor: isClosed ? hexToRgba(commColor, 0.55) : hexToRgba(commColor, 0.85),
                              borderColor: commColor,
                            }}
                            className={`text-left border transition-all block box-border group/btn h-5 sm:h-6 px-1.5 py-0 ${shapeClass} ${
                              isClosed ? 'text-amber-200' : 'text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 h-full w-full overflow-hidden">
                              <span className="text-[10px] font-bold truncate leading-none font-heading flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/90 shadow-sm" />
                                <span className="truncate">{evt.title}</span>
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {isActualEnd && (
                                  <span className="text-[7px] font-extrabold px-1 py-0.2 rounded uppercase bg-rose-950 text-rose-200 border border-rose-700/80 shrink-0 leading-none">
                                    END
                                  </span>
                                )}
                                {isAdminMode && isStart && (
                                  <span className={`text-[7px] font-extrabold px-1 py-0.2 rounded uppercase shrink-0 leading-none ${
                                    isClosed ? 'bg-amber-950 text-amber-300 border border-amber-700' : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                  }`}>
                                    {isClosed ? 'Draft' : 'Live'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalEvent(evt);
                          }}
                          style={{
                            backgroundColor: isClosed ? hexToRgba(commColor, 0.18) : hexToRgba(commColor, 0.28),
                            borderColor: hexToRgba(commColor, 0.7),
                          }}
                          className={`text-left px-1.5 py-0.5 border transition-all block box-border group/btn ${shapeClass} ${
                            isClosed ? 'text-amber-300' : 'text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold truncate leading-tight font-heading flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: commColor }} />
                              <span className="truncate">{evt.title}</span>
                            </span>
                            {isAdminMode && (
                              <span className={`text-[7px] font-extrabold px-0.5 rounded uppercase shrink-0 ${
                                isClosed ? 'bg-amber-900/80 text-amber-300' : 'bg-emerald-950 text-emerald-400'
                              }`}>
                                {isClosed ? 'Draft' : 'Live'}
                              </span>
                            )}
                          </div>
                          <div className="text-[8px] text-slate-300 truncate flex items-center justify-between mt-0.5">
                            <span className="truncate font-semibold" style={{ color: getReadableTextColor(commColor) }}>{evt.community}</span>
                            <span className="text-slate-400">{displayTime.split('-')[0].trim()}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="flex-1 flex flex-col min-h-[520px] bg-[#08090d]">
          <div className="flex border-b border-[#1e2436] bg-[#0f121d] text-center text-xs font-bold text-[#94a3b8] py-2">
            <div className="w-16 shrink-0 text-center text-[#94a3b8] font-mono text-[10px]">Time</div>
            <div className={`flex-1 ${viewMode === 'week' ? 'grid grid-cols-7' : 'flex items-center justify-center'}`}>
              {(viewMode === 'week' ? weekDays : [currentDate]).map((d) => (
                <div
                  key={d.toISOString()}
                  onClick={() => {
                    if (viewMode === 'week') {
                      setCurrentDate(d);
                      setViewMode('day');
                    }
                  }}
                  className={`flex flex-col items-center py-0.5 px-1.5 rounded-lg transition-colors ${
                    viewMode === 'week' ? 'cursor-pointer hover:bg-[#161a29]' : ''
                  }`}
                  title={viewMode === 'week' ? `Click to view Day schedule for ${d.toDateString()}` : undefined}
                >
                  <span>{daysOfWeek[d.getDay()]}</span>
                  <span className={`text-xs font-bold mt-0.5 ${d.toDateString() === new Date().toDateString() ? 'text-[#6366f1]' : 'text-white'}`}>
                    {d.getDate()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[480px] relative scrollbar-hide">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex border-b border-[#1e2436]/60 min-h-[52px]"
              >
                <div className="w-16 shrink-0 border-r border-[#1e2436] text-[10px] text-[#94a3b8] font-mono p-1.5 text-right select-none">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>

                <div className={`flex-1 ${viewMode === 'week' ? 'grid grid-cols-7' : 'relative'}`}>
                  {(viewMode === 'week' ? weekDays : [currentDate]).map((d) => {
                    const dayEvents = filteredEvents.filter((evt) => {
                      if (!isEventOnDate(evt, d)) return false;
                      const { startHour } = parseTimeSlot(evt.time_slot);
                      return startHour === hour;
                    });

                    return (
                      <div
                        key={d.toISOString()}
                        onClick={() => {
                          if (isAdminMode && onSelectDateSlot && dayEvents.length === 0) {
                            const hourStr = hour < 10 ? `0${hour}:00` : `${hour}:00`;
                            onSelectDateSlot(formatDateForSlot(d), hourStr);
                          }
                        }}
                        className={`border-r border-[#1e2436]/40 p-0.5 relative min-h-[52px] cursor-pointer hover:bg-[#161a29]/30 transition-colors ${
                          viewMode === 'day' ? 'w-full h-full' : ''
                        }`}
                      >
                      {dayEvents.map((evt) => {
                        const { startHour, endHour, displayTime } = parseTimeSlot(evt.time_slot);
                        const durationHours = Math.max(1, endHour - startHour);
                        const blockHeightPx = durationHours * 52 - 4;
                        const isClosed = evt.status === 'closed';
                        const commColor = getEventCommunityColor(evt, communities);
                        const isOwnCommunity = isSuperAdmin || (
                          currentUserCommunityName &&
                          (evt.community || '').toLowerCase() === currentUserCommunityName.toLowerCase()
                        );

                        const displayTitle = (isAdminMode && !isOwnCommunity && isClosed) ? 'Slot Reserved' : evt.title;
                        const displayCategory = (isAdminMode && !isOwnCommunity && isClosed) ? 'Reserved' : evt.category;

                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModalEvent(evt);
                            }}
                            style={{
                              height: `${blockHeightPx}px`,
                              backgroundColor: isClosed ? hexToRgba(commColor, 0.2) : hexToRgba(commColor, 0.3),
                              borderColor: hexToRgba(commColor, 0.75),
                            }}
                            className="absolute left-0.5 right-0.5 top-0.5 z-10 p-1.5 rounded-lg border cursor-pointer shadow-md flex flex-col justify-between transition-all overflow-hidden"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-mono uppercase font-bold flex items-center gap-1" style={{ color: commColor }}>
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: commColor }} />
                                  {displayCategory}
                                </span>
                                {isAdminMode && (
                                  <span className={`text-[7px] uppercase font-bold px-1 rounded ${
                                    isClosed ? 'bg-amber-900 text-amber-300' : 'bg-emerald-950 text-emerald-400'
                                  }`}>
                                    {isClosed ? 'Draft' : 'Live'}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-[11px] font-bold text-white line-clamp-1 mt-0.5 font-heading">
                                {displayTitle}
                              </h4>
                              <p className="text-[9px] font-bold line-clamp-1 mt-0.5" style={{ color: getReadableTextColor(commColor) }}>
                                {evt.community}
                              </p>
                            </div>
                            <div className="text-[8px] text-slate-300 font-mono flex items-center justify-between border-t border-slate-700/50 pt-0.5 mt-0.5">
                              <span>{displayTime}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="p-4 sm:p-6 bg-[#08090d] min-h-[420px] space-y-6">
          {(() => {
            const activeMonthEvents = filteredEvents.filter((evt) =>
              isEventInMonth(evt, currentYear, currentMonth)
            );

            if (activeMonthEvents.length === 0) {
              return (
                <div className="p-8 text-center text-slate-500 text-xs italic bg-[#0f121d] border border-[#1e2436] rounded-2xl">
                  No events scheduled for {monthNames[currentMonth]} {currentYear}.
                </div>
              );
            }

            const sortedEvents = [...activeMonthEvents].sort((a, b) => {
              const dateA = new Date(a.date.split(' to ')[0].trim()).getTime() || 0;
              const dateB = new Date(b.date.split(' to ')[0].trim()).getTime() || 0;
              return dateA - dateB;
            });

            const totalEvents = sortedEvents.length;
            const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE) || 1;
            const activePage = Math.min(Math.max(1, gridPage), totalPages);
            const paginatedEvents = sortedEvents.slice(
              (activePage - 1) * EVENTS_PER_PAGE,
              activePage * EVENTS_PER_PAGE
            );

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedEvents.map((evt) => {
                    const isClosed = evt.status === 'closed';
                    const isOwnCommunity =
                      isSuperAdmin ||
                      (currentUserCommunityName &&
                        (evt.community || '').toLowerCase() === currentUserCommunityName.toLowerCase());
                    const commColor = getEventCommunityColor(evt, communities);

                    if (isAdminMode && !isOwnCommunity && isClosed) {
                      return (
                        <div
                          key={evt.id}
                          className="p-6 rounded-2xl bg-slate-900/40 border border-amber-950/80 space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-amber-400 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Slot Booked (Reserved)
                              </span>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-400" /> Time Slot Reserved
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">
                                Reserved by another campus community to prevent scheduling conflicts. Details hidden until live.
                              </p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-slate-800/80 space-y-1">
                            <div className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: commColor }} />
                              <span>{evt.community}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3.5 h-3.5 text-blue-400" /> {evt.date}
                              </span>
                              <span className="text-cyan-400 font-mono text-[11px] flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" /> {evt.time_slot}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalEvent(evt);
                        }}
                        style={{
                          backgroundColor: '#0f121d',
                          borderColor: hexToRgba(commColor, 0.4),
                        }}
                        className="p-6 rounded-2xl border space-y-4 flex flex-col justify-between cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:border-[#6366f1] transition-all duration-300 group relative z-0 hover:z-10"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span
                              className="text-xs uppercase font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5"
                              style={{
                                backgroundColor: hexToRgba(commColor, 0.15),
                                borderColor: hexToRgba(commColor, 0.5),
                                color: commColor,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: commColor }} />
                              {evt.category}
                            </span>
                            {isAdminMode ? (
                              <span
                                className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                                  isClosed
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                }`}
                              >
                                {isClosed ? (
                                  <>
                                    <Lock className="w-3 h-3" /> Closed Draft
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" /> Live
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Live
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="text-xl font-bold text-white font-heading group-hover:text-[#6366f1] transition-colors">
                              {evt.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.description}</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#1e2436] space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{evt.community}</span>
                            {isAdminMode && isOwnCommunity && (
                              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                {onEditEvent && (
                                  <button
                                    onClick={() => onEditEvent(evt)}
                                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                                    title="Edit Event Slot"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                )}
                                {onDeleteEvent && (
                                  <button
                                    onClick={() => onDeleteEvent(evt.id, evt.community)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                                    title="Delete Event Slot"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-blue-400" /> {evt.date}
                            </span>
                            <span className="text-cyan-400 font-mono text-[11px] flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-cyan-400" /> {evt.time_slot}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1e2436] mt-6">
                    <div className="text-xs text-slate-400 font-medium">
                      Showing <span className="text-white font-bold">{(activePage - 1) * EVENTS_PER_PAGE + 1}</span> to{' '}
                      <span className="text-white font-bold">{Math.min(activePage * EVENTS_PER_PAGE, totalEvents)}</span> of{' '}
                      <span className="text-white font-bold">{totalEvents}</span> events in {monthNames[currentMonth]} {currentYear}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        disabled={activePage <= 1}
                        onClick={() => setGridPage((p) => Math.max(1, p - 1))}
                        className="px-3.5 py-1.5 rounded-xl bg-[#161a29] border border-[#1e2436] text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setGridPage(pageNum)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all border ${
                              activePage === pageNum
                                ? 'bg-[#6366f1] text-white border-[#4f46e5] shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                                : 'bg-[#161a29] text-slate-400 hover:text-white border-[#1e2436]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={activePage >= totalPages}
                        onClick={() => setGridPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3.5 py-1.5 rounded-xl bg-[#161a29] border border-[#1e2436] text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {activeModalEvent && mounted && typeof document !== 'undefined' && createPortal(
        <div
          data-lenis-prevent
          onClick={() => setActiveModalEvent(null)}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
          {(() => {
            const isClosed = activeModalEvent.status === 'closed';
            const isOwnCommunity = isSuperAdmin || (
              currentUserCommunityName &&
              activeModalEvent &&
              (activeModalEvent.community || '').toLowerCase() === currentUserCommunityName.toLowerCase()
            );

            if (isClosed && !isOwnCommunity) {
              const commColor = getEventCommunityColor(activeModalEvent, communities);
              return (
                <div
                  data-lenis-prevent
                  onClick={(e) => e.stopPropagation()}
                  className="brutalist-card p-6 sm:p-8 max-w-md w-full space-y-5 rounded-2xl relative text-white bg-[#0f121d] border-2 border-amber-900/60 shadow-2xl my-auto"
                >
                  <button
                    onClick={() => setActiveModalEvent(null)}
                    className="absolute top-4 right-4 text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-[#161a29] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-3 text-center pt-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800 flex items-center justify-center mx-auto text-amber-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 inline-block">
                        Slot Reserved
                      </span>
                      <h3 className="text-xl font-bold text-white font-display mt-2">Time Slot Reserved</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        This time slot is reserved by <span className="font-bold" style={{ color: commColor }}>{activeModalEvent.community}</span> to prevent scheduling conflicts.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-[#94a3b8] bg-[#161a29]/80 p-4 rounded-xl border border-[#1e2436]">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-[#6366f1]" />
                      <span className="text-white font-medium">{activeModalEvent.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-white font-mono">{parseTimeSlot(activeModalEvent.time_slot).displayTime}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-center text-[11px] text-slate-500 italic border-t border-[#1e2436]/60">
                    Event details remain private until published by {activeModalEvent.community}.
                  </div>
                </div>
              );
            }

            return (
              <div
                data-lenis-prevent
                onClick={(e) => e.stopPropagation()}
                className="brutalist-card p-6 sm:p-8 max-w-lg w-full space-y-5 rounded-2xl relative text-white bg-[#0f121d] border-2 border-[#1e2436] shadow-2xl my-auto"
              >
                <button
                  onClick={() => setActiveModalEvent(null)}
                  className="absolute top-4 right-4 text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-[#161a29] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg bg-[#6366f1] text-white border border-[#4f46e5]">
                      {activeModalEvent.category}
                    </span>
                    {isAdminMode && (
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                        activeModalEvent.status === 'closed'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}>
                        {activeModalEvent.status === 'closed' ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {activeModalEvent.status === 'closed' ? 'Closed Draft' : 'Live Published'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white font-display mt-2">{activeModalEvent.title}</h3>
                  <p className="text-xs text-[#94a3b8] font-semibold">{activeModalEvent.community}</p>
                </div>

                {activeModalEvent.description && (
                  <p className="text-xs text-[#94a3b8] leading-relaxed border-t border-b border-[#1e2436] py-3 line-clamp-3">
                    {generate2LineSummary(activeModalEvent.description)}
                  </p>
                )}

                <div className="space-y-2 text-xs text-[#94a3b8]">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-[#6366f1]" />
                    <span>{activeModalEvent.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#6366f1]" />
                    <span>{parseTimeSlot(activeModalEvent.time_slot).displayTime}</span>
                  </div>
                  {(() => {
                    const rawVenue = activeModalEvent.venue || 'Campus Setup / CEV';
                    const isOnline = rawVenue.toLowerCase().startsWith('online') || rawVenue.toLowerCase().includes('online');
                    const formatTag = isOnline ? 'Online' : 'Offline';
                    const cleanLoc = rawVenue.replace(/^(offline|online|hybrid)\s*•\s*/i, '').trim() || rawVenue;

                    return (
                      <div className="flex items-center space-x-2 pt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                          isOnline
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}>
                          {formatTag}
                        </span>
                        <span className="text-white font-semibold">{cleanLoc}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-3 border-t border-[#1e2436] flex flex-wrap items-center justify-between gap-2">
                  {isAdminMode && (isSuperAdmin || (currentUserCommunityName && activeModalEvent && (activeModalEvent.community || '').toLowerCase() === currentUserCommunityName.toLowerCase())) && (
                    <div className="flex items-center gap-2">
                      {onToggleStatus && (
                        <button
                          onClick={() => {
                            onToggleStatus(activeModalEvent.id, activeModalEvent.status || 'live', activeModalEvent.community);
                            setActiveModalEvent(null);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition-all ${
                            activeModalEvent.status === 'closed'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                              : 'bg-amber-950 text-amber-300 border-amber-800 hover:bg-amber-900'
                          }`}
                        >
                          {activeModalEvent.status === 'closed' ? 'Publish Live' : 'Set to Draft'}
                        </button>
                      )}

                      {onEditEvent && (
                        <button
                          onClick={() => {
                            onEditEvent(activeModalEvent);
                            setActiveModalEvent(null);
                          }}
                          className="p-2 text-slate-300 hover:text-white rounded-xl bg-[#161a29] hover:bg-[#1e2436] border border-[#1e2436]"
                          title="Edit Slot"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {onDeleteEvent && (
                        <button
                          onClick={() => {
                            onDeleteEvent(activeModalEvent.id, activeModalEvent.community);
                            setActiveModalEvent(null);
                          }}
                          className="p-2 text-slate-300 hover:text-red-400 rounded-xl bg-[#161a29] hover:bg-[#1e2436] border border-[#1e2436]"
                          title="Delete Slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {activeModalEvent.status === 'live' ? (
                    <Link
                      href={`/events/${activeModalEvent.slug || activeModalEvent.id}`}
                      className="brutalist-btn-primary px-4 py-2 text-xs rounded-xl flex items-center space-x-1.5 font-bold ml-auto"
                    >
                      <span>View Page</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="px-3 py-1.5 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 rounded-xl flex items-center gap-1 ml-auto">
                      <Lock className="w-3 h-3" /> Reserved Draft Slot
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>,
        document.body
      )}
    </div>
  );
}

