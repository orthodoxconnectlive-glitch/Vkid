import { MediaItem, AgeGroup } from '../types';
import { MEDIA_LIBRARY } from '../data/mockData';
import { supabase } from './supabase';
import {
  fetchBunnyVideosFromSupabase,
  saveBunnyVideoToSupabase,
  getBunnyPlaybackUrls,
} from '../services/bunnyUpload';

const LOCAL_STORAGE_KEY = 'vkid_custom_media_items_v2';

/**
 * Sanitizes a MediaItem by ensuring any temporary or expired blob: URLs
 * are replaced with persistent Bunny Stream URLs, CDN streams, or fallback video.
 */
export function sanitizeMediaItem(item: MediaItem): MediaItem {
  let mediaUrl = item.mediaUrl;
  let thumbnailUrl = item.thumbnailUrl;

  const bunnyId = item.bunny_video_id || item.bunnyVideoId;
  if (bunnyId) {
    const { embedUrl, thumbnailUrl: bunnyThumb } = getBunnyPlaybackUrls(bunnyId);
    if (!mediaUrl || mediaUrl.startsWith('blob:')) {
      mediaUrl = embedUrl;
    }
    if (!thumbnailUrl || thumbnailUrl.startsWith('blob:')) {
      thumbnailUrl = bunnyThumb;
    }
  }

  if (!mediaUrl || mediaUrl.startsWith('blob:')) {
    if (item.storageUrl && !item.storageUrl.startsWith('blob:')) {
      mediaUrl = item.storageUrl;
    } else if (item.publicUrl && !item.publicUrl.startsWith('blob:')) {
      mediaUrl = item.publicUrl;
    } else {
      mediaUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    }
  }

  if (!thumbnailUrl || thumbnailUrl.startsWith('blob:')) {
    thumbnailUrl = 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=600&q=80';
  }

  return {
    ...item,
    title: item.title && item.title.trim() && item.title !== 'Untitled video' ? item.title : 'Kids Educational Video',
    mediaUrl,
    thumbnailUrl,
    bunny_video_id: bunnyId || item.bunny_video_id,
    bunnyVideoId: bunnyId || item.bunnyVideoId,
    is_public: item.is_public !== undefined ? item.is_public : true,
  };
}

/**
 * Get initial media items synchronously from LocalStorage combined with default library
 */
export function getInitialMediaItems(): MediaItem[] {
  if (typeof window === 'undefined') return MEDIA_LIBRARY.map(sanitizeMediaItem);
  
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed: MediaItem[] = JSON.parse(saved);
      // Merge unique items by ID and sanitize any stale blob URLs
      const map = new Map<string, MediaItem>();
      MEDIA_LIBRARY.forEach((item) => map.set(item.id, sanitizeMediaItem(item)));
      parsed.forEach((item) => map.set(item.id, sanitizeMediaItem(item)));
      const result = Array.from(map.values());
      // Re-persist sanitized list so stale blob URLs are removed from localStorage
      persistMediaItemsToLocal(result);
      return result;
    }
  } catch (err) {
    console.warn('Failed to parse localStorage media items:', err);
  }

  return MEDIA_LIBRARY.map(sanitizeMediaItem);
}

/**
 * Save updated media array to LocalStorage
 */
export function persistMediaItemsToLocal(items: MediaItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = items.map(sanitizeMediaItem);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('Failed to save media items to localStorage:', err);
  }
}

/**
 * Fetch latest media items from Bunny Stream / Supabase `videos` table, API, and LocalStorage
 */
export async function fetchLatestMediaItems(): Promise<MediaItem[]> {
  const localItems = getInitialMediaItems();
  const map = new Map<string, MediaItem>();
  localItems.forEach((i) => map.set(i.id, sanitizeMediaItem(i)));

  // 1. Fetch from Supabase `videos` table (Direct Bunny Stream metadata records)
  try {
    const bunnyVideos = await fetchBunnyVideosFromSupabase();
    if (bunnyVideos && bunnyVideos.length > 0) {
      bunnyVideos.forEach((v) => map.set(v.id, sanitizeMediaItem(v)));
    }
  } catch (err) {
    console.warn('Supabase `videos` table fetch warning:', err);
  }

  // 2. Fetch from Express Server API
  try {
    const response = await fetch('/api/media');
    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        result.data.forEach((i: MediaItem) => map.set(i.id, sanitizeMediaItem(i)));
      }
    }
  } catch (err) {
    console.warn('API media fetch error, using local/Supabase fallback:', err);
  }

  // 3. Fallback check for `media_items` table in Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        data.forEach((row: any) => {
          map.set(row.id, sanitizeMediaItem({
            id: row.id,
            title: row.title,
            type: row.type || 'video',
            category: row.category || 'Science & Discovery',
            duration: row.duration || '4:30',
            thumbnailUrl: row.thumbnail_url || row.thumbnailUrl,
            mediaUrl: row.media_url || row.mediaUrl,
            targetAgeGroup: Array.isArray(row.target_age_group)
              ? row.target_age_group
              : ['4-5', '6-7'],
            description: row.description || '',
            isPopular: !!row.is_popular,
            status: row.status || 'pending_approval',
            uploadedBy: row.uploaded_by || 'parent@vkid.app',
            createdAt: row.created_at || new Date().toISOString(),
            bunny_video_id: row.bunny_video_id,
            bunnyVideoId: row.bunny_video_id,
          }));
        });
      }
    } catch (err) {
      console.warn('Supabase media table fetch error:', err);
    }
  }

  const merged = Array.from(map.values());
  persistMediaItemsToLocal(merged);
  return merged;
}

/**
 * Save new uploaded media item to Backend API, Supabase `videos` table, and LocalStorage
 */
export async function saveMediaItemToStorage(newItem: MediaItem): Promise<MediaItem> {
  const itemToSave: MediaItem = {
    ...newItem,
    status: newItem.status || 'approved',
    createdAt: newItem.createdAt || new Date().toISOString(),
    is_public: newItem.is_public !== undefined ? newItem.is_public : true,
  };

  // 1. Save to LocalStorage
  const current = getInitialMediaItems();
  const updated = [itemToSave, ...current.filter((i) => i.id !== itemToSave.id)];
  persistMediaItemsToLocal(updated);

  // 2. Post to Express Server API
  try {
    await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemToSave),
    });
  } catch (err) {
    console.warn('API media save error:', err);
  }

  // 3. Post Lightweight text metadata to Supabase `videos` table
  const bunnyId = itemToSave.bunny_video_id || itemToSave.bunnyVideoId;
  if (bunnyId) {
    try {
      await saveBunnyVideoToSupabase({
        id: itemToSave.id,
        title: itemToSave.title,
        description: itemToSave.description,
        age_group: itemToSave.targetAgeGroup,
        category: itemToSave.category,
        bunny_video_id: bunnyId,
        thumbnail_url: itemToSave.thumbnailUrl,
        is_public: true,
        duration: itemToSave.duration,
        status: itemToSave.status,
        uploaded_by: itemToSave.uploadedBy,
      });
    } catch (err) {
      console.warn('Supabase `videos` table save notice:', err);
    }
  }

  return itemToSave;
}

/**
 * Approve media item in storage
 */
export async function approveMediaItemInStorage(id: string): Promise<void> {
  const current = getInitialMediaItems();
  const updated = current.map((item) => (item.id === id ? { ...item, status: 'approved' as const } : item));
  persistMediaItemsToLocal(updated);

  const approvedItem = updated.find((i) => i.id === id);
  if (approvedItem) {
    try {
      await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvedItem),
      });
    } catch (err) {
      console.warn('API media approval error:', err);
    }
  }

  if (supabase) {
    try {
      await supabase.from('videos').update({ status: 'approved' }).eq('id', id);
    } catch (err) {
      console.warn('Supabase videos table approval error:', err);
    }
    try {
      await supabase.from('media_items').update({ status: 'approved' }).eq('id', id);
    } catch (err) {
      console.warn('Supabase media_items approval error:', err);
    }
  }
}

/**
 * Reject / Delete media item from storage
 */
export async function rejectMediaItemInStorage(id: string): Promise<void> {
  const current = getInitialMediaItems();
  const updated = current.filter((item) => item.id !== id);
  persistMediaItemsToLocal(updated);

  try {
    await fetch(`/api/media/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('API media deletion error:', err);
  }

  if (supabase) {
    try {
      await supabase.from('videos').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase videos delete notice:', err);
    }
    try {
      await supabase.from('media_items').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase media_items delete notice:', err);
    }
  }
}
