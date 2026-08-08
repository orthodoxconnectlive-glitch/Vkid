import React from 'react';
import { Lock, Sun, Clock } from 'lucide-react';
import { soundFx, speakText } from '../utils/soundAndTTS';

interface ScreenTimeLockOverlayProps {
  onUnlockClick: () => void;
}

export const ScreenTimeLockOverlay: React.FC<ScreenTimeLockOverlayProps> = ({ onUnlockClick }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-600 z-50 flex items-center justify-center p-6 text-white text-center">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full border-4 border-white/30 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-yellow-300 text-amber-900 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
          <Sun className="w-14 h-14" />
        </div>

        <div>
          <h2 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Break Time! 🌳</h2>
          <p className="text-sm sm:text-base font-bold text-amber-100 leading-relaxed">
            Great job learning today! Time to rest your eyes, stretch, drink water, or play outside.
          </p>
        </div>

        <div className="p-4 bg-black/20 rounded-2xl flex items-center justify-center gap-2 border border-white/10">
          <Clock className="w-5 h-5 text-yellow-300" />
          <span className="text-xs font-bold text-white">Daily Screen Limit Reached for Today</span>
        </div>

        <button
          onClick={() => {
            soundFx.playPop();
            speakText('Ask a parent to unlock more screen time');
            onUnlockClick();
          }}
          className="w-full bg-white hover:bg-amber-50 text-amber-950 font-black text-base py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Lock className="w-5 h-5 text-rose-500" />
          <span>Parents: Unlock / Extend Time</span>
        </button>
      </div>
    </div>
  );
};
