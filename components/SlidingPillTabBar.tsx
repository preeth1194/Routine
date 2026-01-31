import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  type LayoutChangeEvent,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { TAB_ICONS, TAB_LABEL_KEYS } from '@/constants/navigation';
import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import { slidingPillTabBarStyles as styles } from '@/styles/components/SlidingPillTabBar.styles';

const pillSpringConfig = {
  damping: 24,
  stiffness: 180,
  mass: 0.8,
};
const pressSpringConfig = { damping: 18, stiffness: 350 };

export function SlidingPillTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const safeInsets = useSafeAreaInsets();

  const [tabLayouts, setTabLayouts] = useState<Record<number, { x: number; width: number }>>({});

  const activeIndex = state.index;
  const pillTranslateX = useSharedValue(0);
  const PILL_SIZE = 56;

  const handleTabLayout = useCallback(
    (index: number) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      setTabLayouts((prev) => {
        const next = { ...prev, [index]: { x, width } };
        return next;
      });
    },
    []
  );

  const handleBarLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { height } = e.nativeEvent.layout;
      onHeightChange?.(height);
    },
    [onHeightChange]
  );

  useEffect(() => {
    const layout = tabLayouts[activeIndex];
    if (layout) {
      pillTranslateX.value = withSpring(
        layout.x + layout.width / 2 - PILL_SIZE / 2,
        pillSpringConfig
      );
    }
  }, [activeIndex, tabLayouts, pillTranslateX]);

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillTranslateX.value }],
    width: PILL_SIZE,
    height: PILL_SIZE,
    borderRadius: PILL_SIZE / 2,
  }));

  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: 0,
          marginHorizontal: 0,
        },
      ]}
      onLayout={handleBarLayout}
    >
      <View style={styles.bar}>
        <Animated.View style={[styles.pill, pillAnimatedStyle]} />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = index === activeIndex;
          const label =
            (typeof options.tabBarLabel === 'string' ? options.tabBarLabel : null) ??
            options.title ??
            getLabel(TAB_LABEL_KEYS[route.name] ?? route.name);
          const iconName = (TAB_ICONS[route.name] ?? 'ellipse') as React.ComponentProps<typeof Ionicons>['name'];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <AnimatedTabItem
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              onLayout={handleTabLayout(index)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              iconName={iconName}
              label={label}
              isFocused={isFocused}
            />
          );
        })}
      </View>
    </View>
  );
}

function AnimatedTabItem({
  iconName,
  label,
  isFocused,
  onLayout,
  ...pressableProps
}: {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  isFocused: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
} & React.ComponentProps<typeof Pressable>) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.92, pressSpringConfig);
    pressableProps.onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, pressSpringConfig);
    pressableProps.onPressOut?.(e);
  };

  const iconColor = isFocused ? theme.tabBarIconActive : theme.tabBarIconInactive;

  return (
    <Pressable
      {...pressableProps}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
      onLayout={onLayout}
    >
      <Animated.View
        style={[
          styles.tabContent,
          animatedStyle,
          isFocused && styles.tabContentFocused,
        ]}
      >
        <View style={styles.iconWrapper}>
          <Ionicons
            name={iconName}
            size={24}
            color={iconColor}
            style={styles.icon}
          />
        </View>
        {!isFocused && (
          <Text style={[styles.label, { color: theme.tabBarIconInactive }]} numberOfLines={1}>
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

