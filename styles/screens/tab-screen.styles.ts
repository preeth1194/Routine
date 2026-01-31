import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const tabScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: theme.heading,
  },
});
