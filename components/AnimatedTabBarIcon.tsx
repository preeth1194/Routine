import React, { useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { theme } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type AnimatedTabBarIconProps = {
  name: IconName;
  focused: boolean;
  color: string;
};

export function AnimatedTabBarIcon({
  name,
  focused,
  color,
}: AnimatedTabBarIconProps) {
  const scale = useSharedValue(focused ? 1.08 : 1);

  useEffect(() => {
    scale.value = withTiming(focused ? 1.08 : 1, { duration: 200 });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const displayColor = focused ? theme.primaryCTA : color;

  return (
    <Animated.View style={[{ marginBottom: -3 }, animatedStyle]}>
      <Ionicons name={name} size={24} color={displayColor} />
    </Animated.View>
  );
}
