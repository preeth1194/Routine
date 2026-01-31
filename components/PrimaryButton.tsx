import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { primaryButtonStyles as styles } from '@/styles/components/PrimaryButton.styles';

const springConfig = { damping: 15, stiffness: 400 };

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) scale.value = withSpring(0.96, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Animated.View style={[styles.inner, animatedStyle]}>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}
