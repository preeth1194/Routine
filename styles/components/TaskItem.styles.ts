import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const taskItemStyles = StyleSheet.create({
  container: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  containerCompleted: {
    backgroundColor: theme.mintGlow,
    borderColor: theme.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontFamily: typography.headingSemiBold,
    fontSize: 15,
    color: theme.text,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: theme.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
  },
  dueDateOverdue: {
    color: '#e74c3c',
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
  },
  expandButton: {
    padding: 4,
  },
  // Checklist
  checklist: {
    padding: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checklistCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checklistCheckboxCompleted: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checklistText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.text,
    flex: 1,
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
    color: theme.textSecondary,
  },
  // Add item
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addItemText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.primary,
  },
  // Progress bar
  progressBar: {
    height: 3,
    backgroundColor: theme.softSage,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.primary,
  },
  // Collapsed state
  collapsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  collapsedCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collapsedContent: {
    flex: 1,
  },
  collapsedMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
});
