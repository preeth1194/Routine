import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUser } from '@/contexts/UserContext';
import { getLabel } from '@/lib/labels';
import { theme } from '@/constants/theme';
import { appBarStyles } from '@/styles/components/AppBar.styles';

export function AppBar() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { displayName, isLoggedIn } = useUser();

  const nameToShow = isLoggedIn ? displayName : getLabel('appBar.guest');
  const greetingTemplate = getLabel('appBar.greetingTemplate');
  const greeting = greetingTemplate.replace('{{name}}', nameToShow);
  const subtitle = getLabel('appBar.subtitle');

  const openDrawer = () => {
    const drawer = navigation.getParent() as { openDrawer?: () => void } | undefined;
    drawer?.openDrawer?.();
  };

  return (
    <View style={[appBarStyles.bar, { paddingTop: insets.top + 12 }]}>
      <View style={appBarStyles.left}>
        <Text style={appBarStyles.greeting}>{greeting}</Text>
        <Text style={appBarStyles.subtitle}>{subtitle}</Text>
      </View>
      <Pressable
        onPress={openDrawer}
        style={({ pressed }) => [appBarStyles.iconButton, pressed && { opacity: 0.7 }]}
        accessibilityLabel={getLabel('screens.settings')}
        accessibilityRole="button"
      >
        <Ionicons name="settings-outline" size={24} color={theme.appBarIconColor} />
      </Pressable>
    </View>
  );
}
