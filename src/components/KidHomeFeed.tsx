import React, { useState } from 'react';
import { ChildProfile, MediaItem, ActivityGame, Badge, Sticker, AgeGroup } from '../types';
import { Play, Sparkles, Trophy, Tv, Gamepad2, Volume2, Star, Rocket, Flame } from 'lucide-react';
import { soundFx, speakText } from '../utils/soundAndTTS';
import { MediaLibrary } from './MediaLibrary';
import { MathGame } from './Games/MathGame';
import { SpellingGame } from './Games/SpellingGame';
import { MemoryGame } from './Games/MemoryGame';
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
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'media' | 'games' | 'rewards'>('home');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const handleTabChange = (tab: 'home' | 'media' | 'games' | 'rewards') => {
    soundFx.playPop();
    speakText(`Opening ${tab}`);
    setActiveTab(tab);
    setActiveGameId(null);
  };

  const handleLaunchGame = (gameId: string) => {
    soundFx.playPop();
    speakText('Loading game');
    setActiveGameId(gameId);
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation Buttons */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-2 border-2 border-amber-200 shadow-sm flex items-center justify-around gap-1 max-w-2xl mx-auto">
        <button
          onClick={() => handleTabChange('home')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'home' && !activeGameId
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 shadow-md scale-105'
              : 'text-slate-600 hover:bg-amber-50'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Discover</span>
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
          <span>Media Library</span>
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
          <span>Mini-Games</span>
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
          <span>Rewards</span>
        </button>
      </div>

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

      {/* Tab Contents when no active game */}
      {!activeGameId && (
        <>
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Daily Progress Welcome Hero Banner */}
              <div className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-4xl shadow-inner animate-bounce-slow">
                      {currentProfile.avatarUrl}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
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

                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-2.5 flex items-center gap-3">
                    <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
                    <div>
                      <span className="block text-[10px] font-bold text-amber-100 uppercase tracking-wider">Daily Streak</span>
                      <span className="text-lg font-black text-white">3 Days 🔥</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Mini-Games Portal Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-emerald-500" />
                    <span>Learning Mini-Games</span>
                  </h3>
                  <button
                    onClick={() => handleTabChange('games')}
                    className="text-xs font-black text-amber-600 hover:underline"
                  >
                    See All
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {gamesList.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => handleLaunchGame(g.id)}
                      className={`bg-gradient-to-br ${g.color} text-white rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between space-y-4`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-4xl p-2 bg-white/20 rounded-2xl backdrop-blur-md">{g.icon}</span>
                        <span className="bg-black/20 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20">
                          Interactive
                        </span>
                      </div>

                      <div>
                        <h4 className="font-black text-lg text-white mb-1">{g.title}</h4>
                        <p className="text-xs text-white/90 font-medium leading-relaxed">{g.description}</p>
                      </div>

                      <button className="w-full bg-white text-slate-900 font-extrabold text-xs py-2.5 rounded-2xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1.5">
                        <Play className="w-3.5 h-3.5 fill-current text-emerald-600" />
                        <span>Play Now</span>
                      </button>
                    </div>
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
            />
          )}

          {activeTab === 'games' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {gamesList.map((g) => (
                <div
                  key={g.id}
                  onClick={() => handleLaunchGame(g.id)}
                  className={`bg-gradient-to-br ${g.color} text-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer flex flex-col justify-between space-y-4`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-5xl">{g.icon}</span>
                    <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl mb-1">{g.title}</h3>
                    <p className="text-xs text-white/90 font-medium leading-relaxed">{g.description}</p>
                  </div>
                  <button className="w-full bg-white text-slate-900 font-extrabold text-sm py-3 rounded-2xl shadow active:scale-95 flex items-center justify-center gap-2">
                    <Play className="w-4 h-4 fill-current text-emerald-600" />
                    <span>Start Challenge</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'rewards' && (
            <RewardCenter
              earnedBadgeIds={currentProfile.earnedBadges}
              allBadges={allBadges}
              unlockedStickerIds={currentProfile.unlockedStickers}
              allStickers={allStickers}
            />
          )}
        </>
      )}
    </div>
  );
};
