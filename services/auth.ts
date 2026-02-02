/**
 * Authentication service for backend integration
 */
import * as storage from './storage';
import type { AuthToken, UserSettings } from '@/models/types';

const BACKEND_BASE_URL = 'https://digital-vision-board.onrender.com';

/**
 * Auth service for managing authentication with the backend
 */
class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_BASE_URL;
  }

  /**
   * Get the backend base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the current auth token
   */
  async getToken(): Promise<string | null> {
    return storage.getAuthToken();
  }

  /**
   * Get the Authorization header value
   */
  async getAuthHeader(): Promise<string> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No auth token available');
    }
    return `Bearer ${token}`;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;
    
    const isExpired = await storage.isAuthExpired();
    return !isExpired;
  }

  /**
   * Continue as guest - creates a new guest session
   */
  async continueAsGuest(timezone: string, gender?: string): Promise<AuthToken> {
    const response = await fetch(`${this.baseUrl}/auth/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        home_timezone: timezone,
        gender,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create guest session: ${response.status}`);
    }

    const data = await response.json();
    const authToken: AuthToken = {
      token: data.token,
      expiresAt: data.expiresAt,
    };

    // Store token
    await storage.setAuthToken(authToken.token);
    await storage.setAuthExpiresAt(authToken.expiresAt);

    // Store settings
    await storage.setUserSettings({
      homeTimezone: timezone,
      gender: gender as UserSettings['gender'],
    });

    return authToken;
  }

  /**
   * Exchange Firebase ID token for backend token
   */
  async exchangeFirebaseToken(firebaseIdToken: string): Promise<AuthToken> {
    const response = await fetch(`${this.baseUrl}/auth/firebase/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: firebaseIdToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange Firebase token: ${response.status}`);
    }

    const data = await response.json();
    const authToken: AuthToken = {
      token: data.token,
      expiresAt: data.expiresAt,
    };

    // Store token
    await storage.setAuthToken(authToken.token);
    await storage.setAuthExpiresAt(authToken.expiresAt);

    return authToken;
  }

  /**
   * Update user settings on the backend
   */
  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    const authHeader = await this.getAuthHeader();
    
    const response = await fetch(`${this.baseUrl}/user/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        home_timezone: settings.homeTimezone,
        gender: settings.gender,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('expired_auth');
      }
      throw new Error(`Failed to update settings: ${response.status}`);
    }

    // Update local settings
    const currentSettings = await storage.getUserSettings();
    await storage.setUserSettings({
      ...currentSettings,
      ...settings,
    } as UserSettings);
  }

  /**
   * Start Spotify OAuth flow
   * Returns the URL to open in browser
   */
  getSpotifyAuthUrl(): string {
    return `${this.baseUrl}/auth/spotify/start`;
  }

  /**
   * Start YouTube Music OAuth flow
   * Returns the URL to open in browser
   */
  getYouTubeMusicAuthUrl(): string {
    return `${this.baseUrl}/auth/youtube-music/start`;
  }

  /**
   * Start Canva OAuth poll flow
   */
  async startCanvaOAuth(): Promise<{ authUrl: string; pollToken: string }> {
    const response = await fetch(`${this.baseUrl}/auth/canva/start_poll`);
    
    if (!response.ok) {
      throw new Error(`Failed to start Canva OAuth: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Poll for Canva OAuth result
   */
  async pollCanvaOAuth(pollToken: string): Promise<{ status: string; token?: string; expiresAt?: string }> {
    const response = await fetch(`${this.baseUrl}/auth/canva/poll?pollToken=${pollToken}`);
    
    if (!response.ok) {
      throw new Error(`Failed to poll Canva OAuth: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'complete' && data.token) {
      // Store token
      await storage.setAuthToken(data.token);
      await storage.setAuthExpiresAt(data.expiresAt);
    }

    return data;
  }

  /**
   * Sign out - clears all auth data
   */
  async signOut(): Promise<void> {
    await storage.clearAuth();
  }

  /**
   * Make an authenticated request
   */
  async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const authHeader = await this.getAuthHeader();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': authHeader,
      },
    });

    if (response.status === 401) {
      // Token expired
      throw new Error('expired_auth');
    }

    return response;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };
