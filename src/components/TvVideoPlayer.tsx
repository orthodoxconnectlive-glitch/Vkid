import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Film, ExternalLink } from 'lucide-react';
import { parseExternalVideoUrl } from '../utils/mediaUtils';

interface TvVideoPlayerProps {
  mediaUrl: string;
  title: string;
  posterUrl?: string;
  className?: string;
  onOpenExternal?: () => void;
}

export const TvVideoPlayer: React.FC<TvVideoPlayerProps> = ({
  mediaUrl,
  title,
  posterUrl,
  className = 'w-full h-full',
  onOpenExternal,
}) => {
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);

  if (!mediaUrl) {
    return (
      <div className="w-full h-full min-h-[220px] bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center rounded-2xl">
        <Film className="w-12 h-12 text-slate-600 mb-2 animate-pulse" />
        <p className="text-sm font-bold text-slate-300">Video URL not specified</p>
      </div>
    );
  }

  const parsed = parseExternalVideoUrl(mediaUrl);

  // Check if mediaUrl is an embed iframe link or YouTube/Vimeo external link
  const isEmbed =
    parsed.provider === 'youtube' ||
    parsed.provider === 'vimeo' ||
    mediaUrl.includes('youtube.com/embed/') ||
    mediaUrl.includes('youtube-nocookie.com/embed/') ||
    mediaUrl.includes('vimeo.com/video/') ||
    mediaUrl.includes('mediadelivery.net/embed/') ||
    mediaUrl.includes('player.vimeo.com');

  if (isEmbed) {
    let finalEmbedUrl = parsed.embedUrl || mediaUrl;

    // Convert standard youtube.com/embed to youtube-nocookie.com/embed
    if (finalEmbedUrl.includes('youtube.com/embed/')) {
      finalEmbedUrl = finalEmbedUrl.replace('youtube.com/embed/', 'youtube-nocookie.com/embed/');
    }

    // Enforce YouTube safety query parameters
    if (finalEmbedUrl.includes('youtube-nocookie.com') || finalEmbedUrl.includes('youtube.com')) {
      if (!finalEmbedUrl.includes('rel=')) {
        finalEmbedUrl += finalEmbedUrl.includes('?') ? '&rel=0' : '?rel=0';
      }
      if (!finalEmbedUrl.includes('modestbranding=')) {
        finalEmbedUrl += '&modestbranding=1';
      }
      if (!finalEmbedUrl.includes('disablekb=')) {
        finalEmbedUrl += '&disablekb=1';
      }
      if (!finalEmbedUrl.includes('autoplay=')) {
        finalEmbedUrl += '&autoplay=1';
      }
      if (!finalEmbedUrl.includes('playsinline=')) {
        finalEmbedUrl += '&playsinline=1';
      }
    }

    const watchLink = parsed.externalWatchUrl || (parsed.videoId ? `https://www.youtube.com/watch?v=${parsed.videoId}` : mediaUrl);

    return (
      <div className={`relative bg-black rounded-2xl overflow-hidden group ${className}`}>
        <iframe
          key={key}
          src={finalEmbedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          // @ts-ignore
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          className="w-full h-full border-0 rounded-2xl"
        />

        {/* Quick External Fallback Overlay Bar */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2 z-10 shadow-lg">
          <span className="text-[10px] font-extrabold text-slate-300">Having playback issues?</span>
          <button
            type="button"
            onClick={() => {
              if (onOpenExternal) {
                onOpenExternal();
              } else {
                window.open(watchLink, '_blank', 'noopener,noreferrer');
              }
            }}
            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open in YouTube</span>
          </button>
        </div>
      </div>
    );
  }

  // Native HTML5 <video> player with full custom controls for direct video streams/uploads (MP4, WebM, Supabase)
  return (
    <div className={`relative bg-black rounded-2xl overflow-hidden flex items-center justify-center ${className}`}>
      {hasError ? (
        <div className="p-6 text-center text-white space-y-3 bg-slate-900/90 w-full h-full flex flex-col items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h4 className="font-extrabold text-sm sm:text-base">Video Playback Notice</h4>
          <p className="text-xs text-slate-300 max-w-md font-medium leading-relaxed">
            Your Smart TV or web browser experienced a loading delay with this video stream.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                setHasError(false);
                setKey((prev) => prev + 1);
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer focus:ring-4 focus:ring-white"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Stream</span>
            </button>
            <button
              onClick={() => {
                if (onOpenExternal) {
                  onOpenExternal();
                } else {
                  window.open(mediaUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl border border-slate-600 shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Direct Link</span>
            </button>
          </div>
        </div>
      ) : (
        <video
          key={key}
          controls
          autoPlay
          playsInline
          // @ts-ignore
          webkit-playsinline="true"
          preload="metadata"
          poster={posterUrl}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400"
        >
          {/* Specific MIME types for Smart TV H.264/AAC compatibility */}
          <source src={mediaUrl} type="video/mp4; codecs='avc1.42E01E, mp4a.40.2'" />
          <source src={mediaUrl} type="video/mp4" />
          <source src={mediaUrl} type="video/webm" />
          <source src={mediaUrl} />
          <div className="p-6 text-center text-white">
            <p className="text-xs font-bold">Your browser does not support HTML5 video tag.</p>
          </div>
        </video>
      )}
    </div>
  );
};
