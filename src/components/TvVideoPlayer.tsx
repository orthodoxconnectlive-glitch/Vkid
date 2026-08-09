import React, { useState } from 'react';
import { AlertTriangle, Play, RefreshCw, Film } from 'lucide-react';

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

  // Check if mediaUrl is an embed iframe link or direct HTML5 video stream
  const isEmbedUrl =
    mediaUrl.includes('youtube.com/embed/') ||
    mediaUrl.includes('vimeo.com/video/') ||
    mediaUrl.includes('mediadelivery.net/embed/') ||
    mediaUrl.includes('player.vimeo.com');

  if (isEmbedUrl) {
    // Append playsinline parameter if YouTube
    let finalEmbedUrl = mediaUrl;
    if (mediaUrl.includes('youtube.com') && !mediaUrl.includes('playsinline=')) {
      finalEmbedUrl += mediaUrl.includes('?') ? '&playsinline=1' : '?playsinline=1';
    }

    return (
      <div className={`relative bg-black rounded-2xl overflow-hidden ${className}`}>
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
      </div>
    );
  }

  // Native HTML5 <video> player for direct video streams/uploads (MP4, WebM, Supabase, Cloudinary)
  return (
    <div className={`relative bg-black rounded-2xl overflow-hidden flex items-center justify-center ${className}`}>
      {hasError ? (
        <div className="p-6 text-center text-white space-y-3 bg-slate-900/90 w-full h-full flex flex-col items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h4 className="font-extrabold text-sm sm:text-base">Video Playback Notice</h4>
          <p className="text-xs text-slate-300 max-w-md font-medium leading-relaxed">
            Your Smart TV browser codec experienced a loading delay or format compatibility issue with this video stream.
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
          {/* Specific MIME types for Smart TV H.264/AAC compatibility */}
          <source src={mediaUrl} type="video/mp4; codecs='avc1.42E01E, mp4a.40.2'" />
          <source src={mediaUrl} type="video/mp4" />
          <source src={mediaUrl} type="video/webm" />
          <source src={mediaUrl} />
          <div className="p-6 text-center text-white">
            <p className="text-xs font-bold">Your Smart TV browser does not support HTML5 video tag.</p>
          </div>
        </video>
      )}
    </div>
  );
};
