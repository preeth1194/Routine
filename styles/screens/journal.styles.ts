import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const journalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  headerTitle: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: theme.text,
  },
  headerSubtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
  // Today's entry section
  todaySection: {
    padding: 16,
  },
  todayCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
    backgroundColor: theme.mintGlow,
  },
  todayTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 16,
    color: theme.text,
  },
  todayDate: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.textSecondary,
  },
  todayContent: {
    padding: 16,
  },
  entryInput: {
    fontFamily: typography.body,
    fontSize: 15,
    color: theme.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  moodSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
  },
  moodLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.mintGlow,
  },
  moodEmoji: {
    fontSize: 24,
  },
  saveButton: {
    backgroundColor: theme.primary,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.white,
  },
  // Past entries section
  pastSection: {
    flex: 1,
    padding: 16,
  },
  pastTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 16,
    color: theme.text,
    marginBottom: 12,
  },
  entryCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
  },
  entryMood: {
    fontSize: 20,
  },
  entryText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
