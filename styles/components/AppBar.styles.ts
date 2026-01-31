import { StyleSheet } from 'react-native';

import { theme, typography } from '@/constants/theme';

export const appBarStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  left: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: theme.appBarGreeting,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.appBarSubtitle,
    marginTop: 2,
  },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  appName: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.appBarAppName,
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  iconButtonWithBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.appBarNotificationBadge,
  },
});
