import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import type { RoutineEvent } from '@/models/RoutineEvent';
import { createRoutineEventSheetStyles as styles } from '@/styles/components/CreateRoutineEventSheet.styles';

const REMINDER_PRESETS = [0, 5, 15, 30, 60] as const;

const EVENT_ICONS = [
  'time-outline',
  'alarm-outline',
  'fitness-outline',
  'cafe-outline',
  'book-outline',
  'briefcase-outline',
  'walk-outline',
  'bed-outline',
  'nutrition-outline',
  'heart-outline',
  'star-outline',
  'flash-outline',
  'calendar-outline',
  'phone-portrait-outline',
  'chatbubble-outline',
] as const;

const EVENT_COLORS = [
  theme.primary,
  theme.leafGreen,
  theme.softSage,
  theme.deepForest,
  '#5B8A72',
  '#7B68A6',
  '#E07C54',
  '#4A90D9',
];

function parseTime(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
}

function isValidTime(time: string): boolean {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return false;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

type CreateRoutineEventSheetProps = {
  visible: boolean;
  date: string; // YYYY-MM-DD
  editingEvent?: RoutineEvent | null;
  initialStartTime?: string;
  initialEndTime?: string;
  onSave: (event: Omit<RoutineEvent, 'id' | 'createdAt'> & { id?: string }) => void;
  onClose: () => void;
};

export function CreateRoutineEventSheet({
  visible,
  date,
  editingEvent,
  initialStartTime,
  initialEndTime,
  onSave,
  onClose,
}: CreateRoutineEventSheetProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState<number>(5);
  const [customReminderInput, setCustomReminderInput] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('time-outline');
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

  const isEditing = Boolean(editingEvent);

  useEffect(() => {
    if (visible) {
      if (editingEvent) {
        setTitle(editingEvent.title);
        setStartTime(editingEvent.startTime);
        setEndTime(editingEvent.endTime);
        setReminderOn(editingEvent.reminderMinutesBefore !== undefined && editingEvent.reminderMinutesBefore !== null);
        setReminderMinutes(editingEvent.reminderMinutesBefore ?? 5);
        setCustomReminderInput('');
        setSelectedIcon(editingEvent.icon ?? 'time-outline');
        setSelectedColor(editingEvent.color);
      } else {
        setTitle('');
        setStartTime(initialStartTime ?? '09:00');
        setEndTime(initialEndTime ?? '09:30');
        setReminderOn(false);
        setReminderMinutes(5);
        setCustomReminderInput('');
        setSelectedIcon('time-outline');
        setSelectedColor(undefined);
      }
    }
  }, [visible, editingEvent, initialStartTime, initialEndTime]);

  function handleStartTimeChange(text: string) {
    setStartTime(parseTime(text));
  }

  function handleEndTimeChange(text: string) {
    setEndTime(parseTime(text));
  }

  function getReminderMinutesBefore(): number | undefined {
    if (!reminderOn) return undefined;
    if (REMINDER_PRESETS.includes(reminderMinutes as 0 | 5 | 15 | 30 | 60)) return reminderMinutes;
    const custom = parseInt(customReminderInput, 10);
    if (!Number.isNaN(custom) && custom >= 0) return custom;
    return reminderMinutes;
  }

  function handleSave() {
    if (!title.trim()) return;
    if (!isValidTime(startTime) || !isValidTime(endTime)) return;

    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    if (endMins <= startMins) return;

    const reminderMinutesBefore = getReminderMinutesBefore();
    const icon = selectedIcon || undefined;
    const color = selectedColor || undefined;

    if (editingEvent) {
      onSave({
        ...editingEvent,
        title: title.trim(),
        startTime,
        endTime,
        icon,
        color,
        reminderMinutesBefore,
      });
    } else {
      onSave({
        date,
        title: title.trim(),
        startTime,
        endTime,
        icon,
        color,
        reminderMinutesBefore,
        completed: false,
      });
    }
    onClose();
  }

  const canSave =
    title.trim().length > 0 &&
    isValidTime(startTime) &&
    isValidTime(endTime) &&
    (() => {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      return eh * 60 + em > sh * 60 + sm;
    })();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          <Text style={styles.title}>
            {isEditing ? getLabel('routine.editEvent') : getLabel('routine.newEvent')}
          </Text>

          <Text style={styles.inputLabel}>{getLabel('routine.eventTitle')}</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={getLabel('routine.eventTitlePlaceholder')}
            placeholderTextColor={theme.textSecondary}
            autoFocus
          />

          <View style={styles.timeRow}>
            <View style={styles.timeInputGroup}>
              <Text style={styles.inputLabel}>{getLabel('routine.startTime')}</Text>
              <TextInput
                style={styles.input}
                value={startTime}
                onChangeText={handleStartTimeChange}
                placeholder="HH:mm"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.timeInputGroup}>
              <Text style={styles.inputLabel}>{getLabel('routine.endTime')}</Text>
              <TextInput
                style={styles.input}
                value={endTime}
                onChangeText={handleEndTimeChange}
                placeholder="HH:mm"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>{getLabel('routine.eventIcon')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.iconScroll}
            contentContainerStyle={styles.iconScrollContent}
          >
            {EVENT_ICONS.map((iconName) => (
              <Pressable
                key={iconName}
                style={[
                  styles.iconOption,
                  selectedIcon === iconName && styles.iconOptionSelected,
                ]}
                onPress={() => setSelectedIcon(iconName)}
              >
                <Ionicons
                  name={iconName as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={selectedIcon === iconName ? theme.white : theme.text}
                />
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.sectionLabel}>{getLabel('routine.eventColor')}</Text>
          <View style={styles.colorRow}>
            {EVENT_COLORS.map((color, index) => (
              <Pressable
                key={`color-${index}`}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(selectedColor === color ? undefined : color)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>{getLabel('routine.reminder')}</Text>
          <Pressable
            style={styles.reminderRow}
            onPress={() => setReminderOn(!reminderOn)}
          >
            <Text style={styles.reminderLabel}>{getLabel('routine.remindMe')}</Text>
            <View style={[styles.toggle, reminderOn && styles.toggleOn]}>
              <View style={[styles.toggleThumb, reminderOn && styles.toggleThumbOn]} />
            </View>
          </Pressable>
          {reminderOn && (
            <View style={styles.reminderOptions}>
              {REMINDER_PRESETS.map((mins) => (
                <Pressable
                  key={mins}
                  style={[
                    styles.reminderChip,
                    reminderMinutes === mins && !customReminderInput && styles.reminderChipSelected,
                  ]}
                  onPress={() => {
                    setReminderMinutes(mins);
                    setCustomReminderInput('');
                  }}
                >
                  <Text
                    style={[
                      styles.reminderChipText,
                      reminderMinutes === mins && !customReminderInput && styles.reminderChipTextSelected,
                    ]}
                  >
                    {mins === 0
                      ? getLabel('routine.atTimeOfEvent')
                      : mins === 60
                        ? getLabel('routine.oneHourBefore')
                        : getLabel('routine.minutesBefore').replace('{{count}}', String(mins))}
                  </Text>
                </Pressable>
              ))}
              <View style={styles.customReminderRow}>
                <Text style={styles.customReminderLabel}>
                  {getLabel('routine.customMinutes')}
                </Text>
                <TextInput
                  style={styles.customReminderInput}
                  value={customReminderInput}
                  onChangeText={(t) => {
                    setCustomReminderInput(t.replace(/\D/g, ''));
                    const n = parseInt(t.replace(/\D/g, ''), 10);
                    if (!Number.isNaN(n)) setReminderMinutes(n);
                  }}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          )}

          <View style={styles.buttonsRow}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{getLabel('common.cancel')}</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={styles.saveButtonText}>{getLabel('common.save')}</Text>
            </Pressable>
          </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
