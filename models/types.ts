/**
 * Core type definitions for the Vision Board app
 */

// Board layout types
export type BoardLayoutType = 'freeform' | 'grid';

// Schedule types for habits
export type HabitSchedule = 'daily' | 'weekly';

// Timer modes for time-bound habits
export type TimerMode = 'time' | 'song';

// Completion feedback
export interface CompletionFeedback {
  rating: number; // 1-5
  note?: string;
}

// Position for freeform layouts
export interface Position {
  x: number;
  y: number;
}

// Size for components
export interface Size {
  width: number;
  height: number;
}

// Auth token response
export interface AuthToken {
  token: string;
  expiresAt: string;
}

// User settings
export interface UserSettings {
  homeTimezone: string;
  gender?: 'male' | 'female' | 'other';
  theme?: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
}

// Sync outbox item
export interface SyncOutboxItem {
  id: string;
  type: 'board' | 'goal' | 'habit' | 'task' | 'habitCompletion' | 'checklistCompletion';
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  createdAt: string;
}

// Grid tile model for grid boards
export interface GridTile {
  id: string;
  boardId: string;
  goalId?: string;
  position: number; // 0-8 for 3x3 grid
  imagePath?: string;
  imageUrl?: string;
  text?: string;
}

// Vision component for freeform boards
export interface VisionComponent {
  id: string;
  boardId: string;
  goalId?: string;
  type: 'image' | 'text' | 'shape';
  position: Position;
  size: Size;
  zIndex: number;
  imagePath?: string;
  imageUrl?: string;
  text?: string;
  color?: string;
  rotation?: number;
}

// Core value for wizard
export interface CoreValue {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

// Category for goals
export interface Category {
  id: string;
  coreValueId: string;
  name: string;
  description?: string;
}

// Recommended goal from wizard
export interface RecommendedGoal {
  id: string;
  name: string;
  category: string;
  whyImportant?: string;
  suggestedHabits?: string[];
  imageUrl?: string;
}

// Journal entry
export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood?: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

// Affirmation
export interface Affirmation {
  id: string;
  text: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Puzzle state
export interface PuzzleState {
  currentImagePath?: string;
  lastRotatedAt?: string;
  piecePositions?: number[];
}

// Music provider types
export type MusicProvider = 'spotify' | 'appleMusic' | 'youtubeMusic' | 'local';

export interface MusicProviderStatus {
  provider: MusicProvider;
  isConnected: boolean;
  username?: string;
}

// Template
export interface Template {
  id: string;
  name: string;
  description?: string;
  layoutType: BoardLayoutType;
  previewImageUrl?: string;
  goals: Array<{
    name: string;
    category?: string;
    imageUrl?: string;
  }>;
}
