/**
 * Stock images service for Pexels search
 */
import { authService } from './auth';

export interface StockImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  photographer: string;
}

/**
 * Stock images service
 */
class StockImagesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = authService.getBaseUrl();
  }

  /**
   * Search Pexels for images
   */
  async searchPexels(query: string, perPage: number = 15): Promise<StockImage[]> {
    try {
      const params = new URLSearchParams({
        query,
        perPage: perPage.toString(),
      });

      const response = await fetch(
        `${this.baseUrl}/stock/pexels/search?${params}`
      );

      if (!response.ok) {
        throw new Error(`Pexels search failed: ${response.status}`);
      }

      const data = await response.json();
      
      return (data.photos || []).map((photo: any) => ({
        id: photo.id.toString(),
        url: photo.src?.large || photo.src?.original || photo.url,
        thumbnailUrl: photo.src?.medium || photo.src?.small || photo.url,
        photographer: photo.photographer || 'Unknown',
      }));
    } catch (error) {
      console.error('Pexels search error:', error);
      return [];
    }
  }

  /**
   * Get image URLs for a query
   */
  async searchPexelsUrls(query: string, perPage: number = 15): Promise<string[]> {
    const images = await this.searchPexels(query, perPage);
    return images.map((img) => img.url);
  }
}

// Export singleton instance
export const stockImagesService = new StockImagesService();
