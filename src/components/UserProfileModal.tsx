import React, { useState } from 'react';
import { UserAccount, MediaItem, SupportedLanguage } from '../types';
import { getTranslation } from '../data/translations';
import {
  X,
  Mail,
  Shield,
  Film,
  CheckCircle2,
  AlertOctagon,
  User,
  Play,
  Headphones,
  Music,
  Camera,
  Trash2,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';
import { isImageUrl } from '../utils/avatarUtils';
import { AvatarUploadModal } from './AvatarUploadModal';
import { ParentGateModal } from './ParentalControls/ParentGateModal';
import { deleteUserAccountPermanently } from '../lib/accountService';
import { useAuth } from '../context/AuthContext';

interface UserProfileModalProps {
  user: UserAccount;
  userMediaItems: MediaItem[];
  currentLanguage: SupportedLanguage;
  onPlayMedia?: (item: MediaItem) => void;
  onUpdateAvatar?: (userId: string, avatarUrl: string) => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  userMediaItems,
  currentLanguage,
  onPlayMedia,
  onUpdateAvatar,
  onClose,
}) => {
  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);
  const { user: authUser, logout } = useAuth();
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(user.avatarUrl || '👤');

  // Account Deletion State
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isCurrentUser = authUser && (authUser.id === user.id || authUser.email === user.email);

  const handleSelectAvatar = (newAvatar: string) => {
    setCurrentAvatarUrl(newAvatar);
    user.avatarUrl = newAvatar;
    if (onUpdateAvatar) {
      onUpdateAvatar(user.id, newAvatar);
    }
  };

  const handleExecuteDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      const result = await deleteUserAccountPermanently(user.id, user.email);
      if (result.success) {
        await logout();
        onClose();
        window.location.href = '/';
      } else {
        setDeleteError(result.error || 'Failed to delete account.');
      }
    } catch (e: any) {
      setDeleteError(e.message || 'Error occurred while deleting account.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-amber-300 shadow-2xl relative my-auto p-5 sm:p-6 text-slate-800 space-y-4">
          {/* Close Button */}
          <button
            type="button"
            tabIndex={0}
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Card Header */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-inner overflow-hidden">
                {isImageUrl(currentAvatarUrl) ? (
                  <img src={currentAvatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{currentAvatarUrl || '👤'}</span>
                )}
              </div>
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  soundFx.playPop();
                  setIsAvatarPickerOpen(true);
                }}
                className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow border-2 border-white transition-transform active:scale-90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                title="Change Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-lg text-slate-900">{user.displayName}</h3>
                {user.role === 'super_admin' && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                    👑 Super Admin
                  </span>
                )}
                {user.role === 'admin' && (
                  <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                    🛡️ Admin Moderator
                  </span>
                )}
                {user.role === 'parent' && (
                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                    👨‍👩‍👧 Parent Creator
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>{user.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    user.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {user.status === 'active' ? '✓ Active Account' : '⚠ Suspended Account'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.channelBio && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
                Creator Bio
              </span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">{user.channelBio}</p>
            </div>
          )}

          {/* User Uploads List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-4 h-4 text-amber-500" />
                <span>Uploaded Content ({userMediaItems.length})</span>
              </h4>
            </div>

            {userMediaItems.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">No uploaded content yet from this user.</p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {userMediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 border border-slate-200 hover:border-amber-300 rounded-xl p-2.5 flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-slate-800 truncate">{item.title}</h5>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                          <span className="capitalize">{item.type}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span
                            className={`font-bold ${
                              item.status === 'approved' || !item.status
                                ? 'text-emerald-600'
                                : item.status === 'pending_approval'
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {item.status || 'approved'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {onPlayMedia && (item.status === 'approved' || !item.status) && (
                      <button
                        type="button"
                        tabIndex={0}
                        onClick={() => {
                          soundFx.playPop();
                          onPlayMedia(item);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded-lg shadow shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                        title="Play Media"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Deletion Area (Google Play Families Compliant) */}
          {isCurrentUser && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  soundFx.playPop();
                  setIsParentGateOpen(true);
                }}
                className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Account & Erase Personal Data</span>
              </button>
            </div>
          )}

          <button
            type="button"
            tabIndex={0}
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs py-2.5 rounded-xl shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Close Profile
          </button>

          {isAvatarPickerOpen && (
            <AvatarUploadModal
              currentAvatar={currentAvatarUrl}
              title={`Update ${user.displayName}'s Profile Photo`}
              onSelectAvatar={handleSelectAvatar}
              onClose={() => setIsAvatarPickerOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Parental Gate for Account Deletion */}
      {isParentGateOpen && (
        <ParentGateModal
          title="Parent Verification: Account Deletion"
          reason="delete_account"
          description="Please ask a parent or adult guardian to solve this math challenge to authorize account deletion."
          onSuccess={() => {
            setIsParentGateOpen(false);
            setShowDeleteConfirm(true);
          }}
          onClose={() => setIsParentGateOpen(false)}
        />
      )}

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-4 border-rose-500 shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-300">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-xl text-slate-900">Delete Account & All Data?</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                This will permanently delete your account, uploaded media, child profiles, and saved preferences. This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                tabIndex={0}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                tabIndex={0}
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-400 disabled:opacity-50"
              >
                {isDeleting ? <span>Deleting...</span> : <span>Yes, Delete Permanently</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
