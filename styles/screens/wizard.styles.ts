import { StyleSheet, Dimensions } from 'react-native';

import { theme, typography } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const wizardStyles = StyleSheet.create({
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
  stepIndicator: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
  },
  // Progress bar
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.softSage,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  // Content
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  stepTitle: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: theme.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 24,
  },
  // Step 1: Board setup
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
    marginBottom: 24,
  },
  // Core values grid
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valueCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  valueCardSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.mintGlow,
  },
  valueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueIconSelected: {
    backgroundColor: theme.primary,
  },
  valueName: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
    textAlign: 'center',
  },
  // Step 2: Goals
  goalsSection: {
    marginBottom: 24,
  },
  goalsSectionTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 16,
    color: theme.text,
    marginBottom: 12,
  },
  recommendedGoal: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  recommendedGoalAdded: {
    borderColor: theme.primary,
    backgroundColor: theme.mintGlow,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalName: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.text,
    flex: 1,
  },
  goalCategory: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  goalWhyImportant: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.text,
    fontStyle: 'italic',
    marginTop: 8,
  },
  addGoalButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.backgroundSecondary,
  },
  addGoalButtonAdded: {
    backgroundColor: theme.primary,
  },
  addGoalButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: theme.text,
  },
  addGoalButtonTextAdded: {
    color: theme.white,
  },
  // Step 3: Preview
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  previewTile: {
    width: (SCREEN_WIDTH - 48) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.backgroundSecondary,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewGoalName: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewGoalNameText: {
    fontFamily: typography.bodyMedium,
    fontSize: 10,
    color: theme.white,
    textAlign: 'center',
  },
  // Selected goals list
  selectedGoalsList: {
    marginBottom: 24,
  },
  selectedGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  selectedGoalNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedGoalNumberText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: theme.white,
  },
  selectedGoalInfo: {
    flex: 1,
  },
  selectedGoalName: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
  },
  removeGoalButton: {
    padding: 4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
    padding: 16,
    paddingBottom: 32,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
  },
  footerButtonSecondaryText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.text,
  },
  footerButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  footerButtonPrimaryDisabled: {
    opacity: 0.5,
  },
  footerButtonPrimaryText: {
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
  loadingText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 16,
  },
});
