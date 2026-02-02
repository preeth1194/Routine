import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import type { Habit } from '@/models/Habit';
import { toggleCompletion } from '@/models/Habit';
import { getHabitById, updateHabit } from '@/services/database';
import {
  rhythmicTimerService,
  type TimerState,
} from '@/services/rhythmicTimer';
import { timerStyles as styles } from '@/styles/screens/timer.styles';

export default function TimerScreen() {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (habitId) {
      loadHabit();
    }
    return () => {
      // Don't stop timer on unmount - let it continue in background
    };
  }, [habitId]);

  async function loadHabit() {
    try {
      const habitData = await getHabitById(habitId!);
      if (habitData) {
        setHabit(habitData);
        
        // Initialize timer if habit has time-bound spec
        if (habitData.timeBound) {
          await rhythmicTimerService.initTimer(
            habitData.id,
            habitData.timeBound.mode,
            habitData.timeBound.duration,
            (state) => setTimerState({ ...state }),
            handleTimerComplete
          );
        }
      }
    } catch (error) {
      console.error('Failed to load habit:', error);
    }
  }

  async function handleTimerComplete() {
    if (!habit) return;

    // Mark habit as complete
    const updatedHabit = toggleCompletion(habit, new Date());
    await updateHabit(updatedHabit);
    setHabit(updatedHabit);
    setShowComplete(true);
  }

  function handlePlayPause() {
    if (timerState?.isRunning) {
      rhythmicTimerService.pauseTimer();
    } else {
      rhythmicTimerService.startTimer();
    }
  }

  async function handleStop() {
    await rhythmicTimerService.stopTimer();
    router.back();
  }

  function handleDone() {
    setShowComplete(false);
    router.back();
  }

  function renderTimeMode() {
    if (!timerState) return null;

    const remaining = rhythmicTimerService.getRemainingTime();
    const targetMs = timerState.targetDuration * 60 * 1000;
    const progress = ((targetMs - remaining) / targetMs) * 100;

    return (
      <>
        <View
          style={[
            styles.timerCircle,
            timerState.isRunning && styles.timerCircleActive,
          ]}
        >
          <Text style={styles.timerText}>
            {rhythmicTimerService.formatTime(remaining)}
          </Text>
          <Text style={styles.timerLabel}>
            {timerState.isRunning ? 'remaining' : 'paused'}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress)}% complete
          </Text>
        </View>
      </>
    );
  }

  function renderSongMode() {
    if (!timerState) return null;

    const remaining = rhythmicTimerService.getRemainingSongs();

    return (
      <>
        <View style={styles.songDisplay}>
          <Text style={styles.songsRemaining}>{remaining}</Text>
          <Text style={styles.songsLabel}>
            {remaining === 1 ? 'song remaining' : 'songs remaining'}
          </Text>

          {timerState.currentSongTitle && (
            <View style={styles.currentSong}>
              <Text style={styles.currentSongLabel}>
                {getLabel('timer.currentlyPlaying')}
              </Text>
              <Text style={styles.currentSongTitle}>
                {timerState.currentSongTitle}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(timerState.songsPlayed / timerState.targetDuration) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {timerState.songsPlayed} of {timerState.targetDuration} songs played
          </Text>
        </View>
      </>
    );
  }

  function renderCompletionModal() {
    return (
      <Modal visible={showComplete} transparent animationType="fade">
        <View style={styles.completionOverlay}>
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>
              {getLabel('timer.habitComplete')}
            </Text>
            <Text style={styles.completionSubtitle}>
              Great job completing "{habit?.name}"!
            </Text>
            <Pressable style={styles.completionButton} onPress={handleDone}>
              <Text style={styles.completionButtonText}>
                {getLabel('common.done')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  if (!habit || !habit.timeBound) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <Text style={styles.headerTitle}>{getLabel('timer.title')}</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="timer-outline" size={64} color={theme.textSecondary} />
          <Text style={styles.emptyText}>
            This habit doesn't have a timer configured
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
          <Text style={styles.headerTitle}>{getLabel('timer.title')}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.habitName}>{habit.name}</Text>
        <Text style={styles.modeLabel}>
          {timerState?.mode === 'song'
            ? getLabel('timer.songBased')
            : getLabel('timer.timeBased')}
        </Text>

        {timerState?.mode === 'song' ? renderSongMode() : renderTimeMode()}

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            style={[styles.controlButton, styles.stopButton]}
            onPress={handleStop}
          >
            <Ionicons name="stop" size={24} color={theme.white} />
          </Pressable>

          <Pressable
            style={[styles.controlButton, styles.playButton]}
            onPress={handlePlayPause}
          >
            <Ionicons
              name={timerState?.isRunning ? 'pause' : 'play'}
              size={32}
              color={theme.white}
            />
          </Pressable>
        </View>
      </View>

      {renderCompletionModal()}
    </View>
  );
}
