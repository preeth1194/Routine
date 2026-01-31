import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme, typography } from '@/constants/theme';
import { getLabel } from '@/lib/labels';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.mintGlow, theme.softSage, theme.deepForest]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={28} color={theme.deepForest} />
        </Pressable>
        <Text style={styles.title}>{getLabel('screens.settings')}</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLabel('settings.account')}</Text>
          <SettingsItem icon="person-outline" label={getLabel('settings.profile')} />
          <SettingsItem icon="notifications-outline" label={getLabel('settings.notifications')} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLabel('settings.preferences')}</Text>
          <SettingsItem icon="moon-outline" label={getLabel('settings.appearance')} />
          <SettingsItem icon="notifications-outline" label={getLabel('settings.reminders')} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLabel('settings.support')}</Text>
          <SettingsItem icon="help-circle-outline" label={getLabel('settings.help')} />
          <SettingsItem icon="information-circle-outline" label={getLabel('settings.about')} />
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsItem({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={22} color={theme.deepForest} style={styles.itemIcon} />
      <Text style={styles.itemLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.leafGreen} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.mintGlow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: theme.heading,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 13,
    color: theme.leafGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  itemPressed: {
    opacity: 0.8,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemLabel: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 16,
    color: theme.text,
  },
});
