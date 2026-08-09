import React, { useState } from 'react';
import { Badge, Sticker, PlacedSticker, SupportedLanguage } from '../types';
import { Trophy, Star, Sparkles, Trash2, Palette, Smile } from 'lucide-react';
import { soundFx, speakText } from '../utils/soundAndTTS';
import { getTranslation } from '../data/translations';
import confetti from 'canvas-confetti';

interface RewardCenterProps {
  earnedBadgeIds: string[];
  allBadges: Badge[];
  unlockedStickerIds: string[];
  allStickers: Sticker[];
  currentLanguage?: SupportedLanguage;
}

export const RewardCenter: React.FC<RewardCenterProps> = ({
  earnedBadgeIds,
  allBadges,
  unlockedStickerIds,
  allStickers,
  currentLanguage = 'en',
}) => {
  const t = (key: string, fallback: string) => getTranslation(currentLanguage, key, fallback);
  const [activeTab, setActiveTab] = useState<'badges' | 'stickers'>('badges');
  const [sceneBackground, setSceneBackground] = useState<'safari' | 'space' | 'sea'>('safari');
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([
    { id: '1', stickerId: 'st_lion', emoji: '🦁', x: 20, y: 50, scale: 1 },
    { id: '2', stickerId: 'st_rocket', emoji: '🚀', x: 75, y: 30, scale: 1 },
  ]);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(allStickers[0] || null);

  const bgStyles = {
    safari: 'bg-gradient-to-b from-amber-100 via-emerald-100 to-amber-200 border-amber-400',
    space: 'bg-gradient-to-b from-slate-900 via-indigo-950 to-purple-950 border-purple-500',
    sea: 'bg-gradient-to-b from-cyan-200 via-blue-300 to-indigo-400 border-blue-400',
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSticker) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    soundFx.playPop();
    speakText(`Placed ${selectedSticker.name}`);

    const newPlaced: PlacedSticker = {
      id: `placed_${Date.now()}`,
      stickerId: selectedSticker.id,
      emoji: selectedSticker.emoji,
      x,
      y,
      scale: 1,
    };

    setPlacedStickers((prev) => [...prev, newPlaced]);

    confetti({
      particleCount: 15,
      spread: 40,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
    });
  };

  const handleClearStickers = () => {
    soundFx.playPop();
    setPlacedStickers([]);
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            soundFx.playPop();
            setActiveTab('badges');
          }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-sm transition-all shadow-md ${
            activeTab === 'badges'
              ? 'bg-amber-500 text-white border-2 border-amber-600 scale-105'
              : 'bg-white text-slate-700 hover:bg-amber-50 border-2 border-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-yellow-300" />
          <span>My Badges ({earnedBadgeIds.length})</span>
        </button>

        <button
          onClick={() => {
            soundFx.playPop();
            setActiveTab('stickers');
          }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-sm transition-all shadow-md ${
            activeTab === 'stickers'
              ? 'bg-indigo-500 text-white border-2 border-indigo-600 scale-105'
              : 'bg-white text-slate-700 hover:bg-indigo-50 border-2 border-slate-200'
          }`}
        >
          <Palette className="w-4 h-4 text-indigo-300" />
          <span>Sticker Sandbox</span>
        </button>
      </div>

      {activeTab === 'badges' ? (
        /* Badges Showcase Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBadges.map((b) => {
            const isEarned = earnedBadgeIds.includes(b.id);
            return (
              <div
                key={b.id}
                onClick={() => {
                  soundFx.playPop();
                  speakText(`${b.title}. ${b.description}`);
                }}
                className={`p-5 rounded-3xl border-3 shadow-md flex items-center gap-4 transition-all cursor-pointer ${
                  isEarned
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-100 border-amber-300 hover:scale-105'
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                    isEarned ? 'bg-amber-300 text-amber-900 animate-bounce-slow' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {b.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-black text-slate-800 text-base">{b.title}</h4>
                    {isEarned ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-emerald-500" /> Unlocked
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Locked</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Interactive Sticker Book Sandbox */
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg border-3 border-indigo-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-lg text-slate-800">Virtual Sticker Book</h3>
              <p className="text-xs text-slate-500 font-medium">Select a sticker below and tap on the scene to stick it!</p>
            </div>

            {/* Background Theme Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Scene:</span>
              <button
                onClick={() => setSceneBackground('safari')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${sceneBackground === 'safari' ? 'bg-amber-500 text-white' : 'bg-slate-100'}`}
              >
                🌴 Safari
              </button>
              <button
                onClick={() => setSceneBackground('space')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${sceneBackground === 'space' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
              >
                🚀 Space
              </button>
              <button
                onClick={() => setSceneBackground('sea')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${sceneBackground === 'sea' ? 'bg-cyan-500 text-white' : 'bg-slate-100'}`}
              >
                🌊 Sea
              </button>
              <button
                onClick={handleClearStickers}
                className="p-1.5 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors ml-2"
                title="Clear all placed stickers"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sticker Palette Selector Bar */}
          <div className="flex items-center gap-3 overflow-x-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
            {allStickers.map((st) => {
              const isUnlocked = unlockedStickerIds.includes(st.id);
              const isSelected = selectedSticker?.id === st.id;
              return (
                <button
                  key={st.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    soundFx.playPop();
                    speakText(st.name);
                    setSelectedSticker(st);
                  }}
                  className={`p-2.5 rounded-2xl flex flex-col items-center min-w-[64px] border-2 transition-all ${
                    isSelected ? 'border-indigo-500 bg-indigo-50 scale-110 shadow' : 'border-slate-200 bg-white hover:bg-slate-100'
                  } ${!isUnlocked && 'opacity-40 cursor-not-allowed'}`}
                >
                  <span className="text-3xl mb-1">{st.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-700 truncate max-w-[56px]">{st.name}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Scene Canvas */}
          <div
            onClick={handleCanvasClick}
            className={`relative w-full aspect-video rounded-3xl border-4 ${bgStyles[sceneBackground]} shadow-inner overflow-hidden cursor-crosshair select-none`}
          >
            {placedStickers.map((ps) => (
              <div
                key={ps.id}
                style={{ left: `${ps.x}%`, top: `${ps.y}%` }}
                className="absolute text-5xl sm:text-6xl transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform cursor-pointer animate-bounce-slow"
              >
                {ps.emoji}
              </div>
            ))}

            {placedStickers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400/80 font-bold text-sm pointer-events-none">
                Tap anywhere on the scene to place your selected sticker!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
