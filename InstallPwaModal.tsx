import React, { useState } from 'react';
import { ChildProfile } from '../types';
import { Sparkles, Volume2, X, BookOpen, Check, HelpCircle } from 'lucide-react';
import { soundFx, speakText } from '../utils/soundAndTTS';
import confetti from 'canvas-confetti';

interface AiStoryModalProps {
  childProfile: ChildProfile;
  onClose: () => void;
}

export const AiStoryModal: React.FC<AiStoryModalProps> = ({ childProfile, onClose }) => {
  const [theme, setTheme] = useState('Outer Space');
  const [loading, setLoading] = useState(false);
  const [storyData, setStoryData] = useState<{
    title: string;
    story: string;
    puzzle?: { question: string; options: string[]; answer: string };
  } | null>(null);
  const [selectedPuzzleOption, setSelectedPuzzleOption] = useState<string | null>(null);
  const [puzzleCorrect, setPuzzleCorrect] = useState<boolean | null>(null);

  const themes = [
    { name: 'Outer Space', emoji: '🚀', color: 'from-indigo-500 to-purple-600' },
    { name: 'Jungle Safari', emoji: '🦁', color: 'from-amber-500 to-orange-600' },
    { name: 'Magical Kingdom', emoji: '🦄', color: 'from-pink-500 to-rose-600' },
    { name: 'Ocean Explorers', emoji: '🐬', color: 'from-cyan-500 to-blue-600' },
    { name: 'Dino Adventure', emoji: '🦖', color: 'from-emerald-500 to-teal-600' },
  ];

  const handleGenerateStory = async () => {
    soundFx.playPop();
    speakText(`Creating a magical ${theme} story for ${childProfile.name}`);
    setLoading(true);
    setStoryData(null);
    setSelectedPuzzleOption(null);
    setPuzzleCorrect(null);

    try {
      const res = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: childProfile.name,
          theme,
          ageGroup: childProfile.ageGroup,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStoryData({
          title: data.title,
          story: data.story,
          puzzle: data.puzzle,
        });
        soundFx.playSuccess();
        speakText(data.title);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePuzzleOptionClick = (opt: string) => {
    if (!storyData?.puzzle) return;

    soundFx.playPop();
    setSelectedPuzzleOption(opt);

    if (opt === storyData.puzzle.answer) {
      setPuzzleCorrect(true);
      soundFx.playSuccess();
      speakText('Correct answer! You solved the story puzzle!');
      confetti({ particleCount: 40, spread: 80, origin: { y: 0.7 } });
    } else {
      setPuzzleCorrect(false);
      soundFx.playTryAgain();
      speakText('Try another answer!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border-4 border-purple-300 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
            <h3 className="font-black text-lg">AI Storybook & Quest Generator</h3>
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

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Choose Story Theme for {childProfile.name}:
            </label>
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    soundFx.playPop();
                    setTheme(t.name);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                    theme === t.name ? `bg-gradient-to-r ${t.color} text-white shadow-md scale-105` : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-base">{t.emoji}</span>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateStory}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <span className="animate-pulse">Weaving Magical Story with AI...</span>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                <span>Generate Story & Puzzle</span>
              </>
            )}
          </button>

          {/* Generated Story Display */}
          {storyData && (
            <div className="bg-purple-50 rounded-3xl p-5 border-2 border-purple-200 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                <h4 className="font-black text-xl text-purple-950">{storyData.title}</h4>
                <button
                  onClick={() => speakText(`${storyData.title}. ${storyData.story}`, true)}
                  className="flex items-center gap-1 bg-purple-200 hover:bg-purple-300 text-purple-900 text-xs font-extrabold px-3 py-1.5 rounded-full"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Read Aloud</span>
                </button>
              </div>

              <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">{storyData.story}</p>

              {/* Embedded Story Puzzle */}
              {storyData.puzzle && (
                <div className="bg-white rounded-2xl p-4 border-2 border-indigo-300 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    <span>Story Quest Challenge:</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{storyData.puzzle.question}</p>

                  <div className="grid grid-cols-3 gap-2">
                    {storyData.puzzle.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handlePuzzleOptionClick(opt)}
                        className={`py-2 rounded-xl text-sm font-black transition-all border-2 ${
                          selectedPuzzleOption === opt
                            ? puzzleCorrect
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : 'bg-rose-500 text-white border-rose-600'
                            : 'bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
