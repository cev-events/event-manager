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
  Menu,
  Search,
  Settings,
  HelpCircle,
  Users,
  CheckSquare,
  Square
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
  event_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
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
  return '#1565c0';
};

const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || !hex.startsWith('#')) return `rgba(21, 101, 192, ${alpha})`;
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(21, 101, 192, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface GoogleCalendarViewProps {
  events: CalendarEvent[];
  communities: CommunityOption[];
  isAdminMode?: boolean;
  currentUserRole?: UserRole;
  currentUserCommunityName?: string | null;
  onSelectDateSlot?: (dateStr: string, timeSlot?: string) => void;
  onEditEvent?: (evt: CalendarEvent) => void;
  onToggleStatus?: (id: string, currentStatus: 'closed' | 'live', community: string) => void;
  onDeleteEvent?: (id: string, community: string) => void;
}

export default function GoogleCalendarView({
  events,
  communities,
  isAdminMode = false,
  currentUserRole,
  currentUserCommunityName,
  onSelectDateSlot,
  onEditEvent,
  onToggleStatus,
  onDeleteEvent,
}: GoogleCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [miniDate, setMiniDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'grid'>('month');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeModalEvent, setActiveModalEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [gridPage, setGridPage] = useState<number>(1);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSuperAdmin = currentUserRole === 'dev';

  const visibleEvents = events.filter((evt) => {
    if (!isAdminMode && evt.status === 'closed') {
      return false;
    }
    return true;
  });

  const filteredEvents = visibleEvents.filter((evt) => {
    if (selectedCommunity !== 'all' && (evt.community || '').toLowerCase() !== selectedCommunity.toLowerCase()) {
      return false;
    }
    if (isAdminMode && selectedStatus !== 'all' && evt.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = (evt.title || '').toLowerCase().includes(q);
      const matchComm = (evt.community || '').toLowerCase().includes(q);
      const matchCat = (evt.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchComm && !matchCat) return false;
    }
    return true;
  });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const startDay = getFirstDayOfMonth(currentYear, currentMonth);

  const handlePrev = () => {
    if (viewMode === 'month' || viewMode === 'grid') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
      setMiniDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (viewMode === 'week') {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() - 7);
      setCurrentDate(newD);
    } else if (viewMode === 'day') {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() - 1);
      setCurrentDate(newD);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month' || viewMode === 'grid') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
      setMiniDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (viewMode === 'week') {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() + 7);
      setCurrentDate(newD);
    } else if (viewMode === 'day') {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() + 1);
      setCurrentDate(newD);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setMiniDate(today);
  };

  const parseTimeSlot = (timeSlotStr?: string | null): { displayTime: string; startHour: number; endHour: number } => {
    if (!timeSlotStr) return { displayTime: 'Full Day', startHour: 9, endHour: 17 };
    const cleanSlot = timeSlotStr.trim();
    if (cleanSlot.includes('-')) {
      const parts = cleanSlot.split('-');
      const formatPart = (p: string) => {
        const trimmed = p.trim();
        if (trimmed.includes(':')) {
          const [h, m] = trimmed.split(':').map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            const period = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 === 0 ? 12 : h % 12;
            return `${h12}:${String(m).padStart(2, '0')} ${period}`;
          }
        }
        return trimmed;
      };
      return {
        displayTime: `${formatPart(parts[0])} - ${formatPart(parts[1])}`,
        startHour: parseInt(parts[0].split(':')[0] || '9', 10),
        endHour: parseInt(parts[1].split(':')[0] || '17', 10),
      };
    }
    return { displayTime: cleanSlot, startHour: 9, endHour: 17 };
  };

  const getEventStartEndIso = (evt: CalendarEvent): { startIso: string; endIso: string } => {
    if (evt.start_date && evt.end_date) {
      return { startIso: evt.start_date, endIso: evt.end_date };
    }

    const rawDateStr = evt.date || evt.event_date || '';
    if (rawDateStr.includes(' to ') || rawDateStr.includes(' - ') || rawDateStr.includes(' -> ')) {
      const parts = rawDateStr.split(/\s*(?:to|-|->)\s*/i);
      if (parts.length === 2 && /^\d{4}-\d{2}-\d{2}$/.test(parts[0].trim()) && /^\d{4}-\d{2}-\d{2}$/.test(parts[1].trim())) {
        return { startIso: parts[0].trim(), endIso: parts[1].trim() };
      }
    }

    const iso = evt.start_date || evt.event_date || (evt.date && /^\d{4}-\d{2}-\d{2}$/.test(evt.date.trim()) ? evt.date.trim() : '');
    return { startIso: iso, endIso: evt.end_date || iso };
  };

  const isEventOnDate = (evt: CalendarEvent, dateObj: Date): boolean => {
    const formatYmd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const targetIso = formatYmd(dateObj);
    const { startIso, endIso } = getEventStartEndIso(evt);

    if (startIso && endIso) {
      return targetIso >= startIso && targetIso <= endIso;
    }

    if (evt.date) {
      const dateParts = evt.date.split('-');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        return (
          dateObj.getFullYear() === year &&
          dateObj.getMonth() === month &&
          dateObj.getDate() === day
        );
      }
    }

    return false;
  };

  const getEventDatePosition = (evt: CalendarEvent, dateObj: Date) => {
    const formatYmd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const currentIso = formatYmd(dateObj);
    const { startIso, endIso } = getEventStartEndIso(evt);

    if (!startIso || startIso === endIso) {
      return { isMultiDay: false, isStart: true, isEnd: true, isActualStart: true, isActualEnd: true };
    }

    const isActualStart = currentIso === startIso;
    const isActualEnd = currentIso === endIso;
    const dayOfWeek = dateObj.getDay();
    const isWeekStart = dayOfWeek === 0;
    const isWeekEnd = dayOfWeek === 6;

    const isStart = isActualStart || (currentIso > startIso && currentIso <= endIso && isWeekStart);
    const isEnd = isActualEnd || (currentIso >= startIso && currentIso < endIso && isWeekEnd);

    return { isMultiDay: true, isStart, isEnd, isActualStart, isActualEnd };
  };

  const formatDateForSlot = (dateObj: Date): string => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getMiniDays = () => {
    const miniYear = miniDate.getFullYear();
    const miniMonth = miniDate.getMonth();
    const miniTotalDays = new Date(miniYear, miniMonth + 1, 0).getDate();
    const miniStartDay = new Date(miniYear, miniMonth, 1).getDay();
    return { miniYear, miniMonth, miniTotalDays, miniStartDay };
  };

  const { miniYear, miniMonth, miniTotalDays, miniStartDay } = getMiniDays();

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col font-sans border border-[#28292c] bg-[#131314] text-white shadow-2xl">
      {/* 1. Google Calendar Top Navigation Header */}
      <header className="px-4 py-3 border-b border-[#28292c] flex flex-wrap items-center justify-between gap-3 bg-[#1e1f21]">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-full text-[#94a3b8] hover:text-white hover:bg-[#2b2d31] transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#8ab4f8] text-[#131314] font-bold text-xs flex items-center justify-center font-mono">
              {currentDate.getDate()}
            </div>
            <span className="text-lg font-bold text-white font-display tracking-tight hidden sm:inline">
              Calendar
            </span>
          </div>

          <div className="flex items-center space-x-2 pl-2">
            <button
              onClick={handleToday}
              className="px-4 py-1.5 rounded-full border border-[#444746] text-xs font-semibold text-white hover:bg-[#2b2d31] transition-colors"
            >
              Today
            </button>
            <div className="flex items-center">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-[#2b2d31] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-[#2b2d31] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-white font-display">
            {monthNames[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {isAdminMode && onSelectDateSlot && (
            <button
              onClick={() => onSelectDateSlot(formatDateForSlot(currentDate))}
              className="px-4 py-2 bg-[#2b2d31] hover:bg-[#37393e] border border-[#3c4043] text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-[#8ab4f8]" />
              <span className="hidden sm:inline">Book Slot</span>
            </button>
          )}

          {/* View Mode Selector Dropdown */}
          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="bg-[#2b2d31] border border-[#3c4043] text-white text-xs font-bold rounded-full px-4 py-1.5 focus:outline-none focus:border-[#8ab4f8] transition-colors cursor-pointer appearance-none pr-8"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
              <option value="grid">Grid</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</span>
          </div>
        </div>
      </header>

      {/* 2. Main Calendar Workspace (Sidebar + Grid Layout) */}
      <div className="flex flex-1 min-h-[600px] overflow-hidden">
        {/* Left Sidebar Panel */}
        {showSidebar && (
          <aside className="w-64 shrink-0 border-r border-[#28292c] bg-[#1e1f21] p-4 flex flex-col space-y-6 hidden md:flex">
            {/* Create / Book Slot Button */}
            {isAdminMode && onSelectDateSlot && (
              <button
                onClick={() => onSelectDateSlot(formatDateForSlot(currentDate))}
                className="w-full py-3 px-5 bg-[#2b2d31] hover:bg-[#37393e] border border-[#3c4043] text-white rounded-full font-bold text-xs shadow-md flex items-center gap-3 transition-all"
              >
                <Plus className="w-5 h-5 text-[#8ab4f8]" />
                <span>Create Slot</span>
              </button>
            )}

            {/* Mini Month Datepicker Widget */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white px-1">
                <span>{monthNames[miniMonth]} {miniYear}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setMiniDate(new Date(miniYear, miniMonth - 1, 1))}
                    className="p-1 rounded hover:bg-[#2b2d31] text-slate-400 hover:text-white"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setMiniDate(new Date(miniYear, miniMonth + 1, 1))}
                    className="p-1 rounded hover:bg-[#2b2d31] text-slate-400 hover:text-white"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                {Array.from({ length: miniStartDay }).map((_, idx) => (
                  <div key={`mini-empty-${idx}`} />
                ))}
                {Array.from({ length: miniTotalDays }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const isMiniToday =
                    new Date().getDate() === dayNum &&
                    new Date().getMonth() === miniMonth &&
                    new Date().getFullYear() === miniYear;

                  const isSelected =
                    currentDate.getDate() === dayNum &&
                    currentDate.getMonth() === miniMonth &&
                    currentDate.getFullYear() === miniYear;

                  return (
                    <button
                      key={`mini-day-${dayNum}`}
                      onClick={() => {
                        const newD = new Date(miniYear, miniMonth, dayNum);
                        setCurrentDate(newD);
                      }}
                      className={`w-6 h-6 mx-auto flex items-center justify-center rounded-full text-[11px] font-semibold transition-all ${
                        isMiniToday
                          ? 'bg-[#8ab4f8] text-[#131314] font-bold'
                          : isSelected
                          ? 'bg-[#2b2d31] text-white border border-[#8ab4f8]'
                          : 'text-slate-300 hover:bg-[#2b2d31]'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search events & communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131314] border border-[#28292c] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8ab4f8]"
              />
            </div>

            {/* My Calendars (Community Filters) */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                My Calendars
              </div>

              <button
                onClick={() => setSelectedCommunity('all')}
                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCommunity === 'all' ? 'bg-[#2b2d31] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded bg-[#8ab4f8] shrink-0" />
                <span className="truncate">All Communities</span>
              </button>

              {communities.map((c) => {
                const isSel = selectedCommunity.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCommunity(c.name)}
                    className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isSel ? 'bg-[#2b2d31] text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded shrink-0"
                      style={{ backgroundColor: c.color || '#1565c0' }}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Right Main Calendar Grid View */}
        <div className="flex-1 flex flex-col bg-[#131314] overflow-hidden">
          {viewMode === 'month' && (
            <div className="flex-1 flex flex-col min-h-[500px]">
              {/* Day Header Row */}
              <div className="grid grid-cols-7 border-b border-[#28292c] bg-[#1e1f21] text-center text-xs font-bold text-slate-400 py-2.5 uppercase tracking-wider">
                {daysOfWeek.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Month Cell Grid */}
              <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-[#131314]">
                {Array.from({ length: startDay }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="border-r border-b border-[#28292c]/60 bg-[#18191b]/40 min-h-[100px]" />
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
                      className="border-r border-b border-[#28292c] p-1.5 min-h-[100px] flex flex-col justify-start hover:bg-[#1e1f21]/60 cursor-pointer transition-colors group relative"
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-transform ${
                            isToday
                              ? 'bg-[#8ab4f8] text-[#131314] font-extrabold shadow-sm'
                              : 'text-slate-300 group-hover:text-white'
                          }`}
                        >
                          {dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#2b2d31] text-slate-400 border border-[#3c4043]">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Event Chips Container */}
                      <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-hide flex-1 w-full">
                        {dayEvents.map((evt) => {
                          const { displayTime } = parseTimeSlot(evt.time_slot);
                          const isClosed = evt.status === 'closed';
                          const isOwnCommunity = isSuperAdmin || (
                            currentUserCommunityName &&
                            (evt.community || '').toLowerCase() === currentUserCommunityName.toLowerCase()
                          );

                          const { isMultiDay, isStart, isEnd, isActualEnd } = getEventDatePosition(evt, dateObj);
                          const commColor = getEventCommunityColor(evt, communities);

                          let shapeClass = 'w-full rounded-md border z-10';
                          if (isMultiDay) {
                            if (isStart && !isEnd) {
                              shapeClass = 'w-[calc(100%+12px)] -mr-3 rounded-l-md rounded-r-none border-l border-t border-b border-r-0 z-20';
                            } else if (!isStart && !isEnd) {
                              shapeClass = 'w-[calc(100%+16px)] -mx-2 rounded-none border-x-0 border-t border-b z-20';
                            } else if (!isStart && isEnd) {
                              shapeClass = 'w-[calc(100%+12px)] -ml-3 rounded-r-md rounded-l-none border-r border-t border-b border-l-0 z-20';
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
                                  backgroundColor: hexToRgba(commColor, isMultiDay ? 0.8 : 0.35),
                                  borderColor: commColor,
                                }}
                                className={`text-left border transition-all block box-border px-2 py-0.5 ${shapeClass}`}
                              >
                                <div className="text-[10px] font-bold text-amber-300 truncate flex items-center justify-between gap-1 h-4">
                                  {isStart ? (
                                    <span className="flex items-center gap-1 truncate">
                                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                                      <span>Slot Reserved</span>
                                    </span>
                                  ) : (
                                    <span className="opacity-0">.</span>
                                  )}
                                </div>
                              </div>
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
                                backgroundColor: commColor,
                                borderColor: commColor,
                              }}
                              className={`text-left transition-all block text-white shadow-sm px-2 py-0.5 hover:brightness-110 ${shapeClass}`}
                            >
                              <div className="text-[10px] font-bold truncate flex items-center justify-between gap-1 h-4">
                                {isStart ? (
                                  <span className="truncate">{evt.title}</span>
                                ) : (
                                  <span className="opacity-0">.</span>
                                )}
                                {isClosed && isStart && (
                                  <Lock className="w-2.5 h-2.5 text-amber-200 shrink-0" />
                                )}
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

          {viewMode === 'day' && (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#28292c] pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white font-display">
                    {monthNames[currentMonth]} {currentDate.getDate()}, {currentYear}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Scheduled events for {currentDate.toDateString()}
                  </p>
                </div>

                {isAdminMode && onSelectDateSlot && (
                  <button
                    onClick={() => onSelectDateSlot(formatDateForSlot(currentDate))}
                    className="px-4 py-2 bg-[#8ab4f8] text-[#131314] font-bold text-xs rounded-full hover:bg-blue-300 transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Book Slot for Today</span>
                  </button>
                )}
              </div>

              {filteredEvents.filter((evt) => isEventOnDate(evt, currentDate)).length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs bg-[#1e1f21] border border-[#28292c] rounded-2xl">
                  No events or reserved slots scheduled on this date.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredEvents
                    .filter((evt) => isEventOnDate(evt, currentDate))
                    .map((evt) => {
                      const commColor = getEventCommunityColor(evt, communities);
                      const isClosed = evt.status === 'closed';

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setActiveModalEvent(evt)}
                          className="p-5 rounded-2xl bg-[#1e1f21] border border-[#28292c] hover:border-[#8ab4f8] transition-all cursor-pointer space-y-3 shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                              style={{ backgroundColor: commColor }}
                            >
                              {evt.community}
                            </span>

                            {isClosed ? (
                              <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Draft Slot
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Live
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-white font-display">{evt.title}</h4>
                          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                            <Clock className="w-3.5 h-3.5 text-[#8ab4f8]" />
                            <span>{parseTimeSlot(evt.time_slot).displayTime}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Popup Portal for Event Details / Slot Confidentiality Shield */}
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
                  className="p-6 sm:p-8 max-w-md w-full space-y-5 rounded-2xl relative text-white bg-[#1e1f21] border border-amber-900/60 shadow-2xl my-auto"
                >
                  <button
                    onClick={() => setActiveModalEvent(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-[#2b2d31] transition-colors"
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

                  <div className="space-y-2 text-xs text-slate-300 bg-[#131314] p-4 rounded-xl border border-[#28292c]">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-[#8ab4f8]" />
                      <span className="text-white font-medium">{activeModalEvent.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-white font-mono">{parseTimeSlot(activeModalEvent.time_slot).displayTime}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-center text-[11px] text-slate-500 italic border-t border-[#28292c]">
                    Event details remain private until published by {activeModalEvent.community}.
                  </div>
                </div>
              );
            }

            return (
              <div
                data-lenis-prevent
                onClick={(e) => e.stopPropagation()}
                className="p-6 sm:p-8 max-w-lg w-full space-y-5 rounded-2xl relative text-white bg-[#1e1f21] border border-[#28292c] shadow-2xl my-auto"
              >
                <button
                  onClick={() => setActiveModalEvent(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-[#2b2d31] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#8ab4f8] text-[#131314]">
                      {activeModalEvent.category}
                    </span>
                    {isAdminMode && (
                      <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 border ${
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
                  <p className="text-xs text-slate-400 font-semibold">{activeModalEvent.community}</p>
                </div>

                {activeModalEvent.description && (
                  <p className="text-xs text-slate-300 leading-relaxed border-t border-b border-[#28292c] py-3 line-clamp-3">
                    {generate2LineSummary(activeModalEvent.description)}
                  </p>
                )}

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-[#8ab4f8]" />
                    <span>{activeModalEvent.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#8ab4f8]" />
                    <span>{parseTimeSlot(activeModalEvent.time_slot).displayTime}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#28292c] flex flex-wrap items-center justify-between gap-2">
                  {isAdminMode && (isSuperAdmin || (currentUserCommunityName && activeModalEvent && (activeModalEvent.community || '').toLowerCase() === currentUserCommunityName.toLowerCase())) && (
                    <div className="flex items-center gap-2">
                      {onToggleStatus && (
                        <button
                          onClick={() => {
                            onToggleStatus(activeModalEvent.id, activeModalEvent.status || 'live', activeModalEvent.community);
                            setActiveModalEvent(null);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 transition-all ${
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
                          className="p-2 text-slate-300 hover:text-white rounded-full bg-[#2b2d31] hover:bg-[#37393e]"
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
                          className="p-2 text-slate-300 hover:text-red-400 rounded-full bg-[#2b2d31] hover:bg-[#37393e]"
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
                      className="px-4 py-2 text-xs rounded-full bg-white text-[#131314] hover:bg-neutral-200 font-bold flex items-center space-x-1.5 ml-auto shadow-sm"
                    >
                      <span>View Page</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="px-3 py-1.5 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 rounded-full flex items-center gap-1 ml-auto">
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
