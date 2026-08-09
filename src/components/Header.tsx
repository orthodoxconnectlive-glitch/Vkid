import React, { useState } from 'react';
import { ChildProfile, SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES, getTranslation } from '../data/translations';
import { SUPER_ADMIN_EMAIL } from './AdminModerationModal';
import { Lock, Volume2, VolumeX, Download, Clock, Sparkles, ChevronDown, Globe, UploadCloud, ShieldCheck, LogIn, LogOut, Menu, X, UserPlus } from 'lucide-react';
import { soundFx, speakText } from '../utils/soundAndTTS';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentProfile: ChildProfile;
  allProfiles: ChildProfile[];
  onSelectProfile: (profile: ChildProfile) => void;
  remainingMinutes: number;
  totalDailyMinutes: number;
  ttsActive: boolean;
  onToggleTts: () => void;
  isMobileFrame?: boolean;
  onToggleMobileFrame?: () => void;
  onOpenParentPin: () => void;
  onOpenCodeExport: () => void;
  onOpenAiStory: () => void;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  currentUserEmail: string;
  adminEmails: string[];
  pendingCount: number;
  onOpenUploadModal: () => void;
  onOpenAdminModal: () => void;
  onOpenInstallPwa?: () => void;
  onOpenInviteModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  allProfiles,
  onSelectProfile,
  remainingMinutes,
  totalDailyMinutes,
  ttsActive,
  onToggleTts,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenParentPin,
  onOpenCodeExport,
  onOpenAiStory,
  currentLanguage,
  onSelectLanguage,
  currentUserEmail,
  adminEmails,
  pendingCount,
  onOpenUploadModal,
  onOpenAdminModal,
  onOpenInstallPwa,
  onOpenInviteModal,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  const effectiveEmail = user?.email || currentUserEmail;
  const isSuperAdmin = effectiveEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isAdmin = isSuperAdmin || adminEmails.some((e) => e.toLowerCase() === effectiveEmail.toLowerCase());

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const percentLeft = Math.max(0, Math.min(100, (remainingMinutes / totalDailyMinutes) * 100));

  const handleProfileClick = (profile: ChildProfile) => {
    soundFx.playPop();
    speakText(`Switching to ${profile.name}'s profile`);
    onSelectProfile(profile);
    setProfileDropdownOpen(false);
  };

  const handleUploadClick = () => {
    soundFx.playPop();
    if (!isAuthenticated) {
      speakText("Please sign in to upload media.");
      openAuthModal('login');
      return;
    }
    onOpenUploadModal();
  };

  return (
    <header id="vkid-header" className="bg-white/95 backdrop-blur-md border-b-4 border-amber-200 sticky top-0 z-50 px-3 py-2 shadow-sm w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 w-full max-w-full flex-nowrap overflow-hidden">
        {/* Logo & Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-0.5 shadow-md flex items-center justify-center transform hover:scale-105 transition-transform shrink-0">
            <div className="w-full h-full bg-white rounded-[12px] sm:rounded-[14px] flex items-center justify-center font-black text-amber-500 text-base sm:text-xl tracking-tight">
              VK
            </div>
          </div>
          <div className={isMobileFrame ? 'hidden' : 'hidden sm:block'}>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-base sm:text-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                VKid
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider">
                Kids Safe
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden lg:block">{t('brand_tagline', 'Play, Learn & Grow Together')}</p>
          </div>
        </div>

        {/* Center: Profile Switcher & Screen Time Tracker */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Active Profile Pill with Dropdown */}
          <div className="relative">
            <button
              id="profile-select-btn"
              onClick={() => {
                soundFx.playPop();
                setProfileDropdownOpen(!profileDropdownOpen);
              }}
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-amber-400 rounded-full py-0.5 px-1.5 sm:py-1 sm:px-2.5 shadow-sm transition-all text-left shrink-0 min-h-[34px] sm:min-h-[38px]"
            >
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${currentProfile.avatarColor} border-2 flex items-center justify-center text-sm sm:text-lg font-bold shadow-inner shrink-0`}>
                {currentProfile.avatarUrl}
              </div>
              <div className={isMobileFrame ? 'hidden' : 'hidden md:block'}>
                <span className="block font-black text-xs text-slate-800 leading-tight">{currentProfile.name}</span>
                <span className="text-[10px] font-bold text-amber-600">Age {currentProfile.age}</span>
              </div>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute top-full mt-2 left-0 w-52 bg-white border-2 border-amber-300 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Select Child</p>
                  {allProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleProfileClick(p)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-colors ${
                        p.id === currentProfile.id ? 'bg-amber-100/80 font-bold text-amber-900' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-xl">{p.avatarUrl}</span>
                      <div className="text-left">
                        <p className="text-xs font-bold leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-500">Age {p.age} • {p.ageGroup} yrs</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Screen Time Remaining Indicator */}
          <div className="bg-slate-50 border border-slate-200 rounded-full px-2 sm:px-2.5 py-1 flex items-center gap-1 sm:gap-2 shadow-inner shrink-0">
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${remainingMinutes < 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`} />
            {/* Mobile Compact View */}
            <span className={`${isMobileFrame ? 'block' : 'sm:hidden'} text-xs font-black ${remainingMinutes < 5 ? 'text-rose-600' : 'text-slate-800'}`}>
              {remainingMinutes}m
            </span>
            {/* Desktop Full View */}
            <div className={isMobileFrame ? 'hidden' : 'hidden sm:block w-14 sm:w-20'}>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 mb-0.5">
                <span className="truncate">{t('time_left', 'Time Left')}</span>
                <span className={remainingMinutes < 5 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>
                  {remainingMinutes}m
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    percentLeft > 50 ? 'bg-emerald-500' : percentLeft > 20 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${percentLeft}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Tools, Global Language Switcher, Upload & Admin Panel */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Toolbar Options (Hidden on small mobile screens or inside mobile simulator) */}
          <div className={isMobileFrame ? 'hidden' : 'hidden sm:flex items-center gap-1.5 sm:gap-2'}>
            {/* Global i18n Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  soundFx.playPop();
                  setLangDropdownOpen(!langDropdownOpen);
                }}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs py-1.5 px-2.5 rounded-full transition-all shadow-sm"
                title="Change App Language"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-base leading-none">{currentLangObj.flag}</span>
                <span className="hidden md:inline font-extrabold">{currentLangObj.nativeName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-[90]" onClick={() => setLangDropdownOpen(false)} />
                  <div className="absolute top-full mt-2 right-0 w-52 bg-white border-2 border-indigo-200 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95 max-h-72 overflow-y-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      {t('select_language', 'Select Language')}
                    </p>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          soundFx.playPop();
                          onSelectLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors text-xs font-bold ${
                          lang.code === currentLanguage ? 'bg-indigo-100 text-indigo-900 font-extrabold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </div>
                        {lang.dir === 'rtl' && (
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded uppercase">RTL</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* User Video Upload Button */}
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-full shadow transition-all active:scale-95"
              title="Upload New Kid Video or Story"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{t('upload_video', 'Upload')}</span>
            </button>

            {/* User Auth Control (Login / Logout Avatar Menu) */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    soundFx.playPop();
                    setUserDropdownOpen(!userDropdownOpen);
                  }}
                  className="flex items-center gap-1.5 bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-full py-1 px-2 transition-all shadow-sm"
                  title="Account Settings"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline font-extrabold text-xs text-indigo-900 max-w-[100px] truncate">
                    {user.fullName || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-indigo-400" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setUserDropdownOpen(false)} />
                    <div className="absolute top-full mt-2 right-0 w-56 bg-white border-2 border-indigo-200 rounded-2xl shadow-2xl p-3 z-[100] animate-in fade-in zoom-in-95">
                      <div className="pb-2 mb-2 border-b border-slate-100">
                        <p className="font-extrabold text-xs text-slate-900 truncate">{user.fullName || 'Parent Account'}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          {user.role} account
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          soundFx.playPop();
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  soundFx.playPop();
                  openAuthModal('login');
                }}
                className="flex items-center gap-1 bg-slate-100 hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-slate-800 hover:text-indigo-900 font-extrabold text-xs px-2.5 py-1.5 rounded-full shadow-sm transition-all active:scale-95"
                title="Sign in or Register Parent Account"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Log In</span>
              </button>
            )}

            {/* Admin Moderation Dashboard Button */}
            {isAdmin && (
              <button
                onClick={() => {
                  soundFx.playPop();
                  onOpenAdminModal();
                }}
                className="relative flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-400/40 font-extrabold text-xs px-2.5 py-1.5 rounded-full shadow transition-all active:scale-95"
                title="Admin Moderation Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('admin_panel', 'Admin')}</span>
                {pendingCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce ml-0.5">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* AI Story Assistant Button */}
            <button
              id="ai-story-btn"
              onClick={() => {
                soundFx.playPop();
                speakText("Open AI Story Quest");
                onOpenAiStory();
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-full shadow hover:shadow-md transition-all active:scale-95"
              title="Create Custom AI Story or Quest"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
              <span>{t('ai_quest', 'AI Quest')}</span>
            </button>

            {/* Invite Friends Button */}
            {onOpenInviteModal && (
              <button
                id="invite-friends-btn"
                onClick={() => {
                  soundFx.playPop();
                  onOpenInviteModal();
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-slate-900 font-extrabold text-xs px-2.5 py-1.5 rounded-full shadow hover:shadow-md transition-all active:scale-95"
                title="Invite Friends & Parents to VKid"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-900" />
                <span>Invite</span>
              </button>
            )}

            {/* Install PWA App Button */}
            {onOpenInstallPwa && (
              <button
                id="install-pwa-btn"
                onClick={() => {
                  soundFx.playPop();
                  onOpenInstallPwa();
                }}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-full shadow transition-all active:scale-95"
                title="Install VKid App on Home Screen"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {/* Audio TTS Toggle */}
            <button
              id="tts-toggle-btn"
              onClick={() => {
                soundFx.playPop();
                onToggleTts();
              }}
              className={`p-1.5 rounded-full border-2 transition-all ${
                ttsActive ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-slate-100 border-slate-300 text-slate-400'
              }`}
              title={ttsActive ? 'Audio Helper ON' : 'Audio Helper OFF'}
            >
              {ttsActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Parent Zone PIN Button (Always visible) */}
          <button
            id="parent-zone-btn"
            onClick={() => {
              soundFx.playPop();
              speakText('Parent Zone requires PIN');
              onOpenParentPin();
            }}
            className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-full shadow-md transition-all active:scale-95 border-2 border-rose-300"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t('parents', 'Parents')}</span>
          </button>

          {/* Mobile Hamburger Drawer Menu Toggle Button */}
          <button
            onClick={() => {
              soundFx.playPop();
              setMobileDrawerOpen(true);
            }}
            className="sm:hidden p-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>
        </div>

        {/* Mobile Drawer Overlay & Panel */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-[120] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="fixed inset-0"
              onClick={() => setMobileDrawerOpen(false)}
            />

            <div className="relative z-10 w-72 max-w-[85vw] h-full bg-white shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250">
              <div className="space-y-5">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg bg-gradient-to-r from-amber-500 to-indigo-600 bg-clip-text text-transparent">
                      VKid Menu
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Action List */}
                <div className="space-y-2">
                  {/* AI Story Quest */}
                  <button
                    onClick={() => {
                      soundFx.playPop();
                      setMobileDrawerOpen(false);
                      onOpenAiStory();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>AI Story Quest</span>
                  </button>

                  {/* Upload Video */}
                  <button
                    onClick={() => {
                      soundFx.playPop();
                      setMobileDrawerOpen(false);
                      handleUploadClick();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs"
                  >
                    <UploadCloud className="w-4 h-4 text-amber-600" />
                    <span>Upload Video / Story</span>
                  </button>

                  {/* Audio TTS Toggle */}
                  <button
                    onClick={() => {
                      soundFx.playPop();
                      onToggleTts();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border font-bold text-xs transition-colors ${
                      ttsActive
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {ttsActive ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                      <span>Audio Voice Guide</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white shadow-sm">
                      {ttsActive ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Invite Friends Button in Mobile Drawer */}
                  {onOpenInviteModal && (
                    <button
                      onClick={() => {
                        soundFx.playPop();
                        setMobileDrawerOpen(false);
                        onOpenInviteModal();
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500 text-slate-900 font-extrabold text-xs shadow-md"
                    >
                      <UserPlus className="w-4 h-4 text-slate-900" />
                      <span>Invite Friends & Parents 🎁</span>
                    </button>
                  )}

                  {/* Install App Button */}
                  {onOpenInstallPwa && (
                    <button
                      onClick={() => {
                        soundFx.playPop();
                        setMobileDrawerOpen(false);
                        onOpenInstallPwa();
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Install VKid App</span>
                    </button>
                  )}

                  {/* Admin Panel (if admin) */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        soundFx.playPop();
                        setMobileDrawerOpen(false);
                        onOpenAdminModal();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900 text-amber-400 font-extrabold text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Admin Moderation Panel</span>
                      </div>
                      {pendingCount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          {pendingCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Language Selector in Drawer */}
                  <div className="pt-2">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Language</p>
                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            soundFx.playPop();
                            onSelectLanguage(lang.code);
                          }}
                          className={`flex items-center gap-1.5 p-2 rounded-xl text-[11px] font-bold ${
                            lang.code === currentLanguage
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-slate-800 border border-slate-200'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span className="truncate">{lang.nativeName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Account Section */}
              <div className="pt-4 border-t border-slate-100">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <p className="font-extrabold text-xs text-slate-900 truncate">{user.fullName || 'Parent Account'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        soundFx.playPop();
                        setMobileDrawerOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      soundFx.playPop();
                      setMobileDrawerOpen(false);
                      openAuthModal('login');
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs shadow"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Parent Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

