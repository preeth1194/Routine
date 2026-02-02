import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const affirmationsStyles = StyleSheet.create({
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
  // Daily affirmation card
  dailyCard: {
    margin: 16,
    backgroundColor: theme.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  dailyLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dailyText: {
    fontFamily: typography.headingSemiBold,
    fontSize: 20,
    color: theme.white,
    textAlign: 'center',
    lineHeight: 28,
  },
  dailyQuote: {
    marginTop: 16,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  // List
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 16,
    color: theme.text,
    marginBottom: 12,
    marginTop: 8,
  },
  // Affirmation card
  affirmationCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  affirmationCardPinned: {
    borderColor: theme.primary,
    backgroundColor: theme.mintGlow,
  },
  affirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  affirmationText: {
    fontFamily: typography.body,
    fontSize: 15,
    color: theme.text,
    lineHeight: 22,
    flex: 1,
    marginRight: 8,
  },
  affirmationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  pinnedText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.primary,
  },
  // Add affirmation
  addCard: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 12,
  },
  addInput: {
    fontFamily: typography.body,
    fontSize: 15,
    color: theme.text,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.white,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
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
    paddingHorizontal: 32,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: theme.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
