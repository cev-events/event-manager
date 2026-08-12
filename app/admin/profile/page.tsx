// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Key, Image as ImageIcon, CheckCircle2, AlertCircle, Shield, Building, Upload } from 'lucide-react';
import Image from 'next/image';
import { uploadImageFile } from '@/lib/upload';

export default function MyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchMyProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (res.ok && data.profile) {
          setProfile(data.profile);
          setFullName(data.profile.full_name || '');
          setAvatarUrl(data.profile.avatar_url || '');
        }
      } catch {
        setToastMsg({ type: 'error', text: 'Failed to load profile.' });
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 5 * 1024 * 1024) {
      setToastMsg({ type: 'error', text: 'Image file size must be under 5MB.' });
      return;
    }

    setUploading(true);
    setToastMsg(null);

    try {
      const publicUrl = await uploadImageFile(file, 'avatars');
      setAvatarUrl(publicUrl);
      setToastMsg({ type: 'success', text: 'Profile WebP avatar uploaded to Vercel Blob!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload image';
      setToastMsg({ type: 'error', text: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToastMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          avatar_url: avatarUrl,
          password: password || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMsg({ type: 'success', text: 'Your profile and avatar link have been saved to Supabase!' });
        setPassword('');
        if (data.profile) {
          setProfile((prev: any) => ({ ...prev, ...data.profile }));
        }
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      setToastMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-7rem)] lg:h-[calc(100vh-7rem)] lg:overflow-hidden">
      {toastMsg && (
        <div
          className={`flex items-center gap-3 rounded-2xl px-5 py-4 border text-xs font-semibold ${toastMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}

          <span>{toastMsg.text}</span>
        </div>
      )}

      <section className="h-full grid grid-cols-1 lg:grid-cols-12 gap-1">
        <div className="lg:col-span-4 h-full min-h-0 bg-[#141518] text-white rounded-[28px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full border border-white/10" />

          <div className="relative z-10 flex justify-end">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              CEV EVENTS
            </span>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[24px] overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
              {avatarUrl || profile?.avatar_url ? (
                <img
                  src={avatarUrl || profile?.avatar_url || ''}
                  alt={fullName || profile?.email || 'Avatar'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      'none';
                  }}
                />
              ) : (
                <span className="text-3xl font-extrabold font-display">
                  {(fullName || profile?.email || 'ME')
                    .substring(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-[-0.04em] leading-[0.95]">
                {profile?.full_name || 'My Account'}
              </h2>

              <p className="mt-2 text-xs text-white/50 font-mono break-all">
                {profile?.email}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white text-[#141518] flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              {profile?.role || 'editor'}
            </span>

            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/10 text-white/70 border border-white/10 flex items-center gap-1.5">
              <Building className="w-3 h-3" />
              {profile?.community?.name || 'Super Admin'}
            </span>
          </div>
        </div>

        <div className="lg:col-span-8 h-full min-h-0 bg-white border border-neutral-200 rounded-[28px] p-6 sm:p-8 overflow-hidden">
          <form onSubmit={handleUpdateProfile} className="h-full flex flex-col space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                  Personal Information
                </span>

                <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight mt-1">
                  Identity
                </h2>
              </div>

              <User className="w-5 h-5 text-neutral-300" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    required
                    className="w-full bg-[#f7f7f7] border border-neutral-200 text-[#141518] placeholder-neutral-400 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-neutral-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

                  <input
                    type="email"
                    disabled
                    value={profile?.email || ''}
                    className="w-full bg-neutral-100 text-neutral-400 rounded-2xl pl-11 pr-4 py-3.5 text-sm border border-neutral-200 cursor-not-allowed font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-5 space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                  Profile Media
                </span>

                <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight mt-1">
                  Profile Picture
                </h2>
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  id="avatar-file-upload"
                  className="hidden"
                />

                <label
                  htmlFor="avatar-file-upload"
                  className="min-h-[90px] w-full bg-[#f7f7f7] hover:bg-neutral-100 border border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Upload className="w-5 h-5 text-neutral-500" />

                  <span className="text-xs font-bold text-[#141518]">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </span>

                  <span className="text-[10px] text-neutral-400 font-mono">
                    MAX 5MB
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-7 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                  Security
                </span>

                <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight mt-1">
                  Password
                </h2>
              </div>

              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep your current password"
                  className="w-full bg-[#f7f7f7] border border-neutral-200 text-[#141518] placeholder-neutral-400 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-neutral-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-neutral-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={async () => {
                  const { createClient } = await import(
                    '@/lib/supabase/client'
                  );

                  const supabase = createClient();

                  await supabase.auth.signOut();

                  window.location.href = '/login';
                }}
                className="px-5 py-3 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                Sign Out
              </button>

              <button
                type="submit"
                disabled={saving || uploading}
                className="px-7 py-3.5 rounded-full bg-[#141518] text-white hover:bg-black font-extrabold text-xs disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
                {!saving && <ArrowRightIcon />}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );

  function ArrowRightIcon() {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2 7H12M12 7L8 3M12 7L8 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
}