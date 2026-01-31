import React from 'react';
import { View, ViewStyle } from 'react-native';

import { cardStyles } from '@/styles/components/Card.styles';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: CardProps) {
  return <View style={[cardStyles.card, style]}>{children}</View>;
}
