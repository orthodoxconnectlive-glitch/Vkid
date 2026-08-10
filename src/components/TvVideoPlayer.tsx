import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Film } from 'lucide-react';

interface TvVideoPlayerProps {
  mediaUrl: string;
  title: string;
  posterUrl?: string;
  className?: string;
}

export const TvVideoPlayer: React.FC<TvVideoPlayerProps> = ({
  mediaUrl,
  title,
  posterUrl,
  className = 'w-full h-full',
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

  // Convert raw Bunny Stream URLs or Video GUIDs to official iframe embed format
  const getNormalizedUrl = (url: string): { isEmbed: boolean; formattedUrl: string } => {
    if (!url) return { isEmbed: false, formattedUrl: '' };

    // 1. YouTube & Vimeo
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let finalUrl = url;
      if (url.includes('watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        finalUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        finalUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      if (!finalUrl.includes('playsinline=')) {
        finalUrl += finalUrl.includes('?') ? '&playsinline=1' : '?playsinline=1';
      }
      return { isEmbed: true, formattedUrl: finalUrl };
    }

    if (url.includes('vimeo.com')) {
      return { isEmbed: true, formattedUrl: url };
    }

    // 2. Bunny Stream (iframe embed, mediadelivery.net, or bunnycdn.com)
    if (
      url.includes('mediadelivery.net') ||
      url.includes('bunnycdn.com') ||
      url.includes('bunny.net') ||
      url.includes('/embed/')
    ) {
      // If it's already an embed iframe URL, append autoplay/preload
      if (url.includes('/embed/')) {
        return { isEmbed: true, formattedUrl: url };
      }

      // Extract Bunny Video GUID (e.g. c3483883-78dc-48e8-b2af-5848ced3d5ea)
      const libraryId = import.meta.env.VITE_BUNNY_LIBRARY_ID || '723727';
      const guidMatch = url.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);

      if (guidMatch && guidMatch[0]) {
        const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${guidMatch[0]}?autoplay=true&loop=false&muted=false&preload=true`;
        return { isEmbed: true, formattedUrl: embedUrl };
      }
    }

    // 3. Fallback for direct MP4 / WebM files
    return { isEmbed: false, formattedUrl: url };
  };

  const { isEmbed, formattedUrl } = getNormalizedUrl(mediaUrl);

  // Render iFrame Player for Bunny Stream, YouTube, Vimeo
  if (isEmbed) {
    return (
      <div className={`relative bg-black rounded-2xl overflow-hidden ${className}`}>
        <iframe
          key={key}
          src={formattedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          // @ts-ignore
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          className="w-full h-full border-0 rounded-2xl"
        />
      </div>
    );
  }

  // Native HTML5 <video> player fallback for direct MP4 file streams
  return (
    <div className={`relative bg-black rounded-2xl overflow-hidden flex items-center justify-center ${className}`}>
      {hasError ? (
        <div className="p-6 text-center text-white space-y-3 bg-slate-900/90 w-full h-full flex flex-col items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h4 className="font-extrabold text-sm sm:text-base">Video Playback Notice</h4>
          <p className="text-xs text-slate-300 max-w-md font-medium leading-relaxed">
            Unable to stream this video file directly.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setKey((prev) => prev + 1);
            }}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer focus:ring-4 focus:ring-white"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Video Stream</span>
          </button>
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
          <source src={formattedUrl} type="video/mp4" />
          <source src={formattedUrl} type="video/webm" />
          <source src={formattedUrl} />
          <div className="p-6 text-center text-white">
            <p className="text-xs font-bold">Your browser does not support HTML5 video playback.</p>
          </div>
        </video>
      )}
    </div>
  );
};
