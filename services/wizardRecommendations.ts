/**
 * Wizard recommendations service for fetching goal recommendations
 */
import { authService } from './auth';
import type { RecommendedGoal } from '@/models/types';

/**
 * Wizard recommendations service
 */
class WizardRecommendationsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = authService.getBaseUrl();
  }

  /**
   * Get recommended goals for a core value and category
   */
  async getRecommendations(
    coreValueId: string,
    category?: string,
    gender?: string
  ): Promise<RecommendedGoal[]> {
    try {
      const params = new URLSearchParams({
        coreValueId,
        ...(category && { category }),
        ...(gender && { gender }),
      });

      const response = await fetch(
        `${this.baseUrl}/wizard/recommendations?${params}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.warn('Failed to fetch recommendations, using fallback:', error);
      return this.getFallbackRecommendations(coreValueId, category);
    }
  }

  /**
   * Generate new recommendations using AI
   */
  async generateRecommendations(
    coreValueId: string,
    category?: string,
    gender?: string
  ): Promise<RecommendedGoal[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/wizard/recommendations/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coreValueId, category, gender }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate recommendations: ${response.status}`);
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.warn('Failed to generate recommendations:', error);
      return this.getFallbackRecommendations(coreValueId, category);
    }
  }

  /**
   * Get or generate recommendations
   */
  async getOrGenerate(
    coreValueId: string,
    category?: string,
    gender?: string
  ): Promise<RecommendedGoal[]> {
    const existing = await this.getRecommendations(coreValueId, category, gender);
    if (existing.length > 0) {
      return existing;
    }
    return this.generateRecommendations(coreValueId, category, gender);
  }

  /**
   * Fallback recommendations when backend is unavailable
   */
  private getFallbackRecommendations(
    coreValueId: string,
    category?: string
  ): RecommendedGoal[] {
    const recommendations: Record<string, RecommendedGoal[]> = {
      health: [
        {
          id: 'health-1',
          name: 'Run a 5K',
          category: 'Fitness',
          whyImportant: 'Build cardiovascular endurance',
          suggestedHabits: ['Run 3x per week', 'Stretch daily'],
        },
        {
          id: 'health-2',
          name: 'Meditate Daily',
          category: 'Mental Health',
          whyImportant: 'Reduce stress and improve focus',
          suggestedHabits: ['10-minute morning meditation'],
        },
        {
          id: 'health-3',
          name: 'Eat Clean',
          category: 'Nutrition',
          whyImportant: 'Fuel my body with healthy food',
          suggestedHabits: ['Meal prep Sundays', 'Drink 8 glasses of water'],
        },
      ],
      career: [
        {
          id: 'career-1',
          name: 'Get Promoted',
          category: 'Career',
          whyImportant: 'Advance my professional growth',
          suggestedHabits: ['Weekly skill learning', 'Network monthly'],
        },
        {
          id: 'career-2',
          name: 'Save $10K',
          category: 'Finance',
          whyImportant: 'Build financial security',
          suggestedHabits: ['Track expenses daily', 'Save 20% of income'],
        },
        {
          id: 'career-3',
          name: 'Learn New Skill',
          category: 'Skills',
          whyImportant: 'Stay competitive in my field',
          suggestedHabits: ['Study 30 min daily', 'Practice projects weekly'],
        },
      ],
      relationships: [
        {
          id: 'rel-1',
          name: 'Strengthen Family Bonds',
          category: 'Family',
          whyImportant: 'Create lasting memories',
          suggestedHabits: ['Weekly family dinner', 'Call parents weekly'],
        },
        {
          id: 'rel-2',
          name: 'Make New Friends',
          category: 'Social',
          whyImportant: 'Expand my social circle',
          suggestedHabits: ['Attend 2 events monthly', 'Reach out to 1 person weekly'],
        },
      ],
      personal: [
        {
          id: 'personal-1',
          name: 'Read 24 Books',
          category: 'Learning',
          whyImportant: 'Expand my knowledge',
          suggestedHabits: ['Read 30 min daily'],
        },
        {
          id: 'personal-2',
          name: 'Journal Daily',
          category: 'Mindfulness',
          whyImportant: 'Reflect and grow',
          suggestedHabits: ['Morning pages', 'Gratitude journal'],
        },
      ],
      creativity: [
        {
          id: 'creative-1',
          name: 'Create Art Weekly',
          category: 'Art',
          whyImportant: 'Express myself creatively',
          suggestedHabits: ['Sketch 15 min daily', 'Art project weekly'],
        },
        {
          id: 'creative-2',
          name: 'Learn an Instrument',
          category: 'Music',
          whyImportant: 'Develop a new creative outlet',
          suggestedHabits: ['Practice 20 min daily'],
        },
      ],
      adventure: [
        {
          id: 'adventure-1',
          name: 'Visit 5 New Places',
          category: 'Travel',
          whyImportant: 'Explore the world',
          suggestedHabits: ['Plan monthly adventures', 'Save for travel'],
        },
        {
          id: 'adventure-2',
          name: 'Hike Weekly',
          category: 'Outdoors',
          whyImportant: 'Connect with nature',
          suggestedHabits: ['Weekend hikes', 'Try new trails'],
        },
      ],
    };

    return recommendations[coreValueId] || [];
  }
}

// Export singleton instance
export const wizardRecommendationsService = new WizardRecommendationsService();
