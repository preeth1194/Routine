import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';
import type { Habit } from '@/models/Habit';
import {
  isCompletedToday,
  isScheduledOnDate,
  isTimeBound,
  isSongBased,
} from '@/models/Habit';
import { habitItemStyles as styles } from '@/styles/components/HabitItem.styles';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type HabitItemProps = {
  habit: Habit;
  date?: Date;
  onToggle: () => void;
  onTimerPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function HabitItem({
  habit,
  date = new Date(),
  onToggle,
  onTimerPress,
  disabled = false,
  style,
}: HabitItemProps) {
  const isCompleted = isCompletedToday(habit);
  const isScheduled = isScheduledOnDate(habit, date);
  const hasTimer = isTimeBound(habit);
  const isSong = isSongBased(habit);

  const canToggle = isScheduled && !disabled;

  function handlePress() {
    if (canToggle) {
      onToggle();
    }
  }

  return (
    <View
      style={[
        styles.container,
        isCompleted && styles.containerCompleted,
        style,
      ]}
    >
      {/* Checkbox */}
      <Pressable
        style={[
          styles.checkbox,
          isCompleted && styles.checkboxCompleted,
          !canToggle && styles.checkboxDisabled,
        ]}
        onPress={handlePress}
        disabled={!canToggle}
      >
        {isCompleted && (
          <Ionicons name="checkmark" size={18} color={theme.white} />
        )}
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.name, isCompleted && styles.nameCompleted]}
            numberOfLines={2}
          >
            {habit.name}
          </Text>

          {/* Timer button for time-bound habits */}
          {hasTimer && onTimerPress && (
            <Pressable style={styles.timerButton} onPress={onTimerPress}>
              <Ionicons
                name={isSong ? 'musical-notes' : 'timer-outline'}
                size={22}
                color={theme.primary}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.metaRow}>
          {/* Schedule info */}
          <View style={styles.schedule}>
            <Ionicons
              name={habit.schedule === 'daily' ? 'today' : 'calendar'}
              size={14}
              color={theme.textSecondary}
            />
            <Text style={styles.scheduleText}>
              {habit.schedule === 'daily' ? 'Daily' : 'Weekly'}
            </Text>
          </View>

          {/* Streak */}
          {habit.streak > 0 && (
            <View style={styles.streak}>
              <Ionicons name="flame" size={14} color={theme.primary} />
              <Text style={styles.streakText}>{habit.streak} day streak</Text>
            </View>
          )}

          {/* Timer badge */}
          {hasTimer && habit.timeBound && (
            <View style={styles.timerBadge}>
              <Ionicons
                name={isSong ? 'musical-notes' : 'time-outline'}
                size={12}
                color={theme.text}
              />
              <Text style={styles.timerText}>
                {isSong
                  ? `${habit.timeBound.duration} songs`
                  : `${habit.timeBound.duration} min`}
              </Text>
            </View>
          )}
        </View>

        {/* Weekly days */}
        {habit.schedule === 'weekly' && habit.weeklyDays && (
          <View style={styles.weekDays}>
            {DAY_LABELS.map((label, index) => {
              const isActive = habit.weeklyDays?.includes(index);
              return (
                <View
                  key={index}
                  style={[styles.dayBadge, isActive && styles.dayBadgeActive]}
                >
                  <Text
                    style={[styles.dayText, isActive && styles.dayTextActive]}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Not scheduled today message */}
        {!isScheduled && (
          <Text style={styles.notScheduledText}>
            Not scheduled for today
          </Text>
        )}
      </View>
    </View>
  );
}
