import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import { authService } from '@/services/auth';
import { syncService } from '@/services/sync';
import { getUserSettings, setUserSettings, clearAllData } from '@/services/storage';
import type { UserSettings } from '@/models/types';
import { settingsStyles as styles } from '@/styles/screens/settings.styles';

type SyncStatusKey =
  | 'settings.connected'
  | 'settings.guestMode'
  | 'settings.connectedAsGuest'
  | 'settings.syncing'
  | 'settings.syncedSuccess'
  | 'settings.syncFailed'
  | 'settings.syncError';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusKey, setSyncStatusKey] = useState<SyncStatusKey>('settings.guestMode');

  useEffect(() => {
    loadAuthState();
    loadSettings();
  }, []);

  async function loadAuthState() {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setSyncStatusKey(authenticated ? 'settings.connected' : 'settings.guestMode');
  }

  async function loadSettings() {
    const userSettings = await getUserSettings();
    setSettings(userSettings);
  }

  async function handleSync() {
    setIsSyncing(true);
    setSyncStatusKey('settings.syncing');
    try {
      const success = await syncService.syncIfNeeded();
      setSyncStatusKey(success ? 'settings.syncedSuccess' : 'settings.syncFailed');
    } catch {
      setSyncStatusKey('settings.syncError');
    } finally {
      setIsSyncing(false);
      setTimeout(
        () =>
          setSyncStatusKey(
            isAuthenticated ? 'settings.connected' : 'settings.guestMode'
          ),
        2000
      );
    }
  }

  async function handleContinueAsGuest() {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await authService.continueAsGuest(timezone);
      setIsAuthenticated(true);
      setSyncStatusKey('settings.connectedAsGuest');
      await syncService.bootstrap();
    } catch (error) {
      console.error('Failed to continue as guest:', error);
      Alert.alert(getLabel('common.error'), getLabel('settings.createGuestError'));
    }
  }

  async function handleSignOut() {
    Alert.alert(getLabel('auth.signOut'), getLabel('settings.signOutConfirm'), [
      { text: getLabel('common.cancel'), style: 'cancel' },
      {
        text: getLabel('auth.signOut'),
        style: 'destructive',
        onPress: async () => {
          await authService.signOut();
          setIsAuthenticated(false);
          setSyncStatusKey('settings.guestMode');
        },
      },
    ]);
  }

  async function handleClearData() {
    Alert.alert(
      getLabel('settings.clearAllData'),
      getLabel('settings.clearDataConfirm'),
      [
        { text: getLabel('common.cancel'), style: 'cancel' },
        {
          text: getLabel('settings.clearData'),
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert(getLabel('settings.dataCleared'), getLabel('settings.restartApp'));
          },
        },
      ]
    );
  }

  async function handleThemeChange(isDark: boolean) {
    if (settings) {
      const newSettings = {
        ...settings,
        theme: isDark ? ('dark' as const) : ('light' as const),
      };
      await setUserSettings(newSettings);
      setSettings(newSettings);
    }
  }

  async function handleNotificationsChange(enabled: boolean) {
    if (settings) {
      const newSettings = { ...settings, notificationsEnabled: enabled };
      await setUserSettings(newSettings);
      setSettings(newSettings);
    }
  }

  const syncSubtextKey = isAuthenticated ? 'settings.dataBackedUp' : 'settings.connectToSync';

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
          accessibilityLabel={getLabel('settings.close')}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={28} color={theme.deepForest} />
        </Pressable>
        <Text style={styles.title}>{getLabel('screens.settings')}</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLabel('settings.syncStatus')}</Text>
          <View style={styles.syncCard}>
            <View style={styles.syncStatus}>
              <Ionicons
                name={isAuthenticated ? 'cloud-done' : 'cloud-offline'}
                size={24}
                color={isAuthenticated ? theme.primary : theme.textSecondary}
              />
              <View style={styles.syncInfo}>
                <Text style={styles.syncLabel}>{getLabel(syncStatusKey)}</Text>
                <Text style={styles.syncSubtext}>{getLabel(syncSubtextKey)}</Text>
              </View>
            </View>
            <Pressable
              style={[styles.syncButton, isSyncing && { opacity: 0.7 }]}
              onPress={handleSync}
              disabled={isSyncing}
            >
              <Text style={styles.syncButtonText}>
                {isSyncing ? getLabel('settings.syncing') : getLabel('settings.syncNow')}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLabel('settings.account')}</Text>
          {!isAuthenticated ? (
            <Pressable style={styles.authButton} onPress={handleContinueAsGuest}>
              <Ionicons
                name="person-add-outline"
                size={22}
                color={theme.white}
                style={styles.authIcon}
              />
              <Text style={styles.authButtonText}>{getLabel('auth.continueAsGuest')}</Text>
            </Pressable>
          ) : (
            <SettingsItem
              icon="person-outline"
              label={getLabel('settings.profile')}
              onPress={() => {}}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLabel('settings.preferences')}</Text>
          <View style={styles.item}>
            <Ionicons
              name="moon-outline"
              size={22}
              color={theme.deepForest}
              style={styles.itemIcon}
            />
            <Text style={styles.itemLabel}>{getLabel('settings.darkMode')}</Text>
            <Switch
              value={settings?.theme === 'dark'}
              onValueChange={handleThemeChange}
              trackColor={{ false: theme.softSage, true: theme.primary }}
              thumbColor={theme.white}
            />
          </View>
          <View style={styles.item}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.deepForest}
              style={styles.itemIcon}
            />
            <Text style={styles.itemLabel}>{getLabel('settings.notifications')}</Text>
            <Switch
              value={settings?.notificationsEnabled ?? false}
              onValueChange={handleNotificationsChange}
              trackColor={{ false: theme.softSage, true: theme.primary }}
              thumbColor={theme.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLabel('settings.quickActions')}</Text>
          <SettingsItem
            icon="add-circle-outline"
            label={getLabel('settings.createWithWizard')}
            onPress={() => router.push('/boards/wizard' as any)}
          />
          <SettingsItem
            icon="copy-outline"
            label={getLabel('settings.browseTemplates')}
            onPress={() => router.push('/boards/templates' as any)}
          />
          <SettingsItem
            icon="extension-puzzle-outline"
            label={getLabel('settings.playPuzzle')}
            onPress={() => router.push('/puzzle' as any)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLabel('settings.support')}</Text>
          <SettingsItem
            icon="help-circle-outline"
            label={getLabel('settings.help')}
            onPress={() => {}}
          />
          <SettingsItem
            icon="information-circle-outline"
            label={getLabel('settings.about')}
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleDanger]}>
            {getLabel('settings.dangerZone')}
          </Text>
          {isAuthenticated && (
            <SettingsItem
              icon="log-out-outline"
              label={getLabel('settings.signOut')}
              onPress={handleSignOut}
              danger
            />
          )}
          <SettingsItem
            icon="trash-outline"
            label={getLabel('settings.clearAllData')}
            onPress={handleClearData}
            danger
          />
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsItem({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={22}
        color={danger ? '#e74c3c' : theme.deepForest}
        style={styles.itemIcon}
      />
      <Text style={[styles.itemLabel, danger && styles.itemLabelDanger]}>{label}</Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={danger ? '#e74c3c' : theme.leafGreen}
      />
    </Pressable>
  );
}
