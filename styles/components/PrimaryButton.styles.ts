import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const primaryButtonStyles = StyleSheet.create({
  button: {
    backgroundColor: theme.primaryCTA,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: '#ffffff',
  },
});
