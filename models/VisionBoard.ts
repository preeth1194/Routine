import type { BoardLayoutType } from './types';

/**
 * Vision Board model
 * Represents a board that contains goals, habits, and tasks
 */
export interface VisionBoard {
  id: string;
  name: string;
  layoutType: BoardLayoutType;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  color?: string;
  backgroundImagePath?: string;
  backgroundImageUrl?: string;
  syncedAt?: string;
}

/**
 * Create a new VisionBoard with defaults
 */
export function createVisionBoard(
  params: Pick<VisionBoard, 'id' | 'name' | 'layoutType'> & Partial<VisionBoard>
): VisionBoard {
  return {
    createdAt: new Date().toISOString(),
    isActive: false,
    ...params,
  };
}

/**
 * Check if a board is a grid board
 */
export function isGridBoard(board: VisionBoard): boolean {
  return board.layoutType === 'grid';
}

/**
 * Check if a board is a freeform board
 */
export function isFreeformBoard(board: VisionBoard): boolean {
  return board.layoutType === 'freeform';
}
