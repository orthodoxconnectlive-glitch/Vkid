import React, { useState } from 'react';
import { ChildProfile, MediaItem, ActivityGame, Badge, Sticker, AgeGroup, GameCategory, SupportedLanguage } from '../types';
import { Play, Sparkles, Trophy, Tv, Gamepad2, Volume2, Star, Rocket, Flame, Search, Filter, BookOpen, Brain, FlaskConical, Music2, Palette, ChevronRight, Calculator } from 'lucide-react';
import { soundFx, speakText } from '../utils/soundAndTTS';
import { getTranslation } from '../data/translations';
import { MediaLibrary } from './MediaLibrary';
import { MathGame } from './Games/MathGame';
import { SpellingGame } from './Games/SpellingGame';
import { MemoryGame } from './Games/MemoryGame';
import { GenericInteractiveGame } from './Games/GenericInteractiveGame';
import { RewardCenter } from './RewardCenter';

interface KidHomeFeedProps {
  currentProfile: ChildProfile;
  mediaList: MediaItem[];
  gamesList: ActivityGame[];
  allBadges: Badge[];
  allStickers: Sticker[];
  onAddScorePoints: (points: number) => void;
  onToggleFavorite: (mediaId: string) => void;
  onRecordMediaWatch: (durationMinutes: number) => void;
  currentLanguage?: SupportedLanguage;
}

export const KidHomeFeed: React.FC<KidHomeFeedProps> = ({
  currentProfile,
  mediaList,
  gamesList,
  allBadges,
  allStickers,
  onAddScorePoints,
  onToggleFavorite,
  onRecordMediaWatch,
  currentLanguage = 'en',
}) => {
  const t = (key: string, fallback: string) => getTranslation(currentLanguage, key, fallback);
  const [activeTab, setActiveTab] = useState<'home' | 'media' | 'games' | 'rewards'>('home');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Games Filtering States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleTabChange = (tab: 'home' | 'media' | 'games' | 'rewards') => {
    soundFx.playPop();
    speakText(`Opening ${tab}`);
    setActiveTab(tab);
    setActiveGameId(null);
  };

  const handleLaunchGame = (gameId: string) => {
    soundFx.playPop();
    const game = gamesList.find((g) => g.id === gameId);
    if (game) {
      speakText(`Loading ${game.title}`);
    }
    setActiveGameId(gameId);
  };

  const activeGame = gamesList.find((g) => g.id === activeGameId);

  // Filter games based on search, category, and age
  const filteredGames = gamesList.filter((g) => {
    // Category match logic
    let matchesCategory = true;
    if (selectedCategory === 'math') matchesCategory = g.category === 'math';
    else if (selectedCategory === 'literacy') matchesCategory = g.category === 'reading' || g.category === 'spelling';
    else if (selectedCategory === 'logic') matchesCategory = g.category === 'logic' || g.category === 'memory';
    else if (selectedCategory === 'science') matchesCategory = g.category === 'science';
    else if (selectedCategory === 'music') matchesCategory = g.category === 'music';
    else if (selectedCategory === 'art') matchesCategory = g.category === 'art';

    // Age Group match logic
    const matchesAge = selectedAgeGroup === 'all' || g.targetAgeGroup.includes(selectedAgeGroup as AgeGroup);

    // Search query match logic
    const matchesSearch =
      searchQuery.trim() === '' ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesAge && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      {/* Module Navigation Buttons (Desktop) */}
      <div className="hidden sm:flex bg-white/80 backdrop-blur-md rounded-3xl p-2 border-2 border-amber-200 shadow-sm items-center justify-around gap-1 max-w-2xl mx-auto">
        <button
          onClick={() => handleTabChange('home')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'home' && !activeGameId
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 shadow-md scale-105'
              : 'text-slate-600 hover:bg-amber-50'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>{t('discover', 'Discover')}</span>
        </button>

        <button
          onClick={() => handleTabChange('media')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'media' && !activeGameId
              ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md scale-105'
              : 'text-slate-600 hover:bg-rose-50'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>{t('media_library', 'Media Library')}</span>
        </button>

        <button
          onClick={() => handleTabChange('games')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'games' || activeGameId
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md scale-105'
              : 'text-slate-600 hover:bg-emerald-50'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>{t('mini_games', 'Mini-Games')} ({gamesList.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('rewards')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'rewards' && !activeGameId
              ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-md scale-105'
              : 'text-slate-600 hover:bg-purple-50'
          }`}
        >
          <Trophy className="w-4 h-4 text-yellow-300" />
          <span>{t('rewards', 'Rewards')}</span>
        </button>
      </div>

      {/* Native Fixed Bottom Navigation Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-amber-200 flex justify-around items-center py-2 px-2 shadow-2xl sm:hidden">
        <button
          onClick={() => handleTabChange('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl font-black text-[10px] transition-all ${
            activeTab === 'home' && !activeGameId
              ? 'text-amber-600 scale-105 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Rocket className="w-5 h-5" />
          <span>{t('discover', 'Discover')}</span>
        </button>

        <button
          onClick={() => handleTabChange('media')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl font-black text-[10px] transition-all ${
            activeTab === 'media' && !activeGameId
              ? 'text-rose-500 scale-105 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span>{t('media_library', 'Media')}</span>
        </button>

        <button
          onClick={() => handleTabChange('games')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl font-black text-[10px] transition-all ${
            activeTab === 'games' || activeGameId
              ? 'text-emerald-500 scale-105 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span>{t('mini_games', 'Games')}</span>
        </button>

        <button
          onClick={() => handleTabChange('rewards')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl font-black text-[10px] transition-all ${
            activeTab === 'rewards' && !activeGameId
              ? 'text-indigo-600 scale-105 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>{t('rewards', 'Rewards')}</span>
        </button>
      </nav>

      {/* Active Game Views */}
      {activeGameId === 'game_math' && (
        <MathGame
          ageGroup={currentProfile.ageGroup}
          onBack={() => setActiveGameId(null)}
          onCompleteScore={onAddScorePoints}
        />
      )}

      {activeGameId === 'game_spelling' && (
        <SpellingGame
          onBack={() => setActiveGameId(null)}
          onCompleteScore={onAddScorePoints}
        />
      )}

      {activeGameId === 'game_memory' && (
        <MemoryGame
          onBack={() => setActiveGameId(null)}
          onCompleteScore={onAddScorePoints}
        />
      )}

      {activeGameId && !['game_math', 'game_spelling', 'game_memory'].includes(activeGameId) && activeGame && (
        <GenericInteractiveGame
          game={activeGame}
          onBack={() => setActiveGameId(null)}
          onCompleteScore={onAddScorePoints}
        />
      )}

      {/* Tab Contents when no active game */}
      {!activeGameId && (
        <>
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Daily Progress Welcome Hero Banner */}
              <div className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500 rounded-3xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-3xl sm:text-4xl shadow-inner animate-bounce-slow shrink-0">
                      {currentProfile.avatarUrl}
                    </div>
                    <div>
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                          Hi, {currentProfile.name}! 👋
                        </h2>
                        <button
                          onClick={() => speakText(`Hello ${currentProfile.name}! Ready for fun learning today?`, true)}
                          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                          title="Say greeting"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-amber-100 font-bold mt-0.5">
                        You've completed {currentProfile.timeSpentTodayMinutes} of {currentProfile.dailyGoalMinutes} mins learning today!
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-2 flex items-center gap-3 shrink-0">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-pulse" />
                    <div className="text-left">
                      <span className="block text-[9px] sm:text-[10px] font-bold text-amber-100 uppercase tracking-wider">Daily Streak</span>
                      <span className="text-base sm:text-lg font-black text-white">3 Days 🔥</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Mini-Games Portal Grid (Featured Top Preview) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg sm:text-xl text-slate-800 flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-emerald-500" />
                    <span>Featured Mini-Games ({gamesList.length})</span>
                  </h3>
                  <button
                    onClick={() => handleTabChange('games')}
                    className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full hover:bg-amber-200 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span>See All ({gamesList.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Compact Grid of Interactive Icon Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 pt-1">
                  {gamesList.slice(0, 8).map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleLaunchGame(g.id)}
                      className="group relative flex flex-col items-center cursor-pointer text-left focus:outline-none"
                    >
                      <div
                        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br ${g.color} p-2 text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-between relative overflow-hidden border-2 border-white/50`}
                      >
                        {/* Subtle Category Badge */}
                        <span className="bg-black/30 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider self-end border border-white/20">
                          {g.category}
                        </span>

                        {/* Prominent Center Icon */}
                        <span className="text-3xl sm:text-4xl my-auto drop-shadow-md group-hover:scale-110 transition-transform">
                          {g.icon}
                        </span>
                      </div>

                      {/* Small Title Label Below Icon Button */}
                      <span className="mt-1.5 text-center font-extrabold text-xs text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors w-24 sm:w-28">
                        {g.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Media Shelf */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                    <Tv className="w-5 h-5 text-rose-500" />
                    <span>Popular Videos & Stories</span>
                  </h3>
                  <button
                    onClick={() => handleTabChange('media')}
                    className="text-xs font-black text-rose-600 hover:underline"
                  >
                    Explore Library
                  </button>
                </div>

                <MediaLibrary
                  mediaList={mediaList.slice(0, 3)}
                  userAgeGroup={currentProfile.ageGroup}
                  favoriteIds={currentProfile.favoriteMediaIds}
                  onToggleFavorite={onToggleFavorite}
                  onRecordMediaWatch={onRecordMediaWatch}
                  currentLanguage={currentLanguage}
                />
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <MediaLibrary
              mediaList={mediaList}
              userAgeGroup={currentProfile.ageGroup}
              favoriteIds={currentProfile.favoriteMediaIds}
              onToggleFavorite={onToggleFavorite}
              onRecordMediaWatch={onRecordMediaWatch}
              currentLanguage={currentLanguage}
            />
          )}

          {/* Full Mini-Games Dedicated Catalog Page View */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              {/* Header Banner for Mini-Games Portal */}
              <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                    <Gamepad2 className="w-4 h-4 text-yellow-300" />
                    <span>Educational Arcade</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black">20 Learning Mini-Games</h2>
                  <p className="text-xs sm:text-sm text-teal-100 font-bold mt-1">
                    Fun interactive puzzles, music pads, logic mazes, and science experiments tailored for kids!
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-2.5 text-center shrink-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-100">Catalog Count</span>
                  <span className="text-2xl font-black text-white">{gamesList.length} Games</span>
                </div>
              </div>

              {/* Category Filter Tabs & Search Bar */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border-2 border-emerald-200 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  {/* Category Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
                    {[
                      { id: 'all', label: 'All Games', icon: Gamepad2 },
                      { id: 'math', label: 'Math', icon: Calculator },
                      { id: 'literacy', label: 'Literacy', icon: BookOpen },
                      { id: 'logic', label: 'Logic', icon: Brain },
                      { id: 'science', label: 'Science', icon: FlaskConical },
                      { id: 'music', label: 'Music', icon: Music2 },
                      { id: 'art', label: 'Art', icon: Palette },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = selectedCategory === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            soundFx.playPop();
                            setSelectedCategory(tab.id);
                          }}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs whitespace-nowrap transition-all ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-md scale-105'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-64 shrink-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 20 mini-games..."
                      className="w-full bg-slate-100 border border-slate-300 rounded-full pl-9 pr-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Age Group Filter Pills */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Age Filter:</span>
                  {[
                    { id: 'all', label: 'All Ages' },
                    { id: '4-5', label: '4-5 Yrs' },
                    { id: '6-7', label: '6-7 Yrs' },
                    { id: '8-10', label: '8-10 Yrs' },
                  ].map((ag) => (
                    <button
                      key={ag.id}
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedAgeGroup(ag.id);
                      }}
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border transition-all ${
                        selectedAgeGroup === ag.id
                          ? 'bg-amber-400 border-amber-500 text-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {ag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mini-Games Grid */}
              {filteredGames.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 pt-1">
                  {filteredGames.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleLaunchGame(g.id)}
                      className="group relative flex flex-col items-center cursor-pointer text-left focus:outline-none"
                    >
                      <div
                        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br ${g.color} p-2 text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-between relative overflow-hidden border-2 border-white/50`}
                      >
                        {/* Subtle Category Badge */}
                        <span className="bg-black/30 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider self-end border border-white/20">
                          {g.category}
                        </span>

                        {/* Prominent Center Icon */}
                        <span className="text-3xl sm:text-4xl my-auto drop-shadow-md group-hover:scale-110 transition-transform">
                          {g.icon}
                        </span>
                      </div>

                      {/* Small Title Label Below Icon Button */}
                      <span className="mt-1.5 text-center font-extrabold text-xs text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors w-24 sm:w-28">
                        {g.title}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-200">
                  <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-black text-lg text-slate-800 mb-1">No mini-games found</h3>
                  <p className="text-xs font-bold text-slate-500 mb-4">Try adjusting your category filter or search query.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedAgeGroup('all');
                      setSearchQuery('');
                    }}
                    className="bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-full shadow"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rewards' && (
            <RewardCenter
              earnedBadgeIds={currentProfile.earnedBadges}
              allBadges={allBadges}
              unlockedStickerIds={currentProfile.unlockedStickers}
              allStickers={allStickers}
              currentLanguage={currentLanguage}
            />
          )}
        </>
      )}
    </div>
  );
};

