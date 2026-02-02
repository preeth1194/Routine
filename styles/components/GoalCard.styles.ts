import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const goalCardStyles = StyleSheet.create({
  container: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: theme.backgroundSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.softSage,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontFamily: typography.headingSemiBold,
    fontSize: 16,
    color: theme.text,
    marginBottom: 4,
  },
  category: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
  },
  deadline: {
    fontFamily: typography.body,
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: 4,
  },
  deadlineOverdue: {
    color: '#e74c3c',
  },
  whyImportant: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.text,
    marginTop: 8,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.softSage,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: typography.body,
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: 4,
  },
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  compactImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: theme.softSage,
  },
  compactContent: {
    flex: 1,
  },
  compactName: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
  },
  compactMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
});
