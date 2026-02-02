import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const visionBoardCardStyles = StyleSheet.create({
  container: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  activeContainer: {
    borderColor: theme.primary,
    borderWidth: 2,
  },
  previewContainer: {
    aspectRatio: 1,
    backgroundColor: theme.backgroundSecondary,
  },
  gridPreview: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 2,
  },
  gridCellImage: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: theme.softSage,
  },
  gridCellPlaceholder: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: theme.softSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeformPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    opacity: 0.65,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 24,
  },
  overlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  boardName: {
    fontFamily: typography.headingSemiBold,
    fontSize: 16,
    color: theme.text,
    marginBottom: 4,
  },
  boardMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeIndicatorText: {
    fontFamily: typography.bodyMedium,
    fontSize: 10,
    color: theme.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
