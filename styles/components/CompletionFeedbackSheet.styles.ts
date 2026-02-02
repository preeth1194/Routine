import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const completionFeedbackSheetStyles = StyleSheet.create({
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
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.cardBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ratingButtonSelected: {
    backgroundColor: theme.mintGlow,
    borderColor: theme.primary,
  },
  ratingEmoji: {
    fontSize: 24,
  },
  ratingLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  ratingLabelText: {
    fontFamily: typography.body,
    fontSize: 11,
    color: theme.textSecondary,
  },
  noteSection: {
    marginBottom: 24,
  },
  noteLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.white,
  },
});
