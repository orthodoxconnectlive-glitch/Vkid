import React, { useState } from 'react';
import { ChildProfile, SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES, getTranslation } from '../data/translations';
import { SUPER_ADMIN_EMAIL } from './AdminModerationModal';
import { Lock, Volume2, VolumeX, Smartphone, Monitor, Code2, Clock, Sparkles, ChevronDown, Globe, UploadCloud, ShieldCheck } from 'lucide-react';
import { soundFx, speakText } from '../utils/soundAndTTS';

interface HeaderProps {
  currentProfile: ChildProfile;
  allProfiles: ChildProfile[];
  onSelectProfile: (profile: ChildProfile) => void;
  remainingMinutes: number;
  totalDailyMinutes: number;
  ttsActive: boolean;
  onToggleTts: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
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
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  const isSuperAdmin = currentUserEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isAdmin = isSuperAdmin || adminEmails.some((e) => e.toLowerCase() === currentUserEmail.toLowerCase());

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const percentLeft = Math.max(0, Math.min(100, (remainingMinutes / totalDailyMinutes) * 100));

  const handleProfileClick = (profile: ChildProfile) => {
    soundFx.playPop();
    speakText(`Switching to ${profile.name}'s profile`);
    onSelectProfile(profile);
    setProfileDropdownOpen(false);
  };

  return (
    <header id="vkid-header" className="bg-white/95 backdrop-blur-md border-b-4 border-amber-200 sticky top-0 z-30 px-3 py-2 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-0.5 shadow-md flex items-center justify-center transform hover:scale-105 transition-transform shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-amber-500 text-xl tracking-tight">
              VK
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 bg-clip-text text-transparent tracking-tight">
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Profile Pill with Dropdown */}
          <div className="relative">
            <button
              id="profile-select-btn"
              onClick={() => {
                soundFx.playPop();
                setProfileDropdownOpen(!profileDropdownOpen);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-amber-400 rounded-full py-1 px-2.5 shadow-sm transition-all text-left"
            >
              <div className={`w-8 h-8 rounded-full ${currentProfile.avatarColor} border-2 flex items-center justify-center text-lg font-bold shadow-inner shrink-0`}>
                {currentProfile.avatarUrl}
              </div>
              <div className="hidden xs:block">
                <span className="block font-black text-xs text-slate-800 leading-tight">{currentProfile.name}</span>
                <span className="text-[10px] font-bold text-amber-600">Age {currentProfile.age}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute top-12 left-0 w-48 bg-white border-2 border-amber-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
            )}
          </div>

          {/* Screen Time Remaining Indicator */}
          <div className="bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 flex items-center gap-2 shadow-inner">
            <Clock className={`w-4 h-4 ${remainingMinutes < 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`} />
            <div className="w-14 sm:w-20">
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
              <div className="absolute top-12 right-0 w-52 bg-white border-2 border-indigo-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 max-h-72 overflow-y-auto">
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
            )}
          </div>

          {/* User Video Upload Button */}
          <button
            onClick={() => {
              soundFx.playPop();
              onOpenUploadModal();
            }}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-full shadow transition-all active:scale-95"
            title="Upload New Kid Video or Story"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('upload_video', 'Upload')}</span>
          </button>

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
              <span className="hidden sm:inline">{t('admin_panel', 'Admin')}</span>
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
            <span className="hidden md:inline">{t('ai_quest', 'AI Quest')}</span>
          </button>

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

          {/* Mobile Frame Simulator Toggle */}
          <button
            id="device-frame-toggle-btn"
            onClick={() => {
              soundFx.playPop();
              onToggleMobileFrame();
            }}
            className={`p-1.5 rounded-full border-2 transition-all ${
              isMobileFrame ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
            title="Simulate Mobile Frame"
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Code Export */}
          <button
            id="code-export-btn"
            onClick={() => {
              soundFx.playPop();
              onOpenCodeExport();
            }}
            className="p-1.5 rounded-full border-2 border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
            title="Flutter & Code Export"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Parent Zone PIN Button */}
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
        </div>
      </div>
    </header>
  );
};

