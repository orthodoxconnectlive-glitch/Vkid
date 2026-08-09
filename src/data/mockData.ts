import { ChildProfile, MediaItem, ActivityGame, Badge, Sticker, ScreenTimeConfig, UsageReportData, UserAccount } from '../types';

export const MOCK_USERS: UserAccount[] = [
  {
    id: 'usr_super',
    displayName: 'Orthodox Connect Admin',
    email: 'orthodoxconnect.live@gmail.com',
    role: 'super_admin',
    avatarUrl: '👑',
    status: 'active',
    uploadedCount: 12,
    createdAt: '2026-01-01T00:00:00Z',
    channelBio: 'VKid Platform Founder & Content Director',
  },
  {
    id: 'usr_mod',
    displayName: 'VKid Moderator Team',
    email: 'moderator@vkid.app',
    role: 'admin',
    avatarUrl: '🛡️',
    status: 'active',
    uploadedCount: 6,
    createdAt: '2026-02-15T00:00:00Z',
    channelBio: 'Official Safety & Content Moderation Team',
  },
  {
    id: 'usr_sarah',
    displayName: 'Sarah Jenkins',
    email: 'parent_sarah@example.com',
    role: 'parent',
    avatarUrl: '👩‍🏫',
    status: 'active',
    uploadedCount: 3,
    createdAt: '2026-05-10T00:00:00Z',
    channelBio: 'Early Childhood Educator & Parent Creator',
  },
  {
    id: 'usr_david',
    displayName: 'David Chen',
    email: 'teacher_david@school.org',
    role: 'parent',
    avatarUrl: '👨‍🔬',
    status: 'active',
    uploadedCount: 2,
    createdAt: '2026-06-01T00:00:00Z',
    channelBio: 'Elementary STEM Science Teacher & Crafts Specialist',
  },
  {
    id: 'usr_emma',
    displayName: 'Emma Watson',
    email: 'storyteller_emma@vkid.app',
    role: 'parent',
    avatarUrl: '📚',
    status: 'active',
    uploadedCount: 4,
    createdAt: '2026-07-04T00:00:00Z',
    channelBio: 'Children Audiobook Narrator & Bedtime Voice Artist',
  },
  {
    id: 'usr_bad_actor',
    displayName: 'Unverified Account',
    email: 'test_flagged@spam.net',
    role: 'parent',
    avatarUrl: '🤖',
    status: 'suspended',
    uploadedCount: 0,
    createdAt: '2026-08-01T00:00:00Z',
    channelBio: 'Suspended for safety review.',
  },
];

export const INITIAL_CHILD_PROFILES: ChildProfile[] = [
  {
    id: 'child_1',
    name: 'Leo',
    age: 5,
    ageGroup: '4-5',
    avatarUrl: '🦁',
    avatarColor: 'bg-amber-100 text-amber-600 border-amber-300',
    dailyGoalMinutes: 30,
    timeSpentTodayMinutes: 18,
    earnedBadges: ['badge_math_1', 'badge_streak_3', 'badge_spelling_1'],
    unlockedStickers: ['st_lion', 'st_rocket', 'st_star', 'st_rainbow', 'st_dino'],
    favoriteMediaIds: ['m1', 'm3'],
  },
  {
    id: 'child_2',
    name: 'Maya',
    age: 8,
    ageGroup: '8-10',
    avatarUrl: '🦄',
    avatarColor: 'bg-purple-100 text-purple-600 border-purple-300',
    dailyGoalMinutes: 45,
    timeSpentTodayMinutes: 25,
    earnedBadges: ['badge_math_1', 'badge_math_2', 'badge_memory_1'],
    unlockedStickers: ['st_unicorn', 'st_planet', 'st_crown', 'st_magic'],
    favoriteMediaIds: ['m2', 'm5'],
  },
  {
    id: 'child_3',
    name: 'Toby',
    age: 4,
    ageGroup: '4-5',
    avatarUrl: '🐻',
    avatarColor: 'bg-blue-100 text-blue-600 border-blue-300',
    dailyGoalMinutes: 20,
    timeSpentTodayMinutes: 10,
    earnedBadges: ['badge_streak_3'],
    unlockedStickers: ['st_bear', 'st_star'],
    favoriteMediaIds: ['m4'],
  },
];

export const MEDIA_LIBRARY: MediaItem[] = [
  {
    id: 'm1',
    title: 'The Great Jungle Shapes & Numbers Song',
    type: 'rhyme',
    category: 'Music & Movement',
    duration: '3:45',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://www.youtube.com/embed/g2fA1S5mY58', // Sample kid video
    targetAgeGroup: ['4-5', '6-7'],
    description: 'Sing along with Friendly Lion as we learn circles, squares, and count up to 20 with playful beats!',
    isPopular: true,
    status: 'approved',
    uploadedBy: 'curator@vkid.app',
  },
  {
    id: 'm2',
    title: 'Solar System Space Explorers',
    type: 'video',
    category: 'Science & Discovery',
    duration: '6:20',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://www.youtube.com/embed/libKVRa07fU',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Fly through space with Captain Maya and explore planets, stars, and cool space facts!',
    isPopular: true,
    status: 'approved',
    uploadedBy: 'curator@vkid.app',
  },
  {
    id: 'm3',
    title: 'The Little Turtle Who Could Swim Fast',
    type: 'audiobook',
    category: 'Bedtime Stories',
    duration: '8:15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    targetAgeGroup: ['4-5', '6-7'],
    description: 'A soothing ocean tale about courage, teamwork, and finding your own pace.',
    isPopular: false,
    status: 'approved',
    uploadedBy: 'curator@vkid.app',
  },
  {
    id: 'm4',
    title: 'ABC Phonics & Animal Sounds Dance',
    type: 'rhyme',
    category: 'Alphabet & Phonics',
    duration: '4:10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://www.youtube.com/embed/BELlZKpi1Zs',
    targetAgeGroup: ['4-5'],
    description: 'Tap your feet to phonics sounds from A to Z with cheerful animal friends!',
    isPopular: true,
    status: 'approved',
    uploadedBy: 'curator@vkid.app',
  },
  {
    id: 'm5',
    title: 'Mystery of the Curious Dino Detective',
    type: 'audiobook',
    category: 'Stories & Mysteries',
    duration: '10:30',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Join Detective T-Rex as he uses clue-solving math to find the missing golden acorn.',
    isPopular: false,
    status: 'approved',
    uploadedBy: 'curator@vkid.app',
  },
  {
    id: 'm6',
    title: 'Under the Sea Ocean World',
    type: 'video',
    category: 'Nature & Animals',
    duration: '5:45',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://www.youtube.com/embed/v8x10M1pMFA',
    targetAgeGroup: ['4-5', '6-7', '8-10'],
    description: 'Discover colorful coral reefs, dolphins, and glowing jellyfish with underwater fun!',
    isPopular: true,
    status: 'approved',
    uploadedBy: 'curator@vkid.app',
  },
  // Pending Approval User Submissions (For Admin Moderation Queue)
  {
    id: 'm_pending_1',
    title: 'Fun Counting Farm Animals & Singalong',
    type: 'video',
    category: 'Music & Movement',
    duration: '4:20',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://www.youtube.com/embed/2M-sFAt6qWk',
    targetAgeGroup: ['4-5', '6-7'],
    description: 'Parent-uploaded video showing interactive farm counting with cows, sheep, and ducks.',
    isPopular: false,
    status: 'pending_approval',
    uploadedBy: 'parent_sarah@example.com',
    createdAt: '2026-08-08T10:15:00Z',
  },
  {
    id: 'm_pending_2',
    title: 'Easy Paper Origami Magic Butterflies',
    type: 'video',
    category: 'Arts & Crafts',
    duration: '5:10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://www.youtube.com/embed/4S24m98CjO8',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Step-by-step DIY crafting video teaching kids how to fold colorful origami butterflies.',
    isPopular: false,
    status: 'pending_approval',
    uploadedBy: 'teacher_david@school.org',
    createdAt: '2026-08-08T11:40:00Z',
  },
  {
    id: 'm_pending_3',
    title: 'The Whispering Starlight Tree - Bedtime Story',
    type: 'audiobook',
    category: 'Bedtime Stories',
    duration: '12:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    targetAgeGroup: ['4-5', '6-7'],
    description: 'Calming bedtime narration with gentle ambient harp music to help kids fall asleep softly.',
    isPopular: false,
    status: 'pending_approval',
    uploadedBy: 'storyteller_emma@vkid.app',
    createdAt: '2026-08-08T12:05:00Z',
  },
  {
    id: 'm_pending_4',
    title: 'Five Little Ducks Nursery Rhyme & Dance',
    type: 'rhyme',
    category: 'Music & Movement',
    duration: '3:30',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://www.youtube.com/embed/g2fA1S5mY58',
    targetAgeGroup: ['4-5'],
    description: 'Upbeat nursery rhyme with cheerful ducklings learning counting through music.',
    isPopular: false,
    status: 'pending_approval',
    uploadedBy: 'parent_sarah@example.com',
    createdAt: '2026-08-08T12:30:00Z',
  },
];

export const MINI_GAMES: ActivityGame[] = [
  {
    id: 'game_math',
    title: 'Math Quest & Counting',
    category: 'math',
    icon: '🔢',
    color: 'from-amber-400 to-orange-500',
    targetAgeGroup: ['4-5', '6-7', '8-10'],
    description: 'Solve fun fruit counting, addition, and subtraction puzzles with visual rewards!',
    instructions: 'Tap the correct numerical answer or fruit count to earn shiny stars!',
  },
  {
    id: 'game_spelling',
    title: 'Spelling Safari',
    category: 'spelling',
    icon: '🔤',
    color: 'from-emerald-400 to-teal-600',
    targetAgeGroup: ['4-5', '6-7', '8-10'],
    description: 'Drag letter blocks to complete word puzzles and hear audio phonics pronunciation!',
    instructions: 'Combine phonics letters to spell wild animal names and unlock stickers.',
  },
  {
    id: 'game_memory',
    title: 'Memory Card Match',
    category: 'memory',
    icon: '🃏',
    color: 'from-purple-400 to-indigo-600',
    targetAgeGroup: ['4-5', '6-7', '8-10'],
    description: 'Flip matching animal cards to boost visual working memory and earn stars!',
    instructions: 'Flip cards two by two and find matching pairs in fewer turns.',
  },
  {
    id: 'game_shapes',
    title: 'Shape Builder & Geometry',
    category: 'math',
    icon: '📐',
    color: 'from-blue-400 to-cyan-600',
    targetAgeGroup: ['4-5', '6-7'],
    description: 'Snap triangles, circles, and polygons together to construct castles and rockets!',
    instructions: 'Drag geometric shapes into outline slots to complete colorful structures.',
  },
  {
    id: 'game_phonics',
    title: 'Phonics Pop & Rhymes',
    category: 'reading',
    icon: '🎈',
    color: 'from-pink-400 to-rose-600',
    targetAgeGroup: ['4-5', '6-7'],
    description: 'Pop floating alphabet balloons that match the phonics sound spoken by the narrator!',
    instructions: 'Listen carefully to the sound and pop balloons before they float away.',
  },
  {
    id: 'game_colors',
    title: 'Color Mixer & Paint Studio',
    category: 'art',
    icon: '🎨',
    color: 'from-fuchsia-400 to-purple-600',
    targetAgeGroup: ['4-5', '6-7', '8-10'],
    description: 'Mix primary paint colors to create secondary shades and paint magical creatures!',
    instructions: 'Combine Red, Blue, and Yellow to create new colors and fill in coloring pages.',
  },
  {
    id: 'game_dino_math',
    title: 'Dino Math Island',
    category: 'math',
    icon: '🦖',
    color: 'from-lime-400 to-emerald-600',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Feed hungry prehistoric dinosaurs by solving multiplication and skip counting equations!',
    instructions: 'Select the correct leaf number to feed T-Rex and help him grow big!',
  },
  {
    id: 'game_clock',
    title: 'Clock Teller & Time Travel',
    category: 'math',
    icon: '⏰',
    color: 'from-sky-400 to-blue-600',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Rotate the analog clock hands to match the digital time and set off rocket launches!',
    instructions: 'Drag the hour and minute hands to line up with the requested target time.',
  },
  {
    id: 'game_animals',
    title: 'Animal Sounds & Habitat',
    category: 'science',
    icon: '🦁',
    color: 'from-yellow-400 to-amber-600',
    targetAgeGroup: ['4-5', '6-7'],
    description: 'Listen to animal roars, squeaks, and bird songs, then match them to ocean, jungle, or arctic habitats!',
    instructions: 'Tap the animal sound button and match it with the correct living habitat.',
  },
  {
    id: 'game_geography',
    title: 'World Geography Puzzle',
    category: 'science',
    icon: '🌍',
    color: 'from-teal-400 to-cyan-700',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Explore continents, ocean maps, and landmark monuments in an interactive globe explorer!',
    instructions: 'Place continent puzzle pieces on the globe and discover world wonders.',
  },
  {
    id: 'game_coding',
    title: 'Coding Logic Blocks & Robot Run',
    category: 'logic',
    icon: '🤖',
    color: 'from-indigo-400 to-violet-600',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Sequence forward, turn left, and jump command arrows to guide Robot Beep through maze grids!',
    instructions: 'Assemble step-by-step direction code blocks then press RUN to cross the finish line.',
  },
  {
    id: 'game_rhythm',
    title: 'Rhythm Beats & Drum Pad',
    category: 'music',
    icon: '🥁',
    color: 'from-rose-400 to-red-600',
    targetAgeGroup: ['4-5', '6-7', '8-10'],
    description: 'Tap along with glowing tempo pads to build catchy drum rhythms and melody loops!',
    instructions: 'Hit neon drum pads on the beat to keep the animal band jamming together.',
  },
  {
    id: 'game_planets',
    title: 'Solar System Orbit Explorer',
    category: 'science',
    icon: '🪐',
    color: 'from-violet-500 to-purple-800',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Arrange planets by their distance from the Sun and learn space facts about gas giants!',
    instructions: 'Drag Mercury, Venus, Earth, and Neptune into their correct cosmic orbital paths.',
  },
  {
    id: 'game_word_search',
    title: 'Word Search & Vocabulary',
    category: 'reading',
    icon: '🔍',
    color: 'from-emerald-400 to-green-700',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Find hidden sight words in playful themed grids like Space, Safari, and Fairytales!',
    instructions: 'Tap or drag across adjacent letter blocks to highlight vocabulary terms.',
  },
  {
    id: 'game_pattern',
    title: 'Pattern Sequence Finder',
    category: 'logic',
    icon: '🧩',
    color: 'from-orange-400 to-amber-600',
    targetAgeGroup: ['4-5', '6-7'],
    description: 'Identify color and shape repeating patterns to complete the magic train track!',
    instructions: 'Look at the pattern logic (e.g. Red-Blue-Red-Blue) and tap the next missing block.',
  },
  {
    id: 'game_piano',
    title: 'Little Piano Melody Maker',
    category: 'music',
    icon: '🎹',
    color: 'from-cyan-400 to-blue-600',
    targetAgeGroup: ['4-5', '6-7', '8-10'],
    description: 'Play colorful piano keys following song notes to play Twinkle Twinkle and nursery songs!',
    instructions: 'Tap numbered keys as falling musical notes touch the rainbow baseline.',
  },
  {
    id: 'game_fraction',
    title: 'Pizza Fraction Slicer',
    category: 'math',
    icon: '🍕',
    color: 'from-amber-500 to-red-500',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Slice pizzas into halves, quarters, and eighths to feed hungry party guests!',
    instructions: 'Cut the pizza according to the fraction order (e.g., 3/4 cheese, 1/4 pepperoni).',
  },
  {
    id: 'game_nature',
    title: 'Plant Life Cycle & Garden',
    category: 'science',
    icon: '🌱',
    color: 'from-green-400 to-emerald-700',
    targetAgeGroup: ['4-5', '6-7'],
    description: 'Water seeds, provide sunlight, and watch flowers bloom while learning photosynthesis!',
    instructions: 'Drag water droplets, soil fertilizer, and sunbeams onto the seedling to watch it grow.',
  },
  {
    id: 'game_story_builder',
    title: 'Interactive Story Weaver',
    category: 'reading',
    icon: '📖',
    color: 'from-teal-400 to-indigo-600',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Pick story choices and adjectives to create silly custom adventure tales!',
    instructions: 'Choose story characters, action verbs, and magical settings to generate your book.',
  },
  {
    id: 'game_gravity',
    title: 'Physics & Gravity Lab',
    category: 'logic',
    icon: '🚀',
    color: 'from-blue-500 to-indigo-800',
    targetAgeGroup: ['6-7', '8-10'],
    description: 'Tilt ramps, adjust gravity, and bounce marble balls into goal targets!',
    instructions: 'Set up trampoline bounce pads and wooden ramps to direct the rolling marble into the star.',
  },
];

export const BADGES_CATALOG: Badge[] = [
  {
    id: 'badge_math_1',
    title: 'Math Explorer',
    description: 'Solved 5 math counting or addition puzzles correctly.',
    icon: '🏆',
    category: 'math',
    requiredCount: 5,
  },
  {
    id: 'badge_math_2',
    title: 'Math Wizard',
    description: 'Mastered 15 math challenges with flying colors!',
    icon: '🧙‍♂️',
    category: 'math',
    requiredCount: 15,
  },
  {
    id: 'badge_spelling_1',
    title: 'Word Builder',
    description: 'Spelled 5 words correctly in Spelling Safari.',
    icon: '📚',
    category: 'spelling',
    requiredCount: 5,
  },
  {
    id: 'badge_memory_1',
    title: 'Memory Master',
    description: 'Cleared a full memory match grid in under 60 seconds.',
    icon: '🧠',
    category: 'memory',
    requiredCount: 1,
  },
  {
    id: 'badge_streak_3',
    title: '3-Day Star',
    description: 'Logged in and learned 3 days in a row!',
    icon: '⭐',
    category: 'general',
    requiredCount: 3,
  },
];

export const STICKERS_CATALOG: Sticker[] = [
  { id: 'st_lion', name: 'Friendly Lion', emoji: '🦁', color: 'bg-amber-200', category: 'Safari' },
  { id: 'st_rocket', name: 'Super Rocket', emoji: '🚀', color: 'bg-blue-200', category: 'Space' },
  { id: 'st_star', name: 'Gold Star', emoji: '⭐', color: 'bg-yellow-200', category: 'General' },
  { id: 'st_rainbow', name: 'Magic Rainbow', emoji: '🌈', color: 'bg-pink-200', category: 'General' },
  { id: 'st_dino', name: 'Happy T-Rex', emoji: '🦖', color: 'bg-emerald-200', category: 'Safari' },
  { id: 'st_unicorn', name: 'Sparkle Unicorn', emoji: '🦄', color: 'bg-purple-200', category: 'Magic' },
  { id: 'st_planet', name: 'Ring Planet', emoji: '🪐', color: 'bg-indigo-200', category: 'Space' },
  { id: 'st_crown', name: 'Royal Crown', emoji: '👑', color: 'bg-amber-300', category: 'Magic' },
  { id: 'st_bear', name: 'Cuddly Bear', emoji: '🐻', color: 'bg-amber-100', category: 'Safari' },
  { id: 'st_alien', name: 'Friendly Alien', emoji: '👾', color: 'bg-green-200', category: 'Space' },
];

export const DEFAULT_SCREEN_TIME_CONFIG: ScreenTimeConfig = {
  dailyLimitMinutes: 30,
  sessionDurationMinutes: 20,
  isTimerEnabled: true,
  bedtimeStart: '20:00',
  bedtimeEnd: '07:00',
  contentFilters: {
    videosEnabled: true,
    audiobooksEnabled: true,
    gamesEnabled: true,
    aiStoryEnabled: true,
    maxAgeGroup: '8-10',
  },
};

export const MOCK_USAGE_REPORTS: UsageReportData[] = [
  { day: 'Mon', mediaMinutes: 12, gamesMinutes: 18, totalMinutes: 30 },
  { day: 'Tue', mediaMinutes: 8, gamesMinutes: 22, totalMinutes: 30 },
  { day: 'Wed', mediaMinutes: 15, gamesMinutes: 10, totalMinutes: 25 },
  { day: 'Thu', mediaMinutes: 10, gamesMinutes: 20, totalMinutes: 30 },
  { day: 'Fri', mediaMinutes: 20, gamesMinutes: 15, totalMinutes: 35 },
  { day: 'Sat', mediaMinutes: 25, gamesMinutes: 20, totalMinutes: 45 },
  { day: 'Sun', mediaMinutes: 18, gamesMinutes: 22, totalMinutes: 40 },
];

// Flutter Architecture & Supabase / Firebase Snippets for Export Drawer

export const SUPABASE_POSTGRES_SCHEMA_SQL = `-- VKid Platform Postgres Database Schema & Row-Level Security (RLS) Policies
-- Supports Parent-Child Household Model with Zero-Trust Authorization

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Families Table (Household container owned by parent auth.uid)
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    family_name TEXT NOT NULL,
    parent_pin_hash TEXT NOT NULL DEFAULT '1234',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_families_parent_id ON public.families(parent_id);

-- 2. Children Table (Child profiles under family)
CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INT NOT NULL CHECK (age BETWEEN 2 AND 16),
    avatar_url TEXT NOT NULL DEFAULT '🦊',
    daily_goal_minutes INT NOT NULL DEFAULT 30,
    time_spent_today_minutes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_children_family_id ON public.children(family_id);

-- 3. Watch History Table (Child media playback history)
CREATE TABLE IF NOT EXISTS public.watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    media_id TEXT NOT NULL,
    media_title TEXT NOT NULL,
    watch_duration_seconds INT NOT NULL DEFAULT 0,
    watched_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_watch_history_child_id ON public.watch_history(child_id);

-- 4. Screen Time Metrics Table (Daily aggregated metrics)
CREATE TABLE IF NOT EXISTS public.screen_time_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    media_minutes INT NOT NULL DEFAULT 0,
    games_minutes INT NOT NULL DEFAULT 0,
    total_minutes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(child_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_metrics_child_date ON public.screen_time_metrics(child_id, log_date);

-- ============================================================================
-- STRICT ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_time_metrics ENABLE ROW LEVEL SECURITY;

-- Helper Security Function: Check if auth.uid() is owner of family
CREATE OR REPLACE FUNCTION public.is_parent_of_family(f_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.families
        WHERE id = f_id AND parent_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Security Function: Check if auth.uid() is parent of child
CREATE OR REPLACE FUNCTION public.is_parent_of_child(c_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.children c
        JOIN public.families f ON c.family_id = f.id
        WHERE c.id = c_id AND f.parent_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Families Table RLS Policies
CREATE POLICY "Parents can view their family record"
    ON public.families FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can create family record"
    ON public.families FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update family record"
    ON public.families FOR UPDATE USING (parent_id = auth.uid());

-- 2. Children Table RLS Policies
CREATE POLICY "Parents can view children in family"
    ON public.children FOR SELECT USING (public.is_parent_of_family(family_id));

CREATE POLICY "Parents can create child profiles in family"
    ON public.children FOR INSERT WITH CHECK (public.is_parent_of_family(family_id));

CREATE POLICY "Parents can update child profiles in family"
    ON public.children FOR UPDATE USING (public.is_parent_of_family(family_id));

CREATE POLICY "Parents can delete child profiles in family"
    ON public.children FOR DELETE USING (public.is_parent_of_family(family_id));

-- 3. Watch History RLS Policies
CREATE POLICY "Parents can view watch history for their children"
    ON public.watch_history FOR SELECT USING (public.is_parent_of_child(child_id));

CREATE POLICY "Parents can insert watch history for their children"
    ON public.watch_history FOR INSERT WITH CHECK (public.is_parent_of_child(child_id));

-- 4. Screen Time Metrics RLS Policies
CREATE POLICY "Parents can view screen time metrics for their children"
    ON public.screen_time_metrics FOR SELECT USING (public.is_parent_of_child(child_id));

CREATE POLICY "Parents can insert/update screen time metrics for their children"
    ON public.screen_time_metrics FOR ALL USING (public.is_parent_of_child(child_id));
`;

export const SUPABASE_FLUTTER_SERVICE_DART = `// lib/services/supabase_vkid_service.dart
// Production Flutter Service using supabase_flutter package for VKid Auth, Profiles & Metrics

import 'package:supabase_flutter/supabase_flutter.dart';

class VKidSupabaseService {
  final SupabaseClient _client = Supabase.instance.client;

  /// 1. Authenticate Parent Account with Email/Password
  Future<AuthResponse> signInParent({
    required String email,
    required String password,
  }) async {
    return await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  /// 2. Register Parent & Create Family Household Record
  Future<AuthResponse> signUpParent({
    required String email,
    required String password,
    required String familyName,
  }) async {
    final res = await _client.auth.signUp(
      email: email,
      password: password,
    );

    final user = res.user;
    if (user != null) {
      await _client.from('families').insert({
        'parent_id': user.id,
        'family_name': familyName,
        'parent_pin_hash': '1234',
      });
    }
    return res;
  }

  /// 3. Get Family Household for Authenticated Parent
  Future<Map<String, dynamic>?> getParentFamily() async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return null;

    final response = await _client
        .from('families')
        .select()
        .eq('parent_id', userId)
        .maybeSingle();

    return response;
  }

  /// 4. Create Child Profile under Parent Family Account
  Future<Map<String, dynamic>> createChildProfile({
    required String familyId,
    required String name,
    required int age,
    required String avatarUrl,
    int dailyGoalMinutes = 30,
  }) async {
    final inserted = await _client
        .from('children')
        .insert({
          'family_id': familyId,
          'name': name,
          'age': age,
          'avatar_url': avatarUrl,
          'daily_goal_minutes': dailyGoalMinutes,
          'time_spent_today_minutes': 0,
        })
        .select()
        .single();

    return inserted;
  }

  /// 5. Fetch Children Profiles for Current Authenticated Parent
  Future<List<Map<String, dynamic>>> fetchChildProfiles() async {
    final family = await getParentFamily();
    if (family == null) return [];

    final List<dynamic> result = await _client
        .from('children')
        .select()
        .eq('family_id', family['id'])
        .order('created_at', ascending: true);

    return List<Map<String, dynamic>>.from(result);
  }

  /// 6. Securely Fetch Metrics for Parent Dashboard
  Future<List<Map<String, dynamic>>> fetchChildUsageMetrics(String childId) async {
    final List<dynamic> result = await _client
        .from('screen_time_metrics')
        .select()
        .eq('child_id', childId)
        .order('log_date', ascending: false)
        .limit(7);

    return List<Map<String, dynamic>>.from(result);
  }

  /// 7. Log Watch History & Update Daily Screen Time
  Future<void> recordWatchSession({
    required String childId,
    required String mediaId,
    required String mediaTitle,
    required int durationMinutes,
  }) async {
    await _client.from('watch_history').insert({
      'child_id': childId,
      'media_id': mediaId,
      'media_title': mediaTitle,
      'watch_duration_seconds': durationMinutes * 60,
    });
  }
}
`;

export const BUNNYSTREAM_SECURE_TOKEN_DART = `// lib/services/bunnystream_security_service.dart
// Production BunnyStream Signed URL Token Generator for Secure Child Video Delivery

import 'dart:convert';
import 'package:crypto/crypto.dart';

class BunnyStreamSecurityService {
  /// Generates a signed, time-limited token URL for BunnyStream iframe playback.
  /// Protects videos from unauthorized external hotlinking.
  ///
  /// - [libraryId]: BunnyStream Pull Zone / Library ID (e.g., "123456")
  /// - [videoId]: Unique ID of the video asset (e.g., "a1b2c3d4-e5f6...")
  /// - [securityKey]: BunnyStream Library Token Authentication Key
  /// - [expirationMinutes]: Duration signature remains valid (default: 120 mins)
  static String generateSignedEmbedUrl({
    required String libraryId,
    required String videoId,
    required String securityKey,
    int expirationMinutes = 120,
  }) {
    final nowInSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    final expires = nowInSeconds + (expirationMinutes * 60);

    // Signature formula: SHA256(securityKey + videoId + expires)
    final tokenBase = '$securityKey$videoId$expires';
    final tokenBytes = utf8.encode(tokenBase);
    final hashDigest = sha256.convert(tokenBytes);
    final tokenHash = hashDigest.toString();

    return 'https://iframe.mediadelivery.net/embed/$libraryId/$videoId?token=$tokenHash&expires=$expires';
  }

  /// Generates signed HLS m3u8 playlist URL for native Flutter video player (e.g. video_player package)
  static String generateSignedHlsStreamUrl({
    required String cdnHostname, // e.g. "video.vkidapp.com" (Cloudflare CNAME)
    required String videoId,
    required String securityKey,
    int expirationMinutes = 120,
  }) {
    final nowInSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    final expires = nowInSeconds + (expirationMinutes * 60);

    final path = '/$videoId/playlist.m3u8';
    final tokenBase = '$securityKey$path$expires';
    final hashDigest = sha256.convert(utf8.encode(tokenBase));
    final tokenHash = hashDigest.toString();

    return 'https://$cdnHostname$path?token=$tokenHash&expires=$expires';
  }
}
`;

export const FLUTTER_DART_MAIN_CODE = `// lib/main.dart
// VKid Flutter Mobile App Entry Point with Riverpod & Firebase Init
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';

import 'features/auth/parent_pin_screen.dart';
import 'features/kid_home/kid_home_screen.dart';
import 'features/parent_dashboard/parent_dashboard_screen.dart';
import 'providers/screen_time_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const ProviderScope(child: VKidApp()));
}

class VKidApp extends ConsumerWidget {
  const VKidApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLocked = ref.watch(screenTimeLockProvider);

    return MaterialApp(
      title: 'VKid - Safe Educational Platform',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF6B6B),
          brightness: Brightness.light,
        ),
        textTheme: GoogleFonts.fredokaTextTheme(),
        cardTheme: CardTheme(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          elevation: 4,
        ),
      ),
      home: isLocked ? const ScreenTimeLockOverlay() : const KidHomeScreen(),
      routes: {
        '/parent-pin': (ctx) => const ParentPinLockScreen(),
        '/parent-dashboard': (ctx) => const ParentDashboardScreen(),
      },
    );
  }
}
`;

export const FIRESTORE_SECURITY_RULES_CODE = `// firestore.rules
// Production Zero-Trust ABAC Security Rules for VKid Platform
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper Functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isParent(familyId) {
      return isSignedIn() &&
        exists(/databases/$(database)/documents/families/$(familyId)) &&
        get(/databases/$(database)/documents/families/$(familyId)).data.parentUid == request.auth.uid;
    }

    function isValidId(id) {
      return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$');
    }

    // Default Deny Catch-All
    match /{document=**} {
      allow read, write: if false;
    }

    // Family Root Collection (Owned by Parent UID)
    match /families/{familyId} {
      allow get, update: if isSignedIn() && resource.data.parentUid == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.parentUid == request.auth.uid;

      // Child Subcollection
      match /children/{childId} {
        allow read, write: if isParent(familyId);
      }

      // Screen Time Logs Subcollection
      match /logs/{logId} {
        allow create, read: if isParent(familyId);
      }
    }

    // Public Curated Kid Media Collection (Read-Only for Auth Kids/Parents)
    match /media_library/{mediaId} {
      allow get, list: if isSignedIn();
      allow write: if false; // Strict Server-Only Admin Ingestion
    }
  }
}
`;

export const FIREBASE_BLUEPRINT_SCHEMA_JSON = `{
  "entities": {
    "Family": {
      "title": "Family Account",
      "description": "Parental household account containing child profiles and PIN settings.",
      "type": "object",
      "properties": {
        "parentUid": { "type": "string", "description": "Firebase Auth UID" },
        "parentEmail": { "type": "string", "format": "email" },
        "parentPinHash": { "type": "string", "description": "Encrypted 4-digit PIN" },
        "createdAt": { "type": "string", "format": "date-time" }
      },
      "required": ["parentUid", "parentEmail", "parentPinHash"]
    },
    "ChildProfile": {
      "title": "Child Profile",
      "description": "Individual child settings, age rating, goals, and earned rewards.",
      "type": "object",
      "properties": {
        "name": { "type": "string", "maxLength": 30 },
        "age": { "type": "integer", "minimum": 3, "maximum": 12 },
        "avatarUrl": { "type": "string" },
        "dailyGoalMinutes": { "type": "integer", "default": 30 },
        "timeSpentTodayMinutes": { "type": "integer", "default": 0 },
        "earnedBadges": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["name", "age"]
    }
  },
  "firestore": {
    "/families/{familyId}": {
      "schema": { "$ref": "#/entities/Family" },
      "description": "Parent family documents."
    },
    "/families/{familyId}/children/{childId}": {
      "schema": { "$ref": "#/entities/ChildProfile" },
      "description": "Child profiles isolated under family scope."
    }
  }
}`;
