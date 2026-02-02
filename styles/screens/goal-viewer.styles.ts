import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const goalViewerStyles = StyleSheet.create({
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
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  // Goal header section
  goalHeader: {
    padding: 16,
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  goalImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginBottom: 12,
  },
  goalImagePlaceholder: {
    backgroundColor: theme.softSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalName: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: theme.text,
    marginBottom: 4,
  },
  goalCategory: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
  },
  goalWhyImportant: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.text,
    fontStyle: 'italic',
    marginTop: 8,
  },
  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.primary,
  },
  tabText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.textSecondary,
  },
  tabTextActive: {
    color: theme.primary,
  },
  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  // Section
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
    fontSize: 16,
    color: theme.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.primary,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  // Add modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.background,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    fontFamily: typography.body,
    fontSize: 15,
    color: theme.text,
    marginBottom: 12,
  },
  modalLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
    marginBottom: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  scheduleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  scheduleOptionSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.mintGlow,
  },
  scheduleOptionText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weekDayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDayButtonSelected: {
    backgroundColor: theme.primary,
  },
  weekDayText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: theme.text,
  },
  weekDayTextSelected: {
    color: theme.white,
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
  // Insights tab
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  statValue: {
    fontFamily: typography.heading,
    fontSize: 28,
    color: theme.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.textSecondary,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
