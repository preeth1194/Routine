/**
 * AsyncStorage helpers for managing app storage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { UserSettings, PuzzleState } from '@/models/types';

// Storage keys
const KEYS = {
  AUTH_TOKEN: 'dv_auth_token_v1',
  AUTH_EXPIRES_AT: 'dv_auth_expires_at',
  USER_SETTINGS: 'dv_user_settings',
  ACTIVE_BOARD_ID: 'dv_active_board_id',
  PUZZLE_STATE: 'dv_puzzle_state',
  ONBOARDING_COMPLETED: 'dv_onboarding_completed',
  LAST_SYNC_AT: 'dv_last_sync_at',
} as const;

/**
 * Get auth token
 */
export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
}

/**
 * Set auth token
 */
export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
}

/**
 * Get auth token expiry
 */
export async function getAuthExpiresAt(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.AUTH_EXPIRES_AT);
}

/**
 * Set auth token expiry
 */
export async function setAuthExpiresAt(expiresAt: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.AUTH_EXPIRES_AT, expiresAt);
}

/**
 * Check if auth token is expired
 */
export async function isAuthExpired(): Promise<boolean> {
  const expiresAt = await getAuthExpiresAt();
  if (!expiresAt) return true;
  
  const expiryDate = new Date(expiresAt);
  return expiryDate <= new Date();
}

/**
 * Clear auth data
 */
export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.AUTH_TOKEN, KEYS.AUTH_EXPIRES_AT]);
}

/**
 * Get user settings
 */
export async function getUserSettings(): Promise<UserSettings | null> {
  const data = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
  if (!data) return null;
  return JSON.parse(data) as UserSettings;
}

/**
 * Set user settings
 */
export async function setUserSettings(settings: UserSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(settings));
}

/**
 * Get active board ID
 */
export async function getActiveBoardId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.ACTIVE_BOARD_ID);
}

/**
 * Set active board ID
 */
export async function setActiveBoardId(boardId: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.ACTIVE_BOARD_ID, boardId);
}

/**
 * Get puzzle state
 */
export async function getPuzzleState(): Promise<PuzzleState | null> {
  const data = await AsyncStorage.getItem(KEYS.PUZZLE_STATE);
  if (!data) return null;
  return JSON.parse(data) as PuzzleState;
}

/**
 * Set puzzle state
 */
export async function setPuzzleState(state: PuzzleState): Promise<void> {
  await AsyncStorage.setItem(KEYS.PUZZLE_STATE, JSON.stringify(state));
}

/**
 * Check if onboarding is completed
 */
export async function isOnboardingCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
  return value === 'true';
}

/**
 * Set onboarding completed
 */
export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncAt(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.LAST_SYNC_AT);
}

/**
 * Set last sync timestamp
 */
export async function setLastSyncAt(timestamp: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.LAST_SYNC_AT, timestamp);
}

/**
 * Clear all app data
 */
export async function clearAllData(): Promise<void> {
  const allKeys = Object.values(KEYS);
  await AsyncStorage.multiRemove(allKeys);
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.removeItem('visionboard_data');
  }
}

/**
 * Generic get/set for any JSON value
 */
export async function getItem<T>(key: string): Promise<T | null> {
  const data = await AsyncStorage.getItem(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
