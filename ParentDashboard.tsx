import React, { useState, useEffect } from 'react';
import { Volume2, RefreshCw, Trophy, ArrowLeft, Star, Sparkles } from 'lucide-react';
import { soundFx, speakText } from '../../utils/soundAndTTS';
import confetti from 'canvas-confetti';

interface MathGameProps {
  ageGroup: string;
  onBack: () => void;
  onCompleteScore: (scorePoints: number) => void;
}

interface Question {
  id: number;
  prompt: string;
  visualEmoji: string;
  visualCount: number;
  options: number[];
  correctAnswer: number;
}

export const MathGame: React.FC<MathGameProps> = ({ ageGroup, onBack, onCompleteScore }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameFinished, setGameFinished] = useState(false);

  // Generate math questions based on age group
  const questions: Question[] = [
    {
      id: 1,
      prompt: 'Count the shiny apples on the tree!',
      visualEmoji: '🍎',
      visualCount: 4,
      options: [3, 4, 5, 6],
      correctAnswer: 4,
    },
    {
      id: 2,
      prompt: 'How many friendly lions do you see?',
      visualEmoji: '🦁',
      visualCount: 3,
      options: [2, 3, 4, 5],
      correctAnswer: 3,
    },
    {
      id: 3,
      prompt: '3 apples + 2 apples = ?',
      visualEmoji: '🍏',
      visualCount: 5,
      options: [4, 5, 6, 7],
      correctAnswer: 5,
    },
    {
      id: 4,
      prompt: 'How many golden stars are in space?',
      visualEmoji: '⭐',
      visualCount: 6,
      options: [5, 6, 7, 8],
      correctAnswer: 6,
    },
    {
      id: 5,
      prompt: '6 rockets - 2 rockets = ?',
      visualEmoji: '🚀',
      visualCount: 4,
      options: [3, 4, 5, 2],
      correctAnswer: 4,
    },
  ];

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (currentQ && !gameFinished) {
      speakText(currentQ.prompt);
    }
  }, [currentIdx, gameFinished]);

  const handleOptionClick = (option: number) => {
    if (selectedOption !== null) return; // Prevent double tap

    setSelectedOption(option);
    soundFx.playPop();

    if (option === currentQ.correctAnswer) {
      setIsCorrect(true);
      soundFx.playSuccess();
      speakText('Great job! That is correct!');
      setScore((prev) => prev + 20);

      // Trigger mini star burst confetti
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 },
      });

      setTimeout(() => {
        if (currentIdx + 1 < questions.length) {
          setCurrentIdx((prev) => prev + 1);
          setSelectedOption(null);
          setIsCorrect(null);
        } else {
          setGameFinished(true);
          soundFx.playRewardChime();
          onCompleteScore(score + 20);
          confetti({
            particleCount: 80,
            spread: 100,
            origin: { y: 0.6 },
          });
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      soundFx.playTryAgain();
      speakText('Oops, try again!');

      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1200);
    }
  };

  const handleRestart = () => {
    soundFx.playPop();
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setGameFinished(false);
  };

  return (
    <div className="bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-amber-300 max-w-2xl mx-auto">
      {/* Game Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            soundFx.playPop();
            onBack();
          }}
          className="flex items-center gap-1 bg-white border-2 border-amber-300 text-amber-800 font-extrabold text-xs px-3 py-1.5 rounded-full shadow hover:bg-amber-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Games</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-amber-400 text-amber-950 font-black text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-900" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {!gameFinished ? (
        <div>
          {/* Question Counter */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-black text-amber-700 uppercase tracking-wide">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <button
              onClick={() => speakText(currentQ.prompt, true)}
              className="p-1.5 bg-amber-200 text-amber-800 rounded-full hover:bg-amber-300 transition-colors"
              title="Repeat question"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Prompt Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 text-center border-3 border-amber-200 shadow-md mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-4">{currentQ.prompt}</h2>

            {/* Visual Counting Objects Grid */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-3 min-h-[90px] bg-amber-50/50 rounded-xl border border-amber-200">
              {Array.from({ length: currentQ.visualCount }).map((_, idx) => (
                <span
                  key={idx}
                  className="text-4xl sm:text-5xl transform hover:scale-125 transition-transform duration-200 cursor-pointer animate-bounce-slow"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  onClick={() => {
                    soundFx.playPop();
                    speakText(`${idx + 1}`);
                  }}
                >
                  {currentQ.visualEmoji}
                </span>
              ))}
            </div>
          </div>

          {/* Answer Option Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt;
              let btnStyle = 'bg-white border-3 border-amber-300 text-slate-800 hover:bg-amber-100 hover:border-amber-400';

              if (isSelected && isCorrect === true) {
                btnStyle = 'bg-emerald-500 border-3 border-emerald-600 text-white animate-bounce';
              } else if (isSelected && isCorrect === false) {
                btnStyle = 'bg-rose-500 border-3 border-rose-600 text-white animate-shake';
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  disabled={selectedOption !== null}
                  className={`py-4 sm:py-6 text-3xl font-black rounded-2xl shadow-md transition-all active:scale-95 ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Game Completion Celebration Screen */
        <div className="text-center py-8">
          <div className="inline-block p-4 bg-yellow-300 rounded-full shadow-lg mb-4 animate-bounce">
            <Trophy className="w-16 h-16 text-amber-800" />
          </div>
          <h2 className="text-3xl font-black text-amber-900 mb-2">Math Wizard Victory!</h2>
          <p className="text-slate-700 font-bold mb-6">You earned {score} math points and a new sticker badge!</p>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <Star key={s} className="w-8 h-8 text-amber-400 fill-amber-400 animate-pulse" />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base px-6 py-3 rounded-2xl shadow-lg transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Play Again</span>
            </button>
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-base px-6 py-3 rounded-2xl shadow-lg transition-all"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>Return to Games</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
