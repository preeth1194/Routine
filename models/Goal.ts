import type { Position } from './types';

/**
 * Goal model
 * Represents a goal attached to a vision board
 */
export interface Goal {
  id: string;
  boardId: string;
  name: string;
  category?: string;
  whyImportant?: string;
  deadline?: string; // YYYY-MM-DD
  imagePath?: string;
  imageUrl?: string;
  position?: Position; // for freeform layouts
  zIndex?: number;
  gridPosition?: number; // for grid layouts (0-8 for 3x3)
  createdAt: string;
  updatedAt?: string;
}

/**
 * Create a new Goal with defaults
 */
export function createGoal(
  params: Pick<Goal, 'id' | 'boardId' | 'name'> & Partial<Goal>
): Goal {
  return {
    createdAt: new Date().toISOString(),
    ...params,
  };
}

/**
 * Check if a goal has an image
 */
export function hasImage(goal: Goal): boolean {
  return Boolean(goal.imagePath || goal.imageUrl);
}

/**
 * Get the image source for a goal
 */
export function getImageSource(goal: Goal): string | undefined {
  return goal.imagePath || goal.imageUrl;
}

/**
 * Check if a goal is past its deadline
 */
export function isPastDeadline(goal: Goal): boolean {
  if (!goal.deadline) return false;
  const deadlineDate = new Date(goal.deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadlineDate < today;
}
