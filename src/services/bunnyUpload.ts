import { supabase } from '../lib/supabase';
import { MediaItem } from '../types';

export interface BunnyUploadResult {
  guid: string;
  videoUrl: string;
  thumbnailUrl: string;
  mediaItem?: MediaItem;
}

export function isBunnyConfigured(): boolean {
  const apiKey = import.meta.env.VITE_BUNNY_API_KEY;
  const libraryId = import.meta.env.VITE_BUNNY_LIBRARY_ID;
  return Boolean(apiKey && libraryId && apiKey.trim() !== '' && libraryId.trim() !== '');
}

/**
 * Uploads a video file directly to Bunny Stream CDN.
 * Step 1: Create Video Entry -> returns guid
 * Step 2: Upload Binary Video File to Bunny
 * Constructs iframe streaming embed URL and CDN thumbnail URL.
 */
export async function uploadVideoToBunnyStream(
  videoFile: File,
  title: string,
  onProgress?: (progress: number) => void
): Promise<BunnyUploadResult> {
  const apiKey = import.meta.env.VITE_BUNNY_API_KEY;
  const libraryId = import.meta.env.VITE_BUNNY_LIBRARY_ID;
  const cdnHostname = import.meta.env.VITE_BUNNY_STREAM_CDN || '';

  if (!apiKey || !libraryId) {
    throw new Error('Bunny Stream credentials (VITE_BUNNY_API_KEY, VITE_BUNNY_LIBRARY_ID) are missing.');
  }

  const cleanTitle = title || videoFile.name || 'Untitled Video';

  if (onProgress) onProgress(10);

  // Step 1: Create Video Entry in Bunny Stream
  const createRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
    method: 'POST',
    headers: {
      'AccessKey': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: cleanTitle }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create video entry on Bunny Stream: ${createRes.status} ${errorText}`);
  }

  const createData = await createRes.json();
  const guid = createData.guid;

  if (!guid) {
    throw new Error('Bunny Stream did not return a valid video GUID.');
  }

  if (onProgress) onProgress(35);

  // Step 2: Upload Binary Video File
  const uploadRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${guid}`, {
    method: 'PUT',
    headers: {
      'AccessKey': apiKey,
      'Content-Type': 'application/octet-stream',
    },
    body: videoFile,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Failed to upload binary file to Bunny Stream: ${uploadRes.status} ${errorText}`);
  }

  if (onProgress) onProgress(90);

  // Step 3: Construct persistent URLs
  const videoUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}?autoplay=true&loop=false`;
  
  const cleanCdn = cdnHostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const thumbnailUrl = cleanCdn
    ? `https://${cleanCdn}/${guid}/thumbnail.jpg`
    : `https://iframe.mediadelivery.net/thumbnail/${libraryId}/${guid}/thumbnail.jpg`;

  if (onProgress) onProgress(100);

  return {
    guid,
    videoUrl,
    thumbnailUrl,
  };
}

/**
 * Saves Bunny Stream video entry into Supabase database table if configured.
 */
export async function saveBunnyVideoToSupabase(mediaItem: Partial<MediaItem>): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl || !supabase) {
    console.warn('Supabase URL not configured; skipping Supabase DB persist.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('media_items')
      .insert([
        {
          id: mediaItem.id || `bunny_${Date.now()}`,
          title: mediaItem.title,
          description: mediaItem.description || '',
          media_url: mediaItem.mediaUrl,
          thumbnail_url: mediaItem.thumbnailUrl,
          type: mediaItem.type || 'video',
          category: mediaItem.category || 'General',
          target_age_group: mediaItem.targetAgeGroup || ['3-5', '6-8'],
          duration: mediaItem.duration || '0:00',
          provider: 'direct',
          status: 'approved',
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.warn('Supabase insert warning for Bunny video:', error.message);
    }
    return data;
  } catch (err) {
    console.warn('Error saving Bunny video to Supabase:', err);
    return null;
  }
}
