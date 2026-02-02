import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const goalPickerSheetStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.cardBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: theme.text,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  goalItemSelected: {
    backgroundColor: theme.mintGlow,
    borderColor: theme.primary,
  },
  goalImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: theme.softSage,
  },
  goalImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalContent: {
    flex: 1,
  },
  goalName: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.text,
  },
  goalCategory: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    marginLeft: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
  },
  selectButton: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.white,
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.textSecondary,
  },
});
