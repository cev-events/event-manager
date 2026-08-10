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
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] pt-24 md:pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-neutral-800 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <Bug className="w-4 h-4" /> 001 / Bug Reporting & Support
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0a0a0a] font-display tracking-tight leading-[0.95]">
            SUPPORT & FEEDBACK DISPATCH
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed font-sans">
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
            <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-neutral-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {submittedId ? (
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-neutral-200 text-center space-y-6 shadow-sm animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#0a0a0a] font-display">Ticket Submitted Successfully!</h2>
              <p className="text-xs text-neutral-600 max-w-md mx-auto">
                Thank you for reporting. Your support ticket reference ID is:
              </p>
              <div className="inline-block font-mono font-bold text-sm text-[#0a0a0a] bg-neutral-100 border border-neutral-200 px-4 py-2 rounded-xl mt-2 select-all">
                {submittedId}
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              Our superadmin team will review your report and take action.
            </p>
            <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setSubmittedId(null)}
                className="px-6 py-2.5 rounded-full bg-[#0a0a0a] hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-md"
              >
                Submit Another Ticket
              </button>
              <Link
                href="/events"
                className="px-6 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold border border-neutral-200 transition-all"
              >
                Explore Events
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-900" /> Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-neutral-50 border border-neutral-200 text-[#0a0a0a] placeholder-neutral-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-900" /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full bg-neutral-50 border border-neutral-200 text-[#0a0a0a] placeholder-neutral-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-900" /> Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-neutral-50 border border-neutral-200 text-[#0a0a0a] placeholder-neutral-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-rose-500" /> Issue Founded / Description *
              </label>
              <textarea
                required
                rows={4}
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Please describe the bug or issue in detail..."
                className="w-full bg-neutral-50 border border-neutral-200 text-[#0a0a0a] placeholder-neutral-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-neutral-900 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-neutral-900" /> Screenshot / Image Proof (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-neutral-900" />
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
                  <span className="text-[10px] text-neutral-500 font-bold uppercase">Or Paste URL:</span>
                  <input
                    type="url"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-neutral-50 border border-neutral-200 text-[#0a0a0a] placeholder-neutral-400 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                {screenshotUrl && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-3">
                    <img src={screenshotUrl} alt="Screenshot Preview" className="w-12 h-12 object-cover rounded-lg border border-neutral-200" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[#0a0a0a] font-medium truncate">{screenshotUrl}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">Screenshot Attached</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshotUrl('')}
                      className="text-neutral-400 hover:text-rose-500 p-1"
                      title="Remove Screenshot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-neutral-900" /> Additional Suggestions / Comments (Optional)
              </label>
              <textarea
                rows={2}
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="Any recommendations or enhancements you'd like to suggest..."
                className="w-full bg-neutral-50 border border-neutral-200 text-[#0a0a0a] placeholder-neutral-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-neutral-900 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-full bg-[#0a0a0a] hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Dispatching Ticket...' : 'Submit Support Ticket'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
