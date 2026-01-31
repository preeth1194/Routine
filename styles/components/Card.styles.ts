import { StyleSheet } from 'react-native';

import { theme } from '@/constants/theme';

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    padding: 16,
  },
});
