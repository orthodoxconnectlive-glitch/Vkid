import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, Film, ExternalLink, Play } from 'lucide-react';
import { parseExternalVideoUrl } from '../utils/mediaUtils';
import { getBunnyPlaybackUrls } from '../services/bunnyUpload';

interface TvVideoPlayerProps {
  mediaUrl: string;
  title: string;
  posterUrl?: string;
  storageUrl?: string;
  publicUrl?: string;
  bunnyVideoId?: string;
  bunny_video_id?: string;
  className?: string;
  onOpenExternal?: () => void;
}

/**
 * Checks if a given video URL is an external embed (YouTube / Vimeo / Bunny Stream iframe)
 */
function isExternalIframeUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  const lower = urlStr.toLowerCase().trim();
  return (
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('youtube-nocookie.com') ||
    lower.includes('vimeo.com') ||
    lower.includes('player.vimeo.com') ||
    lower.includes('iframe.mediadelivery.net') ||
    lower.includes('mediadelivery.net')
  );
}

const DEFAULT_FALLBACK_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const TvVideoPlayer: React.FC<TvVideoPlayerProps> = ({
  mediaUrl,
  title,
  posterUrl,
  storageUrl,
  publicUrl,
  bunnyVideoId,
  bunny_video_id,
  className = 'w-full h-full',
  onOpenExternal,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isBlobExpired, setIsBlobExpired] = useState(false);
  const [key, setKey] = useState(0);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(mediaUrl);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const effectiveBunnyId = bunnyVideoId || bunny_video_id;

  useEffect(() => {
    setHasError(false);
    setIsBlobExpired(false);
    setFallbackAttempted(false);
    setAutoplayBlocked(false);

    if (effectiveBunnyId) {
      const { embedUrl } = getBunnyPlaybackUrls(effectiveBunnyId);
      setActiveVideoUrl(embedUrl || mediaUrl);
      return;
    }

    if (mediaUrl && mediaUrl.startsWith('blob:')) {
      fetch(mediaUrl)
        .then((res) => {
          if (!res.ok) {
            const validFallback =
              storageUrl && !storageUrl.startsWith('blob:')
                ? storageUrl
                : publicUrl && !publicUrl.startsWith('blob:')
                ? publicUrl
                : DEFAULT_FALLBACK_VIDEO_URL;
            setActiveVideoUrl(validFallback);
          } else {
            setActiveVideoUrl(mediaUrl);
          }
        })
        .catch(() => {
          const validFallback =
            storageUrl && !storageUrl.startsWith('blob:')
              ? storageUrl
              : publicUrl && !publicUrl.startsWith('blob:')
              ? publicUrl
              : DEFAULT_FALLBACK_VIDEO_URL;
          setActiveVideoUrl(validFallback);
        });
    } else {
      setActiveVideoUrl(mediaUrl);
    }
  }, [mediaUrl, storageUrl, publicUrl, effectiveBunnyId]);

  // Handle HTML5 video autoplay safety on Smart TVs
  useEffect(() => {
    if (videoRef.current && activeVideoUrl && !isExternalIframeUrl(activeVideoUrl)) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAutoplayBlocked(false);
          })
          .catch((err) => {
            if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
              setAutoplayBlocked(true);
            }
          });
      }
    }
  }, [activeVideoUrl, key]);

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setAutoplayBlocked(false);
        })
        .catch((e) => {
          console.warn('Manual playback trigger notice:', e);
        });
    }
  };

  if (!activeVideoUrl && !mediaUrl) {
    return (
      <div className="w-full h-full min-h-[220px] bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center rounded-2xl">
        <Film className="w-12 h-12 text-slate-600 mb-2 animate-pulse" />
        <p className="text-sm font-bold text-slate-300">Video URL not specified</p>
      </div>
    );
  }

  const urlToCheck = activeVideoUrl || mediaUrl;

  // 1. Bunny Stream Direct Iframe Playback
  if (
    urlToCheck.includes('iframe.mediadelivery.net') ||
    urlToCheck.includes('mediadelivery.net') ||
    effectiveBunnyId
  ) {
    const finalEmbedSrc = effectiveBunnyId
      ? getBunnyPlaybackUrls(effectiveBunnyId).embedUrl
      : urlToCheck;

    return (
      <div className={`relative bg-black rounded-2xl overflow-hidden group w-full h-full min-h-[220px] aspect-video flex items-center justify-center ${className}`}>
        <iframe
          key={key}
          src={finalEmbedSrc}
          title={title}
          loading="lazy"
          className="w-full h-full rounded-2xl border-0 aspect-video object-cover"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
        />
      </div>
    );
  }

  const isEmbed = isExternalIframeUrl(urlToCheck);

  // 2. YouTube / Vimeo External Iframe Embed
  if (isEmbed) {
    const parsed = parseExternalVideoUrl(urlToCheck);
    let finalEmbedUrl = parsed.embedUrl || urlToCheck;

    if (finalEmbedUrl.includes('youtube.com/embed/')) {
      finalEmbedUrl = finalEmbedUrl.replace('youtube.com/embed/', 'youtube-nocookie.com/embed/');
    }

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

    const watchLink =
      parsed.externalWatchUrl ||
      (parsed.videoId ? `https://www.youtube.com/watch?v=${parsed.videoId}` : urlToCheck);

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

        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2 z-10 shadow-lg">
          <span className="text-[10px] font-extrabold text-slate-300">Playback issue?</span>
          <button
            type="button"
            tabIndex={0}
            onClick={() => {
              if (onOpenExternal) {
                onOpenExternal();
              } else {
                window.open(watchLink, '_blank', 'noopener,noreferrer');
              }
            }}
            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow focus:outline-none focus:ring-2 focus:ring-white"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open in YouTube</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Direct Video File / HLS Stream
  const handleNativeVideoError = () => {
    console.warn('HTML5 Video Error encountered for stream:', activeVideoUrl);

    const fallbackUrl =
      storageUrl && !storageUrl.startsWith('blob:')
        ? storageUrl
        : publicUrl && !publicUrl.startsWith('blob:')
        ? publicUrl
        : DEFAULT_FALLBACK_VIDEO_URL;

    if (!fallbackAttempted && fallbackUrl !== activeVideoUrl) {
      console.warn('Attempting playback fallback to working stream:', fallbackUrl);
      setFallbackAttempted(true);
      setActiveVideoUrl(fallbackUrl);
      setHasError(false);
      setIsBlobExpired(false);
      setKey((prev) => prev + 1);
      return;
    }

    if (activeVideoUrl.startsWith('blob:') || mediaUrl.startsWith('blob:')) {
      setIsBlobExpired(true);
    }
    setHasError(true);
  };

  return (
    <div className={`relative bg-black rounded-2xl overflow-hidden flex items-center justify-center ${className}`}>
      {hasError ? (
        isBlobExpired || activeVideoUrl.startsWith('blob:') ? (
          <div className="p-6 text-center text-white space-y-3 bg-slate-900/95 w-full h-full flex flex-col items-center justify-center rounded-2xl border-2 border-rose-500/30 min-h-[220px]">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h4 className="font-extrabold text-sm sm:text-base text-rose-300">Video Source Expired</h4>
            <p className="text-xs text-slate-300 max-w-md font-medium leading-relaxed">
              Video source expired. Please select another video.
            </p>
          </div>
        ) : (
          <div className="p-6 text-center text-white space-y-3 bg-slate-900/90 w-full h-full flex flex-col items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h4 className="font-extrabold text-sm sm:text-base">Video Playback Notice</h4>
            <p className="text-xs text-slate-300 max-w-md font-medium leading-relaxed">
              Your browser or device experienced a loading error with this video stream.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  setHasError(false);
                  setFallbackAttempted(false);
                  setActiveVideoUrl(mediaUrl);
                  setKey((prev) => prev + 1);
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Stream</span>
              </button>
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  if (onOpenExternal) {
                    onOpenExternal();
                  } else {
                    window.open(activeVideoUrl || mediaUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl border border-slate-600 shadow transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Direct Link</span>
              </button>
            </div>
          </div>
        )
      ) : (
        <>
          <video
            ref={videoRef}
            key={key}
            src={activeVideoUrl}
            controls
            autoPlay
            playsInline
            // @ts-ignore
            webkit-playsinline="true"
            controlsList="nodownload"
            poster={posterUrl}
            tabIndex={0}
            className="w-full h-full object-contain rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-400"
            onError={handleNativeVideoError}
          >
            <source src={activeVideoUrl} type="video/mp4" />
            <source src={activeVideoUrl} type="video/webm" />
            <source src={activeVideoUrl} type="application/x-mpegURL" />
            Your browser does not support standard HTML5 video playback.
          </video>

          {autoplayBlocked && (
            <div
              tabIndex={0}
              role="button"
              onClick={handleManualPlay}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.keyCode === 13 || e.key === ' ') {
                  e.preventDefault();
                  handleManualPlay();
                }
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-20 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400 rounded-xl group"
            >
              <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-110 group-focus:scale-110 transition-transform mb-2">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <span className="text-white font-extrabold text-xs bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/20">
                Press OK / Enter to Play
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
