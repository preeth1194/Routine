import { StyleSheet, Dimensions } from 'react-native';

import { theme, typography } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMER_SIZE = SCREEN_WIDTH - 80;

export const timerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  habitName: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modeLabel: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 32,
  },
  timerCircle: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    borderWidth: 12,
    borderColor: theme.softSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  timerCircleActive: {
    borderColor: theme.primary,
  },
  timerText: {
    fontFamily: typography.heading,
    fontSize: 56,
    color: theme.text,
  },
  timerLabel: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
  },
  // Song mode display
  songDisplay: {
    alignItems: 'center',
    marginBottom: 32,
  },
  songsRemaining: {
    fontFamily: typography.heading,
    fontSize: 72,
    color: theme.primary,
  },
  songsLabel: {
    fontFamily: typography.body,
    fontSize: 16,
    color: theme.textSecondary,
  },
  currentSong: {
    marginTop: 16,
    padding: 16,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  currentSongLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  currentSongTitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
  },
  // Controls
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.primary,
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  // Progress indicator
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.softSage,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  // Completion modal
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completionCard: {
    backgroundColor: theme.background,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  completionTitle: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: theme.text,
    marginBottom: 8,
  },
  completionSubtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  completionButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  completionButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.white,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});
