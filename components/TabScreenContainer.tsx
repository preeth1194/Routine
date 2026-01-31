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
};

export function TabScreenContainer({ children, style }: TabScreenContainerProps) {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={tabScreenContainerStyles.wrapper}>
      <LinearGradient
        colors={[theme.mintGlow, theme.softSage, theme.deepForest]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[tabScreenContainerStyles.container, { paddingBottom: tabBarHeight + 16 }]}>
        <AppBar />
        <View style={[{ flex: 1 }, style]}>{children}</View>
      </View>
    </View>
  );
}
