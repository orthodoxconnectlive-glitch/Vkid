import React, { useState, useEffect } from 'react';
import { ChildProfile, ScreenTimeConfig, UsageReportData } from '../../types';
import { Clock, ShieldCheck, BarChart3, Users, Sparkles, X, Plus, Save, CheckCircle2, Moon, SlidersHorizontal, History, Film, ExternalLink, Trash2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { soundFx } from '../../utils/soundAndTTS';

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
  const [activeTab, setActiveTab] = useState<'screentime' | 'filters' | 'reports' | 'history' | 'profiles' | 'ai'>('screentime');
  const [config, setConfig] = useState<ScreenTimeConfig>({ ...screenTimeConfig });
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([...profiles]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);

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

  const pieData = [
    { name: 'Media Watching', value: 45, color: '#F43F5E' },
    { name: 'Math Games', value: 30, color: '#F59E0B' },
    { name: 'Spelling Safari', value: 15, color: '#10B981' },
    { name: 'Memory Match', value: 10, color: '#8B5CF6' },
  ];

  return (
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
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0">
          <button
            onClick={() => {
              soundFx.playPop();
              setActiveTab('screentime');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'screentime' ? 'bg-white text-rose-600 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Screen Time</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setActiveTab('filters');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'filters' ? 'bg-white text-rose-600 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Content Filters</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setActiveTab('reports');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'reports' ? 'bg-white text-rose-600 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Usage Reports</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setActiveTab('history');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'history' ? 'bg-white text-rose-600 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Watch History ({watchHistory.length})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setActiveTab('profiles');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'profiles' ? 'bg-white text-rose-600 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Child Profiles</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setActiveTab('ai');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ai' ? 'bg-white text-purple-600 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>AI Parent Insights</span>
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
                    onClick={handleClearHistory}
                    className="flex items-center gap-1 bg-white hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-rose-300 transition-all cursor-pointer"
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

                      <a
                        href={item.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-xl transition-all shrink-0"
                        title="Open Direct Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
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
                    <div key={p.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center gap-3">
                      <span className="text-3xl">{p.avatarUrl}</span>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-500 font-medium">Age {p.age} • Daily Goal: {p.dailyGoalMinutes}m</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Profile Form */}
              <div className="bg-rose-50/50 rounded-2xl p-4 border-2 border-rose-200 space-y-3">
                <h4 className="font-black text-sm text-slate-900">Add New Child Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <select
                    value={newChildAvatar}
                    onChange={(e) => setNewChildAvatar(e.target.value)}
                    className="bg-white border border-rose-300 rounded-xl py-2 px-3 text-xs font-bold"
                  >
                    <option value="🦁">🦁 Lion</option>
                    <option value="🦄">🦄 Unicorn</option>
                    <option value="🐻">🐻 Bear</option>
                    <option value="🦊">🦊 Fox</option>
                    <option value="🦖">🦖 Dino</option>
                  </select>
                </div>
                <button
                  onClick={handleAddChildProfile}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Child</span>
                </button>
              </div>
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
                  onClick={handleFetchAiInsights}
                  disabled={loadingAi}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-2"
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
        </div>

        {/* Bottom Save Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 rounded-b-2xl flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-500">VKid Parental Controls v2.4</span>
          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
