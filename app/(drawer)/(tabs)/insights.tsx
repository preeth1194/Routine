import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { TabScreenContainer } from '@/components/TabScreenContainer';
import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import { insightsService, type InsightsData } from '@/services/insights';
import { insightsStyles as styles } from '@/styles/screens/insights.styles';

export default function InsightsScreen() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await insightsService.getGlobalInsights();
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  function renderProgressRing(percentage: number, label: string) {
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.progressRing}>
        <Svg width={size} height={size}>
          <Circle
            stroke={theme.softSage}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={theme.primary}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <Text style={styles.progressText}>{percentage}%</Text>
        <Text style={styles.progressLabel}>{label}</Text>
      </View>
    );
  }

  function renderBarChart() {
    if (!insights?.weeklyActivity.length) return null;

    const maxTotal = Math.max(...insights.weeklyActivity.map((d) => d.total), 1);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>This Week's Activity</Text>
        <View style={styles.barChartContainer}>
          <View style={styles.barRow}>
            {insights.weeklyActivity.map((day, index) => {
              const height = day.total > 0 ? (day.total / maxTotal) * 100 : 10;
              const fillHeight = day.total > 0 
                ? (day.completed / day.total) * height 
                : 0;

              return (
                <View key={index} style={styles.barItem}>
                  <View style={[styles.bar, { height }]}>
                    <View style={[styles.barFill, { height: fillHeight }]} />
                  </View>
                  <Text style={styles.barLabel}>{day.day}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  function renderGoalsBreakdown() {
    if (!insights?.habitsByGoal.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress by Goal</Text>
        <View style={styles.goalsBreakdown}>
          {insights.habitsByGoal.map((goal, index) => (
            <View key={index} style={styles.goalRow}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalName} numberOfLines={1}>
                  {goal.goalName}
                </Text>
                <Text style={styles.goalMeta}>
                  {goal.count} {goal.count === 1 ? 'habit' : 'habits'}
                </Text>
              </View>
              <View style={styles.goalProgress}>
                <Text style={styles.goalProgressText}>
                  {goal.completedToday}/{goal.count}
                </Text>
                <Ionicons
                  name={goal.completedToday === goal.count ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={goal.completedToday === goal.count ? theme.primary : theme.textSecondary}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="analytics-outline"
          size={64}
          color={theme.textSecondary}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>{getLabel('insights.noData')}</Text>
        <Text style={styles.emptySubtitle}>
          Start tracking habits and tasks to see your insights here
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <TabScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </TabScreenContainer>
    );
  }

  const hasData = insights && (insights.totalHabits > 0 || insights.totalTasks > 0);

  return (
    <TabScreenContainer>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getLabel('insights.title')}</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress and stay motivated
          </Text>
        </View>

        {!hasData ? (
          renderEmpty()
        ) : (
          <>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons
                  name="flame"
                  size={24}
                  color={theme.primary}
                  style={styles.statIcon}
                />
                <Text style={styles.statValue}>{insights!.currentStreak}</Text>
                <Text style={styles.statLabel}>{getLabel('insights.currentStreak')}</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons
                  name="trophy"
                  size={24}
                  color={theme.primary}
                  style={styles.statIcon}
                />
                <Text style={styles.statValue}>{insights!.longestStreak}</Text>
                <Text style={styles.statLabel}>{getLabel('insights.longestStreak')}</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons
                  name="repeat"
                  size={24}
                  color={theme.primary}
                  style={styles.statIcon}
                />
                <Text style={styles.statValue}>
                  {insights!.habitsCompletedToday}/{insights!.totalHabits}
                </Text>
                <Text style={styles.statLabel}>Habits Today</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons
                  name="checkbox"
                  size={24}
                  color={theme.primary}
                  style={styles.statIcon}
                />
                <Text style={styles.statValue}>
                  {insights!.completedChecklistItems}/{insights!.totalChecklistItems}
                </Text>
                <Text style={styles.statLabel}>Tasks Done</Text>
              </View>
            </View>

            {/* Completion Rate */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{getLabel('insights.completionRate')}</Text>
              <View style={styles.chartContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  {renderProgressRing(insights!.weeklyCompletionRate, 'Weekly Habits')}
                  {renderProgressRing(insights!.taskCompletionRate, 'Tasks')}
                </View>
              </View>
            </View>

            {/* Weekly Activity Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{getLabel('insights.activity')}</Text>
              {renderBarChart()}
            </View>

            {/* Goals Breakdown */}
            {renderGoalsBreakdown()}
          </>
        )}
      </ScrollView>
    </TabScreenContainer>
  );
}
