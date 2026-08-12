// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import { Building, Plus, Trash2, Edit2, ShieldAlert, Image as ImageIcon, Link2, Upload, X } from 'lucide-react';
import { useCommunities } from '@/lib/hooks/useCommunities';
import { createClient } from '@/lib/supabase/client';
import { UserRole, Community } from '@/types/database.types';
import { uploadImageFile } from '@/lib/upload';

const COLOR_PRESETS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Orange', hex: '#f97316' },
];

export default function CommunitiesManagementPage() {
  const { communities, setCommunities, loading } = useCommunities();
  const [userRole, setUserRole] = useState<UserRole>('editor');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [initials, setInitials] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profile?.role) {
            setUserRole(profile.role);
          }
        }
      } catch {
      }
    };

    fetchUserRole();
  }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDesc('');
    setColor('#6366f1');
    setInitials('');
    setLogoUrl('');
    setEditingCommunity(null);
    setShowAddModal(false);
  };

  const handleOpenEdit = (c: Community) => {
    setEditingCommunity(c);
    setName(c.name || '');
    setSlug(c.slug || '');
    setDesc(c.description || '');
    setColor(c.color || '#6366f1');
    setInitials(c.initials || '');
    setLogoUrl(c.logo_url || '');
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);
    try {
      const publicUrl = await uploadImageFile(file, 'logos');
      setLogoUrl(publicUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);

    const finalSlug = slug.trim() ? slug.toLowerCase().replace(/\s+/g, '-') : name.toLowerCase().replace(/\s+/g, '-');
    const newComm = {
      id: Date.now().toString(),
      name,
      slug: finalSlug,
      description: desc || 'Campus technical community.',
      color,
      initials: initials || name.slice(0, 2).toUpperCase(),
      logo_url: logoUrl || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('communities').insert({
        name,
        slug: finalSlug,
        description: desc,
        color,
        initials: initials || name.slice(0, 2).toUpperCase(),
        logo_url: logoUrl || null,
      }).select().single();

      if (data) {
        setCommunities([...communities, data]);
      } else {
        setCommunities([...communities, newComm]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      resetForm();
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommunity || !name) return;
    setSaving(true);

    const finalSlug = slug.trim() ? slug.toLowerCase().replace(/\s+/g, '-') : name.toLowerCase().replace(/\s+/g, '-');
    const updatedComm: Community = {
      ...editingCommunity,
      name,
      slug: finalSlug,
      description: desc,
      color,
      initials: initials || name.slice(0, 2).toUpperCase(),
      logo_url: logoUrl || null,
      updated_at: new Date().toISOString(),
    };

    setCommunities(communities.map((c) => (c.id === editingCommunity.id ? updatedComm : c)));

    try {
      const supabase = createClient();
      await supabase
        .from('communities')
        .update({
          name,
          slug: finalSlug,
          description: desc,
          color,
          initials: initials || name.slice(0, 2).toUpperCase(),
          logo_url: logoUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingCommunity.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this community entity?')) return;
    setCommunities(communities.filter((c) => c.id !== id));
    try {
      const supabase = createClient();
      await supabase.from('communities').delete().eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

  if (userRole === 'manager' || userRole === 'editor') {
    return (
      <div className="p-8 rounded-[28px] bg-white border border-neutral-200/80 text-center space-y-4 max-w-2xl mx-auto my-12 shadow-sm">
        <div className="p-3 rounded-full bg-rose-50 border border-rose-200 text-rose-600 w-fit mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#141518] font-display">Access Restricted</h2>
        <p className="text-xs text-neutral-500 leading-relaxed font-medium">
          Community Management is restricted to Super Admins and Developers. Community Managers and Editors do not have permission to add, edit, or delete campus community entities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141518] font-display">
            Community Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Create or modify campus community entities and signature colors.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="py-2.5 px-6 rounded-full bg-[#141518] hover:bg-black text-white font-extrabold text-xs shadow-md flex items-center space-x-2 w-fit transition-all"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Community</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-neutral-500 text-xs bg-white border border-neutral-200/60 rounded-[28px]">
          Loading community entities...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.filter((c) => c.slug !== 'college' && c.name.toLowerCase() !== 'college').map((c) => (
            <div key={c.id} className="p-6 rounded-[28px] bg-white border border-neutral-200/60 space-y-4 flex flex-col justify-between relative group hover:shadow-md transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {c.logo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={c.logo_url}
                        alt={c.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-neutral-200"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-[#141518] text-white flex items-center justify-center font-bold text-sm">
                        {c.initials || c.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <h3 className="text-base font-bold text-[#141518] font-display">{c.name}</h3>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 text-neutral-400 hover:text-[#141518] rounded-full hover:bg-neutral-100 transition-colors"
                      title="Edit Community Entity"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-neutral-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                      title="Delete Community Entity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 line-clamp-2 font-medium">{c.description}</p>
              </div>

              {/* Slug & Logo Info Footer */}
              <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
                <span className="truncate max-w-[150px]">slug: {c.slug || c.name.toLowerCase().replace(/\s+/g, '-')}</span>
                {c.logo_url && (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 text-[10px] font-semibold">
                    <ImageIcon className="w-3 h-3" /> Logo Set
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Community */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f121d] border-2 border-[#1e2436] rounded-xl p-6 w-full max-w-md space-y-4 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1e2436] pb-3">
              <h3 className="text-lg font-bold font-display">Create Community Entity</h3>
              <button onClick={resetForm} className="text-[#94a3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Community Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. IEEE SB CEV"
                  required
                  className="w-full bg-[#161a29] border border-[#1e2436] rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                  Custom URL Slug (Dev / Admin Only)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. ieee-sb-cev"
                  className="w-full bg-[#161a29] border border-[#1e2436] rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                  Community Logo (WebP Compressed Vercel Blob Upload)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      disabled={uploading}
                      id="comm-logo-add-upload"
                      className="hidden"
                    />
                    <label
                      htmlFor="comm-logo-add-upload"
                      className="w-full bg-[#161a29] hover:bg-[#1e2436] text-[#94a3b8] hover:text-white rounded-lg px-3 py-2 text-xs border border-[#1e2436] flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#6366f1]" />
                      <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Or Image URL"
                      className="w-full bg-[#161a29] border border-[#1e2436] rounded-lg pl-8 pr-2.5 py-2 text-xs focus:outline-none focus:border-[#6366f1]"
                    />
                    <Link2 className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Initials Badge</label>
                <input
                  type="text"
                  value={initials}
                  onChange={(e) => setInitials(e.target.value)}
                  placeholder="e.g. IE"
                  className="w-full bg-[#161a29] border border-[#1e2436] rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                  Community Brand Color (Calendar Slot Color)
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={`add-${preset.hex}`}
                      type="button"
                      onClick={() => setColor(preset.hex)}
                      className={`w-6 h-6 rounded-full transition-transform border ${
                        color.toLowerCase() === preset.hex.toLowerCase()
                          ? 'scale-125 border-white shadow-md ring-2 ring-white/30'
                          : 'border-transparent hover:scale-110 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={color.startsWith('#') ? color : '#6366f1'}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-9 p-0.5 bg-[#161a29] border border-[#1e2436] rounded-lg cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1 bg-[#161a29] border border-[#1e2436] rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Description / Bio</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Community mission..."
                  className="w-full bg-[#161a29] border border-[#1e2436] rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-[#6366f1] h-20"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#1e2436]">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 text-xs text-[#94a3b8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="brutalist-btn-primary px-4 py-2 rounded-lg text-xs disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Community (Dev/Admin) */}
      {editingCommunity && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f121d] border-2 border-[#1e2436] rounded-xl p-6 w-full max-w-md space-y-4 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1e2436] pb-3">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#6366f1]" /> Edit Community Entity
              </h3>
              <button onClick={resetForm} className="text-[#94a3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Community Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. IEEE SB CEV"
                  required
                  className="w-full bg-[#161a29] border border-[#1e2436] rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                  Custom URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. ieee-sb-cev"
                  className="w-full bg-[#161a29] border border-[#1e2436] rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                  Community Logo (WebP Compressed Vercel Blob Upload)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      disabled={uploading}
                      id="comm-logo-edit-upload"
                      className="hidden"
                    />
                    <label
                      htmlFor="comm-logo-edit-upload"
                      className="w-full bg-[#161a29] hover:bg-[#1e2436] text-[#94a3b8] hover:text-white rounded-lg px-3 py-2 text-xs border border-[#1e2436] flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#6366f1]" />
                      <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Or Image URL"
                      className="w-full bg-[#161a29] border border-[#1e2436] rounded-lg pl-8 pr-2.5 py-2 text-xs focus:outline-none focus:border-[#6366f1]"
                    />
                    <Link2 className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Initials Badge</label>
                <input
                  type="text"
                  value={initials}
                  onChange={(e) => setInitials(e.target.value)}
                  placeholder="e.g. IE"
                  className="w-full bg-[#161a29] border border-[#1e2436] rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                  Community Brand Color (Calendar Slot Color)
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={`edit-${preset.hex}`}
                      type="button"
                      onClick={() => setColor(preset.hex)}
                      className={`w-6 h-6 rounded-full transition-transform border ${
                        color.toLowerCase() === preset.hex.toLowerCase()
                          ? 'scale-125 border-white shadow-md ring-2 ring-white/30'
                          : 'border-transparent hover:scale-110 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={color.startsWith('#') ? color : '#6366f1'}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-9 p-0.5 bg-[#161a29] border border-[#1e2436] rounded-lg cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1 bg-[#161a29] border border-[#1e2436] rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Description / Bio</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Community mission..."
                  className="w-full bg-[#161a29] border border-[#1e2436] rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-[#6366f1] h-20"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#1e2436]">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 text-xs text-[#94a3b8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="brutalist-btn-primary px-4 py-2 rounded-lg text-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Community Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
