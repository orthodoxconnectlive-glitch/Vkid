import { supabase } from '../lib/supabase';
import { MediaItem, AgeGroup } from '../types';

export interface BunnyUploadResult {
  guid: string;
  videoUrl: string;
  embedUrl: string;
  hlsUrl: string;
  thumbnailUrl: string;
  mediaItem?: MediaItem;
}

/**
 * Returns whether Bunny Stream environment variables are configured.
 */
export function isBunnyConfigured(): boolean {
  const apiKey = import.meta.env.VITE_BUNNY_API_KEY;
  const libraryId = import.meta.env.VITE_BUNNY_LIBRARY_ID;
  return Boolean(apiKey && libraryId && apiKey.trim() !== '' && libraryId.trim() !== '');
}

export function getBunnyLibraryId(): string {
  return (import.meta.env.VITE_BUNNY_LIBRARY_ID || '').trim();
}

export function getBunnyApiKey(): string {
  return (import.meta.env.VITE_BUNNY_API_KEY || '').trim();
}

export function getBunnyStreamCdn(): string {
  const raw = (import.meta.env.VITE_BUNNY_STREAM_CDN || '').trim();
  return raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

/**
 * Helper to construct direct Bunny Stream playback & thumbnail URLs
 */
export function getBunnyPlaybackUrls(bunnyVideoId: string, customLibraryId?: string) {
  const libraryId = customLibraryId || getBunnyLibraryId();
  const cdnHostname = getBunnyStreamCdn();

  const embedUrl = libraryId
    ? `https://iframe.mediadelivery.net/embed/${libraryId}/${bunnyVideoId}?autoplay=true&loop=false`
    : `https://iframe.mediadelivery.net/embed/${bunnyVideoId}`;

  const hlsUrl = cdnHostname
    ? `https://${cdnHostname}/${bunnyVideoId}/playlist.m3u8`
    : embedUrl;

  const thumbnailUrl = cdnHostname
    ? `https://${cdnHostname}/${bunnyVideoId}/thumbnail.jpg`
    : libraryId
    ? `https://iframe.mediadelivery.net/thumbnail/${libraryId}/${bunnyVideoId}/thumbnail.jpg`
    : `https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80`;

  return {
    embedUrl,
    hlsUrl,
    thumbnailUrl,
    // By default, embedUrl gives universal iframe playback across all browsers & smart TVs
    playerUrl: embedUrl,
  };
}

/**
 * 1. Direct Bunny Upload:
 * - Creates video object directly via Bunny Stream API:
 *   POST https://video.bunnycdn.com/library/{libraryId}/videos
 *   Header: AccessKey: {apiKey}
 * - Uploads raw binary video file directly to Bunny:
 *   PUT https://video.bunnycdn.com/library/{libraryId}/videos/{videoId}
 * - Bypasses Supabase Storage buckets completely for video media.
 */
export async function uploadVideoToBunnyStream(
  videoFile: File | Blob,
  title: string,
  onProgress?: (progress: number) => void
): Promise<BunnyUploadResult> {
  const libraryId = getBunnyLibraryId();
  const apiKey = getBunnyApiKey();
  const cdnHostname = getBunnyStreamCdn();

  if (!libraryId || !apiKey) {
    throw new Error(
      'Bunny Stream credentials (VITE_BUNNY_LIBRARY_ID, VITE_BUNNY_API_KEY) are not configured. Please check your environment variables.'
    );
  }

  const cleanTitle = (title || (videoFile as File).name || 'Kid Educational Video').trim();

  if (onProgress) onProgress(5);

  // Step 1: Create Video Object via Bunny Stream API
  const createUrl = `https://video.bunnycdn.com/library/${libraryId}/videos`;
  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'AccessKey': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      title: cleanTitle,
    }),
  });

  if (!createResponse.ok) {
    const errorBody = await createResponse.text().catch(() => '');
    throw new Error(
      `Bunny Stream video creation failed (${createResponse.status}): ${errorBody || createResponse.statusText}`
    );
  }

  const createData = await createResponse.json();
  const videoGuid: string = createData.guid || createData.id;

  if (!videoGuid) {
    throw new Error('Bunny Stream did not return a valid video GUID.');
  }

  if (onProgress) onProgress(15);

  // Step 2: Upload Raw Binary Video File directly to Bunny Stream
  const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoGuid}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('AccessKey', apiKey);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        // Map upload byte progress from 15% to 95%
        const percentComplete = 15 + Math.round((event.loaded / event.total) * 80);
        onProgress(Math.min(95, percentComplete));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve();
      } else {
        reject(
          new Error(
            `Bunny Stream binary upload failed (${xhr.status}): ${xhr.responseText || xhr.statusText}`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred while uploading binary video stream to Bunny CDN.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Bunny Stream upload timed out. Please check your network connection.'));
    };

    xhr.send(videoFile);
  });

  // Step 3: Construct Playback & CDN URLs
  const { embedUrl, hlsUrl, thumbnailUrl, playerUrl } = getBunnyPlaybackUrls(videoGuid, libraryId);

  return {
    guid: videoGuid,
    videoUrl: playerUrl,
    embedUrl,
    hlsUrl,
    thumbnailUrl,
  };
}

export interface BunnyVideoMetadataPayload {
  id?: string;
  title: string;
  description?: string;
  age_group?: string | AgeGroup[] | AgeGroup;
  category?: string;
  bunny_video_id: string;
  thumbnail_url?: string;
  is_public?: boolean;
  duration?: string;
  status?: string;
  uploaded_by?: string;
}

/**
 * 2. Lightweight Supabase Metadata:
 * After Bunny confirms upload success, insert only the lightweight text metadata row
 * into Supabase's `videos` table:
 * - id, title, description, age_group, category, bunny_video_id, thumbnail_url, is_public: true
 */
export async function saveBunnyVideoToSupabase(payload: BunnyVideoMetadataPayload): Promise<any> {
  const id = payload.id || `v_${payload.bunny_video_id || Date.now()}`;
  const libraryId = getBunnyLibraryId();
  const cdnHostname = getBunnyStreamCdn();

  const formattedAgeGroup = Array.isArray(payload.age_group)
    ? payload.age_group.join(',')
    : (payload.age_group as string) || '4-5';

  const defaultThumb = cdnHostname && payload.bunny_video_id
    ? `https://${cdnHostname}/${payload.bunny_video_id}/thumbnail.jpg`
    : libraryId && payload.bunny_video_id
    ? `https://iframe.mediadelivery.net/thumbnail/${libraryId}/${payload.bunny_video_id}/thumbnail.jpg`
    : 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';

  const thumbnailUrl = payload.thumbnail_url || defaultThumb;
  const embedUrl = libraryId && payload.bunny_video_id
    ? `https://iframe.mediadelivery.net/embed/${libraryId}/${payload.bunny_video_id}?autoplay=true&loop=false`
    : '';

  // Required lightweight row for Supabase's `videos` table
  const videosRow = {
    id,
    title: payload.title || 'Educational Video',
    description: payload.description || '',
    age_group: formattedAgeGroup,
    category: payload.category || 'Science & Discovery',
    bunny_video_id: payload.bunny_video_id,
    thumbnail_url: thumbnailUrl,
    is_public: payload.is_public !== undefined ? payload.is_public : true,
  };

  if (!supabase) {
    console.info('Supabase client not initialized; lightweight metadata row prepared locally:', videosRow);
    return videosRow;
  }

  try {
    // 1. Insert into Supabase `videos` table
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .upsert([videosRow], { onConflict: 'id' })
      .select();

    if (!videoError) {
      console.info('Successfully inserted lightweight metadata into Supabase `videos` table:', videoData);
      return videoData;
    } else {
      console.warn('Supabase `videos` table insert notice:', videoError.message);
    }
  } catch (err) {
    console.warn('Could not insert to `videos` table, attempting fallback:', err);
  }

  // 2. Compatibility fallback insert into `media_items` table if schema exists
  try {
    const mediaItemsRow = {
      id,
      title: videosRow.title,
      description: videosRow.description,
      media_url: embedUrl || (cdnHostname ? `https://${cdnHostname}/${payload.bunny_video_id}/playlist.m3u8` : ''),
      thumbnail_url: thumbnailUrl,
      category: videosRow.category,
      type: 'video',
      duration: payload.duration || '4:30',
      status: payload.status || 'approved',
      uploaded_by: payload.uploaded_by || 'parent@vkid.app',
      target_age_group: Array.isArray(payload.age_group) ? payload.age_group : [payload.age_group || '4-5'],
    };

    const { data: mediaData, error: mediaError } = await supabase
      .from('media_items')
      .upsert([mediaItemsRow], { onConflict: 'id' })
      .select();

    if (!mediaError) {
      return mediaData;
    }
  } catch (err) {
    console.warn('Fallback `media_items` insert notice:', err);
  }

  return videosRow;
}

/**
 * Queries Supabase `videos` table to fetch all Bunny Stream videos
 */
export async function fetchBunnyVideosFromSupabase(): Promise<MediaItem[]> {
  if (!supabase) return [];

  const libraryId = getBunnyLibraryId();
  const cdnHostname = getBunnyStreamCdn();

  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data
      .filter((row: any) => row.bunny_video_id || row.id)
      .map((row: any) => {
        const bunnyId = row.bunny_video_id || row.id;
        const { embedUrl, thumbnailUrl } = getBunnyPlaybackUrls(bunnyId, libraryId);

        // Parse target age groups
        let ages: AgeGroup[] = ['4-5'];
        if (Array.isArray(row.age_group)) {
          ages = row.age_group as AgeGroup[];
        } else if (typeof row.age_group === 'string') {
          const split = row.age_group.split(',').map((s: string) => s.trim()) as AgeGroup[];
          if (split.length > 0) ages = split;
        }

        return {
          id: row.id || `bunny_${bunnyId}`,
          title: row.title || 'Kids Video',
          description: row.description || '',
          type: 'video' as const,
          category: row.category || 'Science & Discovery',
          duration: row.duration || '4:30',
          mediaUrl: embedUrl,
          thumbnailUrl: row.thumbnail_url || thumbnailUrl,
          targetAgeGroup: ages,
          bunny_video_id: bunnyId,
          bunnyVideoId: bunnyId,
          is_public: row.is_public !== undefined ? !!row.is_public : true,
          status: 'approved' as const,
          createdAt: row.created_at || new Date().toISOString(),
          provider: 'direct' as const,
        };
      });
  } catch (err) {
    console.warn('Error fetching videos from Supabase `videos` table:', err);
    return [];
  }
}
