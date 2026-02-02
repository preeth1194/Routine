import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.mintGlow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: theme.heading,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 13,
    color: theme.leafGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitleDanger: {
    color: '#e74c3c',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  itemPressed: {
    opacity: 0.8,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemLabel: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 16,
    color: theme.text,
  },
  itemLabelDanger: {
    color: '#e74c3c',
  },
  syncCard: {
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncInfo: {
    marginLeft: 12,
    flex: 1,
  },
  syncLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: theme.text,
  },
  syncSubtext: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  syncButton: {
    backgroundColor: theme.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.white,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  authIcon: {
    marginRight: 8,
  },
  authButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: theme.white,
  },
});
