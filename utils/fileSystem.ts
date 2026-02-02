/**
 * File system utilities for handling images and files
 * Web-safe implementation that works on all platforms
 */
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Get the base directory for app files
 */
export function getDocumentDirectory(): string {
  return (FileSystem as any).documentDirectory ?? '';
}

/**
 * Get the cache directory for temporary files
 */
export function getCacheDirectory(): string {
  return (FileSystem as any).cacheDirectory ?? '';
}

/**
 * Check if a path is a URL
 */
export function isUrl(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://');
}

/**
 * Check if a path is a local file path
 */
export function isLocalPath(path: string): boolean {
  return path.startsWith('file://') || path.startsWith('/');
}

/**
 * Check if a file exists (web-safe)
 * On web, returns false for local paths
 */
export async function fileExists(path: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    // On web, we can only check URLs via fetch
    if (isUrl(path)) {
      try {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
      } catch {
        return false;
      }
    }
    // Local file paths don't work on web
    return false;
  }

  try {
    const info = await (FileSystem as any).getInfoAsync(path);
    return info.exists;
  } catch {
    return false;
  }
}

/**
 * Download a file from URL to local storage
 * On web, returns the URL unchanged
 */
export async function downloadFile(
  url: string,
  filename: string,
  directory: 'documents' | 'cache' = 'documents'
): Promise<string> {
  if (Platform.OS === 'web') {
    // On web, we can't download to local storage, return URL
    return url;
  }

  const baseDir = directory === 'documents' 
    ? getDocumentDirectory() 
    : getCacheDirectory();
  
  const localPath = `${baseDir}${filename}`;

  // Check if already downloaded
  const exists = await fileExists(localPath);
  if (exists) {
    return localPath;
  }

  // Download the file
  const downloadResult = await (FileSystem as any).downloadAsync(url, localPath);
  
  if (downloadResult.status !== 200) {
    throw new Error(`Failed to download file: ${downloadResult.status}`);
  }

  return downloadResult.uri;
}

/**
 * Download an image and return the local path
 */
export async function downloadImage(
  url: string,
  imageId: string,
  directory: 'documents' | 'cache' = 'cache'
): Promise<string> {
  // Extract extension from URL or default to jpg
  const extension = url.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
  const filename = `images/${imageId}.${extension}`;
  
  return downloadFile(url, filename, directory);
}

/**
 * Delete a file
 */
export async function deleteFile(path: string): Promise<void> {
  if (Platform.OS === 'web') {
    return; // No-op on web
  }

  try {
    await (FileSystem as any).deleteAsync(path, { idempotent: true });
  } catch (error) {
    console.warn('Failed to delete file:', error);
  }
}

/**
 * Create a directory if it doesn't exist
 */
export async function ensureDirectory(path: string): Promise<void> {
  if (Platform.OS === 'web') {
    return; // No-op on web
  }

  try {
    const info = await (FileSystem as any).getInfoAsync(path);
    if (!info.exists) {
      await (FileSystem as any).makeDirectoryAsync(path, { intermediates: true });
    }
  } catch (error) {
    console.warn('Failed to create directory:', error);
  }
}

/**
 * Get a usable image source (local path or URL)
 * Prioritizes local path if available, falls back to URL
 */
export function getImageSource(
  localPath?: string | null,
  url?: string | null
): string | undefined {
  if (Platform.OS === 'web') {
    // On web, prefer URL since local paths don't work
    return url || localPath || undefined;
  }

  // On native, prefer local path
  return localPath || url || undefined;
}

/**
 * Convert a local file to base64
 */
export async function fileToBase64(path: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const base64 = await (FileSystem as any).readAsStringAsync(path, {
      encoding: (FileSystem as any).EncodingType?.Base64 ?? 'base64',
    });
    return base64;
  } catch (error) {
    console.warn('Failed to read file as base64:', error);
    return null;
  }
}

/**
 * Write base64 data to a file
 */
export async function base64ToFile(
  base64: string,
  filename: string,
  directory: 'documents' | 'cache' = 'documents'
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const baseDir = directory === 'documents' 
      ? getDocumentDirectory() 
      : getCacheDirectory();
    
    const path = `${baseDir}${filename}`;
    
    await (FileSystem as any).writeAsStringAsync(path, base64, {
      encoding: (FileSystem as any).EncodingType?.Base64 ?? 'base64',
    });
    
    return path;
  } catch (error) {
    console.warn('Failed to write base64 to file:', error);
    return null;
  }
}

/**
 * Get file info
 */
export async function getFileInfo(path: string): Promise<{
  exists: boolean;
  size?: number;
  modificationTime?: number;
} | null> {
  if (Platform.OS === 'web') {
    return { exists: isUrl(path) };
  }

  try {
    const info = await (FileSystem as any).getInfoAsync(path);
    return {
      exists: info.exists,
      size: info.exists ? (info as any).size : undefined,
      modificationTime: info.exists ? (info as any).modificationTime : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Copy a file to a new location
 */
export async function copyFile(from: string, to: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    await (FileSystem as any).copyAsync({ from, to });
    return true;
  } catch (error) {
    console.warn('Failed to copy file:', error);
    return false;
  }
}

/**
 * Move a file to a new location
 */
export async function moveFile(from: string, to: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    await (FileSystem as any).moveAsync({ from, to });
    return true;
  } catch (error) {
    console.warn('Failed to move file:', error);
    return false;
  }
}

/**
 * Clear the image cache
 */
export async function clearImageCache(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const cacheDir = getCacheDirectory();
  const imagesDir = `${cacheDir}images/`;
  
  try {
    await (FileSystem as any).deleteAsync(imagesDir, { idempotent: true });
    await ensureDirectory(imagesDir);
  } catch (error) {
    console.warn('Failed to clear image cache:', error);
  }
}
