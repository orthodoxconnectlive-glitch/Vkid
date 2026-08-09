import React from 'react';
import { UserAccount, MediaItem, SupportedLanguage } from '../types';
import { getTranslation } from '../data/translations';
import { X, Mail, Shield, Film, CheckCircle2, AlertOctagon, User, Play, Headphones, Music } from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';

interface UserProfileModalProps {
  user: UserAccount;
  userMediaItems: MediaItem[];
  currentLanguage: SupportedLanguage;
  onPlayMedia?: (item: MediaItem) => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  userMediaItems,
  currentLanguage,
  onPlayMedia,
  onClose,
}) => {
  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-amber-300 shadow-2xl relative my-auto p-5 sm:p-6 text-slate-800 space-y-4">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Profile Card Header */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-inner shrink-0">
            {user.avatarUrl || '👤'}
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
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
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
                      onClick={() => {
                        soundFx.playPop();
                        onPlayMedia(item);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded-lg shadow shrink-0"
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

        <button
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs py-2.5 rounded-xl shadow"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
};
