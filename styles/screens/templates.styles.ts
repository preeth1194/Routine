import { StyleSheet, Dimensions } from 'react-native';

import { theme, typography } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const templatesStyles = StyleSheet.create({
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
    padding: 16,
  },
  intro: {
    marginBottom: 20,
  },
  introTitle: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: theme.text,
    marginBottom: 8,
  },
  introSubtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
  },
  templatesGrid: {
    gap: 16,
  },
  templateCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.cardBorder,
    marginBottom: 16,
  },
  templateImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: theme.backgroundSecondary,
  },
  templateContent: {
    padding: 16,
  },
  templateName: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
    marginBottom: 4,
  },
  templateDescription: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateTypeText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
  },
  goalCount: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
  },
  useButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  useButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.white,
  },
  // Preview modal
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  previewSheet: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  previewHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.cardBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  previewContent: {
    padding: 24,
    paddingTop: 0,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginBottom: 16,
  },
  previewTitle: {
    fontFamily: typography.heading,
    fontSize: 22,
    color: theme.text,
    marginBottom: 8,
  },
  previewDescription: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  previewGoalsTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 16,
    color: theme.text,
    marginBottom: 12,
  },
  previewGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  previewGoalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.primary,
  },
  previewGoalText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.text,
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingBottom: 16,
  },
  previewButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
  },
  previewButtonSecondaryText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.text,
  },
  previewButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  previewButtonPrimaryText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
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
  emptyText: {
    fontFamily: typography.body,
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});
