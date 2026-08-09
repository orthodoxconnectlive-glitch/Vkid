import React, { useState } from 'react';
import { X, Radio, Camera, Video, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface GoLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStream: (streamData: { title: string; parish: string; videoUrl: string }) => void;
}

export const GoLiveModal: React.FC<GoLiveModalProps> = ({
  isOpen,
  onClose,
  onStartStream,
}) => {
  const { profile } = useAuth();
  const { t } = useTheme();

  const [title, setTitle] = useState('Divine Liturgy & Homily');
  const [parish, setParish] = useState(profile?.parish || 'St. George Cathedral');
  const [streamUrl, setStreamUrl] = useState(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  const [cameraActive, setCameraActive] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartStream({
      title,
      parish,
      videoUrl: streamUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-950 border border-amber-600/40 rounded-2xl p-6 shadow-2xl text-stone-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-amber-300 hover:bg-stone-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-amber-900/40">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-pulse">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-amber-100">
              Start Live Parish Broadcast
            </h3>
            <p className="text-xs text-stone-400">
              Broadcast Divine Liturgy, Vespers, or Spiritual Homilies via Bunny Stream
            </p>
          </div>
        </div>

        {/* Camera Preview Frame */}
        <div className="relative aspect-video rounded-xl bg-stone-900 border border-amber-900/40 overflow-hidden flex flex-col items-center justify-center mb-6 shadow-inner">
          {cameraActive ? (
            <div className="w-full h-full bg-gradient-to-br from-amber-950/60 via-stone-900 to-amber-900/40 flex flex-col items-center justify-center p-4 text-center">
              <Camera className="w-10 h-10 text-amber-400 mb-2 animate-bounce" />
              <p className="text-xs font-bold text-amber-200">
                Camera & Audio Feed Ready
              </p>
              <span className="text-[10px] text-stone-400 mt-1">
                Bunny Stream Library ID: #713265
              </span>
            </div>
          ) : (
            <p className="text-xs text-stone-500">Camera preview disabled</p>
          )}

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase">
              PREVIEW
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-amber-300 font-semibold mb-1">
              Broadcast Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Great Vespers & Feast Homily"
              className="w-full p-2.5 rounded-xl bg-stone-900 border border-amber-900/30 text-amber-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-amber-300 font-semibold mb-1">
              Host Parish / Monastery
            </label>
            <input
              type="text"
              required
              value={parish}
              onChange={(e) => setParish(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-900 border border-amber-900/30 text-amber-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-amber-300 font-semibold mb-1">
              Bunny Stream Stream Source / Media URL
            </label>
            <input
              type="text"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-900 border border-amber-900/30 text-amber-100 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Go Live Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
