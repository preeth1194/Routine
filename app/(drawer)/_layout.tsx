import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerActiveTintColor: theme.leafGreen,
        drawerInactiveTintColor: theme.deepForest,
        drawerStyle: {
          backgroundColor: theme.mintGlow,
          width: 280,
        },
        drawerLabelStyle: {
          fontFamily: 'PlusJakartaSans_500Medium',
          fontSize: 16,
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 12,
          marginVertical: 4,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: getLabel('tabs.home'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: getLabel('screens.settings'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
