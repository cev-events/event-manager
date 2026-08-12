// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import { Building, Edit2, CheckCircle2, AlertCircle, Eye, ShieldAlert, Image as ImageIcon, Upload } from 'lucide-react';
import { UserRole } from '@/types/database.types';
import { uploadImageFile } from '@/lib/upload';

export default function MyCommunityPage() {
  const [community, setCommunity] = useState<any>(null);
  const [role, setRole] = useState<UserRole>('editor');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('from-blue-600 to-cyan-400');
  const [initials, setInitials] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const fetchCommunity = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/my-community');
        const data = await res.json();
        if (res.ok && data.community) {
          setCommunity(data.community);
          setRole(data.role || 'editor');
          setName(data.community.name || '');
          setSlug(data.community.slug || '');
          setDescription(data.community.description || '');
          setColor(data.community.color || 'from-blue-600 to-cyan-400');
          setInitials(data.community.initials || '');
          setLogoUrl(data.community.logo_url || '');
        } else if (data.role) {
          setRole(data.role);
        }
      } catch {
        setToastMsg({ type: 'error', text: 'Failed to load community details.' });
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, []);

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 5 * 1024 * 1024) {
      setToastMsg({ type: 'error', text: 'Logo image file size must be under 5MB.' });
      return;
    }

    setUploading(true);
    setToastMsg(null);

    try {
      const publicUrl = await uploadImageFile(file, 'logos');
      setLogoUrl(publicUrl);
      setToastMsg({ type: 'success', text: 'Community WebP logo uploaded to Vercel Blob!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload logo';
      setToastMsg({ type: 'error', text: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'editor') return;

    setSaving(true);
    setToastMsg(null);

    try {
      const payload: Record<string, any> = {
        id: community?.id,
        name,
        description,
        color,
        initials,
        logo_url: logoUrl,
      };

      if (role === 'dev' || role === 'admin') {
        payload.slug = slug;
      }

      const res = await fetch('/api/admin/my-community', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMsg({ type: 'success', text: 'Community details and logo link saved to Supabase!' });
        if (data.community) {
          setCommunity((prev: any) => ({ ...prev, ...data.community }));
        }
      } else {
        throw new Error(data.error || 'Failed to update community');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update community';
      setToastMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-xl">
        Loading community details...
      </div>
    );
  }

  if (!community) {
    return (
      <div className="p-8 text-center text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-xl space-y-2">
        <ShieldAlert className="w-6 h-6 text-amber-400 mx-auto" />
        <p className="font-bold text-white text-sm">No Community Assigned</p>
        <p>Your account is not assigned to a specific community entity yet.</p>
      </div>
    );
  }

  const isEditable = role === 'manager' || role === 'admin' || role === 'dev';
  const isSlugEditable = role === 'admin' || role === 'dev';

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141518] font-display flex items-center gap-3">
            <Building className="w-7 h-7 text-[#141518]" />
            {community.name} Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
            {isEditable
              ? 'Manage logo branding, bio details, and community initials.'
              : 'Editor read-only visibility for assigned community.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white border border-neutral-200/80 text-xs font-bold text-[#141518] shadow-sm w-fit">
          {isEditable ? <Edit2 className="w-3.5 h-3.5 text-[#141518]" /> : <Eye className="w-3.5 h-3.5 text-neutral-500" />}
          <span>{isEditable ? 'Manager Edit Access' : 'Editor Read-Only'}</span>
        </div>
      </div>

      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
            toastMsg.type === 'success'
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

      {/* Settings Form */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-neutral-200/60 shadow-sm space-y-6">
        <div className="flex items-center space-x-4 border-b border-neutral-100 pb-4">
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoUrl}
              alt={name}
              className="w-14 h-14 rounded-2xl object-cover border border-neutral-200"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#141518] text-white flex items-center justify-center font-bold text-xl font-display">
              {initials || name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-[#141518] font-display">{name}</h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">slug: {community.slug}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateCommunity} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                Community Name
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#161a29] text-white disabled:text-slate-500 rounded-lg px-3.5 py-2 text-xs border border-[#1e2436] focus:outline-none focus:border-[#6366f1]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                URL Slug {isSlugEditable ? '(Dev/Admin Editable)' : '(Read-Only for Manager)'}
              </label>
              <input
                type="text"
                disabled={!isSlugEditable}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#161a29] text-white disabled:text-slate-500 rounded-lg px-3.5 py-2 text-xs border border-[#1e2436] focus:outline-none focus:border-[#6366f1] disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* WebP Logo Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Community Logo (WebP Auto-Compressed Vercel Blob Upload)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  disabled={!isEditable || uploading}
                  id="logo-file-upload"
                  className="hidden"
                />
                <label
                  htmlFor="logo-file-upload"
                  className={`w-full bg-[#161a29] hover:bg-[#1e2436] text-[#94a3b8] hover:text-white rounded-lg px-4 py-2 text-xs border border-[#1e2436] flex items-center justify-center space-x-2 cursor-pointer transition-colors ${
                    !isEditable ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-[#6366f1]" />
                  <span>{uploading ? 'Converting & Uploading...' : 'Upload Logo File'}</span>
                </label>
              </div>

              <div>
                <input
                  type="url"
                  disabled={!isEditable}
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Or enter Image URL link"
                  className="w-full bg-[#161a29] text-white disabled:text-slate-500 rounded-lg px-3.5 py-2 text-xs border border-[#1e2436] focus:outline-none focus:border-[#6366f1]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                Initials Badge
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                className="w-full bg-[#161a29] text-white disabled:text-slate-500 rounded-lg px-3.5 py-2 text-xs border border-[#1e2436] focus:outline-none focus:border-[#6366f1]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                Theme Accent Class
              </label>
              <select
                disabled={!isEditable}
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-[#161a29] text-white disabled:text-slate-500 rounded-lg px-3.5 py-2 text-xs border border-[#1e2436] focus:outline-none focus:border-[#6366f1]"
              >
                <option value="from-blue-600 to-cyan-400">Electric Blue / Cyan</option>
                <option value="from-green-500 to-emerald-300">Emerald Green</option>
                <option value="from-yellow-400 to-orange-500">Solar Amber</option>
                <option value="from-green-600 to-lime-400">Lime Green</option>
                <option value="from-purple-600 to-pink-500">Neon Violet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
              Description / Mission Bio
            </label>
            <textarea
              disabled={!isEditable}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#161a29] text-white disabled:text-slate-500 rounded-lg px-3.5 py-2 text-xs border border-[#1e2436] focus:outline-none focus:border-[#6366f1] h-24"
            />
          </div>

          {isEditable && (
            <div className="pt-4 border-t border-[#1e2436] flex justify-end">
              <button
                type="submit"
                disabled={saving || uploading}
                className="brutalist-btn-primary px-6 py-2 rounded-lg text-xs disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Save Community Profile'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
