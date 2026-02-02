import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import { theme, typography } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

type DatePickerSheetProps = {
  visible: boolean;
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
};

export function DatePickerSheet({
  visible,
  selectedDate,
  onSelect,
  onClose,
}: DatePickerSheetProps) {
  const [viewMonth, setViewMonth] = useState(selectedDate);
  const { height: screenHeight } = useWindowDimensions();

  useEffect(() => {
    if (visible) setViewMonth(selectedDate);
  }, [visible, selectedDate]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function handleSelect(date: Date) {
    onSelect(date);
    onClose();
  }

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.container, { maxHeight: screenHeight * 0.7 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Pressable
              onPress={() => setViewMonth(subMonths(viewMonth, 1))}
              style={styles.monthNav}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </Pressable>
            <Text style={styles.monthTitle}>{format(viewMonth, 'MMMM yyyy')}</Text>
            <Pressable
              onPress={() => setViewMonth(addMonths(viewMonth, 1))}
              style={styles.monthNav}
              hitSlop={12}
            >
              <Ionicons name="chevron-forward" size={24} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {weekDayLabels.map((d) => (
              <Text key={d} style={styles.weekdayLabel}>
                {d}
              </Text>
            ))}
          </View>

          <ScrollView
            style={styles.gridScroll}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
          >
            {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIdx) => (
              <View key={weekIdx} style={styles.weekRow}>
                {days.slice(weekIdx * 7, weekIdx * 7 + 7).map((day) => {
                  const inMonth = isSameMonth(day, viewMonth);
                  const selected = isSameDay(day, selectedDate);
                  const today = isToday(day);
                  return (
                    <Pressable
                      key={day.toISOString()}
                      onPress={() => handleSelect(day)}
                      style={[
                        styles.dayCell,
                        !inMonth && styles.dayCellMuted,
                        selected && styles.dayCellSelected,
                        today && !selected && styles.dayCellToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !inMonth && styles.dayTextMuted,
                          selected && styles.dayTextSelected,
                          today && !selected && styles.dayTextToday,
                        ]}
                      >
                        {format(day, 'd')}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>
              {getLabel('common.cancel')}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  container: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.cardBorder,
    borderRadius: 2,
    alignSelf: 'center' as const,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
  },
  monthNav: {
    padding: 4,
  },
  monthTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
  },
  weekdayRow: {
    flexDirection: 'row' as const,
    marginBottom: 8,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center' as const,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: theme.textSecondary,
  },
  gridScroll: {
    maxHeight: 280,
  },
  gridContent: {
    paddingBottom: 16,
  },
  weekRow: {
    flexDirection: 'row' as const,
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  dayCellMuted: {
    opacity: 0.35,
  },
  dayCellSelected: {
    backgroundColor: theme.primary,
  },
  dayCellToday: {
    backgroundColor: theme.mintGlow,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  dayText: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: theme.text,
  },
  dayTextMuted: {
    color: theme.textSecondary,
  },
  dayTextSelected: {
    color: theme.white,
    fontFamily: typography.headingSemiBold,
  },
  dayTextToday: {
    color: theme.primary,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center' as const,
    marginTop: 8,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.text,
  },
};
