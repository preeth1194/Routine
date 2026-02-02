/**
 * Puzzle service for managing puzzle game state
 */
import * as database from './database';
import * as storage from './storage';
import type { PuzzleState, GridTile, VisionComponent } from '@/models/types';
import { getImageSource } from '@/utils/fileSystem';

const ROTATION_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Puzzle service
 */
class PuzzleService {
  /**
   * Get all available goal images from all boards
   */
  async getAvailableImages(): Promise<string[]> {
    const boards = await database.getAllBoards();
    const images: string[] = [];

    for (const board of boards) {
      if (board.layoutType === 'grid') {
        // Get grid tiles
        const tiles = await database.getGridTilesByBoardId(board.id);
        for (const tile of tiles) {
          const imageUri = getImageSource(tile.imagePath, tile.imageUrl);
          if (imageUri) {
            images.push(imageUri);
          }
        }
      } else {
        // Get vision components
        const components = await database.getVisionComponentsByBoardId(board.id);
        for (const component of components) {
          if (component.type === 'image') {
            const imageUri = getImageSource(component.imagePath, component.imageUrl);
            if (imageUri) {
              images.push(imageUri);
            }
          }
        }
      }
    }

    return images;
  }

  /**
   * Get the current puzzle image
   * Auto-rotates if 4 hours have passed
   */
  async getCurrentPuzzleImage(): Promise<string | null> {
    const state = await storage.getPuzzleState();
    const now = Date.now();

    // Check if we need to rotate
    if (state?.lastRotatedAt) {
      const lastRotated = new Date(state.lastRotatedAt).getTime();
      if (now - lastRotated < ROTATION_INTERVAL_MS && state.currentImagePath) {
        return state.currentImagePath;
      }
    }

    // Need to select a new image
    const images = await this.getAvailableImages();
    if (images.length === 0) return null;

    // Select a random image
    const randomIndex = Math.floor(Math.random() * images.length);
    const newImage = images[randomIndex];

    // Save state
    await storage.setPuzzleState({
      currentImagePath: newImage,
      lastRotatedAt: new Date().toISOString(),
    });

    return newImage;
  }

  /**
   * Manually set the puzzle image
   */
  async setPuzzleImage(imagePath: string): Promise<void> {
    await storage.setPuzzleState({
      currentImagePath: imagePath,
      lastRotatedAt: new Date().toISOString(),
    });
  }

  /**
   * Get time until next automatic rotation
   */
  async getTimeUntilRotation(): Promise<number> {
    const state = await storage.getPuzzleState();
    if (!state?.lastRotatedAt) return 0;

    const lastRotated = new Date(state.lastRotatedAt).getTime();
    const nextRotation = lastRotated + ROTATION_INTERVAL_MS;
    const remaining = nextRotation - Date.now();

    return Math.max(0, remaining);
  }

  /**
   * Force rotation to a new image
   */
  async forceRotation(): Promise<string | null> {
    const images = await this.getAvailableImages();
    if (images.length === 0) return null;

    const state = await storage.getPuzzleState();
    let availableImages = images;

    // Exclude current image if possible
    if (state?.currentImagePath && images.length > 1) {
      availableImages = images.filter((img) => img !== state.currentImagePath);
    }

    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const newImage = availableImages[randomIndex];

    await storage.setPuzzleState({
      currentImagePath: newImage,
      lastRotatedAt: new Date().toISOString(),
    });

    return newImage;
  }

  /**
   * Generate shuffled piece positions for a 4x4 puzzle
   */
  generateShuffledPositions(): number[] {
    const positions = Array.from({ length: 16 }, (_, i) => i);
    
    // Fisher-Yates shuffle
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    return positions;
  }

  /**
   * Check if puzzle is solved
   */
  isSolved(positions: number[]): boolean {
    return positions.every((pos, index) => pos === index);
  }
}

// Export singleton instance
export const puzzleService = new PuzzleService();
