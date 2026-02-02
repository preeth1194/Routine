import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
  },
  sectionAction: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  // Board creation modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: theme.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    fontFamily: typography.body,
    fontSize: 15,
    color: theme.text,
    marginBottom: 16,
  },
  layoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  layoutOptionSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.mintGlow,
  },
  layoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.softSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  layoutIconSelected: {
    backgroundColor: theme.primary,
  },
  layoutTextContainer: {
    flex: 1,
  },
  layoutTitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.text,
  },
  layoutDescription: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.text,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  modalButtonPrimaryDisabled: {
    opacity: 0.5,
  },
  modalButtonPrimaryText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.white,
  },
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Puzzle widget placeholder
  puzzleWidget: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  puzzleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  puzzleTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 16,
    color: theme.text,
  },
  puzzlePreview: {
    aspectRatio: 1,
    backgroundColor: theme.softSage,
    borderRadius: 12,
    overflow: 'hidden',
  },
  puzzleEmptyText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
