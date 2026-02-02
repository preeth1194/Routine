import { StyleSheet, Dimensions } from 'react-native';

import { theme, typography } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PUZZLE_SIZE = SCREEN_WIDTH - 32;
const PIECE_SIZE = PUZZLE_SIZE / 4;

export const puzzleStyles = StyleSheet.create({
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timerText: {
    fontFamily: typography.headingSemiBold,
    fontSize: 24,
    color: theme.text,
  },
  puzzleContainer: {
    width: PUZZLE_SIZE,
    height: PUZZLE_SIZE,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  puzzleGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dropZone: {
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  dropZoneActive: {
    backgroundColor: 'rgba(136, 181, 98, 0.2)',
    borderColor: theme.primary,
  },
  puzzlePiece: {
    width: PIECE_SIZE - 4,
    height: PIECE_SIZE - 4,
    margin: 2,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: theme.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pieceCorrect: {
    borderWidth: 2,
    borderColor: theme.primary,
  },
  pieceImage: {
    width: '100%',
    height: '100%',
  },
  // Reference image overlay
  referenceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  referenceImage: {
    width: PUZZLE_SIZE - 32,
    height: PUZZLE_SIZE - 32,
    borderRadius: 8,
  },
  referenceLabel: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.white,
    marginTop: 12,
  },
  // Controls
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.backgroundSecondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  controlButtonPrimary: {
    backgroundColor: theme.primary,
  },
  controlButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
  },
  controlButtonTextPrimary: {
    color: theme.white,
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
  completionTime: {
    fontFamily: typography.body,
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 24,
  },
  completionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  completionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  completionButtonSecondary: {
    backgroundColor: theme.backgroundSecondary,
  },
  completionButtonPrimary: {
    backgroundColor: theme.primary,
  },
  completionButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.text,
  },
  completionButtonTextPrimary: {
    color: theme.white,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export { PUZZLE_SIZE, PIECE_SIZE };
