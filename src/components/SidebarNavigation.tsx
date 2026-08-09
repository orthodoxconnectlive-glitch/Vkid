import React from 'react';
import { SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES, getTranslation } from '../data/translations';
import {
  Lock,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  Globe,
  UploadCloud,
  ShieldCheck,
  LogIn,
  LogOut,
  X,
  UserPlus,
  Pin,
  PinOff,
  User,
  Sliders,
  Sparkles as SparklesIcon
} from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';
import { AppUser } from '../context/AuthContext';

interface SidebarNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  // Auth state
  user: AppUser | null;
  isAuthenticated: boolean;
  openAuthModal: (mode: 'login' | 'register') => void;
  logout: () => void;
  currentUserEmail: string;
  adminEmails: string[];
  isAdmin: boolean;
  pendingCount: number;
  // Handlers
  onOpenUploadModal: () => void;
  onOpenParentPin: () => void;
  onOpenAdminModal: () => void;
  onOpenAiStory: () => void;
  onOpenInviteModal?: () => void;
  onOpenInstallPwa?: () => void;
  // Preferences & Audio
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  ttsActive: boolean;
  onToggleTts: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  isOpen,
  onClose,
  isPinned,
  onTogglePin,
  user,
  isAuthenticated,
  openAuthModal,
  logout,
  isAdmin,
  pendingCount,
  onOpenUploadModal,
  onOpenParentPin,
  onOpenAdminModal,
  onOpenAiStory,
  onOpenInviteModal,
  onOpenInstallPwa,
  currentLanguage,
  onSelectLanguage,
  ttsActive,
  onToggleTts,
}) => {
  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for floating drawer (Mobile or Desktop unpinned) */}
      {!isPinned && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[110] transition-opacity animate-in fade-in duration-200"
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="sidebar-navigation"
        className={`fixed inset-y-0 right-0 z-[120] w-80 max-w-[85vw] bg-white shadow-2xl border-l-2 border-amber-200 flex flex-col justify-between overflow-y-auto transition-all duration-300 animate-in slide-in-from-right ${
          isPinned ? 'lg:static lg:z-30 lg:shadow-none lg:border-l lg:border-slate-200' : ''
        }`}
      >
        <div className="p-4 space-y-5">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-500 p-0.5 flex items-center justify-center text-white font-black text-sm">
                VK
              </div>
              <div>
                <h3 className="font-extrabold text-sm bg-gradient-to-r from-amber-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                  VKid Navigation
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Control Center & Tools</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Desktop Pin Toggle */}
              <button
                onClick={() => {
                  soundFx.playPop();
                  onTogglePin();
                }}
                className={`hidden lg:flex items-center justify-center p-1.5 rounded-lg border transition-all ${
                  isPinned
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                    : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-600'
                }`}
                title={isPinned ? 'Unpin Sidebar' : 'Pin Sidebar to Screen'}
              >
                {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  soundFx.playPop();
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Account Section Header */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-amber-50 border-2 border-indigo-100 rounded-2xl p-3 shadow-xs">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-xs text-slate-900 truncate">
                      {user.fullName || 'Parent Account'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-0.5 bg-indigo-200 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                      {user.role} account
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFx.playPop();
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs shadow-xs transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out Account</span>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2 py-1">
                <div className="flex justify-center">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="font-extrabold text-xs text-slate-800">Parent Account</p>
                  <p className="text-[10px] text-slate-500">Sign in for video uploads & parental tools</p>
                </div>
                <button
                  onClick={() => {
                    soundFx.playPop();
                    openAuthModal('login');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow transition-all active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Parent Log In / Sign Up</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 1: Account & Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider px-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Account & Controls</span>
            </div>

            {/* Upload Video Button */}
            <button
              onClick={() => {
                soundFx.playPop();
                onOpenUploadModal();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-slate-800 font-bold text-xs transition-all text-left shadow-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black text-slate-900 leading-tight">{t('upload_video', 'Upload Video & Story')}</p>
                  <p className="text-[10px] text-amber-700 font-medium">Add new videos, cartoons or audiobooks</p>
                </div>
              </div>
            </button>

            {/* Parent Zone PIN Button */}
            <button
              onClick={() => {
                soundFx.playPop();
                onOpenParentPin();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-slate-800 font-bold text-xs transition-all text-left shadow-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black text-slate-900 leading-tight">{t('parents', 'Parent Zone & Lock')}</p>
                  <p className="text-[10px] text-rose-700 font-medium">Manage time limits & child profiles</p>
                </div>
              </div>
            </button>

            {/* Admin Moderation Panel */}
            {isAdmin && (
              <button
                onClick={() => {
                  soundFx.playPop();
                  onOpenAdminModal();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-amber-400/40 text-amber-400 font-bold text-xs transition-all text-left shadow-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-black text-white leading-tight">{t('admin_panel', 'Admin Moderation')}</p>
                    <p className="text-[10px] text-amber-300/80 font-medium">Review uploads & manage accounts</p>
                  </div>
                </div>
                {pendingCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Section 2: App Tools & Features */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider px-1">
              <SparklesIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>App Tools & Features</span>
            </div>

            {/* AI Story Quest */}
            <button
              onClick={() => {
                soundFx.playPop();
                onOpenAiStory();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs transition-all text-left shadow-sm group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>
                <div>
                  <p className="font-black leading-tight">{t('ai_quest', 'AI Story Quest Generator')}</p>
                  <p className="text-[10px] text-purple-100 font-medium">Create custom fairytales for children</p>
                </div>
              </div>
            </button>

            {/* Invite Friends & Parents */}
            {onOpenInviteModal && (
              <button
                onClick={() => {
                  soundFx.playPop();
                  onOpenInviteModal();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500 hover:opacity-95 text-slate-900 font-bold text-xs transition-all text-left shadow-sm group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <UserPlus className="w-4 h-4 text-slate-900" />
                  </div>
                  <div>
                    <p className="font-black leading-tight">Invite Friends & Parents 🎁</p>
                    <p className="text-[10px] text-slate-800 font-medium">Share https://videokid.live/</p>
                  </div>
                </div>
              </button>
            )}

            {/* Install PWA App */}
            {onOpenInstallPwa && (
              <button
                onClick={() => {
                  soundFx.playPop();
                  onOpenInstallPwa();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-slate-800 font-bold text-xs transition-all text-left shadow-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 leading-tight">Install VKid App</p>
                    <p className="text-[10px] text-emerald-700 font-medium">Add directly to home screen</p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Section 3: Preferences & Audio */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider px-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Preferences & Audio</span>
            </div>

            {/* Audio Voice Helper Toggle */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${ttsActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {ttsActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-black text-xs text-slate-900 leading-tight">Audio Voice Guide</p>
                  <p className="text-[10px] text-slate-500">Read aloud text for kids</p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playPop();
                  onToggleTts();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                  ttsActive
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {ttsActive ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Language Selection Grid */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Language</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      soundFx.playPop();
                      onSelectLanguage(lang.code);
                    }}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all ${
                      lang.code === currentLanguage
                        ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="truncate text-[11px]">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
          VKid Platform • Safe for Children 🎈
        </div>
      </aside>
    </>
  );
};
