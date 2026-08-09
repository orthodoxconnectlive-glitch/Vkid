import React, { useState } from 'react';
import { Play, Volume2, VolumeX, Eye, Radio, Sparkles } from 'lucide-react';

interface BunnyPlayerProps {
  videoUrl?: string;
  posterUrl?: string;
  title?: string;
  isLive?: boolean;
  viewerCount?: number;
  className?: string;
  autoplay?: boolean;
}

export const BunnyPlayer: React.FC<BunnyPlayerProps> = ({
  videoUrl,
  posterUrl,
  title,
  isLive = false,
  viewerCount = 142,
  className = '',
  autoplay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(autoplay);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasBlessingRequested, setHasBlessingRequested] = useState<boolean>(false);

  // Bunny Stream CDN Library ID: 713265
  const bunnyLibraryId = '713265';

  // If videoUrl is a Bunny Stream video GUID or direct URL
  const isBunnyEmbed = videoUrl?.includes('bunnycdn.com') || videoUrl?.includes('iframe.mediadelivery.net');

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-stone-900 border border-amber-900/40 shadow-xl group ${className}`}>
      {/* Live Badge and Viewer Count */}
      {isLive && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold tracking-wide uppercase shadow-lg animate-pulse">
            <Radio className="w-3.5 h-3.5 animate-spin" /> LIVE PARISH BROADCAST
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-amber-200 text-xs font-medium border border-amber-500/30">
            <Eye className="w-3.5 h-3.5 text-amber-400" /> {viewerCount} Viewers
          </span>
        </div>
      )}

      {/* Video Content */}
      {isBunnyEmbed && videoUrl ? (
        <iframe
          src={videoUrl}
          loading="lazy"
          className="w-full aspect-video border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          title={title || 'Bunny Stream Video'}
        />
      ) : videoUrl ? (
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            src={videoUrl}
            poster={posterUrl}
            controls
            autoPlay={autoplay}
            muted={isMuted}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="relative aspect-video bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900/80 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 shadow-inner">
            <Radio className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <h4 className="text-amber-100 font-serif font-bold text-lg mb-1">
            {title || 'Holy Trinity Cathedral Divine Liturgy'}
          </h4>
          <p className="text-stone-400 text-xs max-w-md">
            Streaming powered by Bunny Stream CDN (Library #{bunnyLibraryId}). High quality HLS stream for Orthodox worship.
          </p>

          {!isPlaying ? (
            <button
              onClick={() => setIsPlaying(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-bold text-sm flex items-center gap-2 shadow-lg transition-all transform hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Watch Stream
            </button>
          ) : (
            <div className="mt-4 w-full aspect-video rounded-xl bg-black overflow-hidden relative">
              <iframe
                src={`https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/preview-stream`}
                className="w-full h-full border-0"
                allow="autoplay"
                title="Bunny Stream Live Feed"
              />
            </div>
          )}
        </div>
      )}

      {/* Priest Blessing Request Bar */}
      {isLive && (
        <div className="p-3 bg-stone-950/90 border-t border-amber-900/40 flex items-center justify-between text-xs">
          <span className="text-amber-200/90 font-serif flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Ask for priest blessing during divine service
          </span>
          <button
            onClick={() => setHasBlessingRequested(!hasBlessingRequested)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              hasBlessingRequested
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/20'
            }`}
          >
            {hasBlessingRequested ? '✓ Blessing Requested' : '🙏 Request Blessing'}
          </button>
        </div>
      )}
    </div>
  );
};
