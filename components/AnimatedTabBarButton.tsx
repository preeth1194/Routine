import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { animatedTabBarButtonStyles as styles } from '@/styles/components/AnimatedTabBarButton.styles';

const springConfig = { damping: 15, stiffness: 400 };

type AnimatedTabBarButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: (e: any) => void;
  onPressOut?: (e: any) => void;
  style?: ViewStyle | ViewStyle[];
  accessibilityState?: any;
  href?: string;
  [key: string]: any;
};

export function AnimatedTabBarButton({
  children,
  onPressIn,
  onPressOut,
  style,
  ...props
}: AnimatedTabBarButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.92, springConfig);
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, springConfig);
    onPressOut?.(e);
  };

  const resolvedStyle =
    style && typeof style === 'object' && !Array.isArray(style)
      ? [styles.button, style]
      : [styles.button];

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={resolvedStyle}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
