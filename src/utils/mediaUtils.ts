/**
 * Media Processing & Sanitization Utilities
 */

/**
 * Sanitizes ugly video filenames like "video f7fde1d3 3aa8 4db4..." into clean Title Case
 */
export function cleanFileNameToTitle(fileName: string): string {
  if (!fileName) return '';

  // Remove file extension
  let name = fileName.replace(/\.[^/.]+$/, '');

  // Strip standard UUID/GUID pattern: e.g. f7fde1d3-3aa8-4db4-a212-3832193231 or f7fde1d3 3aa8 4db4
  name = name.replace(/[a-f0-9]{8}[-_ ][a-f0-9]{4}[-_ ][a-f0-9]{4}[-_ ][a-f0-9]{4}[-_ ][a-f0-9]{12}/gi, '');
  
  // Strip isolated hex strings often found in GUID filenames
  name = name.replace(/\b[a-f0-9]{8}\b/gi, '');
  name = name.replace(/\b[a-f0-9]{4}\b/gi, '');

  // Strip common file prefix words
  name = name.replace(/\b(video|mov|mp4|webm|m4v|file|recording|media|vid|trim|uuid|guid)\b/gi, ' ');

  // Replace symbols with spaces
  name = name.replace(/[-_+.%20]/g, ' ');

  // Collapse consecutive spaces
  name = name.replace(/\s+/g, ' ').trim();

  // If leftover is empty or pure numbers, produce a friendly default title
  if (!name || /^\d+$/.test(name)) {
    return 'New Educational Story';
  }

  // Convert to Title Case
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Automatically extracts a video preview frame at timecode 00:00:01 using HTML5 Canvas
 */
export async function extractVideoFrameThumbnail(
  videoFile: File,
  seekTimeSeconds: number = 1.0
): Promise<{ file: File; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(videoFile);
    video.src = fileUrl;

    let seekAttempted = false;

    video.onloadedmetadata = () => {
      const targetTime = Math.min(seekTimeSeconds, video.duration > 0 ? video.duration / 2 : 0.5);
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      if (seekAttempted) return;
      seekAttempted = true;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(fileUrl);
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(fileUrl);
            if (blob) {
              const cleanTitle = cleanFileNameToTitle(videoFile.name)
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '_');
              const thumbFile = new File(
                [blob],
                `thumb_${cleanTitle || 'video'}_${Date.now()}.jpg`,
                { type: 'image/jpeg' }
              );
              resolve({ file: thumbFile, dataUrl });
            } else {
              reject(new Error('Failed to generate image blob from video canvas frame'));
            }
          },
          'image/jpeg',
          0.88
        );
      } catch (err) {
        URL.revokeObjectURL(fileUrl);
        reject(err);
      }
    };

    video.onerror = (err) => {
      URL.revokeObjectURL(fileUrl);
      reject(err || new Error('Video loading error during thumbnail extraction'));
    };
  });
}

export interface ParsedVideoResult {
  provider: 'youtube' | 'vimeo' | 'direct';
  embedUrl: string;
  thumbnailUrl: string;
  videoId?: string;
  externalWatchUrl?: string;
}

/**
 * Extracts YouTube/Vimeo Video ID and formats safe ad-free iframe embed URLs and thumbnail previews
 */
export function parseExternalVideoUrl(urlInput: string): ParsedVideoResult {
  const url = (urlInput || '').trim();

  // 1. Check YouTube patterns
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const ytMatch = url.match(ytRegExp);

  if (ytMatch && ytMatch[2] && ytMatch[2].length === 11) {
    const videoId = ytMatch[2];
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&disablekb=1&playsinline=1`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const externalWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    return {
      provider: 'youtube',
      embedUrl,
      thumbnailUrl,
      videoId,
      externalWatchUrl,
    };
  }

  // 2. Check Vimeo patterns
  const vimeoRegExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegExp);

  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
    const thumbnailUrl = `https://vumbnail.com/${videoId}.jpg`;
    const externalWatchUrl = `https://vimeo.com/${videoId}`;
    return {
      provider: 'vimeo',
      embedUrl,
      thumbnailUrl,
      videoId,
      externalWatchUrl,
    };
  }

  // 3. Fallback to Direct Stream
  return {
    provider: 'direct',
    embedUrl: url,
    thumbnailUrl: '',
    externalWatchUrl: url,
  };
}
