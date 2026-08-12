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
  MapPin
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

// Calculate high contrast text color (dark #0a0a0a vs white #ffffff) based on YIQ relative luminance
const getContrastTextColor = (hexColor?: string | null): string => {
  if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
  let c = hexColor.substring(1);
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return '#ffffff';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 135 ? '#0a0a0a' : '#ffffff';
};

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

  // Robust date range parser that detects explicit start/end dates or range strings in date/event_date/description/title
  const getEventStartEndIso = (evt: CalendarEvent): { startIso: string; endIso: string } => {
    const cleanDateStr = (s?: string | null) => {
      if (!s) return '';
      return s.split('T')[0].trim();
    };

    // 1. Explicit start_date and end_date
    const explicitStart = cleanDateStr(evt.start_date);
    const explicitEnd = cleanDateStr(evt.end_date);
    if (explicitStart && explicitEnd && explicitEnd >= explicitStart) {
      return { startIso: explicitStart, endIso: explicitEnd };
    }

    // 2. Scan text fields (date, event_date, description, title) for date range pattern (YYYY-MM-DD to YYYY-MM-DD)
    const allTexts = [evt.date, evt.event_date, evt.description, evt.title].filter(Boolean).join(' ');
    const rangeMatch = allTexts.match(/(\d{4}-\d{2}-\d{2})\s*(?:to|-|->|–)\s*(\d{4}-\d{2}-\d{2})/i);
    if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
      const p1 = cleanDateStr(rangeMatch[1]);
      const p2 = cleanDateStr(rangeMatch[2]);
      if (p2 >= p1) {
        return { startIso: p1, endIso: p2 };
      }
    }

    // 3. Fallback single date
    const iso = cleanDateStr(evt.start_date || evt.event_date || evt.date);
    const cleanIso = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : '';
    const cleanEnd = explicitEnd || cleanIso;
    return { startIso: cleanIso, endIso: cleanEnd || cleanIso };
  };

  const formatYmd = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isEventOnDate = (evt: CalendarEvent, dateObj: Date): boolean => {
    const targetIso = formatYmd(dateObj);
    const { startIso, endIso } = getEventStartEndIso(evt);

    if (startIso && endIso) {
      return targetIso >= startIso && targetIso <= endIso;
    }

    if (evt.date) {
      const cleanSingle = evt.date.split('T')[0].trim();
      if (cleanSingle === targetIso) return true;
    }

    return false;
  };

  const formatDateForSlot = (dateObj: Date): string => {
    return formatYmd(dateObj);
  };

  const getMiniDays = () => {
    const miniYear = miniDate.getFullYear();
    const miniMonth = miniDate.getMonth();
    const miniTotalDays = new Date(miniYear, miniMonth + 1, 0).getDate();
    const miniStartDay = new Date(miniYear, miniMonth, 1).getDay();
    return { miniYear, miniMonth, miniTotalDays, miniStartDay };
  };

  const { miniYear, miniMonth, miniTotalDays, miniStartDay } = getMiniDays();

  // Build week rows for Month View (Google Calendar Architecture)
  interface DayCellData {
    dateObj: Date;
    isCurrentMonth: boolean;
    dayNum: number;
    iso: string;
  }

  interface MonthWeekRow {
    days: DayCellData[];
  }

  const getMonthWeekRows = (year: number, month: number): MonthWeekRow[] => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const weeks: MonthWeekRow[] = [];
    let currentWeek: DayCellData[] = [];

    // Trailing days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      currentWeek.push({ dateObj: d, isCurrentMonth: false, dayNum: d.getDate(), iso: formatYmd(d) });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      currentWeek.push({ dateObj: d, isCurrentMonth: true, dayNum: day, iso: formatYmd(d) });
      if (currentWeek.length === 7) {
        weeks.push({ days: currentWeek });
        currentWeek = [];
      }
    }

    // Leading days for next month to complete final week row
    if (currentWeek.length > 0) {
      let nextMonthDay = 1;
      while (currentWeek.length < 7) {
        const d = new Date(year, month + 1, nextMonthDay++);
        currentWeek.push({ dateObj: d, isCurrentMonth: false, dayNum: d.getDate(), iso: formatYmd(d) });
      }
      weeks.push({ days: currentWeek });
    }

    return weeks;
  };

  const monthWeekRows = getMonthWeekRows(currentYear, currentMonth);

  // Helper for week view range computation
  const getStartOfWeek = (d: Date) => {
    const res = new Date(d);
    const day = res.getDay();
    res.setDate(res.getDate() - day);
    return res;
  };

  const weekStartDate = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + idx);
    return d;
  });

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col font-sans border border-[#28292c] bg-[#131314] text-white shadow-2xl w-full">
      {/* 1. Google Calendar Top Navigation Header */}
      <header className="px-3 sm:px-6 py-3 border-b border-[#28292c] flex flex-wrap items-center justify-between gap-3 bg-[#1e1f21]">
        <div className="flex items-center space-x-2 sm:space-x-4">
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
            <span className="text-base sm:text-lg font-bold text-white font-display tracking-tight hidden sm:inline">
              Calendar
            </span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 pl-1 sm:pl-2">
            <button
              onClick={handleToday}
              className="px-3 sm:px-4 py-1.5 rounded-full border border-[#444746] text-xs font-semibold text-white hover:bg-[#2b2d31] transition-colors"
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

          <h2 className="text-sm sm:text-xl font-semibold text-white font-display truncate max-w-[140px] sm:max-w-none">
            {monthNames[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {isAdminMode && onSelectDateSlot && (
            <button
              onClick={() => onSelectDateSlot(formatDateForSlot(currentDate))}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2b2d31] hover:bg-[#37393e] border border-[#3c4043] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md transition-all"
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
              className="bg-[#2b2d31] border border-[#3c4043] text-white text-xs font-bold rounded-full px-3 sm:px-4 py-1.5 focus:outline-none focus:border-[#8ab4f8] transition-colors cursor-pointer appearance-none pr-7 sm:pr-8"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
              <option value="grid">Grid</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</span>
          </div>
        </div>
      </header>

      {/* 2. Main Calendar Workspace (Sidebar + Grid Layout) */}
      <div className="flex flex-1 min-h-[550px] sm:min-h-[600px] overflow-hidden relative w-full">
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
                const textColor = getContrastTextColor(c.color || '#1565c0');
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCommunity(c.name)}
                    className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isSel ? 'bg-[#2b2d31] text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center text-[8px] font-bold"
                      style={{ backgroundColor: c.color || '#1565c0', color: textColor }}
                    >
                      {c.initials ? c.initials.slice(0, 1) : ''}
                    </div>
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Right Main Calendar View Container */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#131314] overflow-hidden w-full">
          
          {/* A. MONTH VIEW (Google Calendar Continuous Multi-Day Banner Architecture) */}
          {viewMode === 'month' && (
            <div className="flex-1 min-w-0 flex flex-col w-full h-full">
              {/* Day Header Row */}
              <div className="grid grid-cols-7 border-b border-[#28292c] bg-[#1e1f21] text-center text-[11px] sm:text-xs font-bold text-slate-400 py-2.5 uppercase tracking-wider w-full">
                {daysOfWeek.map((day) => (
                  <div key={day} className="truncate px-1">{day}</div>
                ))}
              </div>

              {/* Month Week Rows Container */}
              <div className="flex-1 flex flex-col divide-y divide-[#28292c] bg-[#131314] w-full">
                {monthWeekRows.map((weekRow, weekIdx) => {
                  const weekStartIso = weekRow.days[0].iso;
                  const weekEndIso = weekRow.days[6].iso;

                  // Find all events intersecting this week row
                  const intersectingEvents = filteredEvents.filter((evt) => {
                    const { startIso, endIso } = getEventStartEndIso(evt);
                    if (!startIso || !endIso) return false;
                    return startIso <= weekEndIso && endIso >= weekStartIso;
                  });

                  return (
                    <div key={`week-row-${weekIdx}`} className="flex-1 min-h-[100px] relative flex flex-col justify-start">
                      {/* Background Day Cells */}
                      <div className="absolute inset-0 grid grid-cols-7 divide-x divide-[#28292c] pointer-events-none">
                        {weekRow.days.map((dayCell, dIdx) => {
                          const isToday =
                            new Date().getDate() === dayCell.dayNum &&
                            new Date().getMonth() === dayCell.dateObj.getMonth() &&
                            new Date().getFullYear() === dayCell.dateObj.getFullYear();

                          return (
                            <div
                              key={`cell-${dIdx}`}
                              onClick={() => {
                                setCurrentDate(dayCell.dateObj);
                                setViewMode('day');
                              }}
                              className={`p-1 sm:p-1.5 flex flex-col justify-start pointer-events-auto cursor-pointer transition-colors ${
                                dayCell.isCurrentMonth ? 'bg-[#131314] hover:bg-[#1e1f21]/60' : 'bg-[#18191b]/40 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                                    isToday
                                      ? 'bg-[#8ab4f8] text-[#131314] font-extrabold shadow-sm'
                                      : dayCell.isCurrentMonth
                                      ? 'text-slate-300'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {dayCell.dayNum}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Foreground Continuous Event Banners Layer */}
                      <div className="grid grid-cols-7 gap-y-1 relative z-10 pt-7 pb-1 px-0.5 font-sans">
                        {intersectingEvents.map((evt) => {
                          const { startIso, endIso } = getEventStartEndIso(evt);

                          // Calculate start and end column indices in this 7-day week row (0 = Sun, 6 = Sat)
                          let startIndex = 0;
                          let endIndex = 6;

                          for (let i = 0; i < 7; i++) {
                            if (weekRow.days[i].iso === startIso) startIndex = i;
                            if (weekRow.days[i].iso === endIso) endIndex = i;
                          }

                          if (startIso < weekStartIso) startIndex = 0;
                          if (endIso > weekEndIso) endIndex = 6;

                          const colStart = startIndex + 1; // CSS 1-indexed
                          const colSpan = endIndex - startIndex + 1;

                          const isActualStart = (weekRow.days[startIndex].iso === startIso);
                          const isActualEnd = (weekRow.days[endIndex].iso === endIso);

                          const commColor = getEventCommunityColor(evt, communities);
                          const textColor = getContrastTextColor(commColor);
                          const isClosed = evt.status === 'closed';

                          const isOwnCommunity = isSuperAdmin || (
                            currentUserCommunityName &&
                            (evt.community || '').toLowerCase() === currentUserCommunityName.toLowerCase()
                          );

                          // If confidential reserved slot
                          if (isAdminMode && !isOwnCommunity && isClosed) {
                            return (
                              <div
                                key={`${evt.id}-w-${weekIdx}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveModalEvent(evt);
                                }}
                                style={{
                                  gridColumn: `${colStart} / span ${colSpan}`,
                                  backgroundColor: hexToRgba(commColor, 0.85),
                                  borderColor: commColor,
                                  color: textColor,
                                }}
                                className={`h-5 flex items-center px-2 text-[10px] font-bold border cursor-pointer transition-all shadow-sm select-none ${
                                  isActualStart ? 'rounded-l-md' : 'rounded-l-none'
                                } ${
                                  isActualEnd ? 'rounded-r-md' : 'rounded-r-none'
                                }`}
                              >
                                <span className="flex items-center gap-1 truncate">
                                  <Lock className="w-2.5 h-2.5 shrink-0" />
                                  <span>Slot Reserved</span>
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={`${evt.id}-w-${weekIdx}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveModalEvent(evt);
                              }}
                              style={{
                                gridColumn: `${colStart} / span ${colSpan}`,
                                backgroundColor: commColor,
                                color: textColor,
                              }}
                              className={`h-5.5 flex items-center px-2 text-[11px] font-bold cursor-pointer transition-all shadow-sm hover:brightness-110 select-none ${
                                isActualStart ? 'rounded-l-md' : 'rounded-l-none'
                              } ${
                                isActualEnd ? 'rounded-r-md' : 'rounded-r-none'
                              }`}
                            >
                              <span className="truncate">
                                {isActualStart || startIndex === 0 ? evt.title : ''}
                              </span>
                              {isClosed && <Lock className="w-3 h-3 shrink-0 ml-auto opacity-90" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* B. WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="flex-1 min-w-0 flex flex-col w-full h-full">
              <div className="grid grid-cols-7 border-b border-[#28292c] bg-[#1e1f21] text-center text-xs font-bold text-slate-400 py-3 uppercase tracking-wider w-full">
                {weekDays.map((d, i) => {
                  const isToday =
                    new Date().getDate() === d.getDate() &&
                    new Date().getMonth() === d.getMonth() &&
                    new Date().getFullYear() === d.getFullYear();

                  return (
                    <div key={i} className="flex flex-col items-center truncate px-1">
                      <span>{daysOfWeek[i]}</span>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 text-xs font-bold ${
                        isToday ? 'bg-[#8ab4f8] text-[#131314]' : 'text-white'
                      }`}>
                        {d.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-7 flex-1 bg-[#131314] w-full">
                {weekDays.map((d, i) => {
                  const dayEvents = filteredEvents.filter((evt) => isEventOnDate(evt, d));
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setCurrentDate(d);
                        setViewMode('day');
                      }}
                      className="border-r border-b border-[#28292c] p-2 min-h-[300px] space-y-2 hover:bg-[#1e1f21]/40 cursor-pointer overflow-hidden"
                    >
                      {dayEvents.map((evt) => {
                        const commColor = getEventCommunityColor(evt, communities);
                        const textColor = getContrastTextColor(commColor);
                        const { startIso } = getEventStartEndIso(evt);
                        const isStart = formatYmd(d) === startIso;
                        const isClosed = evt.status === 'closed';

                        return (
                          <button
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModalEvent(evt);
                            }}
                            style={{ backgroundColor: commColor, color: textColor }}
                            className="w-full text-left p-2 rounded-lg text-xs font-bold shadow-sm hover:brightness-110 transition-all space-y-1 block"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate font-heading">{isStart ? evt.title : `${evt.title} (Cont.)`}</span>
                              {isClosed && <Lock className="w-3 h-3 shrink-0" />}
                            </div>
                            <div className="text-[10px] opacity-90 font-mono truncate">
                              {evt.community} • {parseTimeSlot(evt.time_slot).displayTime}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. DAY VIEW */}
          {viewMode === 'day' && (
            <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#28292c] pb-4">
                <div>
                  <h3 className="text-lg sm:text-2xl font-extrabold text-white font-display">
                    {monthNames[currentMonth]} {currentDate.getDate()}, {currentYear}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Scheduled events & slots for {currentDate.toDateString()}
                  </p>
                </div>

                {isAdminMode && onSelectDateSlot && (
                  <button
                    onClick={() => onSelectDateSlot(formatDateForSlot(currentDate))}
                    className="px-4 py-2 bg-[#8ab4f8] text-[#131314] font-bold text-xs rounded-full hover:bg-blue-300 transition-colors flex items-center gap-1.5 shadow-md self-start sm:self-auto"
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
                      const textColor = getContrastTextColor(commColor);
                      const isClosed = evt.status === 'closed';

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setActiveModalEvent(evt)}
                          className="p-5 rounded-2xl bg-[#1e1f21] border border-[#28292c] hover:border-[#8ab4f8] transition-all cursor-pointer space-y-3 shadow-md"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                              style={{ backgroundColor: commColor, color: textColor }}
                            >
                              {evt.community}
                            </span>

                            {isClosed ? (
                              <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Draft Slot
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Live
                              </span>
                            )}
                          </div>

                          <h4 className="text-base sm:text-lg font-bold text-white font-display">{evt.title}</h4>
                          <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#8ab4f8]" />
                              {parseTimeSlot(evt.time_slot).displayTime}
                            </span>
                            {evt.venue && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                {evt.venue}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* D. GRID VIEW MODE (Full Responsive Cards Grid) */}
          {viewMode === 'grid' && (
            <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#28292c] pb-4">
                <div>
                  <h3 className="text-lg sm:text-2xl font-extrabold text-white font-display flex items-center gap-2">
                    <GridIcon className="w-5 h-5 text-[#8ab4f8]" />
                    <span>Grid Directory ({filteredEvents.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Structured card view of all master campus schedules & reservations.
                  </p>
                </div>

                {isAdminMode && onSelectDateSlot && (
                  <button
                    onClick={() => onSelectDateSlot(formatDateForSlot(currentDate))}
                    className="px-4 py-2 bg-[#8ab4f8] text-[#131314] font-bold text-xs rounded-full hover:bg-blue-300 transition-colors flex items-center gap-1.5 shadow-md self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Book New Slot</span>
                  </button>
                )}
              </div>

              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs bg-[#1e1f21] border border-[#28292c] rounded-2xl">
                  No scheduled events match the current filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredEvents.map((evt) => {
                    const commColor = getEventCommunityColor(evt, communities);
                    const textColor = getContrastTextColor(commColor);
                    const isClosed = evt.status === 'closed';
                    const { displayTime } = parseTimeSlot(evt.time_slot);

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setActiveModalEvent(evt)}
                        className="p-5 rounded-2xl bg-[#1e1f21] border border-[#28292c] hover:border-[#8ab4f8] transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-md group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full truncate max-w-[140px]"
                              style={{ backgroundColor: commColor, color: textColor }}
                            >
                              {evt.community}
                            </span>

                            {isClosed ? (
                              <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <Lock className="w-3 h-3" /> Draft Slot
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="w-3 h-3" /> Live
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#8ab4f8] transition-colors font-display line-clamp-2">
                              {evt.title}
                            </h4>
                            {evt.description && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {generate2LineSummary(evt.description)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#28292c] space-y-2 text-xs text-slate-300">
                          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-[#8ab4f8]" />
                              {evt.date || evt.event_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-cyan-400" />
                              {displayTime}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#2b2d31] text-slate-300 border border-[#3c4043]">
                              {evt.category}
                            </span>
                            <span className="text-xs font-bold text-white group-hover:text-[#8ab4f8] flex items-center gap-1 transition-colors">
                              <span>Details</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
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
              const textColor = getContrastTextColor(commColor);
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
