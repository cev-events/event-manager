// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bug, Search, Filter, Trash2, CheckCircle2, Clock, ShieldAlert, Lock, Mail, Phone, User, ExternalLink, RefreshCw, X, MessageSquare, AlertCircle, CheckSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SupportTicket, TicketStatus } from '@/types/database.types';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTickets(data || []);
    } catch (err: any) {
      console.error('Error fetching support tickets:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load support tickets.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    setUpdatingId(ticketId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) {
        throw error;
      }

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      setFeedback({ type: 'success', message: `Ticket status updated to "${newStatus.replace('_', ' ')}"` });
    } catch (err: any) {
      console.error('Error updating status:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to update ticket status.' });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this support ticket?')) return;

    setDeletingId(ticketId);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('support_tickets').delete().eq('id', ticketId);

      if (error) {
        throw error;
      }

      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
      setFeedback({ type: 'success', message: 'Ticket deleted successfully.' });
    } catch (err: any) {
      console.error('Error deleting ticket:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to delete ticket.' });
    } finally {
      setDeletingId(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = (t.name || '').toLowerCase().includes(q);
      const matchEmail = (t.email || '').toLowerCase().includes(q);
      const matchIssue = (t.issue || '').toLowerCase().includes(q);
      const matchPhone = (t.phone || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchIssue || matchPhone;
    }
    return true;
  });

  const totalTickets = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 flex items-center gap-1">
            <CheckSquare className="w-3 h-3 text-neutral-500" /> Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#141518] font-display">
            Support & Bug Inbox
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Review, track, and resolve user-submitted bug reports and feedback.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200/80 text-xs font-extrabold text-[#141518] flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-[#141518]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-[28px] bg-white border border-neutral-200/60 shadow-sm space-y-2">
          <div className="text-xs text-neutral-500 font-extrabold uppercase tracking-wider">Total Tickets</div>
          <div className="text-4xl font-extrabold text-[#141518] font-display">{totalTickets}</div>
        </div>

        <div className="p-6 rounded-[28px] bg-rose-50 border border-rose-200/60 space-y-2">
          <div className="text-xs text-rose-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Open Issues
          </div>
          <div className="text-4xl font-extrabold text-rose-900 font-display">{openCount}</div>
        </div>

        <div className="p-6 rounded-[28px] bg-amber-50 border border-amber-200/60 space-y-2">
          <div className="text-xs text-amber-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> In Progress
          </div>
          <div className="text-4xl font-extrabold text-amber-900 font-display">{inProgressCount}</div>
        </div>

        <div className="p-6 rounded-[28px] bg-emerald-50 border border-emerald-200/60 space-y-2">
          <div className="text-xs text-emerald-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolved
          </div>
          <div className="text-4xl font-extrabold text-emerald-900 font-display">{resolvedCount}</div>
        </div>
      </div>

      {/* Search & Status Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[28px] border border-neutral-200/60 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by name, email..."
            className="w-full bg-neutral-100 border border-neutral-200 text-[#141518] placeholder-neutral-400 rounded-full pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
          {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold capitalize transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-[#141518] text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="p-8 text-center text-neutral-500 text-xs bg-white border border-neutral-200/60 rounded-[28px]">
          Loading support tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-8 text-center text-neutral-500 text-xs bg-white border border-neutral-200/60 rounded-[28px] space-y-2">
          <Bug className="w-8 h-8 text-neutral-400 mx-auto" />
          <div>No support tickets found matching criteria.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-[28px] bg-white border border-neutral-200/60 hover:shadow-md transition-all space-y-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-3">
                  {getStatusBadge(t.status)}
                  <span className="text-[10px] font-mono text-neutral-400 font-bold">
                    ID: {t.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    {new Date(t.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={t.status}
                    disabled={updatingId === t.id}
                    onChange={(e) => handleUpdateStatus(t.id, e.target.value as TicketStatus)}
                    className="bg-neutral-100 border border-neutral-200 text-xs font-bold text-[#141518] rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                  >
                    <option value="open">Mark Open</option>
                    <option value="in_progress">Mark In Progress</option>
                    <option value="resolved">Mark Resolved</option>
                    <option value="closed">Mark Closed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteTicket(t.id)}
                    disabled={deletingId === t.id}
                    className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-colors"
                    title="Delete Ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 space-y-2 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                  <div className="font-bold text-[#141518] text-sm flex items-center gap-2 font-display">
                    <User className="w-4 h-4 text-[#141518]" /> {t.name}
                  </div>
                  <div className="text-xs text-neutral-600 flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <a href={`mailto:${t.email}`} className="hover:underline text-[#141518] truncate font-semibold">
                      {t.email}
                    </a>
                  </div>
                  {t.phone && (
                    <div className="text-xs text-neutral-600 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{t.phone}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-8 space-y-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1 flex items-center gap-1">
                      <Bug className="w-3.5 h-3.5 text-rose-500" /> Issue Description
                    </div>
                    <div className="text-xs text-neutral-800 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 whitespace-pre-wrap leading-relaxed font-medium">
                      {t.issue}
                    </div>
                  </div>

                  {t.screenshot_url && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1">
                        Attached Screenshot
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src={t.screenshot_url}
                          alt="Screenshot Proof"
                          onClick={() => setSelectedTicket(t)}
                          className="w-20 h-20 object-cover rounded-2xl border border-neutral-200 hover:border-black cursor-pointer transition-all hover:scale-105 shadow-sm"
                        />
                        <a
                          href={t.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#141518] hover:underline flex items-center gap-1 font-bold"
                        >
                          <span>Open Full Image</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {t.suggestions && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-600 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Additional Suggestions
                      </div>
                      <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 p-3.5 rounded-2xl whitespace-pre-wrap font-medium">
                        {t.suggestions}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {mounted && selectedTicket && selectedTicket.screenshot_url && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white border border-neutral-200/80 rounded-[28px] p-6 space-y-4 shadow-2xl text-[#141518]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-sm font-extrabold text-[#141518] font-display">
                Screenshot Proof — {selectedTicket.name}
              </span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-neutral-400 hover:text-[#141518] p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto flex items-center justify-center">
              <img
                src={selectedTicket.screenshot_url}
                alt="Enlarged Screenshot"
                className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-neutral-200"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
