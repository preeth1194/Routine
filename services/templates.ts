/**
 * Templates service for browsing and applying board templates
 */
import { authService } from './auth';
import type { Template } from '@/models/types';

/**
 * Templates service
 */
class TemplatesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = authService.getBaseUrl();
  }

  /**
   * Get all public templates
   */
  async getTemplates(): Promise<Template[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`);

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }

      const data = await response.json();
      return data.templates || [];
    } catch (error) {
      console.warn('Failed to fetch templates, using fallback:', error);
      return this.getFallbackTemplates();
    }
  }

  /**
   * Get a specific template by ID
   */
  async getTemplateById(id: string): Promise<Template | null> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${id}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch template: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Failed to fetch template:', error);
      return null;
    }
  }

  /**
   * Get fallback templates when backend is unavailable
   */
  private getFallbackTemplates(): Template[] {
    return [
      {
        id: 'health-wellness',
        name: 'Health & Wellness',
        description: 'Transform your health with fitness, nutrition, and mindfulness goals',
        layoutType: 'grid',
        previewImageUrl: 'https://images.pexels.com/photos/4397833/pexels-photo-4397833.jpeg?auto=compress&w=600',
        goals: [
          { name: 'Run a Marathon', category: 'Fitness' },
          { name: 'Meditate Daily', category: 'Mindfulness' },
          { name: 'Eat Clean', category: 'Nutrition' },
          { name: 'Sleep 8 Hours', category: 'Rest' },
          { name: 'Drink More Water', category: 'Nutrition' },
          { name: 'Practice Yoga', category: 'Fitness' },
        ],
      },
      {
        id: 'career-success',
        name: 'Career Success',
        description: 'Achieve your professional goals and advance your career',
        layoutType: 'grid',
        previewImageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&w=600',
        goals: [
          { name: 'Get Promoted', category: 'Career' },
          { name: 'Learn New Skills', category: 'Education' },
          { name: 'Build Network', category: 'Networking' },
          { name: 'Start Side Project', category: 'Entrepreneurship' },
          { name: 'Public Speaking', category: 'Skills' },
          { name: 'Financial Freedom', category: 'Finance' },
        ],
      },
      {
        id: 'creative-life',
        name: 'Creative Life',
        description: 'Unleash your creativity and express yourself through art',
        layoutType: 'freeform',
        previewImageUrl: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&w=600',
        goals: [
          { name: 'Paint Weekly', category: 'Art' },
          { name: 'Write a Book', category: 'Writing' },
          { name: 'Learn Music', category: 'Music' },
          { name: 'Photography Project', category: 'Photography' },
          { name: 'Craft Something New', category: 'DIY' },
        ],
      },
      {
        id: 'relationship-goals',
        name: 'Relationship Goals',
        description: 'Strengthen connections with family and friends',
        layoutType: 'grid',
        previewImageUrl: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&w=600',
        goals: [
          { name: 'Quality Family Time', category: 'Family' },
          { name: 'Date Nights', category: 'Romance' },
          { name: 'Call Friends Weekly', category: 'Friendship' },
          { name: 'Be Present', category: 'Mindfulness' },
          { name: 'Express Gratitude', category: 'Wellness' },
        ],
      },
      {
        id: 'adventure-seeker',
        name: 'Adventure Seeker',
        description: 'Explore the world and create unforgettable memories',
        layoutType: 'freeform',
        previewImageUrl: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&w=600',
        goals: [
          { name: 'Visit 10 Countries', category: 'Travel' },
          { name: 'Hike a Mountain', category: 'Adventure' },
          { name: 'Learn to Surf', category: 'Sports' },
          { name: 'Road Trip', category: 'Travel' },
          { name: 'Try New Foods', category: 'Experience' },
        ],
      },
    ];
  }
}

// Export singleton instance
export const templatesService = new TemplatesService();
