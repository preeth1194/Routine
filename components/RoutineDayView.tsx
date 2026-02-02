import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import type { RoutineEvent } from '@/models/RoutineEvent';
import { routineDayViewStyles as styles } from '@/styles/components/RoutineDayView.styles';

const SKY_BLUE = '#87CEEB';
const PEACH = '#FDB462';

const PIXELS_PER_MINUTE = 1;
const MIN_ROW_HEIGHT = 48;
const ROW_MARGIN_BOTTOM = 8;
const EVENT_TILE_HEIGHT = 48;
const TILE_GAP = 8;

function getRowHeight(startMinutes: number, endMinutes: number): number {
  const durationMinutes = endMinutes - startMinutes;
  return Math.max(MIN_ROW_HEIGHT, durationMinutes * PIXELS_PER_MINUTE);
}

function getEventGroupRowHeight(
  startMinutes: number,
  endMinutes: number,
  eventCount: number
): number {
  const durationHeight = getRowHeight(startMinutes, endMinutes);
  const stackedHeight =
    eventCount * EVENT_TILE_HEIGHT + Math.max(0, eventCount - 1) * TILE_GAP;
  return Math.max(durationHeight, stackedHeight);
}

function getItemRowHeight(item: TimelineItem): number {
  const start = item.type === 'gap' ? item.startMinutes : item.startMinutes;
  const end = item.type === 'gap' ? item.endMinutes : item.endMinutes;
  if (item.type === 'eventGroup') {
    return getEventGroupRowHeight(start, end, item.events.length);
  }
  return getRowHeight(start, end);
}

type TimelineItem =
  | { type: 'event'; event: RoutineEvent; startMinutes: number; endMinutes: number }
  | { type: 'eventGroup'; events: RoutineEvent[]; startMinutes: number; endMinutes: number }
  | { type: 'gap'; startMinutes: number; endMinutes: number };

const ACCENT_COLORS = [
  theme.primary,
  theme.leafGreen,
  theme.softSage,
  theme.deepForest,
  '#5B8A72', // sage
  '#7B68A6', // lavender
  '#E07C54', // coral
  '#4A90D9', // blue
];

function getDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr, ${m} min`;
}

function eventsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && startB < endA;
}

function buildTimelineItems(events: RoutineEvent[]): TimelineItem[] {
  const sorted = [...events].sort(
    (a, b) =>
      getDurationMinutes('00:00', a.startTime) - getDurationMinutes('00:00', b.startTime) ||
      getDurationMinutes('00:00', a.endTime) - getDurationMinutes('00:00', b.endTime)
  );
  const items: TimelineItem[] = [];
  let cursor = 0;
  const dayEnd = 24 * 60;
  let i = 0;
  while (i < sorted.length) {
    const event = sorted[i];
    const startM = getDurationMinutes('00:00', event.startTime);
    const endM = getDurationMinutes('00:00', event.endTime);
    if (startM > cursor) {
      items.push({ type: 'gap', startMinutes: cursor, endMinutes: startM });
    }
    const group: RoutineEvent[] = [event];
    let groupStart = startM;
    let groupEnd = endM;
    i++;
    while (i < sorted.length) {
      const next = sorted[i];
      const nextStart = getDurationMinutes('00:00', next.startTime);
      const nextEnd = getDurationMinutes('00:00', next.endTime);
      if (eventsOverlap(groupStart, groupEnd, nextStart, nextEnd)) {
        group.push(next);
        groupStart = Math.min(groupStart, nextStart);
        groupEnd = Math.max(groupEnd, nextEnd);
        i++;
      } else {
        break;
      }
    }
    if (group.length === 1) {
      items.push({ type: 'event', event: group[0], startMinutes: groupStart, endMinutes: groupEnd });
    } else {
      items.push({ type: 'eventGroup', events: group, startMinutes: groupStart, endMinutes: groupEnd });
    }
    cursor = Math.max(cursor, groupEnd);
  }
  if (cursor < dayEnd) {
    items.push({ type: 'gap', startMinutes: cursor, endMinutes: dayEnd });
  }
  if (sorted.length === 0) {
    items.push({ type: 'gap', startMinutes: 0, endMinutes: dayEnd });
  }
  return items;
}

function getPixelPositionForMinute(
  minute: number,
  items: TimelineItem[]
): number {
  let pos = 0;
  for (const item of items) {
    const start = item.type === 'gap' ? item.startMinutes : item.startMinutes;
    const end = item.type === 'gap' ? item.endMinutes : item.endMinutes;
    const rowHeight = getItemRowHeight(item);
    if (minute >= end) {
      pos += rowHeight + ROW_MARGIN_BOTTOM;
    } else if (minute <= start) {
      break;
    } else {
      const fraction = (minute - start) / (end - start);
      pos += fraction * rowHeight;
      break;
    }
  }
  return pos;
}

function getMinuteForPixelPosition(
  pixelY: number,
  items: TimelineItem[]
): number {
  let pos = 0;
  for (const item of items) {
    const start = item.type === 'gap' ? item.startMinutes : item.startMinutes;
    const end = item.type === 'gap' ? item.endMinutes : item.endMinutes;
    const rowHeight = getItemRowHeight(item);
    if (pixelY < pos + rowHeight) {
      const fraction = (pixelY - pos) / rowHeight;
      return Math.max(0, Math.min(24 * 60 - 1, start + fraction * (end - start)));
    }
    pos += rowHeight + ROW_MARGIN_BOTTOM;
  }
  return 24 * 60 - 1;
}


function getSunPosition(
  totalMinutes: number,
  sunriseMinutes: number,
  sunsetMinutes: number
): number {
  if (totalMinutes < sunriseMinutes) return -0.2;
  if (totalMinutes >= sunsetMinutes) return 1.2;
  const dayLength = sunsetMinutes - sunriseMinutes;
  return (totalMinutes - sunriseMinutes) / dayLength;
}

function getMoonPosition(
  totalMinutes: number,
  sunriseMinutes: number,
  sunsetMinutes: number
): number {
  if (totalMinutes >= sunriseMinutes && totalMinutes < sunsetMinutes) return -0.2;
  const nightLength = 24 * 60 - (sunsetMinutes - sunriseMinutes);
  if (totalMinutes >= sunsetMinutes) {
    return (totalMinutes - sunsetMinutes) / nightLength;
  }
  return (totalMinutes + (24 * 60 - sunsetMinutes) + sunriseMinutes) / nightLength;
}

function getArcPoint(progress: number): { x: number; y: number } {
  const angle = Math.PI * progress;
  const radius = 140;
  const centerX = 200;
  const centerY = 180;
  const x = centerX + Math.cos(Math.PI - angle) * radius;
  const y = centerY - Math.sin(Math.PI - angle) * radius;
  return { x, y };
}

const STAR_ANGLES = [72, 144, 216, 288, 324];

export interface RoutineDayViewProps {
  events: RoutineEvent[];
  currentTime: string;
  sunriseTime?: string;
  sunsetTime?: string;
  onEventPress: (event: RoutineEvent) => void;
  onEventToggleComplete: (event: RoutineEvent) => void;
  onEventDelete: (event: RoutineEvent) => void;
  onFreeSlicePress: (startTime: string, endTime: string) => void;
  totalDurationStr: string;
  contentBottomPadding?: number;
}

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function formatTimeForDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

export function RoutineDayView({
  events,
  currentTime,
  sunriseTime = '06:00',
  sunsetTime = '18:00',
  onEventPress,
  onEventToggleComplete,
  onEventDelete,
  onFreeSlicePress,
  totalDurationStr,
  contentBottomPadding,
}: RoutineDayViewProps) {
  const { width: screenWidth } = useWindowDimensions();
  const trackWidth = Math.max(screenWidth - 48, 200);
  const [customTime, setCustomTime] = useState<string | null>(null);
  const startProgressRef = useRef(0);
  const thumbScale = useSharedValue(1);
  const thumbOpacity = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);
  const selectionRef = useRef<{ startMinute: number; endMinute: number } | null>(null);
  const [selection, setSelection] = useState<{
    startMinute: number;
    endMinute: number;
  } | null>(null);

  const sunriseMinutes = toMinutes(sunriseTime);
  const sunsetMinutes = toMinutes(sunsetTime);

  const displayTime = customTime || currentTime;
  const [hours, minutes] = displayTime.split(':').map(Number);
  const timeProgress = (hours + minutes / 60) / 24;
  const displayMinutes = hours * 60 + minutes;

  const sunPosition = getSunPosition(displayMinutes, sunriseMinutes, sunsetMinutes);
  const moonPosition = getMoonPosition(displayMinutes, sunriseMinutes, sunsetMinutes);
  const sunPoint = getArcPoint(sunPosition);
  const moonPoint = getArcPoint(moonPosition);
  const isSunVisible = sunPosition >= 0 && sunPosition <= 1;
  const isMoonVisible = moonPosition >= 0 && moonPosition <= 1;

  const updateCustomTime = useCallback((progress: number) => {
    const clamped = Math.max(0, Math.min(1, progress));
    const totalMinutes = clamped * 24 * 60;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = Math.floor(totalMinutes % 60);
    const timeString = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    setCustomTime(timeString);
  }, []);

  const resetCustomTime = useCallback(() => {
    setTimeout(() => {
      setCustomTime(null);
      thumbOpacity.value = withSpring(0, { damping: 15, stiffness: 400 });
    }, 2000);
  }, [thumbOpacity]);

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thumbScale.value }],
    opacity: thumbOpacity.value,
  }));

  const tooltipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: thumbOpacity.value,
  }));

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const x = e.x - 24;
    const progress = Math.max(0, Math.min(1, x / trackWidth));
    runOnJS(updateCustomTime)(progress);
    thumbOpacity.value = withSpring(1, { damping: 15, stiffness: 400 });
    thumbScale.value = withSpring(1.3, { damping: 15, stiffness: 400 });
    runOnJS(resetCustomTime)();
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startProgressRef.current = timeProgress;
      thumbOpacity.value = withSpring(1, { damping: 15, stiffness: 400 });
      thumbScale.value = withSpring(1.3, { damping: 15, stiffness: 400 });
    })
    .onUpdate((e) => {
      const delta = e.translationX / trackWidth;
      runOnJS(updateCustomTime)(startProgressRef.current + delta);
    })
    .onEnd(() => {
      thumbScale.value = withSpring(1, { damping: 15, stiffness: 400 });
      runOnJS(resetCustomTime)();
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const timelineItems = buildTimelineItems(events);

  const updateSelectionFromPosition = useCallback(
    (contentY: number, isStart: boolean) => {
      const minute = getMinuteForPixelPosition(contentY, timelineItems);
      if (isStart) {
        selectionRef.current = { startMinute: minute, endMinute: minute };
        setSelection(selectionRef.current);
      } else if (selectionRef.current) {
        selectionRef.current = { ...selectionRef.current, endMinute: minute };
        setSelection({ ...selectionRef.current });
      }
    },
    [timelineItems]
  );

  const handleSelectionEnd = useCallback(() => {
    const sel = selectionRef.current;
    selectionRef.current = null;
    setSelection(null);
    if (sel) {
      const start = Math.min(sel.startMinute, sel.endMinute);
      const end = Math.max(sel.startMinute, sel.endMinute);
      const duration = end - start;
      const minDuration = 15;
      const finalEnd = duration < minDuration ? start + 60 : end;
      onFreeSlicePress(minutesToTime(start), minutesToTime(finalEnd));
    }
  }, [onFreeSlicePress]);

  const totalTimelineHeight = timelineItems.reduce(
    (sum, item) => sum + getItemRowHeight(item) + ROW_MARGIN_BOTTOM,
    0
  );

  const rulerLabels = React.useMemo(
    () =>
      Array.from({ length: 24 }, (_, h) => ({
        label: h === 0 ? '12 AM' : h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`,
        top: getPixelPositionForMinute(h * 60, timelineItems),
      })),
    [timelineItems]
  );

  useEffect(() => {
    if (!customTime || events.length === 0) return;
    const [h, m] = customTime.split(':').map(Number);
    const targetMinutes = h * 60 + m;
    const scrollY = Math.max(0, getPixelPositionForMinute(targetMinutes, timelineItems) - 80);
    scrollViewRef.current?.scrollTo({
      y: scrollY,
      animated: true,
    });
  }, [customTime, events.length, timelineItems]);

  function renderEventTile(
    event: RoutineEvent,
    startMinutes: number,
    endMinutes: number,
    eventsList: RoutineEvent[],
    inGroup?: boolean,
    isLastInGroup?: boolean,
    colorIndex?: number
  ) {
    const durationM = endMinutes - startMinutes;
    const accentColor =
      event.color ??
      ACCENT_COLORS[(colorIndex ?? eventsList.indexOf(event)) % ACCENT_COLORS.length];
    const iconName = (event.icon as keyof typeof Ionicons.glyphMap) ?? 'time-outline';
    const tileContent = (
      <View style={inGroup ? undefined : { flex: 1, minWidth: 0 }}>
        <Swipeable
          renderLeftActions={() => (
            <Pressable
              style={{
                backgroundColor: theme.appBarNotificationBadge,
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                minHeight: 48,
                borderRadius: 12,
                marginRight: 4,
              }}
              onPress={() => onEventDelete(event)}
              accessibilityLabel={getLabel('common.delete')}
            >
              <Ionicons name="trash-outline" size={24} color={theme.white} />
            </Pressable>
          )}
          friction={2}
        >
          <Pressable
            style={[styles.eventTile, { backgroundColor: theme.cardBackground }]}
            onPress={() => onEventPress(event)}
          >
            <View style={[styles.eventBar, { backgroundColor: accentColor }]} />
            <View style={styles.eventBlock}>
              <View style={[styles.eventIconCircle, { backgroundColor: accentColor }]}>
                <Ionicons name={iconName} size={16} color={theme.white} />
              </View>
              <View style={styles.eventBlockText}>
                <Text
                  style={[
                    styles.eventBlockTitle,
                    event.completed && {
                      textDecorationLine: 'line-through',
                      color: theme.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {event.title}
                </Text>
                <Text style={styles.eventBlockTime}>
                  {event.startTime}–{event.endTime} ({formatDuration(durationM)})
                </Text>
              </View>
              <Pressable
                style={[
                  styles.eventCompletionCircle,
                  event.completed ? styles.eventCompletionCircleDone : styles.eventCompletionCirclePending,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  onEventToggleComplete(event);
                }}
              >
                {event.completed && (
                  <Ionicons name="checkmark" size={14} color={theme.white} />
                )}
              </Pressable>
            </View>
          </Pressable>
        </Swipeable>
      </View>
    );
    return inGroup ? (
      <View key={event.id} style={{ marginBottom: isLastInGroup ? 0 : 8 }}>
        {tileContent}
      </View>
    ) : (
      tileContent
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.arcHeader}>
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={[SKY_BLUE, PEACH, theme.mintGlow]}
            locations={[0, 0.5, 1]}
            style={styles.arcGradient}
          />
        </View>

        <View style={styles.arcLabelSunrise}>
          <Text style={styles.arcLabelText}>Sunrise: {formatTimeForDisplay(sunriseTime)}</Text>
        </View>
        <View style={styles.arcLabelSunset}>
          <Text style={styles.arcLabelText}>Sunset: {formatTimeForDisplay(sunsetTime)}</Text>
        </View>

        <View style={styles.arcSvgWrapper} pointerEvents="none">
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 400 200"
            preserveAspectRatio="xMidYMid meet"
          >
            <Path
              d="M 20 180 Q 200 40, 380 180"
              stroke={theme.white}
              strokeWidth={2}
              fill="none"
              strokeDasharray="4 4"
              opacity={0.5}
            />
            {isSunVisible && (
              <G>
                <Circle cx={sunPoint.x} cy={sunPoint.y} r={24} fill={PEACH} opacity={0.3} />
                <Circle cx={sunPoint.x} cy={sunPoint.y} r={16} fill="#FFD700" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                  const radians = (angle * Math.PI) / 180;
                  const x1 = sunPoint.x + Math.cos(radians) * 20;
                  const y1 = sunPoint.y + Math.sin(radians) * 20;
                  const x2 = sunPoint.x + Math.cos(radians) * 28;
                  const y2 = sunPoint.y + Math.sin(radians) * 28;
                  return (
                    <Line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#FFD700"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  );
                })}
              </G>
            )}
            {isMoonVisible && (
              <G>
                <Circle cx={moonPoint.x} cy={moonPoint.y} r={22} fill="#E0E0E0" opacity={0.3} />
                <Circle cx={moonPoint.x} cy={moonPoint.y} r={14} fill="#F0F0F0" />
                <Circle cx={moonPoint.x - 4} cy={moonPoint.y - 2} r={3} fill="#D0D0D0" />
                <Circle cx={moonPoint.x + 3} cy={moonPoint.y + 4} r={2} fill="#D0D0D0" />
                {STAR_ANGLES.map((angleDeg, i) => {
                  const radians = (angleDeg * Math.PI) / 180;
                  const distance = 32;
                  const x = moonPoint.x + Math.cos(radians) * distance;
                  const y = moonPoint.y + Math.sin(radians) * distance;
                  return (
                    <Circle key={i} cx={x} cy={y} r={1.5} fill={theme.white} />
                  );
                })}
              </G>
            )}
          </Svg>
        </View>

        <GestureDetector gesture={composedGesture}>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <LinearGradient
                colors={[theme.primary, theme.softSage]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.sliderProgress, { width: `${timeProgress * 100}%` }]}
              />
            </View>
            <Animated.View
              style={[
                styles.sliderTooltip,
                {
                  left: 24 + trackWidth * timeProgress,
                  bottom: 36,
                },
                customTime && tooltipAnimatedStyle,
              ]}
              pointerEvents="none"
            >
              <Text style={styles.sliderTooltipText}>
                {customTime ? getLabel('routine.selected') : getLabel('routine.current')}: {displayTime}
              </Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.sliderThumb,
                { left: 24 + trackWidth * timeProgress - 8 },
                thumbAnimatedStyle,
              ]}
              pointerEvents="none"
            />
            <View style={styles.sliderMarkers}>
              <Text style={styles.sliderMarkerText} numberOfLines={1}>
                {formatTimeForDisplay(sunriseTime)}
              </Text>
              <Text style={styles.sliderMarkerText}>12 PM</Text>
              <Text style={styles.sliderMarkerText} numberOfLines={1}>
                {formatTimeForDisplay(sunsetTime)}
              </Text>
              <Text style={styles.sliderMarkerText}>12 AM</Text>
            </View>
          </View>
        </GestureDetector>
      </View>

      <View style={styles.timelineWrapper}>
        <LinearGradient
          colors={[theme.mintGlow, '#c9dbb5']}
          locations={[0, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ScrollView
          ref={scrollViewRef}
          style={styles.timelineScrollView}
          contentContainerStyle={[
            styles.contentArea,
            contentBottomPadding !== undefined && { paddingBottom: contentBottomPadding },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={(e) => {
            scrollY.value = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={theme.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>{getLabel('routine.empty')}</Text>
              <Text style={styles.emptySubtitle}>{getLabel('routine.emptySubtitle')}</Text>
            </View>
          ) : (
            <>
              <View style={[styles.timelineWithRuler, { minHeight: totalTimelineHeight }]}>
                {events.length > 0 && (
                  <View
                    style={[
                      styles.currentTimeLine,
                      {
                        top: getPixelPositionForMinute(displayMinutes, timelineItems),
                      },
                    ]}
                    pointerEvents="none"
                  />
                )}
                {selection && (
                  <View
                    style={[
                      styles.selectionOverlay,
                      {
                        top: getPixelPositionForMinute(
                          Math.min(selection.startMinute, selection.endMinute),
                          timelineItems
                        ),
                        height:
                          getPixelPositionForMinute(
                            Math.max(selection.startMinute, selection.endMinute),
                            timelineItems
                          ) -
                          getPixelPositionForMinute(
                            Math.min(selection.startMinute, selection.endMinute),
                            timelineItems
                          ),
                      },
                    ]}
                    pointerEvents="none"
                  />
                )}
                <View
                  style={[
                    styles.timeRulerColumn,
                    { height: totalTimelineHeight, position: 'relative' as const },
                  ]}
                >
                  {(rulerLabels ?? []).map(({ label, top }, i) => {
                    const startHour = i;
                    const startTime = `${startHour.toString().padStart(2, '0')}:00`;
                    const endHour = (startHour + 1) % 24;
                    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
                    return (
                      <Pressable
                        key={`ruler-${i}`}
                        style={[styles.timeRulerLabelTouchable, { top }]}
                        onPress={() => onFreeSlicePress(startTime, endTime)}
                        accessibilityLabel={`${label} - ${getLabel('routine.addEventAtTime')}`}
                      >
                        <Text style={styles.timeRulerLabel}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.timelineList}>
                {(() => {
                  let cumulativeOffset = 0;
                  return timelineItems.map((item, idx) => {
                    const startMinutes = item.type === 'gap' ? item.startMinutes : item.startMinutes;
                    const endMinutes = item.type === 'gap' ? item.endMinutes : item.endMinutes;
                    const isCurrentOrSelected =
                      displayMinutes >= startMinutes && displayMinutes < endMinutes;
                    const itemHeight = getItemRowHeight(item);
                    const prevOffset = cumulativeOffset;
                    cumulativeOffset += itemHeight + ROW_MARGIN_BOTTOM;

                  if (item.type === 'event') {
                    const { event, startMinutes: sm, endMinutes: em } = item;
                    const rowHeight = getRowHeight(sm, em);
                    return (
                      <View
                        key={`event-${event.id}`}
                        style={[
                          styles.timelineRow,
                          { height: rowHeight },
                          isCurrentOrSelected && styles.timelineRowHighlight,
                        ]}
                      >
                        {renderEventTile(event, sm, em, events, false, undefined, 0)}
                      </View>
                    );
                  }
                  if (item.type === 'eventGroup') {
                    const { events: groupEvents, startMinutes: sm, endMinutes: em } = item;
                    const rowHeight = getEventGroupRowHeight(sm, em, groupEvents.length);
                    return (
                      <View
                        key={`group-${sm}-${em}`}
                        style={[
                          styles.timelineRow,
                          { height: rowHeight },
                          isCurrentOrSelected && styles.timelineRowHighlight,
                        ]}
                      >
                        <View style={{ flex: 1, minWidth: 0 }}>
                          {groupEvents.map((event, groupIdx) =>
                            renderEventTile(
                              event,
                              sm,
                              em,
                              events,
                              true,
                              groupIdx === groupEvents.length - 1,
                              groupIdx
                            )
                          )}
                        </View>
                      </View>
                    );
                  }
                  const { startMinutes: sm, endMinutes: em } = item;
                  const startTime = minutesToTime(sm);
                  const endTime = minutesToTime(em);
                  const gapDuration = em - sm;
                  if (gapDuration < 15) return null;
                  const rowHeight = getRowHeight(sm, em);

                  const panGesture = Gesture.Pan()
                    .minDistance(15)
                    .onStart((e) => {
                      'worklet';
                      const contentY = prevOffset + e.y + scrollY.value;
                      runOnJS(updateSelectionFromPosition)(contentY, true);
                    })
                    .onUpdate((e) => {
                      'worklet';
                      const contentY = prevOffset + e.y + scrollY.value;
                      runOnJS(updateSelectionFromPosition)(contentY, false);
                    })
                    .onEnd(() => {
                      'worklet';
                      runOnJS(handleSelectionEnd)();
                    });

                  return (
                    <GestureDetector key={`gap-${idx}`} gesture={panGesture}>
                      <Pressable
                        style={[
                          styles.timelineRow,
                          { height: rowHeight },
                          isCurrentOrSelected && styles.timelineRowHighlight,
                        ]}
                        onPress={() => onFreeSlicePress(startTime, endTime)}
                        accessibilityLabel={getLabel('routine.addEventAtTime')}
                      >
                        <View style={styles.gapRow}>
                          <View style={styles.gapIcon}>
                            <Ionicons
                              name="add"
                              size={16}
                              color={theme.primary}
                            />
                          </View>
                          <Text style={styles.gapText}>
                            {getLabel('routine.intervalOver')}
                          </Text>
                        </View>
                      </Pressable>
                    </GestureDetector>
                  );
                });
                })()}
                </View>
              </View>

              <Text style={styles.endOfDay}>
                {getLabel('routine.endOfDay').replace(
                  '{{duration}}',
                  totalDurationStr
                )}
              </Text>
          </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
