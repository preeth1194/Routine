import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Image, Pressable, Text, View, ViewStyle } from 'react-native';
import { format } from 'date-fns';

import { theme } from '@/constants/theme';
import type { Goal } from '@/models/Goal';
import { hasImage, getImageSource, isPastDeadline } from '@/models/Goal';
import { goalCardStyles as styles } from '@/styles/components/GoalCard.styles';

type GoalCardProps = {
  goal: Goal;
  habitsCount?: number;
  tasksCount?: number;
  completionPercentage?: number;
  variant?: 'default' | 'compact';
  onPress?: () => void;
  style?: ViewStyle;
};

export function GoalCard({
  goal,
  habitsCount = 0,
  tasksCount = 0,
  completionPercentage,
  variant = 'default',
  onPress,
  style,
}: GoalCardProps) {
  const imageUri = getImageSource(goal);
  const isOverdue = isPastDeadline(goal);

  if (variant === 'compact') {
    return (
      <Pressable
        style={[styles.container, styles.compactContainer, style]}
        onPress={onPress}
        disabled={!onPress}
      >
        {hasImage(goal) ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.compactImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.compactImage, styles.imagePlaceholder]}>
            <Ionicons name="flag-outline" size={20} color={theme.textSecondary} />
          </View>
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>
            {goal.name}
          </Text>
          {goal.category && (
            <Text style={styles.compactMeta} numberOfLines={1}>
              {goal.category}
            </Text>
          )}
        </View>
        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.textSecondary}
            style={styles.chevron}
          />
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.container, style]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {hasImage(goal) ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="flag-outline" size={32} color={theme.textSecondary} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={2}>
              {goal.name}
            </Text>
            {goal.category && (
              <Text style={styles.category}>{goal.category}</Text>
            )}
            {goal.deadline && (
              <Text
                style={[styles.deadline, isOverdue && styles.deadlineOverdue]}
              >
                {isOverdue ? 'Overdue: ' : 'Due: '}
                {format(new Date(goal.deadline), 'MMM d, yyyy')}
              </Text>
            )}
          </View>
        </View>

        {goal.whyImportant && (
          <Text style={styles.whyImportant} numberOfLines={2}>
            "{goal.whyImportant}"
          </Text>
        )}

        {/* Stats */}
        {(habitsCount > 0 || tasksCount > 0) && (
          <View style={styles.statsRow}>
            {habitsCount > 0 && (
              <View style={styles.stat}>
                <Ionicons name="repeat" size={14} color={theme.textSecondary} />
                <Text style={styles.statText}>
                  {habitsCount} {habitsCount === 1 ? 'habit' : 'habits'}
                </Text>
              </View>
            )}
            {tasksCount > 0 && (
              <View style={styles.stat}>
                <Ionicons
                  name="checkbox-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.statText}>
                  {tasksCount} {tasksCount === 1 ? 'task' : 'tasks'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Progress bar */}
        {completionPercentage !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completionPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completionPercentage}% complete
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
