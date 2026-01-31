import React from 'react';
import { Tabs } from 'expo-router';

import { SlidingPillTabBar } from '@/components/SlidingPillTabBar';
import { getTabConfig } from '@/config/tabs';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <SlidingPillTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: getTabConfig('index').title }}
      />
      <Tabs.Screen
        name="daily-routine"
        options={{ title: getTabConfig('daily-routine').title }}
      />
      <Tabs.Screen
        name="journal"
        options={{ title: getTabConfig('journal').title }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: getTabConfig('insights').title }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: getTabConfig('profile').title }}
      />
    </Tabs>
  );
}
