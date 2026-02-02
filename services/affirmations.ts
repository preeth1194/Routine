/**
 * Affirmations service for backend API integration
 */
import { authService } from './auth';
import * as database from './database';
import type { Affirmation } from '@/models/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Affirmations service for managing affirmations
 */
class AffirmationsService {
  /**
   * Load all affirmations (local first, then sync with backend)
   */
  async loadAffirmations(): Promise<Affirmation[]> {
    // First, load from local database
    const localAffirmations = await database.getAllAffirmations();
    
    // Try to sync with backend
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const response = await authService.fetch('/api/affirmations?limit=100');
        if (response.ok) {
          const data = await response.json();
          const backendAffirmations: Affirmation[] = data.affirmations || [];
          
          // Merge backend affirmations into local database
          for (const affirmation of backendAffirmations) {
            const existing = localAffirmations.find((a) => a.id === affirmation.id);
            if (!existing) {
              await database.insertAffirmation(affirmation);
            } else if (new Date(affirmation.updatedAt) > new Date(existing.updatedAt)) {
              await database.updateAffirmation(affirmation);
            }
          }
          
          // Reload after sync
          return database.getAllAffirmations();
        }
      }
    } catch (error) {
      console.warn('Failed to sync affirmations with backend:', error);
    }
    
    return localAffirmations;
  }

  /**
   * Create a new affirmation
   */
  async createAffirmation(text: string): Promise<Affirmation> {
    const now = new Date().toISOString();
    const affirmation: Affirmation = {
      id: uuidv4(),
      text,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    };

    // Save locally
    await database.insertAffirmation(affirmation);

    // Sync to backend
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        await authService.fetch('/api/affirmations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
      }
    } catch (error) {
      console.warn('Failed to sync new affirmation to backend:', error);
    }

    return affirmation;
  }

  /**
   * Update an affirmation
   */
  async updateAffirmation(affirmation: Affirmation): Promise<Affirmation> {
    const updated: Affirmation = {
      ...affirmation,
      updatedAt: new Date().toISOString(),
    };

    // Save locally
    await database.updateAffirmation(updated);

    // Sync to backend
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        await authService.fetch(`/api/affirmations/${affirmation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: updated.text }),
        });
      }
    } catch (error) {
      console.warn('Failed to sync updated affirmation to backend:', error);
    }

    return updated;
  }

  /**
   * Delete an affirmation
   */
  async deleteAffirmation(id: string): Promise<void> {
    // Delete locally
    await database.deleteAffirmation(id);

    // Sync to backend
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        await authService.fetch(`/api/affirmations/${id}`, {
          method: 'DELETE',
        });
      }
    } catch (error) {
      console.warn('Failed to sync deleted affirmation to backend:', error);
    }
  }

  /**
   * Toggle pin status for an affirmation
   */
  async togglePin(affirmation: Affirmation): Promise<Affirmation> {
    const updated: Affirmation = {
      ...affirmation,
      isPinned: !affirmation.isPinned,
      updatedAt: new Date().toISOString(),
    };

    // Save locally
    await database.updateAffirmation(updated);

    // Sync to backend
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        await authService.fetch(`/api/affirmations/${affirmation.id}/pin`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPinned: updated.isPinned }),
        });
      }
    } catch (error) {
      console.warn('Failed to sync pinned affirmation to backend:', error);
    }

    return updated;
  }

  /**
   * Get a random pinned affirmation for daily display
   */
  async getDailyAffirmation(): Promise<Affirmation | null> {
    const affirmations = await database.getAllAffirmations();
    const pinned = affirmations.filter((a) => a.isPinned);
    
    if (pinned.length > 0) {
      // Return a random pinned affirmation
      const randomIndex = Math.floor(Math.random() * pinned.length);
      return pinned[randomIndex];
    }
    
    if (affirmations.length > 0) {
      // Return a random affirmation if no pinned ones
      const randomIndex = Math.floor(Math.random() * affirmations.length);
      return affirmations[randomIndex];
    }
    
    return null;
  }
}

// Export singleton instance
export const affirmationsService = new AffirmationsService();
