/**
 * Category images service for fetching default images by category
 */
import { authService } from './auth';
import { stockImagesService } from './stockImages';

/**
 * Category images service
 */
class CategoryImagesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = authService.getBaseUrl();
  }

  /**
   * Get images for a category
   */
  async getCategoryImages(
    coreValueId: string,
    category: string
  ): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        coreValueId,
        category,
      });

      const response = await fetch(
        `${this.baseUrl}/stock/category-images?${params}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get category images: ${response.status}`);
      }

      const data = await response.json();
      return data.images || [];
    } catch (error) {
      console.warn('Failed to get category images, falling back to Pexels:', error);
      return this.getFallbackImages(category);
    }
  }

  /**
   * Get a single category image URL
   */
  async getCategoryImageUrl(
    coreValueId: string,
    category: string
  ): Promise<string | null> {
    const images = await this.getCategoryImages(coreValueId, category);
    if (images.length === 0) return null;
    
    // Return a random image
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }

  /**
   * Fallback to Pexels search
   */
  private async getFallbackImages(category: string): Promise<string[]> {
    return stockImagesService.searchPexelsUrls(category, 10);
  }
}

// Export singleton instance
export const categoryImagesService = new CategoryImagesService();
