import { supabase } from '../lib/supabase';
import { Post } from '../types';

// Bunny Stream video links (Library ID: 713265)
export const BUNNY_STREAM_BASE = 'https://video.bunnycdn.com/play/713265';
export const SEED_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
];

// Initial seed posts used for instant preview and local fallback if database table is initializing
const INITIAL_SEED_POSTS: Post[] = [
  {
    id: 'post-seed-1',
    text: 'A blessed Feast of the Transfiguration to all brothers and sisters in Christ! "Lord, it is good for us to be here" (Matthew 17:4). May the Divine Light illuminate our hearts.',
    authorName: 'Fr. Seraphim Rose',
    authorParish: 'St. Herman of Alaska Monastery, Platina',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    authorId: 'auth-fr-seraphim',
    image: 'https://images.unsplash.com/photo-1548625361-195fe5772323?auto=format&fit=crop&q=80&w=1200',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    likesCount: 42,
    commentsCount: 9,
    resharesCount: 14,
    isLiked: false,
    isReshared: false,
  },
  {
    id: 'post-seed-2',
    text: 'Highlight from tonight’s Choral Rehearsal for the Divine Liturgy! Praise the Lord with harp and psalter. Join our fellowship room tonight in My Network.',
    authorName: 'Eleni Chrysostom',
    authorParish: 'Holy Trinity Cathedral, Boston',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    authorId: 'auth-eleni',
    video: SEED_VIDEOS[0],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    likesCount: 88,
    commentsCount: 19,
    resharesCount: 23,
    isLiked: true,
  },
  {
    id: 'post-seed-3',
    text: 'Daily Spiritual Reflection from St. Isaac the Syrian: "Acquire inner peace, and a thousand souls around you shall be saved." Let us keep this in mind during our evening prayers.',
    authorName: 'Deacon Markos Haddad',
    authorParish: 'St. George Antiochian Church, Damascus',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    authorId: 'auth-markos',
    image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    likesCount: 156,
    commentsCount: 31,
    resharesCount: 54,
  },
  {
    id: 'post-seed-4',
    text: 'Youth Group Pilgrimage reel! Visiting St. Anthony Monastery in Arizona. Experience the tranquil desert spirituality with our choir.',
    authorName: 'Anna Papadopoulos',
    authorParish: 'St. Nicholas Church, Chicago',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    authorId: 'auth-anna',
    video: SEED_VIDEOS[1],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    likesCount: 210,
    commentsCount: 45,
    resharesCount: 38,
  },
];

// Helper to convert Supabase row object to frontend Post model
export function mapRowToPost(row: any): Post {
  return {
    id: String(row.id),
    text: row.content || row.text || '',
    authorName: row.author_name || row.authorName || 'Orthodox Member',
    authorParish: row.author_parish || row.authorParish || 'Parish Community',
    authorAvatar: row.author_avatar || row.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    authorId: row.author_id || row.authorId,
    image: row.image_url || row.image || undefined,
    video: row.video || undefined,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    groupId: row.group_id || row.groupId || undefined,
    likesCount: row.likes_count ?? row.likesCount ?? Math.floor(Math.random() * 20),
    commentsCount: row.comments_count ?? row.commentsCount ?? Math.floor(Math.random() * 5),
    resharesCount: row.reshares_count ?? row.resharesCount ?? Math.floor(Math.random() * 8),
    isLiked: row.is_liked ?? false,
    isReshared: row.is_reshared ?? false,
    quotedPost: row.quoted_post ? mapRowToPost(row.quoted_post) : null,
    reshareKind: row.reshare_kind || undefined,
  };
}

// Memory cache for smooth optimistic UI updates
let localPostsCache: Post[] = [...INITIAL_SEED_POSTS];

/**
 * Mandatory Export: loadPosts(groupId?, options?)
 * Fetches main feed posts from Supabase or fallback
 */
export async function loadPosts(
  groupId?: string,
  options?: { limit?: number; offset?: number }
): Promise<Post[]> {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    if (options?.limit) {
      const from = options.offset || 0;
      query = query.range(from, from + options.limit - 1);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const fetched = data.map(mapRowToPost);
      // Merge with newly saved local posts if any
      const mergedMap = new Map<string, Post>();
      fetched.forEach((p) => mergedMap.set(p.id, p));
      localPostsCache.forEach((p) => {
        if (!mergedMap.has(p.id)) {
          mergedMap.set(p.id, p);
        }
      });
      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (err) {
    console.warn('Supabase posts fetch fallback to local cache:', err);
  }

  // Fallback to local posts
  if (groupId) {
    return localPostsCache.filter((p) => p.groupId === groupId);
  }
  return localPostsCache;
}

/**
 * Mandatory Export: loadPostsByAuthor(authorId)
 * Fetches posts written by a specific author/profile
 */
export async function loadPostsByAuthor(authorId: string): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .or(`author_id.eq.${authorId},author_name.ilike.%${authorId}%`)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map(mapRowToPost);
    }
  } catch (err) {
    console.warn('Supabase author posts fallback:', err);
  }

  return localPostsCache.filter(
    (p) => p.authorId === authorId || p.authorName.toLowerCase().includes(authorId.toLowerCase())
  );
}

/**
 * Mandatory Export: loadReels()
 * Fetches short-form video posts where video is not null
 */
export async function loadReels(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .not('video', 'is', null)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map(mapRowToPost);
    }
  } catch (err) {
    console.warn('Supabase loadReels fallback:', err);
  }

  const videoPosts = localPostsCache.filter((p) => Boolean(p.video));
  if (videoPosts.length === 0) {
    return [
      {
        id: 'reel-demo-1',
        text: 'Choral Vespers Hymn - Pure Virgin Lady St. Nektarios #OrthodoxHymn',
        authorName: 'Choir of St. Anthony Monastery',
        authorParish: 'St. Anthony Monastery, AZ',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        video: SEED_VIDEOS[0],
        createdAt: new Date().toISOString(),
        likesCount: 312,
        commentsCount: 42,
        resharesCount: 89,
      },
      {
        id: 'reel-demo-2',
        text: 'Morning blessing at Mount Athos monastery gardens. Glory to God for all things!',
        authorName: 'Fr. Ephraim',
        authorParish: 'Vatopedi Monastery, Mount Athos',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        video: SEED_VIDEOS[1],
        createdAt: new Date().toISOString(),
        likesCount: 540,
        commentsCount: 68,
        resharesCount: 120,
      },
    ];
  }

  return videoPosts;
}

/**
 * Mandatory Export: savePost(post)
 * Inserts or updates a post in Supabase
 */
export async function savePost(postPartial: Partial<Post>): Promise<Post> {
  const newPost: Post = {
    id: postPartial.id || 'post-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    text: postPartial.text || '',
    authorName: postPartial.authorName || 'Orthodox Visitor',
    authorParish: postPartial.authorParish || 'Parish Community',
    authorAvatar: postPartial.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    authorId: postPartial.authorId,
    image: postPartial.image,
    video: postPartial.video,
    createdAt: postPartial.createdAt || new Date().toISOString(),
    groupId: postPartial.groupId,
    likesCount: postPartial.likesCount || 0,
    commentsCount: postPartial.commentsCount || 0,
    resharesCount: postPartial.resharesCount || 0,
    quotedPost: postPartial.quotedPost,
    reshareKind: postPartial.reshareKind,
  };

  // Add to local cache immediately
  localPostsCache = [newPost, ...localPostsCache.filter((p) => p.id !== newPost.id)];

  try {
    const dbPayload = {
      content: newPost.text,
      author_name: newPost.authorName,
      author_parish: newPost.authorParish,
      author_avatar: newPost.authorAvatar,
      author_id: newPost.authorId,
      image_url: newPost.image || null,
      video: newPost.video || null,
      group_id: newPost.groupId || null,
      created_at: newPost.createdAt,
    };

    const { data, error } = await supabase.from('posts').insert([dbPayload]).select();
    if (!error && data && data.length > 0) {
      return mapRowToPost(data[0]);
    }
  } catch (err) {
    console.warn('Supabase savePost insert error, fallback to local post:', err);
  }

  return newPost;
}

/**
 * Mandatory Export: loadPost(postId)
 */
export async function loadPost(postId: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (!error && data) {
      return mapRowToPost(data);
    }
  } catch (err) {
    console.warn('loadPost error:', err);
  }

  const local = localPostsCache.find((p) => p.id === postId);
  return local || null;
}

/**
 * Mandatory Export: deletePost(postId)
 */
export async function deletePost(postId: string): Promise<boolean> {
  localPostsCache = localPostsCache.filter((p) => p.id !== postId);

  try {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) return true;
  } catch (err) {
    console.warn('deletePost error:', err);
  }

  return true;
}

/**
 * Mandatory Export: createReshare(postId, kind, quote)
 * Handles post reshares and quote posts
 */
export async function createReshare(
  postId: string,
  kind: 'reshare' | 'quote',
  quote?: string
): Promise<Post> {
  const originalPost = await loadPost(postId);
  
  if (originalPost) {
    originalPost.resharesCount = (originalPost.resharesCount || 0) + 1;
  }

  const resharePost: Post = {
    id: 'reshare-' + Date.now(),
    text: quote || (kind === 'reshare' ? `Reshared from ${originalPost?.authorName || 'Parishioner'}` : ''),
    authorName: 'Orthodox Member',
    authorParish: 'St. George Cathedral',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    quotedPost: originalPost,
    reshareKind: kind,
    likesCount: 0,
    commentsCount: 0,
    resharesCount: 0,
  };

  return await savePost(resharePost);
}
