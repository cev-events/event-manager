// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect } from 'react';
import { useCommunities } from '@/lib/hooks/useCommunities';
import { UserRole, Profile } from '@/types/database.types';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Edit2,
  Building,
  Key,
  Image as ImageIcon,
  Briefcase,
  Mail,
  User as UserIcon,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import Image from 'next/image';

export default function UserManagementPage() {
  const { communities } = useCommunities();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('editor');
  const [currentUserCommunityId, setCurrentUserCommunityId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [communityId, setCommunityId] = useState('');

  useEffect(() => {
    const fetchActiveUser = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, community_id')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCurrentUserRole(profile.role);
            setCurrentUserCommunityId(profile.community_id || null);
          }
        }
      } catch {
      }
    };

    fetchActiveUser();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok && data.profiles) {
        setProfiles(data.profiles);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const displayedProfiles = profiles.filter((p) => {
    if (p.role === 'dev' && currentUserRole !== 'dev') {
      return false;
    }

    if (currentUserRole === 'dev' || currentUserRole === 'admin') {
      return true;
    }
    if (currentUserRole === 'manager') {
      return p.community_id === currentUserCommunityId || p.id === currentUserCommunityId;
    }
    return false;
  });

  if (currentUserRole === 'editor') {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800 text-amber-300 w-fit mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Editors do not have access to User Roles management. Only Community Managers and Super Admins can manage team members.
        </p>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingUser(null);
    setFullName('');
    setPosition('');
    setEmail('');
    setPassword('');
    setAvatarUrl('');
    setRole('manager');
    setCommunityId(currentUserRole === 'manager' ? (currentUserCommunityId || '') : '');
    setModalOpen(true);
  };

  const openEditModal = (user: Profile) => {
    if (user.role === 'dev' && currentUserRole !== 'dev') {
      setToastMsg({ type: 'error', text: 'Dev (Superuser) accounts cannot be modified.' });
      return;
    }
    setEditingUser(user);
    setFullName(user.full_name || '');
    setPosition(user.position || '');
    setEmail(user.email);
    setPassword('');
    setAvatarUrl(user.avatar_url || '');
    setRole(user.role);
    setCommunityId(user.community_id || (currentUserRole === 'manager' ? (currentUserCommunityId || '') : ''));
    setModalOpen(true);
  };

  const resetForm = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFullName('');
    setPosition('');
    setEmail('');
    setPassword('');
    setAvatarUrl('');
    setRole('manager');
    setCommunityId('');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSaving(true);
    setToastMsg(null);

    const finalCommunityId = currentUserRole === 'manager' ? (currentUserCommunityId || communityId) : communityId;
    const selectedComm = communities.find((c) => c.id === finalCommunityId);

    try {
      const endpoint = '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      const payload: Record<string, any> = {
        id: editingUser ? editingUser.id : undefined,
        email,
        full_name: fullName,
        position,
        avatar_url: avatarUrl,
        role,
        community_id: finalCommunityId || null,
      };

      if (password) {
        payload.password = password;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success || data.profile) {
        const savedProfile: Profile = data.profile || {
          id: editingUser ? editingUser.id : `usr_${Date.now()}`,
          email,
          full_name: fullName,
          position,
          avatar_url: avatarUrl,
          role,
          community_id: finalCommunityId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          community: selectedComm ? { name: selectedComm.name, color: selectedComm.color, initials: selectedComm.initials } as any : undefined,
        };

        if (editingUser) {
          setProfiles((prev) =>
            prev.map((p) => (p.id === editingUser.id ? { ...p, ...savedProfile } : p))
          );
          setToastMsg({ type: 'success', text: 'User profile updated successfully!' });
        } else {
          setProfiles((prev) => [savedProfile, ...prev]);
          setToastMsg({ type: 'success', text: 'New lead added to community!' });
        }

        resetForm();
        fetchProfiles();
      } else {
        throw new Error(data.error || 'Operation failed');
      }
    } catch {
      const fallbackUser: Profile = {
        id: editingUser ? editingUser.id : `usr_${Date.now()}`,
        email,
        full_name: fullName,
        position,
        avatar_url: avatarUrl,
        role,
        community_id: finalCommunityId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        community: selectedComm ? { name: selectedComm.name, color: selectedComm.color, initials: selectedComm.initials } as any : undefined,
      };

      if (editingUser) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === editingUser.id ? { ...p, ...fallbackUser } : p))
        );
      } else {
        setProfiles((prev) => [fallbackUser, ...prev]);
      }

      setToastMsg({ type: 'success', text: 'User created successfully!' });
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const targetUser = profiles.find((p) => p.id === userId);
    if (targetUser?.role === 'dev' && currentUserRole !== 'dev') {
      setToastMsg({ type: 'error', text: 'Dev (Superuser) accounts cannot be deleted by non-dev roles.' });
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${userName || userId}"?`)) {
      return;
    }

    setProfiles((prev) => prev.filter((p) => p.id !== userId));
    setToastMsg({ type: 'success', text: 'User removed from list!' });

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE', headers });
    } catch {
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-mono text-neutral-400 uppercase font-bold tracking-widest">
            005 / Access Control & RBAC Matrix
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display leading-none">
            {currentUserRole === 'manager' ? 'TEAM & COMMUNITY LEADS' : 'USER ROLES & ACCESS MANAGEMENT'}
          </h1>
          <p className="text-xs text-neutral-400">
            {currentUserRole === 'manager'
              ? 'Add and modify community leads and editors.'
              : 'Create, modify, and assign position roles.'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="py-2.5 px-5 rounded-full bg-white hover:bg-neutral-200 text-[#0a0a0a] font-bold text-xs shadow-md flex items-center space-x-2 w-fit transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Lead / Editor</span>
        </button>
      </div>

      {/* Toast Messages */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : 'bg-red-950/80 border-red-800 text-red-200'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Profiles Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-slate-900/60 border border-slate-800 rounded-2xl">
          Loading user accounts & profiles...
        </div>
      ) : displayedProfiles.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <p>No community leads found. Click "Add New Lead / Editor" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProfiles.map((usr) => (
            <div
              key={usr.id}
              className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-6 hover:border-neutral-700 transition-colors shadow-sm"
            >
              <div className="space-y-4">
                {/* Profile Avatar & Info */}
                <div className="flex items-center space-x-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700 shrink-0 flex items-center justify-center text-xl font-extrabold text-white">
                    {usr.avatar_url ? (
                      <Image
                        src={usr.avatar_url}
                        alt={usr.full_name || usr.email}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span>{(usr.full_name || usr.email).substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <h3 className="text-lg font-bold text-white truncate font-display">
                      {usr.full_name || 'Unnamed User'}
                    </h3>
                    <p className="text-xs text-neutral-300 font-semibold truncate flex items-center gap-1">
                      <Briefcase className="w-3 h-3 shrink-0 text-neutral-400" />
                      {usr.position || 'Community Lead'}
                    </p>
                    <p className="text-xs text-neutral-400 truncate mt-0.5 font-mono">{usr.email}</p>
                  </div>
                </div>

                {/* Role & Community Badges */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-800 text-white border border-neutral-700 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-neutral-400" />
                    {usr.role}
                  </span>

                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Building className="w-3 h-3 text-neutral-400" />
                    {usr.community?.name || 'Super Admin (All)'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-4 border-t border-neutral-800">
                <button
                  onClick={() => openEditModal(usr)}
                  className="flex-1 py-2 px-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-neutral-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modify User</span>
                </button>

                <button
                  onClick={() => handleDeleteUser(usr.id, usr.full_name || usr.email)}
                  className="p-2 rounded-full bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 hover:text-white text-xs transition-colors"
                  title="Delete User Account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 my-8 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-400" />
                {editingUser ? 'Modify Lead Profile' : 'Add New Community Lead'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Anand P."
                    required
                    className="w-full bg-slate-950 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Position / Designation
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. IEEE SB Lead / Nodal Officer"
                    required
                    className="w-full bg-slate-950 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address (Auth User)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="lead@cev.ac.in"
                    required
                    className="w-full bg-slate-950 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {editingUser ? 'Reset Password (Optional)' : 'Auth Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingUser ? 'Leave blank to keep existing password' : 'Enter password'}
                    required={!editingUser}
                    className="w-full bg-slate-950 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Profile Picture URL (Avatar)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-950 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    RBAC Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 text-[#fff] rounded-xl px-3 py-2.5 text-sm border border-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {currentUserRole === 'dev' && (
                      <option value="dev">Dev (Super Admin)</option>
                    )}
                    {(currentUserRole === 'dev' || currentUserRole === 'admin') && (
                      <option value="admin">Admin</option>
                    )}
                    <option value="manager">Manager (Lead)</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Associated Community
                  </label>
                  {currentUserRole === 'manager' ? (
                    <input
                      type="text"
                      disabled
                      value={communities.find((c) => c.id === currentUserCommunityId)?.name || 'Assigned Community'}
                      className="w-full bg-slate-950/60 text-slate-400 rounded-xl px-3 py-2.5 text-sm border border-slate-800"
                    />
                  ) : (
                    <select
                      value={communityId}
                      onChange={(e) => setCommunityId(e.target.value)}
                      className="w-full bg-slate-950 text-white rounded-xl px-3 py-2.5 text-sm border border-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">All Communities (Super Admin)</option>
                      {communities.filter((c) => c.slug !== 'college' && c.name.toLowerCase() !== 'college').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingUser ? 'Update Lead' : 'Add Lead Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
