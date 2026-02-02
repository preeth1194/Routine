import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import type { Goal } from '@/models/Goal';
import { hasImage, getImageSource } from '@/models/Goal';
import { goalPickerSheetStyles as styles } from '@/styles/components/GoalPickerSheet.styles';

type GoalPickerSheetProps = {
  visible: boolean;
  goals: Goal[];
  selectedGoalId?: string;
  title?: string;
  subtitle?: string;
  onSelect: (goal: Goal) => void;
  onClose: () => void;
};

export function GoalPickerSheet({
  visible,
  goals,
  selectedGoalId,
  title = getLabel('goals.pickGoal'),
  subtitle,
  onSelect,
  onClose,
}: GoalPickerSheetProps) {
  const [selected, setSelected] = useState<string | undefined>(selectedGoalId);

  function handleSelect() {
    const goal = goals.find((g) => g.id === selected);
    if (goal) {
      onSelect(goal);
      onClose();
    }
  }

  function renderGoalItem({ item }: { item: Goal }) {
    const isSelected = selected === item.id;
    const imageUri = getImageSource(item);

    return (
      <Pressable
        style={[styles.goalItem, isSelected && styles.goalItemSelected]}
        onPress={() => setSelected(item.id)}
      >
        {hasImage(item) ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.goalImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.goalImage, styles.goalImagePlaceholder]}>
            <Ionicons name="flag-outline" size={20} color={theme.textSecondary} />
          </View>
        )}
        <View style={styles.goalContent}>
          <Text style={styles.goalName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.category && (
            <Text style={styles.goalCategory} numberOfLines={1}>
              {item.category}
            </Text>
          )}
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={theme.primary}
            style={styles.checkmark}
          />
        )}
      </Pressable>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="flag-outline" size={48} color={theme.textSecondary} />
        <Text style={styles.emptyText}>{getLabel('goals.noGoalsAvailable')}</Text>
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.container}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          <FlatList
            data={goals}
            keyExtractor={(item) => item.id}
            renderItem={renderGoalItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={renderEmpty}
          />

          <View style={styles.footer}>
            <Pressable
              style={[
                styles.selectButton,
                !selected && styles.selectButtonDisabled,
              ]}
              onPress={handleSelect}
              disabled={!selected}
            >
              <Text style={styles.selectButtonText}>{getLabel('common.select')}</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{getLabel('common.cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
