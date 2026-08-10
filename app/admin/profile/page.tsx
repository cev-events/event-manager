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
      <div className="p-8 text-center text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-xl">
        Loading user profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b border-[#1e2436] pb-4 space-y-1">
        <span className="text-xs font-mono text-[#6366f1] uppercase font-bold tracking-widest">
          007 / Profile & Account Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-none">
          MY PROFILE & ACCOUNT SETTINGS
        </h1>
        <p className="text-xs text-[#94a3b8]">
          Manage full name, WebP avatar uploads, and password security settings.
        </p>
      </div>

      {toastMsg && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center gap-3 ${toastMsg.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
            : 'bg-red-950/80 border-red-800 text-red-200'
            }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-neutral-800">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-neutral-800 border border-neutral-700 shrink-0 flex items-center justify-center text-xl font-extrabold text-white shadow-md">
            {avatarUrl || profile?.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl || profile?.avatar_url || ''}
                alt={fullName || profile?.email || 'Avatar'}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <span>{(fullName || profile?.email || 'ME').substring(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-lg font-bold text-white font-display">{profile?.full_name || 'My Account'}</h2>
            <p className="text-xs text-neutral-400 font-mono">{profile?.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-800 text-white border border-neutral-700 flex items-center gap-1">
                <Shield className="w-3 h-3 text-neutral-400" />
                {profile?.role || 'editor'}
              </span>

              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                <Building className="w-3 h-3 text-neutral-400" />
                {profile?.community?.name || 'Super Admin (All)'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                required
                className="w-full bg-neutral-800 text-white placeholder-neutral-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs border border-neutral-700 focus:outline-none focus:border-white"
              />
              <User className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full bg-neutral-800/50 text-neutral-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs border border-neutral-800 cursor-not-allowed font-mono"
              />
              <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Profile Picture WebP Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Profile Pic
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
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
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl px-4 py-2.5 text-xs border border-neutral-700 flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <span>{uploading ? 'Converting & Uploading...' : 'Upload Image File'}</span>
                </label>
              </div>

              <div className="relative">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Or enter Image URL link"
                  className="w-full bg-neutral-800 text-white placeholder-neutral-500 rounded-xl pl-9 pr-3 py-2.5 text-xs border border-neutral-700 focus:outline-none focus:border-white"
                />
                <ImageIcon className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Auth Password (Optional)
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep existing password"
                className="w-full bg-neutral-800 text-white placeholder-neutral-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs border border-neutral-700 focus:outline-none focus:border-white"
              />
              <Key className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={async () => {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              className="px-4 py-2 rounded-full bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold hover:bg-rose-900/60 transition-colors"
            >
              Sign Out
            </button>

            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2.5 rounded-full bg-white text-[#0a0a0a] hover:bg-neutral-200 font-bold text-xs disabled:opacity-50 transition-colors shadow-md"
            >
              {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
