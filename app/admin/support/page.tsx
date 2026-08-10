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
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-700 flex items-center gap-1">
            <CheckSquare className="w-3 h-3" /> Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2436] pb-6">
        <div className="space-y-1">
          <span className="text-xs font-mono text-[#6366f1] uppercase font-bold tracking-widest flex items-center gap-1.5">
            <Bug className="w-3.5 h-3.5" /> 006 / Support & Bug Receiver
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display leading-none">
            SUPPORT & BUG INBOX
          </h1>
          <p className="text-xs text-[#94a3b8]">
            Review, track, and resolve user-submitted bug reports and feedback.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-[#161a29] hover:bg-[#1e2436] border border-[#1e2436] text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f121d] border border-[#1e2436] space-y-2">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Tickets</div>
          <div className="text-3xl font-extrabold text-white font-display">{totalTickets}</div>
        </div>

        <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-900/60 space-y-2">
          <div className="text-xs text-rose-400 font-semibold uppercase flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Open Issues
          </div>
          <div className="text-3xl font-extrabold text-rose-300 font-display">{openCount}</div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-900/60 space-y-2">
          <div className="text-xs text-amber-400 font-semibold uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </div>
          <div className="text-3xl font-extrabold text-amber-300 font-display">{inProgressCount}</div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-900/60 space-y-2">
          <div className="text-xs text-emerald-400 font-semibold uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </div>
          <div className="text-3xl font-extrabold text-emerald-300 font-display">{resolvedCount}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f121d] p-4 rounded-2xl border border-[#1e2436]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by name, email..."
            className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#6366f1]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border shrink-0 ${
                statusFilter === st
                  ? 'bg-[#6366f1] text-white border-[#4f46e5] shadow-sm'
                  : 'bg-[#161a29] text-slate-400 hover:text-white border-[#1e2436]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs italic bg-[#0f121d] border border-[#1e2436] rounded-2xl">
          Loading support tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs italic bg-[#0f121d] border border-[#1e2436] rounded-2xl space-y-2">
          <Bug className="w-8 h-8 text-slate-600 mx-auto" />
          <div>No support tickets found matching criteria.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className="p-5 sm:p-6 rounded-2xl bg-[#0f121d] border border-[#1e2436] hover:border-[#6366f1]/40 transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2436] pb-4">
                <div className="flex items-center gap-3">
                  {getStatusBadge(t.status)}
                  <span className="text-[10px] font-mono text-slate-500">
                    ID: {t.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(t.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={t.status}
                    disabled={updatingId === t.id}
                    onChange={(e) => handleUpdateStatus(t.id, e.target.value as TicketStatus)}
                    className="bg-[#161a29] border border-[#1e2436] text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#6366f1] cursor-pointer"
                  >
                    <option value="open">Mark Open</option>
                    <option value="in_progress">Mark In Progress</option>
                    <option value="resolved">Mark Resolved</option>
                    <option value="closed">Mark Closed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteTicket(t.id)}
                    disabled={deletingId === t.id}
                    className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete Ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 space-y-2 bg-[#161a29] p-4 rounded-xl border border-[#1e2436]">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-[#6366f1]" /> {t.name}
                  </div>
                  <div className="text-xs text-slate-300 flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <a href={`mailto:${t.email}`} className="hover:underline text-cyan-300 truncate">
                      {t.email}
                    </a>
                  </div>
                  {t.phone && (
                    <div className="text-xs text-slate-300 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{t.phone}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-8 space-y-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                      <Bug className="w-3.5 h-3.5 text-rose-400" /> Issue Founded / Description
                    </div>
                    <div className="text-xs text-slate-200 bg-[#161a29] p-3.5 rounded-xl border border-[#1e2436] whitespace-pre-wrap leading-relaxed">
                      {t.issue}
                    </div>
                  </div>

                  {t.screenshot_url && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Attached Screenshot
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src={t.screenshot_url}
                          alt="Screenshot Proof"
                          onClick={() => setSelectedTicket(t)}
                          className="w-20 h-20 object-cover rounded-xl border border-[#1e2436] hover:border-[#6366f1] cursor-pointer transition-all hover:scale-105"
                        />
                        <a
                          href={t.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#6366f1] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Open Full Image</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {t.suggestions && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-400 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Additional Suggestions
                      </div>
                      <div className="text-xs text-slate-300 bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl whitespace-pre-wrap">
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#0f121d] border border-[#1e2436] rounded-2xl p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1e2436] pb-3">
              <span className="text-xs font-bold text-white font-heading">
                Screenshot Proof — {selectedTicket.name}
              </span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto flex items-center justify-center">
              <img
                src={selectedTicket.screenshot_url}
                alt="Enlarged Screenshot"
                className="max-w-full max-h-[75vh] object-contain rounded-xl border border-[#1e2436]"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
