import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';
import { fabStyles as styles } from '@/styles/components/FAB.styles';

type FABProps = {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  label?: string;
  onPress: () => void;
  style?: ViewStyle;
};

export function FAB({ icon = 'add', label, onPress, style }: FABProps) {
  const isExtended = Boolean(label);

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          isExtended && styles.buttonExtended,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        <Ionicons name={icon} size={24} color={theme.white} />
        {label && <Text style={styles.label}>{label}</Text>}
      </Pressable>
    </View>
  );
}
