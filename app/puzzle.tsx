import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import { puzzleService } from '@/services/puzzle';
import { puzzleStyles as styles, PIECE_SIZE } from '@/styles/screens/puzzle.styles';

export default function PuzzleGameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [piecePositions, setPiecePositions] = useState<number[]>([]);
  const [showReference, setShowReference] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    loadPuzzle();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  async function loadPuzzle() {
    setLoading(true);
    try {
      const image = await puzzleService.getCurrentPuzzleImage();
      setImageUri(image);
      if (image) {
        startNewGame();
      }
    } catch (error) {
      console.error('Failed to load puzzle:', error);
    } finally {
      setLoading(false);
    }
  }

  function startNewGame() {
    // Generate shuffled positions
    const positions = puzzleService.generateShuffledPositions();
    setPiecePositions(positions);
    setIsComplete(false);
    setSelectedPiece(null);

    // Start timer
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current);
    }, 100);
  }

  function handlePiecePress(position: number) {
    if (isComplete) return;

    if (selectedPiece === null) {
      // Select this piece
      setSelectedPiece(position);
    } else if (selectedPiece === position) {
      // Deselect
      setSelectedPiece(null);
    } else {
      // Swap pieces
      const newPositions = [...piecePositions];
      const temp = newPositions[selectedPiece];
      newPositions[selectedPiece] = newPositions[position];
      newPositions[position] = temp;
      setPiecePositions(newPositions);
      setSelectedPiece(null);

      // Check if solved
      if (puzzleService.isSolved(newPositions)) {
        handleComplete();
      }
    }
  }

  function handleComplete() {
    setIsComplete(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleShuffle() {
    startNewGame();
  }

  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function renderPuzzle() {
    if (!imageUri) return null;

    return (
      <View style={styles.puzzleGrid}>
        {piecePositions.map((originalPos, currentPos) => {
          const row = Math.floor(originalPos / 4);
          const col = originalPos % 4;
          const isCorrect = originalPos === currentPos;
          const isSelected = selectedPiece === currentPos;

          return (
            <Pressable
              key={currentPos}
              style={[
                styles.dropZone,
                isSelected && styles.dropZoneActive,
              ]}
              onPress={() => handlePiecePress(currentPos)}
            >
              <View
                style={[
                  styles.puzzlePiece,
                  isCorrect && styles.pieceCorrect,
                ]}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={[
                    styles.pieceImage,
                    {
                      transform: [
                        { translateX: -col * (PIECE_SIZE - 4) },
                        { translateY: -row * (PIECE_SIZE - 4) },
                        { scale: 4 },
                      ],
                    },
                  ]}
                  resizeMode="cover"
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  function renderCompletionModal() {
    return (
      <Modal visible={isComplete} transparent animationType="fade">
        <View style={styles.completionOverlay}>
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>
              {getLabel('puzzle.completed')}
            </Text>
            <Text style={styles.completionTime}>
              {getLabel('puzzle.time').replace('{{time}}', formatTime(elapsedTime))}
            </Text>
            <View style={styles.completionButtons}>
              <Pressable
                style={[styles.completionButton, styles.completionButtonSecondary]}
                onPress={() => router.back()}
              >
                <Text style={styles.completionButtonText}>
                  {getLabel('common.done')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.completionButton, styles.completionButtonPrimary]}
                onPress={() => {
                  setIsComplete(false);
                  startNewGame();
                }}
              >
                <Text style={styles.completionButtonTextPrimary}>
                  {getLabel('puzzle.playAgain')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  if (!imageUri) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <Text style={styles.headerTitle}>{getLabel('puzzle.title')}</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={64} color={theme.textSecondary} />
          <Text style={styles.emptyTitle}>{getLabel('puzzle.noImages')}</Text>
          <Text style={styles.emptySubtitle}>
            Add images to your vision boards to play the puzzle game
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{getLabel('puzzle.title')}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerButton} onPress={handleShuffle}>
            <Ionicons name="shuffle" size={20} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {/* Timer */}
        <View style={styles.timer}>
          <Ionicons name="time-outline" size={24} color={theme.textSecondary} />
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        </View>

        {/* Puzzle */}
        <View style={styles.puzzleContainer}>
          {renderPuzzle()}

          {/* Reference overlay */}
          {showReference && (
            <View style={styles.referenceOverlay}>
              <Image
                source={{ uri: imageUri }}
                style={styles.referenceImage}
                resizeMode="cover"
              />
              <Text style={styles.referenceLabel}>Reference Image</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            style={styles.controlButton}
            onPress={() => setShowReference(!showReference)}
          >
            <Ionicons
              name={showReference ? 'eye-off' : 'eye'}
              size={20}
              color={theme.text}
            />
            <Text style={styles.controlButtonText}>
              {showReference
                ? getLabel('puzzle.hideReference')
                : getLabel('puzzle.showReference')}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.controlButton, styles.controlButtonPrimary]}
            onPress={handleShuffle}
          >
            <Ionicons name="shuffle" size={20} color={theme.white} />
            <Text style={styles.controlButtonTextPrimary}>
              {getLabel('puzzle.shuffle')}
            </Text>
          </Pressable>
        </View>
      </View>

      {renderCompletionModal()}
    </View>
  );
}
