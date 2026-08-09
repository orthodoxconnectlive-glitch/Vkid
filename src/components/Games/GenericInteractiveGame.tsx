import React, { useState, useEffect } from 'react';
import { ActivityGame } from '../../types';
import { Volume2, RefreshCw, Trophy, ArrowLeft, Star, Sparkles, CheckCircle2, Play, Music, Palette, Cpu, Globe, Rocket, HelpCircle } from 'lucide-react';
import { soundFx, speakText } from '../../utils/soundAndTTS';
import confetti from 'canvas-confetti';

interface GenericInteractiveGameProps {
  game: ActivityGame;
  onBack: () => void;
  onCompleteScore: (scorePoints: number) => void;
}

export const GenericInteractiveGame: React.FC<GenericInteractiveGameProps> = ({ game, onBack, onCompleteScore }) => {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);

  // Mode Specific States
  // Color Mixer state
  const [color1, setColor1] = useState<string | null>(null);
  const [color2, setColor2] = useState<string | null>(null);
  const [mixedColor, setMixedColor] = useState<{ name: string; hex: string; emoji: string } | null>(null);

  // Piano / Rhythm state
  const [activeNote, setActiveNote] = useState<string | null>(null);

  // Coding Blocks state
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });
  const [commands, setCommands] = useState<string[]>([]);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Quiz / Challenge state
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Multi-choice challenges generator tailored to game id
  const getGameChallenges = () => {
    switch (game.id) {
      case 'game_phonics':
        return [
          { prompt: 'Pop the balloon that starts with the sound "B"!', target: 'B', options: ['A 🍎', 'B 🎈', 'C 🐱', 'D 🐶'], correct: 'B 🎈' },
          { prompt: 'Which letter makes the "S" sound like Snake?', target: 'S', options: ['M 🐒', 'S 🐍', 'T 🐯', 'P 🐼'], correct: 'S 🐍' },
          { prompt: 'Find the letter for "Duck"!', target: 'D', options: ['D 🦆', 'F 🦊', 'G 🦒', 'H 🐴'], correct: 'D 🦆' },
        ];
      case 'game_dino_math':
        return [
          { prompt: 'Feed T-Rex: 5 leaves + 5 leaves = ?', target: '10', options: ['8', '10', '12', '15'], correct: '10' },
          { prompt: 'Skip count by 2s: 2, 4, 6, ?', target: '8', options: ['7', '8', '9', '10'], correct: '8' },
          { prompt: '3 x 3 dino eggs = ?', target: '9', options: ['6', '8', '9', '12'], correct: '9' },
        ];
      case 'game_clock':
        return [
          { prompt: 'Set the rocket launch time for 3:00 o\'clock!', target: '3:00', options: ['1:00', '3:00', '6:00', '12:00'], correct: '3:00' },
          { prompt: 'Which clock shows half past 4 (4:30)?', target: '4:30', options: ['4:00', '4:30', '5:00', '5:30'], correct: '4:30' },
          { prompt: 'School finishes at 2:00 PM. Select 2:00!', target: '2:00', options: ['10:00', '12:00', '2:00', '8:00'], correct: '2:00' },
        ];
      case 'game_animals':
        return [
          { prompt: 'Where does the Roaring Lion live?', target: 'Jungle', options: ['Jungle 🌴', 'Ocean 🌊', 'Arctic 🧊', 'Desert 🏜️'], correct: 'Jungle 🌴' },
          { prompt: 'Which creature swims in the Deep Blue Sea?', target: 'Ocean', options: ['Polar Bear 🐻', 'Dolphin 🐬', 'Eagle 🦅', 'Camel 🐪'], correct: 'Dolphin 🐬' },
          { prompt: 'Find the bird that can hoot at night!', target: 'Owl', options: ['Penguin 🐧', 'Owl 🦉', 'Parrot 🦜', 'Duck 🦆'], correct: 'Owl 🦉' },
        ];
      case 'game_geography':
        return [
          { prompt: 'Which giant continent has the Eiffel Tower and Colosseum?', target: 'Europe', options: ['Europe 🏰', 'Africa 🦁', 'Asia 🐼', 'Antarctica 🐧'], correct: 'Europe 🏰' },
          { prompt: 'Find the largest ocean on Earth!', target: 'Pacific', options: ['Atlantic 🌊', 'Pacific 🌏', 'Indian 🏝️', 'Arctic 🧊'], correct: 'Pacific 🌏' },
          { prompt: 'Where do Kangaroos hop in the wild?', target: 'Australia', options: ['Australia 🦘', 'Canada 🍁', 'Egypt 🏜️', 'Brazil 🦜'], correct: 'Australia 🦘' },
        ];
      case 'game_planets':
        return [
          { prompt: 'Which planet is closest to the Sun?', target: 'Mercury', options: ['Mercury 🪐', 'Earth 🌍', 'Jupiter 🔴', 'Neptune 🔵'], correct: 'Mercury 🪐' },
          { prompt: 'Find the Red Planet with high mountains!', target: 'Mars', options: ['Venus 🟡', 'Mars 🔴', 'Saturn 🪐', 'Uranus ❄️'], correct: 'Mars 🔴' },
          { prompt: 'Which huge planet has bright icy rings?', target: 'Saturn', options: ['Jupiter 🟠', 'Saturn 🪐', 'Moon 🌙', 'Sun ☀️'], correct: 'Saturn 🪐' },
        ];
      case 'game_fraction':
        return [
          { prompt: 'Slice the pizza in half! How many slices is 1/2?', target: '1 of 2', options: ['1 slice', '2 slices', '3 slices', '4 slices'], correct: '1 slice' },
          { prompt: 'Quarter pizza! You eat 1 out of 4 slices. What fraction is eaten?', target: '1/4', options: ['1/2', '1/3', '1/4', '3/4'], correct: '1/4' },
        ];
      default:
        return [
          { prompt: `Welcome to ${game.title}! Challenge #1`, target: 'A', options: ['Option A ⭐', 'Option B 🚀', 'Option C 🎨', 'Option D 🧩'], correct: 'Option A ⭐' },
          { prompt: 'Awesome progress! Select the winning star!', target: 'Star', options: ['Circle ⚪', 'Square 🟦', 'Star ⭐', 'Heart ❤️'], correct: 'Star ⭐' },
        ];
    }
  };

  const challenges = getGameChallenges();
  const currentChallenge = challenges[quizIdx] || challenges[0];

  useEffect(() => {
    speakText(`Playing ${game.title}. ${game.description}`);
  }, [game]);

  // Handle Quiz Answer
  const handleAnswerSelect = (opt: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(opt);
    soundFx.playPop();

    if (opt === currentChallenge.correct) {
      setIsAnswerCorrect(true);
      soundFx.playSuccess();
      speakText('Excellent choice!');
      setScore((prev) => prev + 25);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });

      setTimeout(() => {
        if (quizIdx + 1 < challenges.length) {
          setQuizIdx((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsAnswerCorrect(null);
        } else {
          setGameFinished(true);
          soundFx.playRewardChime();
          onCompleteScore(score + 25);
          confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } });
        }
      }, 1400);
    } else {
      setIsAnswerCorrect(false);
      soundFx.playTryAgain();
      speakText('Try again!');
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
      }, 1200);
    }
  };

  // Color Mixer Logic
  const handleColorPick = (colName: string) => {
    soundFx.playPop();
    if (!color1) {
      setColor1(colName);
      speakText(`Selected ${colName}`);
    } else if (!color2) {
      setColor2(colName);
      speakText(`Selected ${colName}`);
      calculateMix(color1, colName);
    }
  };

  const calculateMix = (c1: string, c2: string) => {
    let result = { name: 'Custom Shade', hex: '#8b5cf6', emoji: '✨' };
    const pair = [c1, c2].sort().join('+');

    if (pair === 'Blue+Red') result = { name: 'Magical Purple 💜', hex: '#9333ea', emoji: '🔮' };
    else if (pair === 'Red+Yellow') result = { name: 'Bright Orange 🧡', hex: '#f97316', emoji: '🍊' };
    else if (pair === 'Blue+Yellow') result = { name: 'Emerald Green 💚', hex: '#10b981', emoji: '🌱' };
    else if (c1 === c2) result = { name: `Extra Vibrant ${c1}`, hex: c1 === 'Red' ? '#ef4444' : c1 === 'Blue' ? '#3b82f6' : '#eab308', emoji: '🎨' };

    setMixedColor(result);
    soundFx.playSuccess();
    speakText(`You created ${result.name}!`);
    setScore((prev) => prev + 30);
    confetti({ particleCount: 40, spread: 70 });
  };

  const resetColorMixer = () => {
    soundFx.playPop();
    setColor1(null);
    setColor2(null);
    setMixedColor(null);
  };

  // Piano Note Player
  const playPianoNote = (noteName: string, frequency: number) => {
    setActiveNote(noteName);
    soundFx.playPop();
    speakText(noteName);
    setScore((prev) => prev + 5);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // Audio context fallback
    }

    setTimeout(() => setActiveNote(null), 300);
  };

  // Robot Coding Simulator
  const addCodeCommand = (cmd: string) => {
    soundFx.playPop();
    speakText(cmd);
    setCommands((prev) => [...prev, cmd]);
  };

  const runRobotCode = () => {
    if (commands.length === 0) return;
    setIsRunningCode(true);
    soundFx.playPop();
    speakText('Running robot code commands!');

    let curX = 0;
    let curY = 0;

    commands.forEach((cmd, idx) => {
      setTimeout(() => {
        soundFx.playPop();
        if (cmd === 'FORWARD') curY = Math.min(curY + 1, 3);
        if (cmd === 'RIGHT') curX = Math.min(curX + 1, 3);
        if (cmd === 'LEFT') curX = Math.max(curX - 1, 0);
        setRobotPos({ x: curX, y: curY });

        if (idx === commands.length - 1) {
          setIsRunningCode(false);
          if (curX === 3 && curY === 3) {
            soundFx.playRewardChime();
            speakText('Target reached! Excellent programming!');
            setScore((prev) => prev + 50);
            confetti({ particleCount: 60, spread: 90 });
          }
        }
      }, (idx + 1) * 600);
    });
  };

  const resetRobot = () => {
    soundFx.playPop();
    setRobotPos({ x: 0, y: 0 });
    setCommands([]);
  };

  return (
    <div className={`bg-gradient-to-b ${game.color} rounded-3xl p-4 sm:p-6 text-white shadow-2xl border-4 border-white/30 max-w-2xl mx-auto relative overflow-hidden`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <button
          onClick={() => {
            soundFx.playPop();
            onBack();
          }}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs px-3 py-1.5 rounded-full border border-white/30 shadow backdrop-blur-md transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Games</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">{game.icon}</span>
          <h2 className="font-black text-lg sm:text-xl truncate max-w-[180px] sm:max-w-none">{game.title}</h2>
        </div>

        <div className="bg-yellow-400 text-slate-900 font-black text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Trophy className="w-4 h-4 text-amber-900" />
          <span>{score} pts</span>
        </div>
      </div>

      {!gameFinished ? (
        <div className="space-y-4">
          {/* Instructions banner */}
          <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center justify-between gap-2">
            <p className="text-xs sm:text-sm font-bold text-white/95 leading-snug">
              {game.instructions || game.description}
            </p>
            <button
              onClick={() => speakText(game.instructions || game.description, true)}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full shrink-0"
              title="Listen instructions"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Specialized Interactive Color Mixer */}
          {game.id === 'game_colors' && (
            <div className="bg-white/90 text-slate-900 rounded-2xl p-4 shadow-lg border-2 border-white space-y-4">
              <h3 className="font-black text-center text-lg text-slate-800 flex items-center justify-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                <span>Primary Color Mixer Palette</span>
              </h3>

              <div className="flex justify-center gap-3">
                {[
                  { name: 'Red', color: 'bg-red-500 text-white', hex: '#ef4444' },
                  { name: 'Blue', color: 'bg-blue-500 text-white', hex: '#3b82f6' },
                  { name: 'Yellow', color: 'bg-amber-400 text-slate-900', hex: '#facc15' },
                ].map((btn) => (
                  <button
                    key={btn.name}
                    onClick={() => handleColorPick(btn.name)}
                    className={`px-4 py-3 rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 ${btn.color} ${
                      color1 === btn.name || color2 === btn.name ? 'ring-4 ring-purple-400 scale-105' : ''
                    }`}
                  >
                    {btn.name}
                  </button>
                ))}
              </div>

              {/* Mixing pot display */}
              <div className="bg-slate-100 rounded-2xl p-4 text-center border-2 border-dashed border-slate-300">
                <p className="text-xs font-bold text-slate-500 mb-2">Mixing Pot:</p>
                <div className="flex items-center justify-center gap-2 text-xl font-black">
                  <span>{color1 || 'Color 1'}</span>
                  <span>+</span>
                  <span>{color2 || 'Color 2'}</span>
                  <span>=</span>
                  {mixedColor ? (
                    <span className="px-3 py-1 rounded-xl text-white font-black" style={{ backgroundColor: mixedColor.hex }}>
                      {mixedColor.name} {mixedColor.emoji}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Select two colors</span>
                  )}
                </div>

                {mixedColor && (
                  <button
                    onClick={resetColorMixer}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-black bg-purple-600 text-white px-3 py-1.5 rounded-full shadow hover:bg-purple-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Mix Again</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. Specialized Interactive Piano & Melody */}
          {(game.id === 'game_piano' || game.id === 'game_rhythm') && (
            <div className="bg-white/90 text-slate-900 rounded-2xl p-4 shadow-lg border-2 border-white space-y-4">
              <h3 className="font-black text-center text-lg text-slate-800 flex items-center justify-center gap-2">
                <Music className="w-5 h-5 text-indigo-600" />
                <span>Interactive Piano & Sound Pad</span>
              </h3>

              <div className="grid grid-cols-7 gap-1.5 h-36">
                {[
                  { note: 'Do (C)', freq: 261.63, col: 'bg-rose-500' },
                  { note: 'Re (D)', freq: 293.66, col: 'bg-amber-500' },
                  { note: 'Mi (E)', freq: 329.63, col: 'bg-yellow-400' },
                  { note: 'Fa (F)', freq: 349.23, col: 'bg-emerald-500' },
                  { note: 'Sol (G)', freq: 392.00, col: 'bg-cyan-500' },
                  { note: 'La (A)', freq: 440.00, col: 'bg-blue-500' },
                  { note: 'Ti (B)', freq: 493.88, col: 'bg-purple-500' },
                ].map((k) => (
                  <button
                    key={k.note}
                    onClick={() => playPianoNote(k.note, k.freq)}
                    className={`${k.col} text-white rounded-xl font-black text-xs flex flex-col justify-end p-2 shadow-md hover:opacity-90 active:scale-95 transition-all ${
                      activeNote === k.note ? 'ring-4 ring-yellow-300 scale-95' : ''
                    }`}
                  >
                    <span>{k.note.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Specialized Interactive Coding Logic Runner */}
          {game.id === 'game_coding' && (
            <div className="bg-white/90 text-slate-900 rounded-2xl p-4 shadow-lg border-2 border-white space-y-4">
              <h3 className="font-black text-center text-lg text-slate-800 flex items-center justify-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <span>Robot Beep Maze Run</span>
              </h3>

              {/* 4x4 Grid */}
              <div className="grid grid-cols-4 gap-2 bg-slate-800 p-3 rounded-2xl max-w-[240px] mx-auto border-2 border-slate-700 shadow-inner">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const x = idx % 4;
                  const y = Math.floor(idx / 4);
                  const isRobot = robotPos.x === x && robotPos.y === y;
                  const isTarget = x === 3 && y === 3;

                  return (
                    <div
                      key={idx}
                      className={`h-12 rounded-xl flex items-center justify-center text-xl font-bold border ${
                        isRobot ? 'bg-amber-400 border-yellow-300 animate-bounce' : isTarget ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-700 border-slate-600'
                      }`}
                    >
                      {isRobot ? '🤖' : isTarget ? '🏁' : ''}
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => addCodeCommand('FORWARD')}
                  disabled={isRunningCode}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3 py-2 rounded-xl shadow"
                >
                  ⬆️ FORWARD
                </button>
                <button
                  onClick={() => addCodeCommand('RIGHT')}
                  disabled={isRunningCode}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3 py-2 rounded-xl shadow"
                >
                  ➡️ RIGHT
                </button>
                <button
                  onClick={runRobotCode}
                  disabled={isRunningCode || commands.length === 0}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow"
                >
                  ▶️ RUN CODE
                </button>
                <button
                  onClick={resetRobot}
                  disabled={isRunningCode}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl"
                >
                  🔄 RESET
                </button>
              </div>

              <div className="text-center text-xs font-bold text-slate-600">
                Commands Sequence: {commands.length > 0 ? commands.join(' → ') : 'None selected'}
              </div>
            </div>
          )}

          {/* 4. Default Interactive Quiz / Task Challenge for Other Games */}
          {!['game_colors', 'game_piano', 'game_rhythm', 'game_coding'].includes(game.id) && (
            <div className="bg-white/95 text-slate-900 rounded-3xl p-5 shadow-xl border-2 border-white/50 space-y-4">
              <div className="flex justify-between items-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                <span>Challenge {quizIdx + 1} of {challenges.length}</span>
                <span>Category: {game.category}</span>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 text-center border-2 border-amber-200">
                <h3 className="text-lg sm:text-xl font-black text-slate-800">{currentChallenge.prompt}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {currentChallenge.options.map((opt) => {
                  const isSel = selectedAnswer === opt;
                  let style = 'bg-slate-50 hover:bg-indigo-50 border-2 border-slate-200 text-slate-800';

                  if (isSel && isAnswerCorrect === true) {
                    style = 'bg-emerald-500 border-2 border-emerald-600 text-white animate-bounce';
                  } else if (isSel && isAnswerCorrect === false) {
                    style = 'bg-rose-500 border-2 border-rose-600 text-white animate-shake';
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswerSelect(opt)}
                      disabled={selectedAnswer !== null}
                      className={`p-4 rounded-2xl font-black text-base shadow-sm transition-all active:scale-95 text-center ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Complete Stage Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                soundFx.playRewardChime();
                setGameFinished(true);
                onCompleteScore(score + 30);
                confetti({ particleCount: 70, spread: 80 });
              }}
              className="bg-white text-slate-900 font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg hover:bg-amber-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Complete Challenge Round</span>
            </button>
          </div>
        </div>
      ) : (
        /* Victory Screen */
        <div className="text-center py-8 text-white">
          <div className="inline-block p-4 bg-yellow-300 rounded-full shadow-xl mb-4 animate-bounce">
            <Trophy className="w-14 h-14 text-amber-900" />
          </div>
          <h2 className="text-3xl font-black mb-2">{game.title} Master!</h2>
          <p className="text-white/90 font-bold mb-6">You scored {score} points in this educational challenge!</p>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <Star key={s} className="w-8 h-8 text-yellow-300 fill-yellow-300 animate-pulse" />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
                soundFx.playPop();
                setGameFinished(false);
                setQuizIdx(0);
                setScore(0);
                setSelectedAnswer(null);
                setIsAnswerCorrect(null);
              }}
              className="flex items-center justify-center gap-2 bg-white text-slate-900 font-extrabold text-sm px-6 py-3 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>Play Again</span>
            </button>
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 bg-black/40 hover:bg-black/60 text-white font-extrabold text-sm px-6 py-3 rounded-2xl shadow-lg border border-white/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>All 20 Mini-Games</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
