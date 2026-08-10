import React, { useState } from 'react';
import { MediaItem, UserAccount, SupportedLanguage, MediaType, UserRole } from '../types';
import { getTranslation } from '../data/translations';
import {
  ShieldCheck,
  Check,
  X,
  Trash2,
  UserPlus,
  ShieldAlert,
  Play,
  Eye,
  Mail,
  Film,
  Headphones,
  Music,
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  Ban,
} from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';
import { UserProfileModal } from './UserProfileModal';
import { useAuth } from '../context/AuthContext';
import { TvVideoPlayer } from './TvVideoPlayer';
import { useTvNavigation } from '../hooks/useTvNavigation';

interface AdminModerationModalProps {
  currentLanguage: SupportedLanguage;
  currentUserEmail: string;
  adminEmails: string[];
  mediaItems: MediaItem[];
  userAccounts: UserAccount[];
  onApproveVideo: (id: string) => void;
  onRejectVideo: (id: string) => void;
  onAddAdmin: (email: string) => void;
  onRemoveAdmin: (email: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onToggleUserAdminRole: (userId: string) => void;
  onClose: () => void;
}

export const SUPER_ADMIN_WHITELIST = [
  'orthodoxconnect.live@gmail.com',
  'lucasautocode@gmail.com',
];

export const SUPER_ADMIN_EMAIL = 'orthodoxconnect.live@gmail.com';

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return SUPER_ADMIN_WHITELIST.some((e) => e.toLowerCase() === clean);
}

export function checkIsAdmin(
  email?: string | null,
  role?: string | null,
  appMetadataRole?: string | null,
  adminEmails: string[] = []
): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();

  // 1. Super Admin Whitelist check
  if (isSuperAdminEmail(cleanEmail)) return true;

  // 2. Explicit admin / super_admin role check
  const cleanRole = (role || '').trim().toLowerCase();
  const cleanAppRole = (appMetadataRole || '').trim().toLowerCase();
  if (
    cleanRole === 'admin' ||
    cleanRole === 'super_admin' ||
    cleanAppRole === 'admin' ||
    cleanAppRole === 'super_admin'
  ) {
    return true;
  }

  // 3. Dynamic adminEmails array
  if (adminEmails.some((e) => e.toLowerCase() === cleanEmail)) {
    return true;
  }

  return false;
}

export const AdminModerationModal: React.FC<AdminModerationModalProps> = ({
  currentLanguage,
  currentUserEmail,
  adminEmails,
  mediaItems,
  userAccounts,
  onApproveVideo,
  onRejectVideo,
  onAddAdmin,
  onRemoveAdmin,
  onToggleUserStatus,
  onToggleUserAdminRole,
  onClose,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'users' | 'admins'>('pending');
  const [pendingTypeFilter, setPendingTypeFilter] = useState<MediaType | 'all'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminAddSuccess, setAdminAddSuccess] = useState('');
  const [adminAddError, setAdminAddError] = useState('');
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserAccount | null>(null);

  // TV Remote D-Pad Navigation Back Listener
  useTvNavigation({
    onBack: () => {
      if (previewMedia) {
        setPreviewMedia(null);
      } else if (selectedProfileUser) {
        setSelectedProfileUser(null);
      } else {
        onClose();
      }
    },
  });

  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  const effectiveEmail = user?.email || currentUserEmail || '';
  const effectiveRole = user?.role;
  const effectiveAppMetaRole = user?.app_metadata?.role || user?.user_metadata?.role;

  const hasAdminAccess = checkIsAdmin(effectiveEmail, effectiveRole, effectiveAppMetaRole, adminEmails);
  const isSuperAdmin = isSuperAdminEmail(effectiveEmail);

  if (!hasAdminAccess) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-rose-300 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-xl text-slate-900">Access Denied</h3>
          <p className="text-sm text-slate-600 font-medium">
            You do not have administrative privileges to access the Admin Moderation Panel. Please sign in with an authorized administrator account.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl shadow transition-all active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isPendingStatus = (status?: string) =>
    status === 'pending_approval' || status === 'pending' || status === 'pending_moderation';

  // Filter pending items by type
  const pendingVideos = mediaItems.filter((item) => {
    if (!isPendingStatus(item.status)) return false;
    if (pendingTypeFilter === 'all') return true;
    return item.type === pendingTypeFilter;
  });

  const publishedVideos = mediaItems.filter((item) => item.status === 'approved' || item.status === 'published' || !item.status);

  // Filter users directory
  const filteredUsers = userAccounts.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();
    setAdminAddSuccess('');
    setAdminAddError('');

    const trimmed = newAdminEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setAdminAddError('Please enter a valid email address.');
      return;
    }

    if (adminEmails.some((e) => e.toLowerCase() === trimmed)) {
      setAdminAddError('This email is already an assigned Admin.');
      return;
    }

    onAddAdmin(trimmed);
    soundFx.playSuccess();
    setAdminAddSuccess(`Granted Admin permissions to ${trimmed}`);
    setNewAdminEmail('');
  };

  const handleRemoveAdminClick = (email: string) => {
    soundFx.playPop();
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      alert('Permanent Super Admin Owner access cannot be revoked.');
      return;
    }
    if (confirm(`Are you sure you want to revoke Admin privileges from ${email}?`)) {
      onRemoveAdmin(email);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-5xl w-full border-2 border-slate-700 shadow-2xl relative my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">{t('admin_panel', 'Admin Moderation Dashboard')}</h3>
                {isSuperAdmin ? (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                    👑 Super Admin Owner
                  </span>
                ) : (
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/40">
                    🛡️ Moderator Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Logged in as: <strong className="text-slate-200">{currentUserEmail}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 border-b border-slate-800 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pending Queue ({mediaItems.filter((i) => isPendingStatus(i.status)).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('published')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'published'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Published Feed ({publishedVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users Directory ({userAccounts.length})</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('admins')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admins'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Admin Privileges ({adminEmails.length})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PENDING QUEUE WITH CATEGORY BADGE FILTERS */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">
                  Pending Submissions Moderation Queue
                </h4>

                {/* Category Filters */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setPendingTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                      pendingTypeFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setPendingTypeFilter('video')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                      pendingTypeFilter === 'video'
                        ? 'bg-rose-500 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Film className="w-3 h-3" />
                    <span>Videos</span>
                  </button>
                  <button
                    onClick={() => setPendingTypeFilter('audiobook')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                      pendingTypeFilter === 'audiobook'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Headphones className="w-3 h-3" />
                    <span>Audiobooks</span>
                  </button>
                  <button
                    onClick={() => setPendingTypeFilter('rhyme')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                      pendingTypeFilter === 'rhyme'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Music className="w-3 h-3" />
                    <span>Rhymes</span>
                  </button>
                </div>
              </div>

              {pendingVideos.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="font-bold text-sm text-slate-300">All clear! No pending submissions awaiting moderation.</p>
                  <p className="text-xs text-slate-500">
                    New user uploads will automatically queue here for admin approval.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingVideos.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-800 border-2 border-amber-500/40 rounded-2xl p-3 flex flex-col justify-between shadow-lg relative overflow-hidden"
                    >
                      <div className="space-y-2">
                        {/* Thumbnail & Format Badge */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-700 group">
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                            {item.type === 'video' && <Film className="w-3 h-3" />}
                            {item.type === 'audiobook' && <Headphones className="w-3 h-3" />}
                            {item.type === 'rhyme' && <Music className="w-3 h-3" />}
                            <span className="capitalize">{item.type}</span>
                          </div>
                          <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {item.duration}
                          </div>
                          <button
                            onClick={() => setPreviewMedia(item)}
                            className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-extrabold text-white"
                          >
                            <Eye className="w-5 h-5 text-amber-400" />
                            <span>Preview Media</span>
                          </button>
                        </div>

                        {/* Title & Info */}
                        <div>
                          <h5 className="font-extrabold text-sm text-white line-clamp-1">{item.title}</h5>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{item.description}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-300">
                          <span className="bg-slate-700 px-2 py-0.5 rounded-md">{item.category}</span>
                          <span className="bg-slate-700 px-2 py-0.5 rounded-md">
                            Age {item.targetAgeGroup.join(', ')} yrs
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 border-t border-slate-700/60 pt-2 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-amber-400" />
                          <span>Uploaded by: <strong className="text-slate-200">{item.uploadedBy || 'Anonymous Parent'}</strong></span>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-700">
                        <button
                          onClick={() => {
                            soundFx.playSuccess();
                            onApproveVideo(item.id);
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold py-2 rounded-xl flex items-center justify-center gap-1 transition-all shadow"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Publish</span>
                        </button>

                        <button
                          onClick={() => {
                            soundFx.playPop();
                            if (confirm('Are you sure you want to permanently delete this video from VKid?')) {
                              onRejectVideo(item.id);
                            }
                          }}
                          className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PUBLISHED FEED */}
          {activeTab === 'published' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">
                Active Public Media Library ({publishedVideos.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {publishedVideos.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 flex flex-col justify-between"
                  >
                    <div className="flex gap-2.5 items-start">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-16 h-12 object-cover rounded-lg shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-white truncate">{item.title}</h5>
                        <p className="text-[10px] text-slate-400 capitalize">{item.type} • {item.category}</p>
                        <span className="inline-block mt-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Approved & Active
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        soundFx.playPop();
                        if (confirm(`Unpublish '${item.title}' and send back to moderation?`)) {
                          onRejectVideo(item.id);
                        }
                      }}
                      className="mt-2 text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center justify-end gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Unpublish / Revoke</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN USER DIRECTORY & MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800 p-3 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Registered Accounts Directory</h4>
                    <p className="text-[11px] text-slate-400">
                      Manage registered users, toggle admin privileges, and ban/suspend accounts.
                    </p>
                  </div>
                </div>

                {/* User Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Users Data Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">User / Display Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Uploads</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {filteredUsers.map((user) => {
                      const userUploadsCount = mediaItems.filter(
                        (m) => m.uploadedBy?.toLowerCase() === user.email.toLowerCase()
                      ).length;
                      const isOwner = user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

                      return (
                        <tr key={user.id} className="hover:bg-slate-900/80 transition-colors">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <span className="text-lg">{user.avatarUrl || '👤'}</span>
                            <div>
                              <span className="block font-bold">{user.displayName}</span>
                              <span className="text-[10px] text-slate-500 font-normal">ID: {user.id}</span>
                            </div>
                          </td>

                          <td className="p-3 text-slate-300 font-bold">{user.email}</td>

                          <td className="p-3">
                            {user.role === 'super_admin' && (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                                👑 Super Admin
                              </span>
                            )}
                            {user.role === 'admin' && (
                              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                                🛡️ Admin
                              </span>
                            )}
                            {user.role === 'parent' && (
                              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                👨‍👩‍👧 Parent
                              </span>
                            )}
                          </td>

                          <td className="p-3 font-extrabold text-amber-400">{userUploadsCount}</td>

                          <td className="p-3">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                user.status === 'active'
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                  : 'bg-rose-950 text-rose-400 border-rose-800'
                              }`}
                            >
                              {user.status === 'active' ? '✓ Active' : '⚠ Suspended'}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Profile */}
                              <button
                                onClick={() => {
                                  soundFx.playPop();
                                  setSelectedProfileUser(user);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors"
                                title="View User Profile & Uploads"
                              >
                                View Profile
                              </button>

                              {/* Toggle Admin Role (Super Admin Only) */}
                              {isSuperAdmin && !isOwner && (
                                <button
                                  onClick={() => {
                                    soundFx.playPop();
                                    onToggleUserAdminRole(user.id);
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                    user.role === 'admin'
                                      ? 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800'
                                      : 'bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800'
                                  }`}
                                  title="Toggle Admin Privileges"
                                >
                                  {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                </button>
                              )}

                              {/* Ban/Suspend Toggle */}
                              {!isOwner && (
                                <button
                                  onClick={() => {
                                    soundFx.playPop();
                                    onToggleUserStatus(user.id);
                                  }}
                                  className={`p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                                    user.status === 'active'
                                      ? 'bg-rose-900/60 text-rose-300 hover:bg-rose-800 border border-rose-700'
                                      : 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800 border border-emerald-700'
                                  }`}
                                  title={user.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                                >
                                  {user.status === 'active' ? (
                                    <Ban className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN PRIVILEGES MANAGEMENT (SUPER ADMIN ONLY) */}
          {activeTab === 'admins' && isSuperAdmin && (
            <div className="space-y-6">
              <div className="bg-slate-800 border-2 border-amber-500/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h4 className="font-extrabold text-base text-white">Grant Admin Access</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As Permanent Owner (<strong className="text-amber-300">{SUPER_ADMIN_EMAIL}</strong>), you can grant or revoke Admin privileges for other accounts. Assigned admins can approve/reject submitted videos.
                </p>

                <form onSubmit={handleAddAdminSubmit} className="flex gap-2 pt-2">
                  <input
                    type="email"
                    placeholder="e.g. moderator@vkid.app"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t('add_admin', 'Add Admin')}</span>
                  </button>
                </form>

                {adminAddSuccess && (
                  <p className="text-xs font-bold text-emerald-400 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800">
                    ✓ {adminAddSuccess}
                  </p>
                )}
                {adminAddError && (
                  <p className="text-xs font-bold text-rose-400 bg-rose-950/60 p-2 rounded-lg border border-rose-800">
                    ⚠ {adminAddError}
                  </p>
                )}
              </div>

              {/* Current Admin Email List */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">
                  Current Platform Administrators ({adminEmails.length})
                </h4>

                <div className="space-y-2">
                  {adminEmails.map((email) => {
                    const isOwner = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                    return (
                      <div
                        key={email}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          isOwner
                            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                            : 'bg-slate-800/80 border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Mail className={`w-4 h-4 ${isOwner ? 'text-amber-400' : 'text-slate-400'}`} />
                          <span className="font-extrabold text-xs">{email}</span>
                          {isOwner && (
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                              👑 Permanent Owner
                            </span>
                          )}
                        </div>

                        {!isOwner && (
                          <button
                            onClick={() => handleRemoveAdminClick(email)}
                            className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/60 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke Access</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Media Preview Modal Overlay (Video, Audiobook Waveform Player, or Rhyme Player) */}
        {previewMedia && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-2xl w-full p-4 space-y-3 relative text-white">
              <button
                onClick={() => setPreviewMedia(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h4 className="font-extrabold text-lg text-amber-400 flex items-center gap-2">
                {previewMedia.type === 'video' && <Film className="w-5 h-5 text-rose-400" />}
                {previewMedia.type === 'audiobook' && <Headphones className="w-5 h-5 text-indigo-400" />}
                {previewMedia.type === 'rhyme' && <Music className="w-5 h-5 text-purple-400" />}
                <span>{previewMedia.title}</span>
              </h4>
              <p className="text-xs text-slate-400">{previewMedia.description}</p>

              {/* Player depending on type */}
              <div className="w-full rounded-2xl overflow-hidden bg-black border border-slate-800 p-2">
                {previewMedia.type === 'video' || previewMedia.type === 'rhyme' ? (
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                    <TvVideoPlayer
                      mediaUrl={previewMedia.mediaUrl}
                      title={previewMedia.title}
                      posterUrl={previewMedia.thumbnailUrl}
                      storageUrl={previewMedia.storageUrl}
                      publicUrl={previewMedia.publicUrl}
                    />
                  </div>
                ) : (
                  /* Audiobook Preview Player */
                  <div className="p-6 text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-lg">
                      <img src={previewMedia.thumbnailUrl} alt={previewMedia.title} className="w-full h-full object-cover" />
                    </div>
                    <audio controls autoPlay src={previewMedia.mediaUrl} className="w-full" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    soundFx.playSuccess();
                    onApproveVideo(previewMedia.id);
                    setPreviewMedia(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Content</span>
                </button>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Modal inside Admin */}
        {selectedProfileUser && (
          <UserProfileModal
            user={selectedProfileUser}
            userMediaItems={mediaItems.filter(
              (m) => m.uploadedBy?.toLowerCase() === selectedProfileUser.email.toLowerCase()
            )}
            currentLanguage={currentLanguage}
            onPlayMedia={(item) => setPreviewMedia(item)}
            onClose={() => setSelectedProfileUser(null)}
          />
        )}
      </div>
    </div>
  );
};

