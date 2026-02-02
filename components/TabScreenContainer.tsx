import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { theme } from '@/constants/theme';
import { AppBar } from '@/components/AppBar';
import { tabScreenContainerStyles } from '@/styles/components/TabScreenContainer.styles';

type TabScreenContainerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  showAppBar?: boolean;
  extendContentBehindTabBar?: boolean;
};

export function TabScreenContainer({
  children,
  style,
  showAppBar = true,
  extendContentBehindTabBar = false,
}: TabScreenContainerProps) {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={tabScreenContainerStyles.wrapper}>
      <LinearGradient
        colors={[theme.mintGlow, theme.softSage, theme.deepForest]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          tabScreenContainerStyles.container,
          { paddingBottom: extendContentBehindTabBar ? 0 : tabBarHeight + 16 },
        ]}
      >
        {showAppBar && <AppBar />}
        <View style={[{ flex: 1 }, style]}>{children}</View>
      </View>
    </View>
  );
}
