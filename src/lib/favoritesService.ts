import { supabase } from './supabase';

const LOCAL_FAVORITES_KEY_PREFIX = 'vkid_user_favorites_';

/**
 * Fetch favorite video IDs for the given user from Supabase `favorites` table,
 * with LocalStorage fallback.
 */
export async function fetchUserFavoriteIds(userId?: string): Promise<string[]> {
  if (!userId) return [];

  // Try fetching from Supabase favorites table
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('video_id')
        .eq('user_id', userId);

      if (!error && data) {
        const ids = data.map((row: any) => String(row.video_id)).filter(Boolean);
        // Sync to local cache
        localStorage.setItem(`${LOCAL_FAVORITES_KEY_PREFIX}${userId}`, JSON.stringify(ids));
        return ids;
      }
    } catch (err) {
      console.warn('Error querying Supabase favorites table:', err);
    }
  }

  // Fallback to localStorage cache
  try {
    const cached = localStorage.getItem(`${LOCAL_FAVORITES_KEY_PREFIX}${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Error reading local favorites cache:', e);
  }

  return [];
}

/**
 * Toggle a video favorite status in Supabase `favorites` table.
 * Returns the updated array of favorite video IDs.
 */
export async function toggleSupabaseFavorite(
  userId: string,
  videoId: string,
  currentFavoriteIds: string[]
): Promise<string[]> {
  const isAlreadyFavorite = currentFavoriteIds.includes(videoId);
  const updatedIds = isAlreadyFavorite
    ? currentFavoriteIds.filter((id) => id !== videoId)
    : [...currentFavoriteIds, videoId];

  // Immediately persist to local cache for instant UI feedback
  try {
    localStorage.setItem(`${LOCAL_FAVORITES_KEY_PREFIX}${userId}`, JSON.stringify(updatedIds));
  } catch (e) {
    console.warn('Failed to update local favorites cache:', e);
  }

  // Update Supabase favorites table
  if (supabase) {
    try {
      if (isAlreadyFavorite) {
        // Delete favorite row
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: userId, video_id: videoId });

        if (error) {
          console.warn('Notice deleting from Supabase favorites:', error.message);
        }
      } else {
        // Insert favorite row
        const { error } = await supabase
          .from('favorites')
          .insert([
            {
              user_id: userId,
              video_id: videoId,
              created_at: new Date().toISOString(),
            },
          ]);

        if (error) {
          console.warn('Notice inserting into Supabase favorites:', error.message);
        }
      }
    } catch (err) {
      console.warn('Error updating Supabase favorites table:', err);
    }
  }

  return updatedIds;
}
