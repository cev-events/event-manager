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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          Loading community details...
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="p-8 text-center text-neutral-500 text-xs bg-white border border-neutral-200/60 rounded-[28px] space-y-3">
        <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="font-bold text-[#141518] text-base">No Community Assigned</h3>
        <p>Your account is not assigned to a specific community entity yet.</p>
      </div>
    );
  }

  const isEditable = role === 'manager' || role === 'admin' || role === 'dev';
  const isSlugEditable = role === 'admin' || role === 'dev';

  return (
    <div className="w-full min-h-[calc(100vh-7rem)] lg:h-[calc(100vh-7rem)] lg:overflow-hidden pb-12 lg:pb-0">
      {toastMsg && (
        <div
          className={`flex items-center gap-3 rounded-2xl px-5 py-4 border text-xs font-semibold mb-4 ${
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

      <section className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left Dark Card - Community Brand Overview */}
        <div className="lg:col-span-4 h-full min-h-0 bg-[#141518] text-white rounded-[28px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative shadow-xl">
          <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full border border-white/10" />

          <div className="relative z-10 flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              COMMUNITY ENTITY
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              {role}
            </span>
          </div>

          <div className="relative z-10 space-y-6 my-6 lg:my-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[24px] overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center shadow-lg">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-3xl font-extrabold font-display">
                  {initials || name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-[-0.04em] leading-[0.95]">
                {name || 'My Community'}
              </h2>

              <p className="mt-2 text-xs text-white/50 font-mono break-all">
                slug: {community.slug}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white text-[#141518] flex items-center gap-1.5">
              <Building className="w-3 h-3" />
              {community.name}
            </span>

            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/10 text-white/70 border border-white/10 flex items-center gap-1.5">
              {isEditable ? <Edit2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {isEditable ? 'Editable' : 'Read-Only'}
            </span>
          </div>
        </div>

        {/* Right White Card - Form Controls */}
        <div className="lg:col-span-8 h-full min-h-0 bg-white border border-neutral-200 rounded-[28px] p-6 sm:p-8 overflow-y-auto shadow-sm">
          <form onSubmit={handleUpdateCommunity} className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                  Entity Details
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight mt-1 text-[#141518]">
                  Community Branding
                </h2>
              </div>

              <Building className="w-5 h-5 text-neutral-300" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                  Community Name
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Community name"
                  required
                  className="w-full bg-[#f7f7f7] border border-neutral-200 text-[#141518] placeholder-neutral-400 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-neutral-500 focus:bg-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                  URL Slug {isSlugEditable ? '(Dev/Admin Editable)' : '(Read-Only)'}
                </label>
                <input
                  type="text"
                  disabled={!isSlugEditable}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-neutral-100 text-neutral-500 rounded-2xl px-4 py-3.5 text-sm border border-neutral-200 cursor-not-allowed font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                  Initials Badge
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={initials}
                  onChange={(e) => setInitials(e.target.value)}
                  placeholder="e.g. IE"
                  className="w-full bg-[#f7f7f7] border border-neutral-200 text-[#141518] placeholder-neutral-400 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-neutral-500 focus:bg-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                  Brand Color Accent
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#6366f1"
                  className="w-full bg-[#f7f7f7] border border-neutral-200 text-[#141518] placeholder-neutral-400 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-neutral-500 focus:bg-white transition-all font-mono disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            </div>

            {/* Logo Media Upload */}
            <div className="border-t border-neutral-100 pt-5 space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                  Brand Assets
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight mt-1 text-[#141518]">
                  Community Logo Image
                </h2>
              </div>

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
                    className={`min-h-[80px] w-full bg-[#f7f7f7] hover:bg-neutral-100 border border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      !isEditable ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-5 h-5 text-neutral-500" />
                    <span className="text-xs font-bold text-[#141518]">
                      {uploading ? 'Uploading...' : 'Upload WebP Logo'}
                    </span>
                  </label>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="url"
                    disabled={!isEditable}
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Or enter Image URL link"
                    className="w-full bg-[#f7f7f7] border border-neutral-200 text-[#141518] placeholder-neutral-400 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-neutral-500 focus:bg-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>
            </div>

            {/* Bio Description */}
            <div className="border-t border-neutral-100 pt-5 space-y-3">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                Community Description / Mission
              </label>
              <textarea
                disabled={!isEditable}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Community mission and details..."
                className="w-full bg-[#f7f7f7] border border-neutral-200 text-[#141518] placeholder-neutral-400 rounded-2xl p-4 text-sm focus:outline-none focus:border-neutral-500 focus:bg-white transition-all h-24 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            {/* Submit Action */}
            {isEditable && (
              <div className="mt-auto pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-7 py-3.5 rounded-full bg-[#141518] text-white hover:bg-black font-extrabold text-xs disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {saving ? 'Saving Profile...' : 'Save Community Profile'}
                </button>
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
