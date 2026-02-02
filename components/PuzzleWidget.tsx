import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { theme, typography } from '@/constants/theme';
import { puzzleService } from '@/services/puzzle';

export function PuzzleWidget() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shuffledPositions, setShuffledPositions] = useState<number[]>([]);

  useEffect(() => {
    loadPuzzle();
  }, []);

  async function loadPuzzle() {
    setLoading(true);
    try {
      const image = await puzzleService.getCurrentPuzzleImage();
      setImageUri(image);
      if (image) {
        setShuffledPositions(puzzleService.generateShuffledPositions());
      }
    } catch (error) {
      console.error('Failed to load puzzle:', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePress() {
    if (imageUri) {
      router.push('/puzzle' as any);
    }
  }

  function renderPuzzlePreview() {
    if (!imageUri || shuffledPositions.length === 0) {
      return (
        <View style={styles.emptyPreview}>
          <Ionicons name="images-outline" size={32} color={theme.textSecondary} />
          <Text style={styles.emptyText}>No images available</Text>
        </View>
      );
    }

    // Render a 4x4 grid preview of shuffled pieces
    return (
      <View style={styles.puzzleGrid}>
        {shuffledPositions.slice(0, 16).map((originalPos, currentPos) => {
          const row = Math.floor(originalPos / 4);
          const col = originalPos % 4;

          return (
            <View key={currentPos} style={styles.puzzlePiece}>
              <Image
                source={{ uri: imageUri }}
                style={[
                  styles.pieceImage,
                  {
                    // Position the background image to show the correct piece
                    transform: [
                      { translateX: -col * 100 },
                      { translateY: -row * 100 },
                      { scale: 4 },
                    ],
                  },
                ]}
                resizeMode="cover"
              />
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="extension-puzzle" size={20} color={theme.primary} />
          <Text style={styles.title}>Daily Puzzle</Text>
        </View>
        <Pressable style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.preview}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          renderPuzzlePreview()
        )}
      </View>

      {imageUri && (
        <Text style={styles.tapText}>Tap to play</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: typography.headingSemiBold,
    fontSize: 16,
    color: theme.text,
  },
  settingsButton: {
    padding: 4,
  },
  preview: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.backgroundSecondary,
  },
  puzzleGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  puzzlePiece: {
    width: '25%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: theme.cardBorder,
  },
  pieceImage: {
    width: '100%',
    height: '100%',
  },
  emptyPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
  },
  tapText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
