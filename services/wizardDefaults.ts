/**
 * Wizard defaults service for fetching core values and categories
 */
import { authService } from './auth';
import type { CoreValue, Category } from '@/models/types';

// Cached defaults
let cachedDefaults: { coreValues: CoreValue[]; categories: Category[] } | null = null;

/**
 * Wizard defaults service
 */
class WizardDefaultsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = authService.getBaseUrl();
  }

  /**
   * Fetch wizard defaults from backend
   */
  async getDefaults(): Promise<{ coreValues: CoreValue[]; categories: Category[] }> {
    // Return cached if available
    if (cachedDefaults) {
      return cachedDefaults;
    }

    try {
      const response = await fetch(`${this.baseUrl}/wizard/defaults`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch defaults: ${response.status}`);
      }

      const data = await response.json();
      
      const result = {
        coreValues: data.coreValues || [],
        categories: data.categories || [],
      };

      cachedDefaults = result;
      return result;
    } catch (error) {
      console.warn('Failed to fetch wizard defaults, using fallback:', error);
      return this.getFallbackDefaults();
    }
  }

  /**
   * Get fallback defaults when backend is unavailable
   */
  private getFallbackDefaults(): { coreValues: CoreValue[]; categories: Category[] } {
    const coreValues: CoreValue[] = [
      { id: 'health', name: 'Health & Wellness', icon: 'fitness' },
      { id: 'career', name: 'Career & Finance', icon: 'briefcase' },
      { id: 'relationships', name: 'Relationships', icon: 'heart' },
      { id: 'personal', name: 'Personal Growth', icon: 'trending-up' },
      { id: 'creativity', name: 'Creativity', icon: 'color-palette' },
      { id: 'adventure', name: 'Adventure & Travel', icon: 'airplane' },
    ];

    const categories: Category[] = [
      { id: 'fitness', coreValueId: 'health', name: 'Fitness' },
      { id: 'nutrition', coreValueId: 'health', name: 'Nutrition' },
      { id: 'mental', coreValueId: 'health', name: 'Mental Health' },
      { id: 'income', coreValueId: 'career', name: 'Income' },
      { id: 'skills', coreValueId: 'career', name: 'Skills' },
      { id: 'networking', coreValueId: 'career', name: 'Networking' },
      { id: 'family', coreValueId: 'relationships', name: 'Family' },
      { id: 'friends', coreValueId: 'relationships', name: 'Friends' },
      { id: 'romance', coreValueId: 'relationships', name: 'Romance' },
      { id: 'mindfulness', coreValueId: 'personal', name: 'Mindfulness' },
      { id: 'learning', coreValueId: 'personal', name: 'Learning' },
      { id: 'habits', coreValueId: 'personal', name: 'Habits' },
      { id: 'art', coreValueId: 'creativity', name: 'Art' },
      { id: 'music', coreValueId: 'creativity', name: 'Music' },
      { id: 'writing', coreValueId: 'creativity', name: 'Writing' },
      { id: 'travel', coreValueId: 'adventure', name: 'Travel' },
      { id: 'outdoors', coreValueId: 'adventure', name: 'Outdoors' },
    ];

    return { coreValues, categories };
  }

  /**
   * Clear cached defaults
   */
  clearCache(): void {
    cachedDefaults = null;
  }
}

// Export singleton instance
export const wizardDefaultsService = new WizardDefaultsService();
