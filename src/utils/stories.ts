export interface Story {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorParish: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
}

const STORIES_STORAGE_KEY = 'orthodoxconnect_stories_v1';

const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    authorName: 'Fr. Seraphim Rose',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    authorParish: 'St. Herman Monastery',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-195fe5772323?auto=format&fit=crop&q=80&w=1200',
    caption: 'Vespers candlelight at monastery chapel. Blessed evening to all!',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'story-2',
    authorName: 'Eleni Chrysostom',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    authorParish: 'Holy Trinity Cathedral',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200',
    caption: 'Choral practice for Sunday Divine Liturgy! Praise God.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'story-3',
    authorName: 'Deacon Markos',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    authorParish: 'St. George Antiochian',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    caption: 'Coptic Iconography restoration at our sanctuary today.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export function loadStories(): Story[] {
  try {
    const raw = localStorage.getItem(STORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(INITIAL_STORIES));
      return INITIAL_STORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STORIES;
  }
}

export function saveStory(newStoryPartial: Omit<Story, 'id' | 'createdAt'>): Story {
  const newStory: Story = {
    id: 'story-' + Date.now(),
    ...newStoryPartial,
    createdAt: new Date().toISOString(),
  };

  const existing = loadStories();
  const updated = [newStory, ...existing];

  try {
    localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save story to localStorage:', err);
  }

  return newStory;
}
