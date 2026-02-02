import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { format } from 'date-fns';

import { theme } from '@/constants/theme';
import type { Task, ChecklistItem } from '@/models/Task';
import {
  isTaskFullyCompleted,
  isTaskOverdue,
  getTaskCompletionPercentage,
  isChecklistItemCompleted,
} from '@/models/Task';
import { taskItemStyles as styles } from '@/styles/components/TaskItem.styles';

type TaskItemProps = {
  task: Task;
  onChecklistItemToggle: (itemId: string) => void;
  onAddChecklistItem?: () => void;
  onPress?: () => void;
  collapsed?: boolean;
  style?: ViewStyle;
};

export function TaskItem({
  task,
  onChecklistItemToggle,
  onAddChecklistItem,
  onPress,
  collapsed = false,
  style,
}: TaskItemProps) {
  const [expanded, setExpanded] = useState(!collapsed);
  const isCompleted = isTaskFullyCompleted(task);
  const isOverdue = isTaskOverdue(task);
  const completionPercentage = getTaskCompletionPercentage(task);

  if (collapsed && !expanded) {
    // Collapsed view
    return (
      <Pressable
        style={[styles.container, isCompleted && styles.containerCompleted, style]}
        onPress={() => setExpanded(true)}
      >
        <View style={styles.collapsedContainer}>
          <View
            style={[
              styles.collapsedCheckbox,
              isCompleted && styles.checklistCheckboxCompleted,
            ]}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={14} color={theme.white} />
            )}
          </View>
          <View style={styles.collapsedContent}>
            <Text
              style={[styles.name, isCompleted && styles.nameCompleted]}
              numberOfLines={1}
            >
              {task.name}
            </Text>
            <Text style={styles.collapsedMeta}>
              {task.checklist.filter(isChecklistItemCompleted).length}/{task.checklist.length} items
            </Text>
          </View>
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.textSecondary}
          />
        </View>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View
            style={[styles.progressBarFill, { width: `${completionPercentage}%` }]}
          />
        </View>
      </Pressable>
    );
  }

  return (
    <View
      style={[styles.container, isCompleted && styles.containerCompleted, style]}
    >
      {/* Header */}
      <Pressable style={styles.header} onPress={onPress}>
        <View style={styles.headerContent}>
          <Text
            style={[styles.name, isCompleted && styles.nameCompleted]}
            numberOfLines={2}
          >
            {task.name}
          </Text>
          <View style={styles.metaRow}>
            {/* Due date */}
            {task.dueDate && (
              <View style={styles.dueDate}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={isOverdue ? '#e74c3c' : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.dueDateText,
                    isOverdue && styles.dueDateOverdue,
                  ]}
                >
                  {format(new Date(task.dueDate), 'MMM d')}
                </Text>
              </View>
            )}
            {/* Progress */}
            <View style={styles.progress}>
              <Ionicons
                name="checkbox-outline"
                size={14}
                color={theme.textSecondary}
              />
              <Text style={styles.progressText}>
                {task.checklist.filter(isChecklistItemCompleted).length}/
                {task.checklist.length}
              </Text>
            </View>
          </View>
        </View>
        {collapsed && (
          <Pressable
            style={styles.expandButton}
            onPress={() => setExpanded(false)}
          >
            <Ionicons name="chevron-up" size={20} color={theme.textSecondary} />
          </Pressable>
        )}
      </Pressable>

      {/* Checklist */}
      <View style={styles.checklist}>
        {task.checklist.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            onToggle={() => onChecklistItemToggle(item.id)}
          />
        ))}

        {/* Add item button */}
        {onAddChecklistItem && (
          <Pressable
            style={styles.addItemContainer}
            onPress={onAddChecklistItem}
          >
            <View style={styles.addItemButton}>
              <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
              <Text style={styles.addItemText}>Add item</Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[styles.progressBarFill, { width: `${completionPercentage}%` }]}
        />
      </View>
    </View>
  );
}

type ChecklistItemRowProps = {
  item: ChecklistItem;
  onToggle: () => void;
};

function ChecklistItemRow({ item, onToggle }: ChecklistItemRowProps) {
  const isCompleted = isChecklistItemCompleted(item);

  return (
    <Pressable style={styles.checklistItem} onPress={onToggle}>
      <View
        style={[
          styles.checklistCheckbox,
          isCompleted && styles.checklistCheckboxCompleted,
        ]}
      >
        {isCompleted && (
          <Ionicons name="checkmark" size={14} color={theme.white} />
        )}
      </View>
      <Text
        style={[
          styles.checklistText,
          isCompleted && styles.checklistTextCompleted,
        ]}
        numberOfLines={2}
      >
        {item.text}
      </Text>
    </Pressable>
  );
}
