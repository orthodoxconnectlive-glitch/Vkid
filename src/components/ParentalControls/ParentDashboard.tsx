import React, { useState, useEffect } from 'react';
import { ChildProfile, ScreenTimeConfig, UsageReportData } from '../../types';
import {
  Clock,
  ShieldCheck,
  BarChart3,
  Users,
  Sparkles,
  X,
  Plus,
  Save,
  CheckCircle2,
  Moon,
  SlidersHorizontal,
  History,
  Film,
  ExternalLink,
  Trash2,
  Camera,
  AlertTriangle,
  UserX,
  Lock,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { soundFx } from '../../utils/soundAndTTS';
import { isImageUrl } from '../../utils/avatarUtils';
import { AvatarUploadModal } from '../AvatarUploadModal';
import { useAuth } from '../../context/AuthContext';
import { ParentGateModal } from './ParentGateModal';
import { deleteUserAccountPermanently } from '../../lib/accountService';
import { useTvNavigation } from '../../hooks/useTvNavigation';

interface WatchHistoryItem {
  id: string;
  mediaId: string;
  title: string;
  category: string;
  type: string;
  watchedAt: string;
  duration: string;
  thumbnailUrl: string;
  mediaUrl: string;
}

interface ParentDashboardProps {
  screenTimeConfig: ScreenTimeConfig;
  onUpdateScreenTimeConfig: (newConfig: ScreenTimeConfig) => void;
  profiles: ChildProfile[];
  onUpdateProfiles: (profiles: ChildProfile[]) => void;
  usageData: UsageReportData[];
  onClose: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  screenTimeConfig,
  onUpdateScreenTimeConfig,
  profiles,
  onUpdateProfiles,
  usageData,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'screentime' | 'filters' | 'reports' | 'history' | 'profiles' | 'ai' | 'account'>('screentime');
  const [config, setConfig] = useState<ScreenTimeConfig>({ ...screenTimeConfig });
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([...profiles]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [isNewChildAvatarModalOpen, setIsNewChildAvatarModalOpen] = useState(false);

  // Parental Gate & External Link State
  const [gateAction, setGateAction] = useState<{ type: 'external_link' | 'delete_account'; url?: string } | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // TV / Hardware Back Navigation
  useTvNavigation({
    onBack: () => {
      if (gateAction) {
        setGateAction(null);
      } else if (showDeleteConfirmModal) {
        setShowDeleteConfirmModal(false);
      } else if (editingChild) {
        setEditingChild(null);
      } else if (isNewChildAvatarModalOpen) {
        setIsNewChildAvatarModalOpen(false);
      } else {
        soundFx.playPop();
        onClose();
      }
    },
    enabled: true,
  });

  // Load Watch History from LocalStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('vkid_watch_history');
      if (raw) {
        setWatchHistory(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Could not parse watch history:', e);
    }
  }, []);

  const handleClearHistory = () => {
    soundFx.playPop();
    localStorage.removeItem('vkid_watch_history');
    setWatchHistory([]);
  };

  // AI Parent Insights state
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // New Child Profile Form
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState(5);
  const [newChildAvatar, setNewChildAvatar] = useState('🦊');

  const handleSaveConfig = () => {
    soundFx.playSuccess();
    onUpdateScreenTimeConfig(config);
    onUpdateProfiles(childProfiles);
    setSaveSuccessMsg('Parental Settings saved successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleFetchAiInsights = async () => {
    soundFx.playPop();
    setLoadingAi(true);
    try {
      const activeChild = childProfiles[0];
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: activeChild?.name || 'Child',
          age: activeChild?.age || 5,
          gameStats: { mathScore: 85, spellingScore: 90, memoryScore: 75 },
          timeSpentMinutes: activeChild?.timeSpentTodayMinutes || 25,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAiInsight(data.insight);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAddChildProfile = () => {
    if (!newChildName.trim()) return;
    soundFx.playPop();

    const ageGroup = newChildAge <= 5 ? '4-5' : newChildAge <= 7 ? '6-7' : '8-10';
    const newProfile: ChildProfile = {
      id: `child_${Date.now()}`,
      name: newChildName,
      age: newChildAge,
      ageGroup,
      avatarUrl: newChildAvatar,
      avatarColor: 'bg-emerald-100 text-emerald-600 border-emerald-300',
      dailyGoalMinutes: 30,
      timeSpentTodayMinutes: 0,
      earnedBadges: [],
      unlockedStickers: ['st_star', 'st_rainbow'],
      favoriteMediaIds: [],
    };

    const updated = [...childProfiles, newProfile];
    setChildProfiles(updated);
    onUpdateProfiles(updated);
    setNewChildName('');
  };

  // Execute Account Deletion
  const handleExecuteDeleteAccount = async () => {
    if (!user) {
      // If anonymous/local, clear local storage & reload
      localStorage.clear();
      window.location.reload();
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError('');
    try {
      const result = await deleteUserAccountPermanently(user.id, user.email);
      if (result.success) {
        await logout();
        onClose();
        window.location.href = '/';
      } else {
        setDeleteError(result.error || 'Failed to delete account. Please try again.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Error occurred during account deletion.');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirmModal(false);
    }
  };

  const pieData = [
    { name: 'Media Watching', value: 45, color: '#F43F5E' },
    { name: 'Math Games', value: 30, color: '#F59E0B' },
    { name: 'Spelling Safari', value: 15, color: '#10B981' },
    { name: 'Memory Match', value: 10, color: '#8B5CF6' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full border-4 border-rose-300 shadow-2xl relative my-auto max-h-[95vh] flex flex-col">
          {/* Top Header */}
          <div className="p-4 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 text-white flex items-center justify-between rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-yellow-300" />
              <div>
                <h2 className="font-black text-xl leading-tight">Parent Control Dashboard</h2>
                <p className="text-[11px] text-rose-100 font-medium">Configure screen time, content filters & usage reports</p>
              </div>
            </div>
            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dashboard Tabs */}
          <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0">
            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setActiveTab('screentime');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                activeTab === 'screentime' ? 'bg-white text-rose-600 shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Screen Time</span>
            </button>

            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setActiveTab('filters');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                activeTab === 'filters' ? 'bg-white text-rose-600 shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Content Filters</span>
            </button>

            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setActiveTab('reports');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                activeTab === 'reports' ? 'bg-white text-rose-600 shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Usage Reports</span>
            </button>

            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setActiveTab('history');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                activeTab === 'history' ? 'bg-white text-rose-600 shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Watch History ({watchHistory.length})</span>
            </button>

            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setActiveTab('profiles');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                activeTab === 'profiles' ? 'bg-white text-rose-600 shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Child Profiles</span>
            </button>

            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setActiveTab('ai');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                activeTab === 'ai' ? 'bg-white text-purple-600 shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI Parent Insights</span>
            </button>

            {/* Account & Data Management Tab */}
            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setActiveTab('account');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                activeTab === 'account' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserX className="w-4 h-4 text-rose-500" />
              <span>Account & Privacy</span>
            </button>
          </div>

          {/* Success Alert */}
          {saveSuccessMsg && (
            <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Tab Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
            {activeTab === 'screentime' && (
              <div className="space-y-6">
                {/* Daily Limit Slider */}
                <div className="bg-rose-50/60 rounded-2xl p-5 border-2 border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">Daily Screen Time Limit</h3>
                      <p className="text-xs text-slate-500">Automatically lock the app once limit is reached</p>
                    </div>
                    <span className="text-2xl font-black text-rose-600 bg-white px-4 py-1 rounded-2xl border border-rose-300">
                      {config.dailyLimitMinutes} min
                    </span>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={config.dailyLimitMinutes}
                    onChange={(e) => setConfig({ ...config, dailyLimitMinutes: Number(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer h-2 bg-rose-200 rounded-lg"
                  />

                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>10 mins</span>
                    <span>30 mins</span>
                    <span>60 mins</span>
                    <span>120 mins</span>
                  </div>
                </div>

                {/* Bedtime Curfew Schedule */}
                <div className="bg-indigo-50/60 rounded-2xl p-5 border-2 border-indigo-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-base">
                    <Moon className="w-5 h-5 text-indigo-600" />
                    <h3>Bedtime Curfew Lock</h3>
                  </div>
                  <p className="text-xs text-slate-500">Block usage during late evening and night hours</p>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bedtime Starts:</label>
                      <input
                        type="time"
                        value={config.bedtimeStart}
                        onChange={(e) => setConfig({ ...config, bedtimeStart: e.target.value })}
                        className="w-full bg-white border border-indigo-300 rounded-xl py-2 px-3 text-sm font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Morning Unlock:</label>
                      <input
                        type="time"
                        value={config.bedtimeEnd}
                        onChange={(e) => setConfig({ ...config, bedtimeEnd: e.target.value })}
                        className="w-full bg-white border border-indigo-300 rounded-xl py-2 px-3 text-sm font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'filters' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 mb-2">Category Access Toggles</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                    <span className="font-bold text-sm text-slate-800">Media Library Videos</span>
                    <input
                      type="checkbox"
                      checked={config.contentFilters.videosEnabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contentFilters: { ...config.contentFilters, videosEnabled: e.target.checked },
                        })
                      }
                      className="w-5 h-5 accent-rose-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                    <span className="font-bold text-sm text-slate-800">Audiobooks & Stories</span>
                    <input
                      type="checkbox"
                      checked={config.contentFilters.audiobooksEnabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contentFilters: { ...config.contentFilters, audiobooksEnabled: e.target.checked },
                        })
                      }
                      className="w-5 h-5 accent-rose-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                    <span className="font-bold text-sm text-slate-800">Educational Mini-Games</span>
                    <input
                      type="checkbox"
                      checked={config.contentFilters.gamesEnabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contentFilters: { ...config.contentFilters, gamesEnabled: e.target.checked },
                        })
                      }
                      className="w-5 h-5 accent-rose-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                    <span className="font-bold text-sm text-slate-800">AI Story Generator</span>
                    <input
                      type="checkbox"
                      checked={config.contentFilters.aiStoryEnabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contentFilters: { ...config.contentFilters, aiStoryEnabled: e.target.checked },
                        })
                      }
                      className="w-5 h-5 accent-rose-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Media vs Educational Games Chart */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <h4 className="font-extrabold text-sm text-slate-800 mb-3">Daily Minutes Spent This Week</h4>
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={usageData}>
                          <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Bar dataKey="mediaMinutes" name="Media Watch" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="gamesMinutes" name="Learning Games" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Subject Time Breakdown */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <h4 className="font-extrabold text-sm text-slate-800 mb-3">Activity Breakdown</h4>
                    <div className="h-60 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-rose-50 p-4 rounded-2xl border border-rose-200">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Recently Watched Videos & Media</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Monitor what educational videos your children have watched on VKid
                    </p>
                  </div>
                  {watchHistory.length > 0 && (
                    <button
                      type="button"
                      tabIndex={0}
                      onClick={handleClearHistory}
                      className="flex items-center gap-1 bg-white hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-rose-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Clear History</span>
                    </button>
                  )}
                </div>

                {watchHistory.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <Film className="w-10 h-10 text-slate-400 mx-auto animate-pulse" />
                    <p className="text-xs font-bold text-slate-700">No watch history recorded yet</p>
                    <p className="text-[11px] text-slate-400">
                      When kids watch educational videos or listen to stories, they will automatically appear here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {watchHistory.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 hover:border-amber-300 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-16 h-10 object-cover rounded-xl shrink-0 bg-slate-900"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-16 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                              <Film className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.title}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">{item.category}</span>
                              <span>•</span>
                              <span>{item.duration}</span>
                              <span>•</span>
                              <span>{new Date(item.watchedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Outbound Link wrapped in Parental Gate */}
                        <button
                          type="button"
                          tabIndex={0}
                          onClick={() => {
                            soundFx.playPop();
                            setGateAction({ type: 'external_link', url: item.mediaUrl });
                          }}
                          className="p-2 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-xl transition-all shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                          title="Open Direct Link (Adult Verification Required)"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profiles' && (
              <div className="space-y-6">
                {/* Existing Profiles List */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-800">Family Child Profiles</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {childProfiles.map((p) => (
                      <div key={p.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative group shrink-0">
                            <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-inner overflow-hidden">
                              {isImageUrl(p.avatarUrl) ? (
                                <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{p.avatarUrl || '👤'}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              tabIndex={0}
                              onClick={() => {
                                soundFx.playPop();
                                setEditingChild(p);
                              }}
                              className="absolute -bottom-1 -right-1 p-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow border border-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                              title="Change Photo / Avatar"
                            >
                              <Camera className="w-3 h-3" />
                            </button>
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{p.name}</p>
                            <p className="text-xs text-slate-500 font-medium">Age {p.age} • Daily Goal: {p.dailyGoalMinutes}m</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          tabIndex={0}
                          onClick={() => {
                            soundFx.playPop();
                            setEditingChild(p);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-xl border border-slate-200 font-bold text-xs shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          Change Photo
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Profile Form */}
                <div className="bg-rose-50/50 rounded-2xl p-4 border-2 border-rose-200 space-y-3">
                  <h4 className="font-black text-sm text-slate-900">Add New Child Profile</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Child Name"
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      className="bg-white border border-rose-300 rounded-xl py-2 px-3 text-xs font-bold"
                    />
                    <input
                      type="number"
                      placeholder="Age (4-10)"
                      min="3"
                      max="12"
                      value={newChildAge}
                      onChange={(e) => setNewChildAge(Number(e.target.value))}
                      className="bg-white border border-rose-300 rounded-xl py-2 px-3 text-xs font-bold"
                    />
                    <button
                      type="button"
                      tabIndex={0}
                      onClick={() => {
                        soundFx.playPop();
                        setIsNewChildAvatarModalOpen(true);
                      }}
                      className="flex items-center justify-between bg-white border-2 border-rose-300 hover:border-rose-400 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-800 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-sm overflow-hidden shrink-0">
                          {isImageUrl(newChildAvatar) ? (
                            <img src={newChildAvatar} alt="New Child Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span>{newChildAvatar || '🦁'}</span>
                          )}
                        </div>
                        <span>Select Avatar / Photo</span>
                      </div>
                      <Camera className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </div>
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={handleAddChildProfile}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Child Profile</span>
                  </button>
                </div>

                {/* Avatar Upload Modals */}
                {editingChild && (
                  <AvatarUploadModal
                    currentAvatar={editingChild.avatarUrl}
                    title={`Update ${editingChild.name}'s Photo`}
                    onSelectAvatar={(newAvatarUrl) => {
                      const updated = childProfiles.map((item) =>
                        item.id === editingChild.id ? { ...item, avatarUrl: newAvatarUrl } : item
                      );
                      setChildProfiles(updated);
                      onUpdateProfiles(updated);
                    }}
                    onClose={() => setEditingChild(null)}
                  />
                )}

                {isNewChildAvatarModalOpen && (
                  <AvatarUploadModal
                    currentAvatar={newChildAvatar}
                    title="Choose Photo or Avatar for New Child"
                    onSelectAvatar={(newAvatarUrl) => {
                      setNewChildAvatar(newAvatarUrl);
                    }}
                    onClose={() => setIsNewChildAvatarModalOpen(false)}
                  />
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-200 space-y-3">
                  <div className="flex items-center gap-2 text-purple-900 font-black text-base">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3>AI Pedagogical Advisor</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Generates personalized developmental recommendations based on your child's recent activity in Math, Spelling, and Memory games.
                  </p>

                  <button
                    type="button"
                    tabIndex={0}
                    onClick={handleFetchAiInsights}
                    disabled={loadingAi}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                  >
                    {loadingAi ? 'Analyzing Child Progress...' : 'Generate Developmental Insights'}
                  </button>

                  {aiInsight && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-purple-200 text-xs leading-relaxed text-slate-800 whitespace-pre-line font-medium shadow-sm">
                      {aiInsight}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Google Play Families Compliant Account Deletion & Privacy Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Current Account Profile</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {user ? `Logged in as ${user.email} (${user.role})` : 'Anonymous Guest Session'}
                      </p>
                    </div>
                    {user && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Active Account
                      </span>
                    )}
                  </div>
                </div>

                {/* Google Play Families Account Deletion Card */}
                <div className="bg-rose-50/80 rounded-2xl p-5 border-2 border-rose-300 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-300">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-rose-950">Delete Account & Erase All Data</h4>
                      <p className="text-xs text-rose-800/90 font-medium leading-relaxed">
                        In accordance with Google Play Families & privacy standards, parents may permanently delete their account and associated child data at any time.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/90 rounded-xl p-3.5 border border-rose-200 text-xs space-y-1.5 text-slate-700">
                    <p className="font-bold text-rose-900">Deleting your account will permanently purge:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                      <li>All linked child profiles, avatars, and learning stats</li>
                      <li>Watch history and saved favorite videos</li>
                      <li>Screen time limits, preferences, and custom PIN</li>
                      <li>All cloud database account records and authentication credentials</li>
                    </ul>
                  </div>

                  {deleteError && (
                    <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold">
                      {deleteError}
                    </div>
                  )}

                  <button
                    type="button"
                    tabIndex={0}
                    onClick={() => {
                      soundFx.playPop();
                      setGateAction({ type: 'delete_account' });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-400"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Delete Account Permanently</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Save Footer */}
          <div className="p-4 bg-slate-100 border-t border-slate-200 rounded-b-2xl flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-slate-500">VKid Parental Controls v2.4 • Families Compliant</span>
            <button
              type="button"
              tabIndex={0}
              onClick={handleSaveConfig}
              className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Parental Gate for External Link or Delete Account Verification */}
      {gateAction && (
        <ParentGateModal
          title={gateAction.type === 'delete_account' ? 'Parent Verification: Account Deletion' : 'Parental Verification'}
          reason={gateAction.type}
          targetUrl={gateAction.url}
          description={
            gateAction.type === 'delete_account'
              ? 'Please ask a parent or adult guardian to solve this math problem to authorize permanent account deletion.'
              : 'Please ask a parent or adult guardian to solve this math problem before opening an external link.'
          }
          onSuccess={() => {
            const action = gateAction;
            setGateAction(null);
            if (action.type === 'delete_account') {
              setShowDeleteConfirmModal(true);
            }
          }}
          onClose={() => setGateAction(null)}
        />
      )}

      {/* Final Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-4 border-rose-500 shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-300">
              <Trash2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-xl text-slate-900">Are you absolutely sure?</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                This action is irreversible. All of your profiles, favorites, watch history, and database records will be permanently erased.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                tabIndex={0}
                onClick={() => setShowDeleteConfirmModal(false)}
                disabled={isDeletingAccount}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                tabIndex={0}
                onClick={handleExecuteDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-400 disabled:opacity-50"
              >
                {isDeletingAccount ? <span>Deleting...</span> : <span>Yes, Delete Account</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
