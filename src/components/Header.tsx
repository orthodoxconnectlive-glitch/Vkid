import React, { useState } from 'react';
import { ChildProfile, SupportedLanguage, MediaItem, UserAccount } from '../types';
import { getTranslation } from '../data/translations';
import { SUPER_ADMIN_EMAIL } from './AdminModerationModal';
import { Clock, ChevronDown, Menu } from 'lucide-react';
import { soundFx, speakText } from '../utils/soundAndTTS';
import { useAuth } from '../context/AuthContext';
import { SidebarNavigation } from './SidebarNavigation';
import { UniversalSearchBar } from './UniversalSearchBar';

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
  // Search bar data
  mediaItems?: MediaItem[];
  userAccounts?: UserAccount[];
  onSelectMedia?: (item: MediaItem) => void;
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
  onOpenParentPin,
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
  mediaItems = [],
  userAccounts = [],
  onSelectMedia,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  const effectiveEmail = user?.email || currentUserEmail;
  const isSuperAdmin = effectiveEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isAdmin = isSuperAdmin || adminEmails.some((e) => e.toLowerCase() === effectiveEmail.toLowerCase());

  const percentLeft = Math.max(0, Math.min(100, (remainingMinutes / totalDailyMinutes) * 100));

  const handleProfileClick = (profile: ChildProfile) => {
    soundFx.playPop();
    speakText(`Switching to ${profile.name}'s profile`);
    onSelectProfile(profile);
    setProfileDropdownOpen(false);
  };

  return (
    <>
      <header id="vkid-header" className="bg-white/95 backdrop-blur-md border-b-4 border-amber-200 sticky top-0 z-50 px-3 sm:px-6 py-2 shadow-sm w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 w-full">
          {/* Main Header Top Row */}
          <div className="flex items-center justify-between gap-2 w-full">
            {/* 1. VKid Logo & Brand */}
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

            {/* 2. Child Profile Selector & Screen Time */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Active Profile Dropdown Pill */}
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

                {/* Profile Dropdown Menu */}
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
                <span className={`${isMobileFrame ? 'block' : 'sm:hidden'} text-xs font-black ${remainingMinutes < 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {remainingMinutes}m
                </span>
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

            {/* 3. Universal Search Bar (Desktop inline view) */}
            <div className="hidden lg:block flex-1 max-w-md mx-2">
              <UniversalSearchBar
                mediaItems={mediaItems}
                userAccounts={userAccounts}
                currentLanguage={currentLanguage}
                onSelectMedia={(item) => {
                  if (onSelectMedia) onSelectMedia(item);
                }}
              />
            </div>

            {/* 4. Sidebar Toggle Menu Button */}
            <button
              id="sidebar-toggle-btn"
              onClick={() => {
                soundFx.playPop();
                setSidebarOpen(!sidebarOpen);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-xs px-3 py-2 rounded-full shadow-md transition-all active:scale-95 shrink-0"
              title="Toggle Menu & Controls"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
              {pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar (Mobile & Tablet view under top row) */}
          <div className="block lg:hidden w-full pt-1">
            <UniversalSearchBar
              mediaItems={mediaItems}
              userAccounts={userAccounts}
              currentLanguage={currentLanguage}
              onSelectMedia={(item) => {
                if (onSelectMedia) onSelectMedia(item);
              }}
            />
          </div>
        </div>
      </header>

      {/* Sidebar Navigation Panel & Drawer */}
      <SidebarNavigation
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isPinned={isPinned}
        onTogglePin={() => setIsPinned(!isPinned)}
        user={user}
        isAuthenticated={isAuthenticated}
        openAuthModal={openAuthModal}
        logout={logout}
        currentUserEmail={currentUserEmail}
        adminEmails={adminEmails}
        isAdmin={isAdmin}
        pendingCount={pendingCount}
        onOpenUploadModal={() => {
          setSidebarOpen(false);
          if (!isAuthenticated) {
            speakText('Please sign in to upload media.');
            openAuthModal('login');
            return;
          }
          onOpenUploadModal();
        }}
        onOpenParentPin={() => {
          setSidebarOpen(false);
          speakText('Parent Zone requires PIN');
          onOpenParentPin();
        }}
        onOpenAdminModal={() => {
          setSidebarOpen(false);
          onOpenAdminModal();
        }}
        onOpenAiStory={() => {
          setSidebarOpen(false);
          speakText('Open AI Story Quest');
          onOpenAiStory();
        }}
        onOpenInviteModal={
          onOpenInviteModal
            ? () => {
                setSidebarOpen(false);
                onOpenInviteModal();
              }
            : undefined
        }
        onOpenInstallPwa={
          onOpenInstallPwa
            ? () => {
                setSidebarOpen(false);
                onOpenInstallPwa();
              }
            : undefined
        }
        currentLanguage={currentLanguage}
        onSelectLanguage={onSelectLanguage}
        ttsActive={ttsActive}
        onToggleTts={onToggleTts}
      />
    </>
  );
};
