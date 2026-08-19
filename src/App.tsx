import React, { useState, useEffect } from 'react';
import { ChildProfile, ScreenTimeConfig, MediaItem, ActivityGame, Badge, Sticker, SupportedLanguage, UserAccount } from './types';
import { isRtl } from './data/translations';
import {
  INITIAL_CHILD_PROFILES,
  MEDIA_LIBRARY,
  MINI_GAMES,
  BADGES_CATALOG,
  STICKERS_CATALOG,
  DEFAULT_SCREEN_TIME_CONFIG,
  MOCK_USAGE_REPORTS,
  MOCK_USERS,
} from './data/mockData';
import { Header } from './components/Header';
import { KidHomeFeed } from './components/KidHomeFeed';
import { DeviceFrame } from './components/DeviceFrame';
import { ScreenTimeLockOverlay } from './components/ScreenTimeLockOverlay';
import { PinLockModal } from './components/ParentalControls/PinLockModal';
import { ParentDashboard } from './components/ParentalControls/ParentDashboard';
import { FlutterArchitectureDrawer } from './components/FlutterExport/FlutterArchitectureDrawer';
import { AiStoryModal } from './components/AiStoryModal';
import { VideoUploadModal } from './components/VideoUploadModal';
import { AdminModerationModal, SUPER_ADMIN_EMAIL, SUPER_ADMIN_WHITELIST, checkIsAdmin } from './components/AdminModerationModal';
import { UniversalSearchBar } from './components/UniversalSearchBar';
import { AuthModal } from './components/AuthModal';
import { EducatorControlPanel } from './components/EducatorControlPanel';
import { InstallPwaModal } from './components/InstallPwaModal';
import { InviteFriendsModal } from './components/InviteFriendsModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setTtsEnabled, soundFx, speakText } from './utils/soundAndTTS';
import { useTvNavigation } from './hooks/useTvNavigation';
import {
  getInitialMediaItems,
  fetchLatestMediaItems,
  saveMediaItemToStorage,
  approveMediaItemInStorage,
  rejectMediaItemInStorage,
} from './lib/mediaService';
import {
  fetchUserFavoriteIds,
  toggleSupabaseFavorite,
} from './lib/favoritesService';

function AppInner() {
  const [profiles, setProfiles] = useState<ChildProfile[]>(INITIAL_CHILD_PROFILES);
  const [currentProfileId, setCurrentProfileId] = useState<string>('child_1');
  const [screenTimeConfig, setScreenTimeConfig] = useState<ScreenTimeConfig>(DEFAULT_SCREEN_TIME_CONFIG);
  const [parentPin, setParentPin] = useState<string>('1234');

  const { user, isPresentationMode, activeClass } = useAuth();

  // Video Media State & Admin Moderation Queue
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(getInitialMediaItems);

  // Sync latest media items from API/Supabase on mount
  useEffect(() => {
    fetchLatestMediaItems().then((latest) => {
      if (latest && latest.length > 0) {
        setMediaItems(latest);
      }
    });
  }, []);

  // User Accounts Directory State
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(MOCK_USERS);

  // i18n Language State (English, Arabic, Spanish, Chinese, Korean, Russian, etc.)
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  // User Accounts & Admin Privileges State
  const currentUserEmail = user?.email || '';
  const [adminEmails, setAdminEmails] = useState<string[]>([
    ...SUPER_ADMIN_WHITELIST,
    'moderator@vkid.app',
  ]);

  const isAdmin = checkIsAdmin(
    currentUserEmail,
    user?.role,
    user?.app_metadata?.role || user?.user_metadata?.role,
    adminEmails
  );

  // Screen Time Session Countdown
  const [remainingMinutes, setRemainingMinutes] = useState<number>(screenTimeConfig.sessionDurationMinutes);
  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(false);

  // Tools & Modals
  const [ttsActive, setTtsActive] = useState<boolean>(true);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isParentPinOpen, setIsParentPinOpen] = useState<boolean>(false);
  const [isParentDashboardOpen, setIsParentDashboardOpen] = useState<boolean>(false);
  const [isCodeExportOpen, setIsCodeExportOpen] = useState<boolean>(false);
  const [isAiStoryOpen, setIsAiStoryOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isEducatorModalOpen, setIsEducatorModalOpen] = useState<boolean>(false);

  // PWA Install & Invite State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const currentProfile = profiles.find((p) => p.id === currentProfileId) || profiles[0];

  const pendingVideosCount = mediaItems.filter((i) => i.status === 'pending_approval').length;

  // Global Smart TV Remote Back Key modal dismiss handler
  useTvNavigation({
    onBack: () => {
      if (isEducatorModalOpen) setIsEducatorModalOpen(false);
      else if (isAdminModalOpen) setIsAdminModalOpen(false);
      else if (isParentDashboardOpen) setIsParentDashboardOpen(false);
      else if (isParentPinOpen) setIsParentPinOpen(false);
      else if (isAiStoryOpen) setIsAiStoryOpen(false);
      else if (isUploadModalOpen) setIsUploadModalOpen(false);
      else if (isCodeExportOpen) setIsCodeExportOpen(false);
      else if (isInstallModalOpen) setIsInstallModalOpen(false);
      else if (isInviteModalOpen) setIsInviteModalOpen(false);
    },
  });

  // Sync remaining minutes whenever config session duration changes
  useEffect(() => {
    setRemainingMinutes(screenTimeConfig.sessionDurationMinutes);
    setIsScreenLocked(false);
  }, [screenTimeConfig.sessionDurationMinutes]);

  // Screen time countdown timer loop (decrements 1 min every 60s)
  useEffect(() => {
    if (!screenTimeConfig.isTimerEnabled || isScreenLocked) return;

    const interval = setInterval(() => {
      setRemainingMinutes((prev) => {
        if (prev <= 1) {
          setIsScreenLocked(true);
          soundFx.playTryAgain();
          speakText("Break time! Today's screen time is complete.");
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // 1 minute interval

    return () => clearInterval(interval);
  }, [screenTimeConfig.isTimerEnabled, isScreenLocked]);

  // Sync Root Document RTL / Language attributes on language change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRtl(currentLanguage) ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  const handleToggleTts = () => {
    const next = !ttsActive;
    setTtsActive(next);
    setTtsEnabled(next);
    if (next) speakText('Audio voice helper turned on');
  };

  const handleAddScorePoints = (scorePoints: number) => {
    // Award badge if score threshold met
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === currentProfile.id) {
          const updatedBadges = [...p.earnedBadges];
          if (scorePoints >= 20 && !updatedBadges.includes('badge_math_1')) {
            updatedBadges.push('badge_math_1');
          }
          if (scorePoints >= 30 && !updatedBadges.includes('badge_memory_1')) {
            updatedBadges.push('badge_memory_1');
          }
          return {
            ...p,
            timeSpentTodayMinutes: p.timeSpentTodayMinutes + 5,
            earnedBadges: updatedBadges,
          };
        }
        return p;
      })
    );
  };

  // Sync user's favorites from Supabase `favorites` table when authenticated
  useEffect(() => {
    if (user?.id) {
      fetchUserFavoriteIds(user.id).then((favIds) => {
        if (favIds && favIds.length > 0) {
          setProfiles((prev) =>
            prev.map((p) => {
              if (p.id === currentProfileId) {
                const merged = Array.from(new Set([...p.favoriteMediaIds, ...favIds]));
                return { ...p, favoriteMediaIds: merged };
              }
              return p;
            })
          );
        }
      });
    }
  }, [user?.id, currentProfileId]);

  const handleToggleFavorite = async (mediaId: string) => {
    const currentFavs = currentProfile.favoriteMediaIds || [];
    const isFav = currentFavs.includes(mediaId);
    const nextFavs = isFav ? currentFavs.filter((id) => id !== mediaId) : [...currentFavs, mediaId];

    // Optimistically update current child profile state
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === currentProfile.id) {
          return {
            ...p,
            favoriteMediaIds: nextFavs,
          };
        }
        return p;
      })
    );

    // If authenticated, persist to Supabase `favorites` table
    if (user?.id) {
      try {
        await toggleSupabaseFavorite(user.id, mediaId, currentFavs);
      } catch (err) {
        console.warn('Error toggling Supabase favorite:', err);
      }
    }
  };

  const handleRecordMediaWatch = (durationMinutes: number) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === currentProfile.id) {
          return {
            ...p,
            timeSpentTodayMinutes: p.timeSpentTodayMinutes + durationMinutes,
          };
        }
        return p;
      })
    );
  };

  const handlePinSuccess = () => {
    setIsParentPinOpen(false);
    setIsScreenLocked(false);
    setRemainingMinutes(screenTimeConfig.sessionDurationMinutes); // Reset timer on parent unlock
    setIsParentDashboardOpen(true);
  };

  // Video Upload Submission (Assigned published status & persisted)
  const handleUploadSubmit = async (newVideo: MediaItem) => {
    const published = await saveMediaItemToStorage(newVideo);
    setMediaItems((prev) => [published, ...prev.filter((i) => i.id !== published.id)]);
    const latest = await fetchLatestMediaItems();
    if (latest && latest.length > 0) {
      setMediaItems(latest);
    }
  };

  // Video Admin Approval
  const handleApproveVideo = async (videoId: string) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === videoId ? { ...item, status: 'approved' } : item))
    );
    await approveMediaItemInStorage(videoId);
    const latest = await fetchLatestMediaItems();
    if (latest && latest.length > 0) {
      setMediaItems(latest);
    }
  };

  // Video Admin Rejection / Deletion
  const handleRejectVideo = async (videoId: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== videoId));
    await rejectMediaItemInStorage(videoId);
  };

  // Toggle user account status (Active <-> Suspended)
  const handleToggleUserStatus = (userId: string) => {
    setUserAccounts((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          if (u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return u;
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Toggle user Admin Role (Super Admin only)
  const handleToggleUserAdminRole = (userId: string) => {
    setUserAccounts((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          if (u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return u;
          const nextRole = u.role === 'admin' ? 'parent' : 'admin';
          if (nextRole === 'admin') {
            handleAddAdmin(u.email);
          } else {
            handleRemoveAdmin(u.email);
          }
          return { ...u, role: nextRole };
        }
        return u;
      })
    );
  };

  // Admin Management (Super Admin)
  const handleAddAdmin = (email: string) => {
    if (!adminEmails.some((e) => e.toLowerCase() === email.toLowerCase())) {
      setAdminEmails((prev) => [...prev, email.toLowerCase()]);
    }
  };

  const handleRemoveAdmin = (email: string) => {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return;
    setAdminEmails((prev) => prev.filter((e) => e.toLowerCase() !== email.toLowerCase()));
  };

  return (
    <DeviceFrame isMobileFrame={isMobileFrame} onExitMobileFrame={() => setIsMobileFrame(false)}>
      <div
        dir={isRtl(currentLanguage) ? 'rtl' : 'ltr'}
        className="min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-purple-50/40 text-slate-900 pb-12 pt-safe pb-safe font-sans selection:bg-amber-200 transition-all duration-300"
      >
        {/* Presentation Mode Status Banner if Active */}
        {isPresentationMode && (
          <div className="bg-indigo-900 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md border-b-2 border-indigo-700 animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>
                🏫 Classroom Presentation Mode — <strong>{user?.schoolName || 'St. Mark Orthodox Academy'}</strong> ({activeClass?.name || 'Class 1A'})
              </span>
            </div>
            <button
              onClick={() => setIsEducatorModalOpen(true)}
              className="bg-indigo-700 hover:bg-indigo-600 px-2.5 py-1 rounded-lg text-[11px] font-black text-amber-300 transition-colors"
            >
              Control Panel
            </button>
          </div>
        )}

        {/* Top App Bar with integrated Search Bar and Sidebar Navigation */}
        <Header
          currentProfile={currentProfile}
          allProfiles={profiles}
          onSelectProfile={(p) => setCurrentProfileId(p.id)}
          remainingMinutes={remainingMinutes}
          totalDailyMinutes={screenTimeConfig.sessionDurationMinutes}
          ttsActive={ttsActive}
          onToggleTts={handleToggleTts}
          onOpenParentPin={() => setIsParentPinOpen(true)}
          onOpenCodeExport={() => setIsCodeExportOpen(true)}
          onOpenAiStory={() => setIsAiStoryOpen(true)}
          currentLanguage={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          currentUserEmail={currentUserEmail}
          adminEmails={adminEmails}
          pendingCount={pendingVideosCount}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
          onOpenEducatorModal={() => setIsEducatorModalOpen(true)}
          onOpenInstallPwa={() => setIsInstallModalOpen(true)}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
          mediaItems={mediaItems}
          userAccounts={userAccounts}
          onSelectMedia={(selectedItem) => {
            speakText(`Playing ${selectedItem.title}`);
          }}
        />

        {/* Main Content View Container */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
          <KidHomeFeed
            currentProfile={currentProfile}
            mediaList={mediaItems}
            gamesList={MINI_GAMES}
            allBadges={BADGES_CATALOG}
            allStickers={STICKERS_CATALOG}
            onAddScorePoints={handleAddScorePoints}
            onToggleFavorite={handleToggleFavorite}
            onRecordMediaWatch={handleRecordMediaWatch}
            currentLanguage={currentLanguage}
            isAdmin={isAdmin}
            currentUserEmail={currentUserEmail}
            userRole={user?.role}
            isAuthenticated={!!user}
            onDeleteVideo={handleRejectVideo}
            onApproveVideo={handleApproveVideo}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenParentPin={() => setIsParentPinOpen(true)}
          />
        </main>

        {/* Overlays & Modals */}

        {/* 1. Screen Time Break Lock Overlay */}
        {isScreenLocked && (
          <ScreenTimeLockOverlay onUnlockClick={() => setIsParentPinOpen(true)} />
        )}

        {/* 2. Parent PIN Entry Lock Modal */}
        {isParentPinOpen && (
          <PinLockModal
            currentPin={parentPin}
            onSuccess={handlePinSuccess}
            onClose={() => setIsParentPinOpen(false)}
          />
        )}

        {/* 3. Parent Control Dashboard */}
        {isParentDashboardOpen && (
          <ParentDashboard
            screenTimeConfig={screenTimeConfig}
            onUpdateScreenTimeConfig={setScreenTimeConfig}
            profiles={profiles}
            onUpdateProfiles={setProfiles}
            usageData={MOCK_USAGE_REPORTS}
            onClose={() => setIsParentDashboardOpen(false)}
          />
        )}

        {/* 4. Flutter & Firebase Code Architecture Export Drawer */}
        {isCodeExportOpen && (
          <FlutterArchitectureDrawer onClose={() => setIsCodeExportOpen(false)} />
        )}

        {/* 5. AI Story Quest Generator Modal */}
        {isAiStoryOpen && (
          <AiStoryModal childProfile={currentProfile} onClose={() => setIsAiStoryOpen(false)} />
        )}

        {/* 6. User Video Upload Modal */}
        {isUploadModalOpen && (
          <VideoUploadModal
            currentLanguage={currentLanguage}
            currentUserEmail={currentUserEmail}
            onUploadSubmit={handleUploadSubmit}
            onClose={() => setIsUploadModalOpen(false)}
          />
        )}

        {/* 7. Admin Moderation & Privileges Dashboard Modal */}
        {isAdminModalOpen && (
          <AdminModerationModal
            currentLanguage={currentLanguage}
            currentUserEmail={currentUserEmail}
            adminEmails={adminEmails}
            mediaItems={mediaItems}
            userAccounts={userAccounts}
            onApproveVideo={handleApproveVideo}
            onRejectVideo={handleRejectVideo}
            onAddAdmin={handleAddAdmin}
            onRemoveAdmin={handleRemoveAdmin}
            onToggleUserStatus={handleToggleUserStatus}
            onToggleUserAdminRole={handleToggleUserAdminRole}
            onClose={() => setIsAdminModalOpen(false)}
          />
        )}

        {/* 7b. School & Educator Control Panel Modal */}
        <EducatorControlPanel
          isOpen={isEducatorModalOpen}
          onClose={() => setIsEducatorModalOpen(false)}
          currentLanguage={currentLanguage}
        />

        {/* 8. Supabase Auth Modal (Login & Register) */}
        <AuthModal currentLanguage={currentLanguage} />

        {/* 9. PWA Mobile Installation Modal */}
        <InstallPwaModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          canInstallDirect={!!deferredPrompt}
          currentLanguage={currentLanguage}
          onInstallDirect={() => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              deferredPrompt.userChoice.then(() => {
                setDeferredPrompt(null);
              });
            }
          }}
        />

        {/* 10. Invite Friends & Parents Modal */}
        <InviteFriendsModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          currentLanguage={currentLanguage}
        />
      </div>
    </DeviceFrame>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
