import React, { useState, useEffect } from 'react';
import { RefreshCw, Trophy, ArrowLeft, Star, Brain } from 'lucide-react';
import { soundFx, speakText } from '../../utils/soundAndTTS';
import confetti from 'canvas-confetti';

interface MemoryGameProps {
  onBack: () => void;
  onCompleteScore: (scorePoints: number) => void;
}

interface MemoryCard {
  id: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ onBack, onCompleteScore }) => {
  const cardData = [
    { emoji: '🦁', name: 'Lion' },
    { emoji: '🚀', name: 'Rocket' },
    { emoji: '🦄', name: 'Unicorn' },
    { emoji: '⭐', name: 'Star' },
  ];

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const initializeBoard = () => {
    // Duplicate data to form pairs
    const duplicated = [...cardData, ...cardData];
    const shuffled = duplicated
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({
        id: idx,
        emoji: item.emoji,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameFinished(false);
    speakText('Memory Match! Flip cards to find matching animal pairs.');
  };

  useEffect(() => {
    initializeBoard();
  }, []);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length >= 2) {
      return;
    }

    soundFx.playPop();
    speakText(cards[index].name);

    // Flip card
    const updated = [...cards];
    updated[index].isFlipped = true;
    setCards(updated);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (updated[firstIdx].emoji === updated[secondIdx].emoji) {
        // Match found!
        soundFx.playSuccess();
        updated[firstIdx].isMatched = true;
        updated[secondIdx].isMatched = true;
        setCards(updated);
        setFlippedIndices([]);
        setMatchedPairs((p) => p + 1);

        if (matchedPairs + 1 === cardData.length) {
          // All matched!
          setTimeout(() => {
            setGameFinished(true);
            soundFx.playRewardChime();
            onCompleteScore(30);
            confetti({
              particleCount: 80,
              spread: 100,
              origin: { y: 0.6 },
            });
          }, 800);
        }
      } else {
        // Not matched, flip back after brief pause
        soundFx.playTryAgain();
        setTimeout(() => {
          const reset = [...cards];
          reset[firstIdx].isFlipped = false;
          reset[secondIdx].isFlipped = false;
          setCards(reset);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-purple-50 to-indigo-100 rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-purple-300 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            soundFx.playPop();
            onBack();
          }}
          className="flex items-center gap-1 bg-white border-2 border-purple-300 text-purple-800 font-extrabold text-xs px-3 py-1.5 rounded-full shadow hover:bg-purple-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Games</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-purple-500 text-white font-black text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
            <Brain className="w-4 h-4" />
            <span>Moves: {moves}</span>
          </div>
        </div>
      </div>

      {!gameFinished ? (
        <div>
          <p className="text-center text-xs font-black text-purple-900 uppercase tracking-wider mb-4">
            Find all {cardData.length} matching pairs!
          </p>

          {/* Card Grid */}
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {cards.map((card, idx) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(idx)}
                className={`aspect-square rounded-2xl text-4xl sm:text-5xl flex items-center justify-center shadow-md transition-all duration-300 transform border-3 ${
                  card.isFlipped || card.isMatched
                    ? 'bg-white border-purple-400 rotate-y-180 scale-100'
                    : 'bg-gradient-to-tr from-purple-500 to-indigo-600 border-purple-300 hover:scale-105 active:scale-95'
                }`}
              >
                {card.isFlipped || card.isMatched ? card.emoji : '❓'}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Finished Celebration */
        <div className="text-center py-8">
          <div className="inline-block p-4 bg-purple-200 rounded-full mb-3 animate-bounce">
            <Brain className="w-14 h-14 text-purple-800" />
          </div>
          <h2 className="text-3xl font-black text-purple-900 mb-2">Memory Champion!</h2>
          <p className="text-slate-700 font-bold mb-4">You matched all cards in {moves} moves!</p>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <Star key={s} className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={initializeBoard}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg transition-all"
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
