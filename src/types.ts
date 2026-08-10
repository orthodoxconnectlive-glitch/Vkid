export type AgeGroup = '4-5' | '6-7' | '8-10';

export type SupportedLanguage = 'en' | 'ar' | 'es' | 'zh' | 'ko' | 'ru' | 'fr' | 'de' | 'pt' | 'hi' | 'ja';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  ageGroup: AgeGroup;
  avatarUrl: string;
  avatarColor: string;
  dailyGoalMinutes: number;
  timeSpentTodayMinutes: number;
  earnedBadges: string[];
  unlockedStickers: string[];
  favoriteMediaIds: string[];
}

export type MediaType = 'video' | 'audiobook' | 'rhyme';

export type VideoApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  category: string;
  duration: string;
  thumbnailUrl: string;
  mediaUrl: string;
  targetAgeGroup: AgeGroup[];
  description: string;
  isPopular?: boolean;
  status?: VideoApprovalStatus;
  uploadedBy?: string;
  createdAt?: string;
  provider?: 'direct' | 'youtube' | 'vimeo';
  storageUrl?: string;
  publicUrl?: string;
}

export type UserRole = 'super_admin' | 'admin' | 'educator' | 'parent';

export interface Classroom {
  id: string;
  name: string;
  grade: string;
  studentPin: string;
  assignedPlaylists: string[];
  studentCount?: number;
}

export interface SchoolData {
  schoolName: string;
  classes: Classroom[];
  activeClassId?: string;
  presentationMode: boolean;
}

export interface UserAccount {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  schoolName?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended';
  uploadedCount?: number;
  createdAt: string;
  channelBio?: string;
}

export type GameCategory = 'math' | 'reading' | 'logic' | 'science' | 'music' | 'art' | 'spelling' | 'memory';

export interface ActivityGame {
  id: string;
  title: string;
  category: GameCategory;
  icon: string;
  color: string;
  targetAgeGroup: AgeGroup[];
  description: string;
  instructions?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: GameCategory | 'general';
  requiredCount: number;
}

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  color: string;
  category: string;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
}

export interface ScreenTimeConfig {
  dailyLimitMinutes: number;
  sessionDurationMinutes: number;
  isTimerEnabled: boolean;
  bedtimeStart: string; // e.g. "20:00"
  bedtimeEnd: string;   // e.g. "07:00"
  contentFilters: {
    videosEnabled: boolean;
    audiobooksEnabled: boolean;
    gamesEnabled: boolean;
    aiStoryEnabled: boolean;
    maxAgeGroup: AgeGroup;
  };
}

export interface UsageReportData {
  day: string;
  mediaMinutes: number;
  gamesMinutes: number;
  totalMinutes: number;
}

export interface GameSessionLog {
  id: string;
  childId: string;
  gameTitle: string;
  category: GameCategory;
  score: number;
  durationSeconds: number;
  timestamp: string;
}
