import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  Pressable,
  Text,
  View,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { addDays, eachDayOfInterval, format, isToday } from 'date-fns';

import { TabScreenContainer } from '@/components/TabScreenContainer';
import { CreateRoutineEventSheet } from '@/components/CreateRoutineEventSheet';
import { DatePickerSheet } from '@/components/DatePickerSheet';
import { RoutineDayView } from '@/components/RoutineDayView';
import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import type { RoutineEvent } from '@/models/RoutineEvent';
import {
  getEventsForDate,
  getWeekStart,
  createEvent,
  updateEvent,
  toggleEventCompletion,
  deleteEvent as deleteRoutineEvent,
} from '@/services/routineEvents';
import { getSunTimesForDate } from '@/services/sunTimes';
import {
  dailyRoutineStyles as styles,
} from '@/styles/screens/daily-routine.styles';

function AnimatedDayCell({
  day,
  isSelected,
  isToday,
  onPress,
  cellWidth,
}: {
  day: Date;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
  cellWidth: number;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withTiming(1.15, { duration: SELECT_ANIM_DURATION * 0.6 }),
        withSpring(1, { damping: 14, stiffness: 200 })
      );
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isTodayAndSelected = isToday && isSelected;

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.88, pressSpringConfig);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, pressSpringConfig);
      }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.dayCell,
          { width: cellWidth, minWidth: cellWidth },
          isToday && !isSelected && styles.dayCellToday,
          isSelected && !isToday && styles.dayCellSelected,
          isTodayAndSelected && styles.dayCellTodaySelected,
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.dayNumber,
            isTodayAndSelected && styles.dayCellTodaySelectedText,
          ]}
        >
          {format(day, 'd')}
        </Text>
        <Text
          style={[
            styles.dayLabel,
            isTodayAndSelected && styles.dayCellTodaySelectedText,
          ]}
        >
          {isToday ? getLabel('routine.today') : format(day, 'EEE')}
        </Text>
        {isToday && (
          <View
            style={[
              styles.todayDot,
              isTodayAndSelected && { backgroundColor: theme.white },
            ]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

function getDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

const DAY_CELL_GAP = 6;
const WEEKS_FORWARD = 52; // 1 year
const WEEKS_BACK = 52; // 1 year
const CONTENT_PADDING = 4;


const pressSpringConfig = { damping: 15, stiffness: 400 };
const SELECT_ANIM_DURATION = 250;

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr, ${m} min`;
}

export default function RoutineScreen() {
  const today = new Date();
  const tabBarHeight = useBottomTabBarHeight();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const sectionPadding = 32;
  const availableWidth = Math.max(screenWidth - sectionPadding, 280);
  const weekChunkWidth = scrollWidth > 0 ? scrollWidth : availableWidth;
  const dayCellWidth = (weekChunkWidth - 6 * DAY_CELL_GAP) / 7;
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState<RoutineEvent[]>([]);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RoutineEvent | null>(null);
  const [preselectedStartTime, setPreselectedStartTime] = useState<
    string | undefined
  >();
  const [preselectedEndTime, setPreselectedEndTime] = useState<
    string | undefined
  >();
  const [currentTime, setCurrentTime] = useState(() =>
    format(new Date(), 'HH:mm')
  );
  const [sunTimes, setSunTimes] = useState<{ sunrise: string; sunset: string }>({
    sunrise: '06:00',
    sunset: '18:00',
  });

  useEffect(() => {
    getSunTimesForDate(selectedDate).then((times) => {
      setSunTimes({ sunrise: times.sunrise, sunset: times.sunset });
    });
  }, [selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm'));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const todayWeekStart = getWeekStart(today);
  const rangeStart = addDays(todayWeekStart, -7 * WEEKS_BACK);
  const rangeEnd = addDays(todayWeekStart, 6 + WEEKS_FORWARD * 7);
  const allDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

  const weekChunks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weekChunks.push(allDays.slice(i, i + 7));
  }

  const todayWeekIdx = Math.floor(
    (todayWeekStart.getTime() - rangeStart.getTime()) / (7 * 86400000)
  );

  useEffect(() => {
    if (scrollWidth > 0 && todayWeekIdx >= 0) {
      const chunkWidth = weekChunkWidth + 8;
      const x = CONTENT_PADDING + todayWeekIdx * chunkWidth;
      scrollRef.current?.scrollTo({ x, animated: false });
    }
  }, [scrollWidth]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isSelectedToday = isToday(selectedDate);

  useEffect(() => {
    loadEvents();
  }, [selectedDateStr]);

  async function loadEvents() {
    try {
      const data = await getEventsForDate(selectedDate);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load routine events:', error);
    }
  }

  function getReminderWhenText(minutesBefore: number | undefined): string {
    if (minutesBefore === undefined || minutesBefore === null) return '';
    if (minutesBefore === 0) return getLabel('routine.reminderAtTime');
    if (minutesBefore === 60) return getLabel('routine.oneHourBefore');
    return getLabel('routine.minutesBefore').replace('{{count}}', String(minutesBefore));
  }

  async function handleCreateEvent(
    payload: Omit<RoutineEvent, 'id' | 'createdAt'> & { id?: string }
  ) {
    try {
      const isEdit = Boolean(payload.id);
      if (payload.id) {
        await updateEvent(payload as RoutineEvent);
      } else {
        await createEvent(
          payload.date,
          payload.title,
          payload.startTime,
          payload.endTime,
          payload.icon,
          payload.color,
          payload.reminderMinutesBefore
        );
      }
      await loadEvents();
      setShowCreateSheet(false);
      setEditingEvent(null);

      const when = getReminderWhenText(payload.reminderMinutesBefore);
      const title = isEdit
        ? getLabel('routine.eventUpdated')
        : getLabel('routine.eventSaved');
      const message =
        when !== ''
          ? (isEdit
              ? getLabel('routine.eventUpdatedWithReminder')
              : getLabel('routine.eventSavedWithReminder')
            ).replace('{{when}}', when)
          : null;
      Alert.alert(title, message ?? undefined, [{ text: getLabel('common.ok') }]);
    } catch (error) {
      console.error('Failed to save event:', error);
      Alert.alert(
        getLabel('common.error'),
        'Failed to save event. Please try again.',
        [{ text: getLabel('common.ok') }]
      );
    }
  }

  async function handleToggleComplete(event: RoutineEvent) {
    try {
      const updated = await toggleEventCompletion(event.id);
      if (updated) {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? updated : e))
        );
      }
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  }

  async function handleDeleteEvent(event: RoutineEvent) {
    try {
      await deleteRoutineEvent(event.id);
      await loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  }

  function handleEditEvent(event: RoutineEvent) {
    setEditingEvent(event);
    setPreselectedStartTime(undefined);
    setPreselectedEndTime(undefined);
    setShowCreateSheet(true);
  }

  function handleFreeSlicePress(startTime: string, endTime: string) {
    setPreselectedStartTime(startTime);
    setPreselectedEndTime(endTime);
    setEditingEvent(null);
    setShowCreateSheet(true);
  }

  function openCreateSheetWithDefaults() {
    setPreselectedStartTime(undefined);
    setPreselectedEndTime(undefined);
    setEditingEvent(null);
    setShowCreateSheet(true);
  }

  const totalMinutes = events.reduce(
    (sum, e) => sum + getDurationMinutes(e.startTime, e.endTime),
    0
  );
  const totalDurationStr = formatDuration(totalMinutes);

  function goToToday() {
    setSelectedDate(today);
    setWeekStart(todayWeekStart);
    const chunkWidth = weekChunkWidth + 8;
    const x = CONTENT_PADDING + todayWeekIdx * chunkWidth;
    scrollRef.current?.scrollTo({ x, animated: true });
  }

  function handleScrollEnd(e: { nativeEvent: { contentOffset: { x: number } } }) {
    const x = e.nativeEvent.contentOffset.x;
    const visibleCenter = x + scrollWidth / 2;
    const chunkWidth = weekChunkWidth + 8;
    const weekIndex = Math.floor((visibleCenter - CONTENT_PADDING) / chunkWidth);
    const clamped = Math.max(0, Math.min(weekIndex, weekChunks.length - 1));
    const chunk = weekChunks[clamped];
    if (chunk?.[0]) setWeekStart(chunk[0]);
  }

  const onScrollLayout = (e: LayoutChangeEvent) => {
    setScrollWidth(e.nativeEvent.layout.width);
  };

  return (
    <TabScreenContainer showAppBar extendContentBehindTabBar>
      <View style={styles.screenRoot}>
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={styles.calendarMonthRow}
              accessibilityLabel={getLabel('routine.pickDate')}
            >
              <Ionicons
                name="calendar-outline"
                size={22}
                color={theme.text}
                style={styles.calendarIcon}
              />
              <Text
                style={styles.calendarMonth}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {format(selectedDate, 'd MMMM yyyy')}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.todayButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={goToToday}
              accessibilityLabel={getLabel('routine.goToToday')}
            >
              <Text style={styles.todayButtonText}>
                {getLabel('routine.today')}
              </Text>
            </Pressable>
          </View>
          <View style={styles.weekStripRow}>
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.weekStripScroll}
              contentContainerStyle={styles.weekStripContent}
              decelerationRate="fast"
              snapToInterval={weekChunkWidth + 8}
              snapToAlignment="start"
              onMomentumScrollEnd={handleScrollEnd}
              onScrollEndDrag={handleScrollEnd}
              scrollEventThrottle={16}
              onLayout={onScrollLayout}
            >
              {weekChunks.map((days, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.weekChunk,
                    {
                      width: weekChunkWidth,
                      gap: DAY_CELL_GAP,
                    },
                  ]}
                >
                  {days.map((day) => (
                    <AnimatedDayCell
                      key={day.toISOString()}
                      day={day}
                      isSelected={
                        format(day, 'yyyy-MM-dd') ===
                        format(selectedDate, 'yyyy-MM-dd')
                      }
                      isToday={isToday(day)}
                      onPress={() => setSelectedDate(day)}
                      cellWidth={dayCellWidth}
                    />
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.timelineContainer}>
          <RoutineDayView
            events={events}
            currentTime={currentTime}
            sunriseTime={sunTimes.sunrise}
            sunsetTime={sunTimes.sunset}
            onEventPress={handleEditEvent}
            onEventToggleComplete={handleToggleComplete}
            onEventDelete={handleDeleteEvent}
            onFreeSlicePress={handleFreeSlicePress}
            totalDurationStr={totalDurationStr}
            contentBottomPadding={tabBarHeight + 24}
          />

          <Pressable
            style={[styles.fab, { bottom: tabBarHeight + 24 }]}
            onPress={openCreateSheetWithDefaults}
          >
            <Ionicons name="add" size={28} color={theme.white} />
          </Pressable>
        </View>
      </View>

      <CreateRoutineEventSheet
        visible={showCreateSheet}
        date={selectedDateStr}
        editingEvent={editingEvent}
        initialStartTime={preselectedStartTime}
        initialEndTime={preselectedEndTime}
        onSave={handleCreateEvent}
        onClose={() => {
          setShowCreateSheet(false);
          setEditingEvent(null);
          setPreselectedStartTime(undefined);
          setPreselectedEndTime(undefined);
        }}
      />

      <DatePickerSheet
        visible={showDatePicker}
        selectedDate={selectedDate}
        onSelect={(date) => {
          setSelectedDate(date);
          setWeekStart(getWeekStart(date));
          const weekIdx = weekChunks.findIndex((chunk) =>
            chunk.some(
              (d) => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            )
          );
          if (weekIdx >= 0) {
            const chunkWidth = weekChunkWidth + 8;
            const x = CONTENT_PADDING + weekIdx * chunkWidth;
            setTimeout(() => {
              scrollRef.current?.scrollTo({ x, animated: true });
            }, 100);
          }
        }}
        onClose={() => setShowDatePicker(false)}
      />
    </TabScreenContainer>
  );
}
