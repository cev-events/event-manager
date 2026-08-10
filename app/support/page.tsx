// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bug, Send, CheckCircle2, ShieldAlert, Upload, Image as ImageIcon, Phone, Mail, User, MessageSquare, Sparkles, HelpCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SupportPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [issue, setIssue] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please select a valid image file (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Image size must be less than 5MB.' });
      return;
    }

    setUploadingImage(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `support/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('posters')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) {
        throw uploadErr;
      }

      const { data: publicUrlData } = supabase.storage.from('posters').getPublicUrl(filePath);
      if (publicUrlData && publicUrlData.publicUrl) {
        setScreenshotUrl(publicUrlData.publicUrl);
        setFeedback({ type: 'success', message: 'Screenshot uploaded successfully!' });
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to upload screenshot. You can also paste an image URL.' });
    } finally {
      setUploadingImage(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !issue.trim() || submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          issue: issue.trim(),
          screenshot_url: screenshotUrl.trim() || null,
          suggestions: suggestions.trim() || null,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to submit support ticket.');
      }

      if (resData.data && resData.data.id) {
        setSubmittedId(resData.data.id);
      } else {
        setSubmittedId(`TICK-${Date.now().toString().slice(-6)}`);
      }

      setName('');
      setEmail('');
      setPhone('');
      setIssue('');
      setSuggestions('');
      setScreenshotUrl('');
    } catch (err: any) {
      console.error('Error submitting support ticket:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit bug report. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f8fafc] pt-24 md:pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161a29] border border-[#1e2436] text-[#6366f1] text-xs font-mono font-bold uppercase tracking-wider">
            <Bug className="w-4 h-4" /> 004 / Bug Reporting & Support
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-[0.95]">
            SUPPORT & FEEDBACK DISPATCH
          </h1>
          <p className="text-xs sm:text-sm text-[#94a3b8] max-w-lg mx-auto leading-relaxed font-sans">
            Found a bug, styling glitch, or missing feature on CEV EVENTS? Report it below and our developer team will address it.
          </p>
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

        {submittedId ? (
          <div className="brutalist-card p-8 sm:p-10 rounded-2xl bg-[#0f121d] border border-[#1e2436] text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white font-display">Ticket Submitted Successfully!</h2>
              <p className="text-xs text-[#94a3b8] max-w-md mx-auto">
                Thank you for reporting. Your support ticket reference ID is:
              </p>
              <div className="inline-block font-mono font-bold text-sm text-[#6366f1] bg-[#161a29] border border-[#1e2436] px-4 py-2 rounded-xl mt-2 select-all">
                {submittedId}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Our superadmin team will review your report and take action.
            </p>
            <div className="pt-4 border-t border-[#1e2436] flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setSubmittedId(null)}
                className="px-5 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold transition-all shadow-md"
              >
                Submit Another Ticket
              </button>
              <Link
                href="/events"
                className="px-5 py-2.5 rounded-xl bg-[#161a29] hover:bg-[#1e2436] text-slate-300 hover:text-white text-xs font-bold border border-[#1e2436] transition-all"
              >
                Explore Events
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="brutalist-card p-6 sm:p-8 rounded-2xl bg-[#0f121d] border border-[#1e2436] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#6366f1]" /> Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#6366f1]" /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" /> Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-rose-400" /> Issue Founded / Description *
              </label>
              <textarea
                required
                rows={4}
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Please describe the bug or issue in detail (e.g. Page layout breaks when selecting grid view on mobile...)"
                className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Screenshot / Image Proof (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer bg-[#161a29] hover:bg-[#1e2436] border border-[#1e2436] hover:border-[#6366f1] text-xs text-slate-300 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-[#6366f1]" />
                    <span>{uploadingImage ? 'Uploading Image...' : 'Upload Screenshot File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Or Paste URL:</span>
                  <input
                    type="url"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#6366f1]"
                  />
                </div>

                {screenshotUrl && (
                  <div className="p-3 bg-[#161a29] border border-[#1e2436] rounded-xl flex items-center gap-3">
                    <img src={screenshotUrl} alt="Screenshot Preview" className="w-12 h-12 object-cover rounded-lg border border-[#1e2436]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white font-medium truncate">{screenshotUrl}</div>
                      <div className="text-[10px] text-emerald-400 font-bold">Screenshot Attached</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshotUrl('')}
                      className="text-slate-400 hover:text-red-400 p-1"
                      title="Remove Screenshot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Anymore Suggestions / Feedback (Optional)
              </label>
              <textarea
                rows={3}
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="Any recommendations, feature requests, or thoughts on how we can improve CEV EVENTS..."
                className="w-full bg-[#161a29] border border-[#1e2436] text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#6366f1] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="w-full py-3 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Bug Report</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
