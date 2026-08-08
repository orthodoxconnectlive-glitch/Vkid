import React, { useState, useEffect } from 'react';
import { Volume2, RefreshCw, Trophy, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { soundFx, speakText } from '../../utils/soundAndTTS';
import confetti from 'canvas-confetti';

interface SpellingGameProps {
  onBack: () => void;
  onCompleteScore: (scorePoints: number) => void;
}

interface WordPuzzle {
  word: string;
  emoji: string;
  hint: string;
}

export const SpellingGame: React.FC<SpellingGameProps> = ({ onBack, onCompleteScore }) => {
  const puzzles: WordPuzzle[] = [
    { word: 'CAT', emoji: '🐱', hint: 'A furry pet that says meow!' },
    { word: 'SUN', emoji: '☀️', hint: 'Gives us bright light in the sky!' },
    { word: 'DINO', emoji: '🦖', hint: 'A giant prehistoric creature!' },
    { word: 'STAR', emoji: '⭐', hint: 'Shines brightly in night sky!' },
    { word: 'FISH', emoji: '🐟', hint: 'Swims happily under water!' },
    { word: 'LION', emoji: '🦁', hint: 'King of the jungle safari!' },
  ];

  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<{ id: string; letter: string }[]>([]);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const currentPuzzle = puzzles[puzzleIdx];

  // Initialize letter tiles whenever puzzle index changes
  useEffect(() => {
    if (currentPuzzle) {
      setPlacedLetters([]);
      const targetWord = currentPuzzle.word;
      // Add extra distractor letters to make it fun
      const extraLetters = ['X', 'O', 'P', 'B', 'M'];
      const combined = [
        ...targetWord.split('').map((char, i) => ({ id: `letter_${i}_${char}`, letter: char })),
        { id: 'extra_1', letter: extraLetters[puzzleIdx % extraLetters.length] },
      ];

      // Shuffle tiles
      const shuffled = [...combined].sort(() => Math.random() - 0.5);
      setAvailableTiles(shuffled);

      speakText(`Spell the word: ${currentPuzzle.word}. ${currentPuzzle.hint}`);
    }
  }, [puzzleIdx]);

  const handleTileClick = (tile: { id: string; letter: string }) => {
    soundFx.playPop();
    speakText(tile.letter);

    // Add letter to placed
    const newPlaced = [...placedLetters, tile.letter];
    setPlacedLetters(newPlaced);

    // Remove tile from available
    setAvailableTiles((prev) => prev.filter((t) => t.id !== tile.id));

    // Check if word is complete
    if (newPlaced.length === currentPuzzle.word.length) {
      const formedWord = newPlaced.join('');
      if (formedWord === currentPuzzle.word) {
        soundFx.playSuccess();
        speakText(`Awesome! ${currentPuzzle.word}!`);
        setScore((prev) => prev + 25);

        confetti({
          particleCount: 30,
          spread: 70,
          origin: { y: 0.7 },
        });

        setTimeout(() => {
          if (puzzleIdx + 1 < puzzles.length) {
            setPuzzleIdx((prev) => prev + 1);
          } else {
            setGameFinished(true);
            soundFx.playRewardChime();
            onCompleteScore(score + 25);
            confetti({
              particleCount: 90,
              spread: 120,
              origin: { y: 0.6 },
            });
          }
        }, 1500);
      } else {
        soundFx.playTryAgain();
        speakText('Not quite right, let us try that word again!');
        setTimeout(() => {
          // Reset tiles for current puzzle
          setPlacedLetters([]);
          const targetWord = currentPuzzle.word;
          const combined = [
            ...targetWord.split('').map((char, i) => ({ id: `letter_${i}_${char}`, letter: char })),
            { id: 'extra_reset', letter: 'Z' },
          ].sort(() => Math.random() - 0.5);
          setAvailableTiles(combined);
        }, 1200);
      }
    }
  };

  const handleRemovePlaced = (index: number) => {
    soundFx.playPop();
    const removedLetter = placedLetters[index];
    const newPlaced = placedLetters.filter((_, i) => i !== index);
    setPlacedLetters(newPlaced);

    // Put tile back
    setAvailableTiles((prev) => [...prev, { id: `returned_${Date.now()}`, letter: removedLetter }]);
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-teal-100 rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-emerald-300 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            soundFx.playPop();
            onBack();
          }}
          className="flex items-center gap-1 bg-white border-2 border-emerald-300 text-emerald-800 font-extrabold text-xs px-3 py-1.5 rounded-full shadow hover:bg-emerald-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Games</span>
        </button>

        <div className="bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
          <Trophy className="w-4 h-4" />
          <span>Score: {score}</span>
        </div>
      </div>

      {!gameFinished ? (
        <div>
          {/* Word Prompt Card */}
          <div className="bg-white rounded-2xl p-4 text-center border-3 border-emerald-200 shadow-md mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-6xl sm:text-7xl animate-pulse">{currentPuzzle.emoji}</span>
            </div>
            <p className="text-sm font-bold text-slate-600 mb-2">{currentPuzzle.hint}</p>

            <button
              onClick={() => speakText(`Spell ${currentPuzzle.word}`, true)}
              className="inline-flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300"
            >
              <Volume2 className="w-4 h-4" />
              <span>Hear Word Pronunciation</span>
            </button>
          </div>

          {/* Letter Slots */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
            {Array.from({ length: currentPuzzle.word.length }).map((_, idx) => {
              const letter = placedLetters[idx];
              return (
                <div
                  key={idx}
                  onClick={() => letter && handleRemovePlaced(idx)}
                  className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-3 flex items-center justify-center text-3xl font-black shadow-md cursor-pointer transition-all ${
                    letter
                      ? 'bg-emerald-500 text-white border-emerald-600 transform scale-105'
                      : 'bg-emerald-50 border-dashed border-emerald-300 text-slate-300'
                  }`}
                >
                  {letter || ''}
                </div>
              );
            })}
          </div>

          {/* Scrambled Tile Choices */}
          <p className="text-center text-xs font-black text-teal-800 uppercase tracking-wider mb-2">Tap letters below to spell:</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className="w-12 h-14 sm:w-14 sm:h-16 bg-white hover:bg-emerald-100 border-3 border-teal-300 text-teal-900 font-black text-2xl sm:text-3xl rounded-2xl shadow-md transition-all active:scale-95 hover:scale-110"
              >
                {tile.letter}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Finished Screen */
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-black text-emerald-900 mb-2">Spelling Safari Master!</h2>
          <p className="text-slate-700 font-bold mb-6">You spelled all words correctly and earned {score} points!</p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                soundFx.playPop();
                setPuzzleIdx(0);
                setScore(0);
                setGameFinished(false);
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Play Again</span>
            </button>
            <button
              onClick={onBack}
              className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg transition-all"
            >
              Back to Games
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
