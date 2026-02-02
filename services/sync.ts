/**
 * Sync service for backend data synchronization
 */
import { authService } from './auth';
import * as database from './database';
import * as storage from './storage';
import { Platform } from 'react-native';

/**
 * Sync status
 */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

/**
 * Sync service for managing data sync with the backend
 */
class SyncService {
  private status: SyncStatus = 'idle';
  private lastError: string | null = null;
  public authExpired = false;

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * Get last error message
   */
  getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Bootstrap the app with initial data from backend
   * Call this when the app has no local boards
   */
  async bootstrap(): Promise<boolean> {
    try {
      this.status = 'syncing';
      
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated) {
        this.status = 'idle';
        return false;
      }

      const response = await authService.fetch('/sync/bootstrap');
      
      if (!response.ok) {
        throw new Error(`Bootstrap failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Store boards from backend
      if (data.boards && Array.isArray(data.boards)) {
        for (const board of data.boards) {
          await database.insertBoard({
            id: board.id,
            name: board.name,
            layoutType: board.layoutType || 'grid',
            createdAt: board.createdAt || new Date().toISOString(),
            isActive: board.isActive || false,
            color: board.color,
            backgroundImagePath: board.backgroundImagePath,
            backgroundImageUrl: board.backgroundImageUrl,
            syncedAt: new Date().toISOString(),
          });

          // Store goals
          if (board.goals && Array.isArray(board.goals)) {
            for (const goal of board.goals) {
              await database.insertGoal({
                id: goal.id,
                boardId: board.id,
                name: goal.name,
                category: goal.category,
                whyImportant: goal.whyImportant,
                deadline: goal.deadline,
                imagePath: goal.imagePath,
                imageUrl: goal.imageUrl,
                position: goal.position,
                zIndex: goal.zIndex,
                gridPosition: goal.gridPosition,
                createdAt: goal.createdAt || new Date().toISOString(),
              });

              // Store habits
              if (goal.habits && Array.isArray(goal.habits)) {
                for (const habit of goal.habits) {
                  await database.insertHabit({
                    id: habit.id,
                    goalId: goal.id,
                    name: habit.name,
                    schedule: habit.schedule || 'daily',
                    weeklyDays: habit.weeklyDays,
                    completionDates: habit.completionDates || [],
                    streak: habit.streak || 0,
                    timeBound: habit.timeBound,
                    feedbackByDate: habit.feedbackByDate,
                    createdAt: habit.createdAt || new Date().toISOString(),
                  });
                }
              }

              // Store tasks
              if (goal.tasks && Array.isArray(goal.tasks)) {
                for (const task of goal.tasks) {
                  await database.insertTask({
                    id: task.id,
                    goalId: goal.id,
                    name: task.name,
                    checklist: task.checklist || [],
                    dueDate: task.dueDate,
                    completionFeedbackByDate: task.completionFeedbackByDate,
                    createdAt: task.createdAt || new Date().toISOString(),
                  });
                }
              }
            }
          }
        }
      }

      // Store settings
      if (data.settings) {
        await storage.setUserSettings({
          homeTimezone: data.settings.home_timezone,
          gender: data.settings.gender,
          theme: data.settings.theme,
          notificationsEnabled: data.settings.notifications_enabled,
        });
      }

      await storage.setLastSyncAt(new Date().toISOString());
      this.status = 'success';
      return true;
    } catch (error) {
      this.status = 'error';
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      if (this.lastError === 'expired_auth') {
        this.authExpired = true;
      }
      
      console.error('Bootstrap error:', error);
      return false;
    }
  }

  /**
   * Push local changes to the backend
   */
  async push(): Promise<boolean> {
    try {
      // Skip sync on web when backend might be unreachable
      if (Platform.OS === 'web') {
        // Best effort sync on web
        try {
          return await this.doPush();
        } catch {
          console.log('Sync skipped on web (backend unreachable)');
          return true;
        }
      }

      return await this.doPush();
    } catch (error) {
      this.status = 'error';
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      if (this.lastError === 'expired_auth') {
        this.authExpired = true;
      }
      
      console.error('Push error:', error);
      return false;
    }
  }

  private async doPush(): Promise<boolean> {
    this.status = 'syncing';
    
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      this.status = 'idle';
      return false;
    }

    const outbox = await database.getOutbox();
    
    if (outbox.length === 0) {
      this.status = 'success';
      return true;
    }

    const response = await authService.fetch('/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        changes: outbox,
      }),
    });

    if (!response.ok) {
      throw new Error(`Push failed: ${response.status}`);
    }

    // Clear outbox after successful push
    await database.clearOutbox();
    await storage.setLastSyncAt(new Date().toISOString());
    
    this.status = 'success';
    return true;
  }

  /**
   * Sync if needed - bootstraps on empty, pushes changes otherwise
   */
  async syncIfNeeded(): Promise<boolean> {
    const boards = await database.getAllBoards();
    
    if (boards.length === 0) {
      return this.bootstrap();
    } else {
      return this.push();
    }
  }

  /**
   * Force full sync - clears local and bootstraps from backend
   */
  async forceFullSync(): Promise<boolean> {
    // Clear local data (except auth)
    const db = database.getDatabase();
    await db.execAsync(`
      DELETE FROM boards;
      DELETE FROM goals;
      DELETE FROM habits;
      DELETE FROM habit_completions;
      DELETE FROM tasks;
      DELETE FROM checklist_items;
      DELETE FROM grid_tiles;
      DELETE FROM vision_components;
      DELETE FROM sync_outbox;
    `);

    return this.bootstrap();
  }

  /**
   * Reset auth expired flag
   */
  resetAuthExpired(): void {
    this.authExpired = false;
  }
}

// Export singleton instance
export const syncService = new SyncService();

// Export class for testing
export { SyncService };
