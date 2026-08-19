import React, { useState } from 'react';
import { MediaItem } from '../types';
import { X, ExternalLink, Sparkles, PlayCircle, Play, Headphones, AlertCircle } from 'lucide-react';
import { TvVideoPlayer } from './TvVideoPlayer';
import { soundFx } from '../utils/soundAndTTS';
import { parseExternalVideoUrl } from '../utils/mediaUtils';
import { useTvNavigation } from '../hooks/useTvNavigation';

interface VideoPlayerModalProps {
  media: MediaItem;
  relatedMedia?: MediaItem[];
  onSelectRelated?: (item: MediaItem) => void;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  media,
  relatedMedia = [],
  onSelectRelated,
  onClose,
}) => {
  const [audioError, setAudioError] = useState(false);

  // TV Remote Navigation listener for modal close on Back / Return key
  useTvNavigation({
    onBack: onClose,
    enabled: !!media,
  });

  if (!media) return null;

  const parsed = parseExternalVideoUrl(media.mediaUrl);
  const targetWatchUrl = parsed.externalWatchUrl || media.mediaUrl;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full border-4 border-amber-300 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Sparkles className="w-5 h-5 text-amber-950 shrink-0" />
            <h3 className="font-black text-sm sm:text-base truncate">{media.title}</h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              tabIndex={0}
              onClick={() => window.open(targetWatchUrl, '_blank', 'noopener,noreferrer')}
              className="hidden sm:flex items-center gap-1.5 bg-white/30 hover:bg-white/50 text-slate-900 font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm border border-black/10 focus:outline-none focus:ring-2 focus:ring-slate-900"
              title="Open video directly in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Watch External Link</span>
            </button>

            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-slate-900 transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-900"
              title="Close video player (TV Remote Back / Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 bg-slate-950 overflow-y-auto flex-1 space-y-4">
          {media.type === 'video' || media.type === 'rhyme' ? (
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
              <TvVideoPlayer
                mediaUrl={media.mediaUrl}
                title={media.title}
                posterUrl={media.thumbnailUrl}
                storageUrl={media.storageUrl}
                publicUrl={media.publicUrl}
                onOpenExternal={() => window.open(targetWatchUrl, '_blank')}
              />
            </div>
          ) : audioError || (media.mediaUrl.startsWith('blob:') && audioError) ? (
            <div className="py-8 text-center text-white space-y-3 bg-slate-900/95 rounded-2xl border-2 border-rose-500/30 p-6 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
              <h4 className="font-extrabold text-base text-rose-300">Video Source Expired</h4>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Video source expired. Please re-upload or select another video.
              </p>
            </div>
          ) : (
            <div className="py-8 text-center text-white space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg animate-pulse">
                <Headphones className="w-12 h-12 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-black mb-1">{media.title}</h4>
                <p className="text-xs text-indigo-300 font-medium">{media.description}</p>
              </div>
              <div className="bg-slate-800/80 rounded-2xl p-4 max-w-md mx-auto border border-indigo-500/30">
                <audio controls autoPlay src={media.mediaUrl} className="w-full" onError={() => setAudioError(true)} />
              </div>
            </div>
          )}

          {/* Related Educational Videos List */}
          {relatedMedia.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-amber-400" />
                  <span>Next Safe Videos for Kids</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-bold">Select with TV Remote to play next</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {relatedMedia.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    tabIndex={0}
                    onClick={() => {
                      soundFx.playPop();
                      if (onSelectRelated) onSelectRelated(item);
                    }}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-400 focus:outline-none p-2 rounded-xl text-left transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-950 mb-1.5">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-amber-400 fill-current" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-white px-1 rounded font-bold">
                        {item.duration}
                      </span>
                    </div>
                    <h5 className="text-[11px] font-bold text-white leading-tight line-clamp-1 group-hover:text-amber-300">
                      {item.title}
                    </h5>
                    <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{item.category}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
