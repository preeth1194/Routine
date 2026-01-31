import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const slidingPillTabBarStyles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: 30,
    left: 15,
    right: 15,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: theme.tabBarBackground,
    borderWidth: 1,
    borderColor: theme.tabBarBorder,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 6,
    minHeight: 64,
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: theme.deepForest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pill: {
    position: 'absolute',
    left: -1,
    top: 8,
    backgroundColor: theme.tabBarPill,
    shadowColor: theme.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    width: '100%',
  },
  tabContentFocused: {
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
    lineHeight: 28,
  },
  label: {
    fontFamily: typography.bodyMedium,
    fontSize: 10,
    marginTop: 4,
    maxWidth: 72,
    textAlign: 'center',
  },
});
