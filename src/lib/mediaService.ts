import { MediaItem } from '../types';
import { MEDIA_LIBRARY } from '../data/mockData';
import { supabase } from './supabase';

const LOCAL_STORAGE_KEY = 'vkid_custom_media_items_v2';

/**
 * Get initial media items synchronously from LocalStorage combined with default library
 */
export function getInitialMediaItems(): MediaItem[] {
  if (typeof window === 'undefined') return MEDIA_LIBRARY;
  
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed: MediaItem[] = JSON.parse(saved);
      // Merge unique items by ID
      const map = new Map<string, MediaItem>();
      MEDIA_LIBRARY.forEach((item) => map.set(item.id, item));
      parsed.forEach((item) => map.set(item.id, item));
      return Array.from(map.values());
    }
  } catch (err) {
    console.warn('Failed to parse localStorage media items:', err);
  }

  return MEDIA_LIBRARY;
}

/**
 * Save updated media array to LocalStorage
 */
export function persistMediaItemsToLocal(items: MediaItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save media items to localStorage:', err);
  }
}

/**
 * Fetch latest media items from backend API (/api/media) or Supabase table
 */
export async function fetchLatestMediaItems(): Promise<MediaItem[]> {
  const localItems = getInitialMediaItems();

  try {
    // 1. Attempt API server fetch
    const response = await fetch('/api/media');
    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        // Merge API results with local storage items
        const map = new Map<string, MediaItem>();
        localItems.forEach((i) => map.set(i.id, i));
        result.data.forEach((i: MediaItem) => map.set(i.id, i));
        const merged = Array.from(map.values());
        persistMediaItemsToLocal(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('API media fetch error, using local/Supabase fallback:', err);
  }

  // 2. Attempt Supabase DB fetch if available
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mappedFromSupabase: MediaItem[] = data.map((row: any) => ({
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
        }));

        const map = new Map<string, MediaItem>();
        localItems.forEach((i) => map.set(i.id, i));
        mappedFromSupabase.forEach((i) => map.set(i.id, i));
        const merged = Array.from(map.values());
        persistMediaItemsToLocal(merged);
        return merged;
      }
    } catch (err) {
      console.warn('Supabase media table fetch error:', err);
    }
  }

  return localItems;
}

/**
 * Save new uploaded media item to Backend API, Supabase DB, and LocalStorage
 */
export async function saveMediaItemToStorage(newItem: MediaItem): Promise<MediaItem> {
  const itemToSave: MediaItem = {
    ...newItem,
    status: newItem.status || 'pending_approval',
    createdAt: newItem.createdAt || new Date().toISOString(),
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

  // 3. Post to Supabase DB if client exists
  if (supabase) {
    try {
      await supabase.from('media_items').insert([
        {
          id: itemToSave.id,
          title: itemToSave.title,
          type: itemToSave.type,
          category: itemToSave.category,
          duration: itemToSave.duration,
          thumbnail_url: itemToSave.thumbnailUrl,
          media_url: itemToSave.mediaUrl,
          target_age_group: itemToSave.targetAgeGroup,
          description: itemToSave.description,
          status: itemToSave.status,
          uploaded_by: itemToSave.uploadedBy,
          created_at: itemToSave.createdAt,
        },
      ]);
    } catch (err) {
      console.warn('Supabase DB insert error:', err);
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
      await supabase.from('media_items').update({ status: 'approved' }).eq('id', id);
    } catch (err) {
      console.warn('Supabase media approval error:', err);
    }
  }
}

/**
 * Reject / Delete media item from storage and purge underlying storage files
 */
export async function rejectMediaItemInStorage(id: string): Promise<void> {
  const current = getInitialMediaItems();
  const targetItem = current.find((item) => item.id === id);
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
      if (targetItem) {
        const filesToRemove: string[] = [];
        const extractStoragePath = (url?: string) => {
          if (!url) return null;
          if (url.includes('/storage/v1/object/public/vkid-media/')) {
            return url.split('/storage/v1/object/public/vkid-media/')[1];
          }
          return null;
        };

        const mediaPath = extractStoragePath(targetItem.mediaUrl);
        if (mediaPath) filesToRemove.push(mediaPath);

        const thumbPath = extractStoragePath(targetItem.thumbnailUrl);
        if (thumbPath) filesToRemove.push(thumbPath);

        if (filesToRemove.length > 0) {
          await supabase.storage.from('vkid-media').remove(filesToRemove);
        }
      }
      await supabase.from('media_items').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase media deletion error:', err);
    }
  }
}
