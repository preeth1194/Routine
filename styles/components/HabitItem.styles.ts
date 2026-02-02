import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const habitItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  containerCompleted: {
    backgroundColor: theme.mintGlow,
    borderColor: theme.primary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.text,
    flex: 1,
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
  schedule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduleText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: theme.primary,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.softSage,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timerText: {
    fontFamily: typography.body,
    fontSize: 11,
    color: theme.text,
  },
  timerButton: {
    marginLeft: 8,
  },
  notScheduledText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  // Weekly days display
  weekDays: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dayBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeActive: {
    backgroundColor: theme.primary,
  },
  dayText: {
    fontFamily: typography.body,
    fontSize: 10,
    color: theme.textSecondary,
  },
  dayTextActive: {
    color: theme.white,
  },
});
