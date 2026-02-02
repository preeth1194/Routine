import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Path,
  Text as SvgText,
} from 'react-native-svg';

import { theme, typography } from '@/constants/theme';
import type { RoutineEvent } from '@/models/RoutineEvent';

/** Architectural scale: drafting ruler / tachymeter */
const MAJOR_TICK_COLOR = '#2C2C2C';
const SUB_TICK_COLOR = '#8A8A8A';
const SEMICIRCLE_CLIP_ID = 'semicircle-clip';

function angleInSlice(angleDeg: number, startAngle: number, endAngle: number): boolean {
  const norm = (a: number) => ((a % 360) + 360) % 360;
  const a = norm(angleDeg);
  const s = norm(startAngle);
  const e = norm(endAngle);
  if (s <= e) return a >= s && a <= e;
  return a >= s || a <= e;
}

/** Map minute within a 6-hour window to angle. 0 min in window = top (-90°), clockwise. */
function windowMinuteToAngle(minuteInWindow: number, windowDuration: number): number {
  return (minuteInWindow / windowDuration) * 360 - 90;
}

/** Semi-circle: map full-circle content angle (-90..270) to semicircle display angle (0..180). */
function contentAngleToSemi(contentAngle: number): number {
  return ((contentAngle + 90) / 360) * 180;
}

/** Semi-circle: map display angle (0..180) back to content angle. */
function semiAngleToContent(displayAngle: number): number {
  return (displayAngle / 180) * 360 - 90;
}

/** Map day minutes to angle when showing only a time window. */
function dayMinutesToWindowAngle(
  dayMinutes: number,
  windowStart: number,
  windowEnd: number
): number {
  const clipped = Math.max(windowStart, Math.min(windowEnd, dayMinutes));
  const minuteInWindow = clipped - windowStart;
  return windowMinuteToAngle(minuteInWindow, windowEnd - windowStart);
}

/** Chronodex: light pastel/white fills and thin dark stroke */
const CHRONODEX_STROKE = '#1a1a1a';
const CHRONODEX_STROKE_WIDTH = 1.2;
const CHRONODEX_FILLS = [
  theme.white,
  theme.mintGlow,
  theme.softSage,
  theme.cardBackground ?? theme.white,
];

/** Staggered radii by activity type for hand-drawn Chronodex look (multiplier of base outer R). */
function getActivityRadiusMultiplier(title: string, index: number): number {
  const t = title.toLowerCase();
  if (/\bsleep|rest|nap\b/.test(t)) return 1.08;
  if (/\bwork|meeting|focus\b/.test(t)) return 1.05;
  if (/\bworkout|exercise|run|gym|yoga|meditate\b/.test(t)) return 0.96;
  if (/\bmeal|breakfast|lunch|dinner|eat|food\b/.test(t)) return 1.02;
  if (/\bread|art|creative|family|call\b/.test(t)) return 1.0;
  return 0.98 + (index % 5) * 0.025;
}

export interface ClockSlice {
  startAngle: number;
  endAngle: number;
  event?: RoutineEvent;
  isFree: boolean;
  color: string;
  /** Chronodex: multiplier for outer radius (staggered look) */
  outerRadiusMultiplier?: number;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Converts minutes from midnight to SVG angle. 0° = top (12 o'clock), clockwise. */
function minutesToAngle(minutes: number): number {
  return (minutes / 1440) * 360 - 90;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/** Chronodex: pie slice from center to outer edge (filled arc segment). */
function describePieArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const span = endAngle >= startAngle
    ? endAngle - startAngle
    : (endAngle + 360) - startAngle;
  const sweep = 1;
  const largeArc = span > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y} Z`;
}

export function buildSlicesFromEvents(events: RoutineEvent[]): ClockSlice[] {
  const slices: ClockSlice[] = [];
  const sorted = [...events].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  let cursorMinutes = 0;
  let eventIndex = 0;

  for (const event of sorted) {
    const startM = timeToMinutes(event.startTime);
    const endM = timeToMinutes(event.endTime);

    if (startM > cursorMinutes) {
      slices.push({
        startAngle: minutesToAngle(cursorMinutes),
        endAngle: minutesToAngle(startM),
        isFree: true,
        color: theme.white,
      });
    }

    const color =
      event.color ?? CHRONODEX_FILLS[eventIndex % CHRONODEX_FILLS.length];
    slices.push({
      startAngle: minutesToAngle(startM),
      endAngle: minutesToAngle(endM),
      event,
      isFree: false,
      color,
      outerRadiusMultiplier: getActivityRadiusMultiplier(event.title, eventIndex),
    });
    eventIndex++;
    cursorMinutes = Math.max(cursorMinutes, endM);
  }

  if (cursorMinutes < 1440) {
    slices.push({
      startAngle: minutesToAngle(cursorMinutes),
      endAngle: minutesToAngle(1440),
      isFree: true,
      color: theme.white,
    });
  }

  if (sorted.length === 0) {
    slices.push({
      startAngle: minutesToAngle(0),
      endAngle: minutesToAngle(1440),
      isFree: true,
      color: theme.white,
    });
  }

  return slices;
}

/** Build slices for a 6-hour window; angles in window space (0–360 min → full circle). */
export function buildSlicesForWindow(
  events: RoutineEvent[],
  windowStartMinutes: number,
  windowEndMinutes: number
): ClockSlice[] {
  const windowDuration = windowEndMinutes - windowStartMinutes;
  const slices: ClockSlice[] = [];
  const sorted = [...events].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  let cursor = windowStartMinutes;
  let eventIndex = 0;

  for (const event of sorted) {
    const startM = timeToMinutes(event.startTime);
    const endM = timeToMinutes(event.endTime);
    if (endM <= windowStartMinutes || startM >= windowEndMinutes) continue;

    const sliceStart = Math.max(windowStartMinutes, startM);
    const sliceEnd = Math.min(windowEndMinutes, endM);
    if (sliceStart > cursor) {
      slices.push({
        startAngle: dayMinutesToWindowAngle(cursor, windowStartMinutes, windowEndMinutes),
        endAngle: dayMinutesToWindowAngle(sliceStart, windowStartMinutes, windowEndMinutes),
        isFree: true,
        color: theme.white,
      });
    }

    const color =
      event.color ?? CHRONODEX_FILLS[eventIndex % CHRONODEX_FILLS.length];
    slices.push({
      startAngle: dayMinutesToWindowAngle(sliceStart, windowStartMinutes, windowEndMinutes),
      endAngle: dayMinutesToWindowAngle(sliceEnd, windowStartMinutes, windowEndMinutes),
      event,
      isFree: false,
      color,
      outerRadiusMultiplier: getActivityRadiusMultiplier(event.title, eventIndex),
    });
    eventIndex++;
    cursor = Math.max(cursor, sliceEnd);
  }

  if (cursor < windowEndMinutes) {
    slices.push({
      startAngle: dayMinutesToWindowAngle(cursor, windowStartMinutes, windowEndMinutes),
      endAngle: dayMinutesToWindowAngle(windowEndMinutes, windowStartMinutes, windowEndMinutes),
      isFree: true,
      color: theme.white,
    });
  }

  if (slices.length === 0) {
    slices.push({
      startAngle: windowMinuteToAngle(0, windowDuration),
      endAngle: windowMinuteToAngle(windowDuration, windowDuration),
      isFree: true,
      color: theme.white,
    });
  }

  return slices;
}

type RoutineClockChartProps = {
  events: RoutineEvent[];
  isToday: boolean;
  onEventPress: (event: RoutineEvent) => void;
  onFreeSlicePress: (startTime: string, endTime: string) => void;
  onRingPress?: (angleDeg: number) => void;
  selectingTimeStart?: string | null;
  size: number;
  style?: object;
  /** 6-hour window: start minute from midnight (e.g. 360 = 6:00) */
  windowStartMinutes?: number;
  /** 6-hour window: end minute from midnight (e.g. 720 = 12:00) */
  windowEndMinutes?: number;
  /** Title shown in the center of the clock (e.g. "Your morning") */
  segmentTitle?: string;
  /** Called when dial rotation brings next/prev 6-hour sector into view (1 = next, -1 = prev) */
  onSectorChange?: (direction: 1 | -1) => void;
};

export function RoutineClockChart({
  events,
  isToday,
  onEventPress,
  onFreeSlicePress,
  onRingPress,
  selectingTimeStart,
  size,
  style,
  windowStartMinutes,
  windowEndMinutes,
  segmentTitle,
  onSectorChange,
}: RoutineClockChartProps) {
  const isWindowMode =
    windowStartMinutes != null &&
    windowEndMinutes != null &&
    windowEndMinutes > windowStartMinutes;
  const windowDuration = isWindowMode
    ? windowEndMinutes! - windowStartMinutes!
    : 1440;
  const isSemiCircle = isWindowMode && windowDuration === 360;
  const [rotationOffset, setRotationOffset] = useState(0);
  const rotationOffsetRef = useRef(0);
  const rotationStartRef = useRef(0);
  useEffect(() => {
    rotationOffsetRef.current = rotationOffset;
  }, [rotationOffset]);

  const slices = isWindowMode
    ? buildSlicesForWindow(events, windowStartMinutes!, windowEndMinutes!)
    : buildSlicesFromEvents(events);

  const cx = size / 2;
  const cy = size / 2;
  const innerR = (size / 2) * 0.12;
  const baseOuterR = (size / 2) * 0.42;
  const labelR = baseOuterR + 26;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentAngle = isWindowMode
    ? dayMinutesToWindowAngle(
        currentMinutes,
        windowStartMinutes!,
        windowEndMinutes!
      )
    : minutesToAngle(currentMinutes);
  const currentTimeInWindow =
    isWindowMode &&
    currentMinutes >= windowStartMinutes! &&
    currentMinutes < windowEndMinutes!;

  function handlePress(locationX: number, locationY: number) {
    const relX = locationX - size / 2;
    const relY = locationY - size / 2;
    let angleDeg = (Math.atan2(relY, relX) * 180) / Math.PI;
    if (isSemiCircle) {
      const displayAngle = Math.max(0, Math.min(180, angleDeg >= 0 ? angleDeg : angleDeg + 360));
      angleDeg = semiAngleToContent(displayAngle);
    }
    const slice = slices.find((s) =>
      angleInSlice(angleDeg, s.startAngle, s.endAngle)
    );
    if (slice?.event) {
      onEventPress(slice.event);
    } else if (slice?.isFree) {
      if (onRingPress) {
        onRingPress(angleDeg);
      } else {
        let startM: number;
        let endM: number;
        if (isWindowMode) {
          const angleFromTop = ((angleDeg + 90 + 360) % 360) / 360;
          const minuteInWindow = angleFromTop * windowDuration;
          startM = windowStartMinutes! + minuteInWindow;
          startM = Math.max(
            windowStartMinutes!,
            Math.min(windowEndMinutes! - 15, Math.floor(startM / 15) * 15)
          );
          const durationM = Math.max(15, Math.round((windowEndMinutes! - startM) / 15) * 15);
          endM = Math.min(windowEndMinutes!, startM + durationM);
        } else {
          startM = Math.max(0, ((slice.startAngle + 90) / 360) * 1440);
          endM = Math.min(1439, ((slice.endAngle + 90) / 360) * 1440);
          const durationM = Math.max(15, Math.round((endM - startM) / 15) * 15);
          endM = Math.min(1439, startM + durationM);
        }
        const sh = Math.min(23, Math.floor(startM / 60));
        const sm = (Math.round((startM % 60) / 15) * 15) % 60;
        const eh = Math.min(23, Math.floor(endM / 60));
        const em = Math.round((endM % 60) / 15) * 15;
        const emFinal = Math.min(59, em);
        const startTime = `${sh.toString().padStart(2, '0')}:${sm.toString().padStart(2, '0')}`;
        const endTime = `${eh.toString().padStart(2, '0')}:${emFinal.toString().padStart(2, '0')}`;
        onFreeSlicePress(startTime, endTime);
      }
    }
  }

  const maxOuterR = baseOuterR * 1.1;

  const toDisplayAngle = useCallback(
    (contentAngle: number) =>
      isSemiCircle ? contentAngleToSemi(contentAngle) : contentAngle,
    [isSemiCircle]
  );

  const semicircleClipPath = isSemiCircle
    ? `M ${cx + maxOuterR} ${cy} A ${maxOuterR} ${maxOuterR} 0 0 1 ${cx - maxOuterR} ${cy} L ${cx} ${cy} Z`
    : null;

  const panGesture = isSemiCircle
    ? Gesture.Pan()
        .onStart(() => {
          rotationStartRef.current = rotationOffsetRef.current;
        })
        .onUpdate((e) => {
          const degPerPx = 0.35;
          const next = rotationStartRef.current + e.translationX * degPerPx;
          setRotationOffset(Math.max(-180, Math.min(180, next)));
        })
        .onEnd(() => {
          const snapStep = 30;
          setRotationOffset((prev) => {
            const snapped = Math.round(prev / snapStep) * snapStep;
            const clamped = Math.max(-180, Math.min(180, snapped));
            if (onSectorChange && clamped <= -90) onSectorChange(1);
            if (onSectorChange && clamped >= 90) onSectorChange(-1);
            return clamped;
          });
        })
    : null;

  const content = (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} pointerEvents="none">
        {isSemiCircle && (
          <Defs>
            <ClipPath id={SEMICIRCLE_CLIP_ID}>
              <Path d={semicircleClipPath!} />
            </ClipPath>
          </Defs>
        )}
        <G
          clipPath={isSemiCircle ? `url(#${SEMICIRCLE_CLIP_ID})` : undefined}
          transform={isSemiCircle ? `rotate(${rotationOffset} ${cx} ${cy})` : undefined}
        >
          {/* Chronodex: pie segments from center with staggered outer radii */}
          <G>
            {slices.map((slice, i) => {
              const sliceOuterR =
                baseOuterR * (slice.outerRadiusMultiplier ?? 1);
              const startAng = toDisplayAngle(slice.startAngle);
              const endAng = toDisplayAngle(slice.endAngle);
              const pathD = describePieArc(
                cx,
                cy,
                sliceOuterR,
                startAng,
                endAng
              );
              return (
                <Path
                  key={i}
                  d={pathD}
                  fill={slice.color}
                  stroke={CHRONODEX_STROKE}
                  strokeWidth={CHRONODEX_STROKE_WIDTH}
                />
              );
            })}
          </G>

          {/* Small center circle (Chronodex center) */}
          <Circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill={theme.white}
            stroke={CHRONODEX_STROKE}
            strokeWidth={CHRONODEX_STROKE_WIDTH}
          />

          {/* Outer arc: semicircle ruler edge or full circle */}
          {isSemiCircle ? (
            <Path
              d={`M ${polarToCartesian(cx, cy, maxOuterR, 0).x} ${polarToCartesian(cx, cy, maxOuterR, 0).y} A ${maxOuterR} ${maxOuterR} 0 0 1 ${polarToCartesian(cx, cy, maxOuterR, 180).x} ${polarToCartesian(cx, cy, maxOuterR, 180).y}`}
              fill="none"
              stroke={MAJOR_TICK_COLOR}
              strokeWidth={1.2}
            />
          ) : (
            <Circle
              cx={cx}
              cy={cy}
              r={maxOuterR}
              fill="none"
              stroke={CHRONODEX_STROKE}
              strokeWidth={0.8}
              opacity={0.4}
            />
          )}

          {/* Architectural scale (6h semicircle): major 100% #2C2C2C, sub 30-min 70%, 15/45 50% #8A8A8A */}
          {isSemiCircle ? (
            <>
              {Array.from({ length: 25 }, (_, i) => {
                const minuteInWindow = i * 15;
                const contentAngle = windowMinuteToAngle(minuteInWindow, 360);
                const displayAngle = contentAngleToSemi(contentAngle);
                const rad = (displayAngle * Math.PI) / 180;
                const isHour = i % 4 === 0;
                const is30 = i % 4 === 2;
                const tickHeight = isHour ? 1 : is30 ? 0.7 : 0.5;
                const r1 = maxOuterR - maxOuterR * 0.15 * tickHeight;
                const r2 = maxOuterR;
                const x1 = cx + r1 * Math.cos(rad);
                const y1 = cy + r1 * Math.sin(rad);
                const x2 = cx + r2 * Math.cos(rad);
                const y2 = cy + r2 * Math.sin(rad);
                return (
                  <Path
                    key={i}
                    d={`M ${x1} ${y1} L ${x2} ${y2}`}
                    stroke={isHour ? MAJOR_TICK_COLOR : SUB_TICK_COLOR}
                    strokeWidth={isHour ? 1.5 : 1}
                    opacity={isHour ? 1 : 0.85}
                  />
                );
              })}
              {Array.from(
                { length: 7 },
                (_, i) => Math.floor(windowStartMinutes! / 60) + i
              )
                .filter((h) => h <= Math.ceil((windowEndMinutes! - 1) / 60))
                .map((h) => {
                  const startHour = Math.floor(windowStartMinutes! / 60);
                  const minuteInWindow = (h - startHour) * 60;
                  const contentAngle = windowMinuteToAngle(minuteInWindow, 360);
                  const displayAngle = contentAngleToSemi(contentAngle);
                const rad = (displayAngle * Math.PI) / 180;
                const lx = cx + (maxOuterR + 18) * Math.cos(rad);
                const ly = cy + (maxOuterR + 18) * Math.sin(rad);
                return (
                  <SvgText
                    key={h}
                    x={lx}
                    y={ly}
                    fill={MAJOR_TICK_COLOR}
                    fontSize={13}
                    fontWeight="600"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {(h % 24).toString()}
                  </SvgText>
                );
              })}
            </>
          ) : null}
        </G>

        {!isSemiCircle && (
          <>
        {/* Minute tick marks: thin dark (Chronodex); 48 for 12h window, 24 for 6h, 96 for full day */}
        {Array.from(
          {
            length: isWindowMode
              ? (windowDuration <= 360 ? 24 : 48)
              : 96,
          },
          (_, i) => {
            const totalTicks = isWindowMode
              ? (windowDuration <= 360 ? 24 : 48)
              : 96;
            const angleDeg = (i / totalTicks) * 360 - 90;
            const angle = (angleDeg * Math.PI) / 180;
            const x1 = cx + (maxOuterR - 4) * Math.cos(angle);
            const y1 = cy + (maxOuterR - 4) * Math.sin(angle);
            const x2 = cx + maxOuterR * Math.cos(angle);
            const y2 = cy + maxOuterR * Math.sin(angle);
            return (
              <Path
                key={`min-${i}`}
                d={`M ${x1} ${y1} L ${x2} ${y2}`}
                stroke={CHRONODEX_STROKE}
                strokeWidth={0.8}
                opacity={0.5}
              />
            );
          }
        )}

        {/* Hour tick marks and labels; 7 evenly spaced for window (6h or 12h) */}
        {(isWindowMode
          ? Array.from(
              { length: 7 },
              (_, i) =>
                Math.floor(windowStartMinutes! / 60) +
                Math.round(windowDuration / 360) * i
            ).filter((h) => h <= Math.ceil((windowEndMinutes! - 1) / 60))
          : [0, 3, 6, 9, 12, 15, 18, 21]
        ).map((h) => {
          const angleDeg = isWindowMode
            ? dayMinutesToWindowAngle(h * 60, windowStartMinutes!, windowEndMinutes!)
            : (h / 24) * 360 - 90;
          const angle = (angleDeg * Math.PI) / 180;
          const x1 = cx + (maxOuterR - 6) * Math.cos(angle);
          const y1 = cy + (maxOuterR - 6) * Math.sin(angle);
          const x2 = cx + maxOuterR * Math.cos(angle);
          const y2 = cy + maxOuterR * Math.sin(angle);
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);
          return (
            <G key={h}>
              <Path
                d={`M ${x1} ${y1} L ${x2} ${y2}`}
                stroke={CHRONODEX_STROKE}
                strokeWidth={CHRONODEX_STROKE_WIDTH}
                opacity={0.8}
              />
              <SvgText
                x={lx}
                y={ly}
                fill={CHRONODEX_STROKE}
                fontSize={12}
                fontWeight="500"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {(h % 24).toString()}
              </SvgText>
            </G>
          );
        })}
          </>
        )}

        {/* Chronodex: labels inside segments, rotated to match segment angle */}
        {slices.map((slice, i) => {
          if (!slice.event) return null;
          const sliceOuterR =
            baseOuterR * (slice.outerRadiusMultiplier ?? 1);
          const midAngleContent = (slice.startAngle + slice.endAngle) / 2;
          const midAngle = toDisplayAngle(midAngleContent);
          const labelRadius = sliceOuterR * 0.52;
          const lx = cx + labelRadius * Math.cos((midAngle * Math.PI) / 180);
          const ly = cy + labelRadius * Math.sin((midAngle * Math.PI) / 180);
          const rotation = midAngle + 90;
          const title =
            slice.event.title.length > 14
              ? `${slice.event.title.slice(0, 12)}…`
              : slice.event.title;
          return (
            <G
              key={`label-${i}`}
              transform={`rotate(${rotation} ${lx} ${ly})`}
            >
              <SvgText
                x={lx}
                y={ly}
                fill={CHRONODEX_STROKE}
                fontSize={10}
                fontWeight="500"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {title}
              </SvgText>
            </G>
          );
        })}

        {/* Current time indicator (when viewing today and time is in this window) */}
        {isToday && (isWindowMode ? currentTimeInWindow : true) && (
          <G>
            <Path
              d={`M ${cx} ${cy} L ${polarToCartesian(cx, cy, maxOuterR, toDisplayAngle(currentAngle)).x} ${polarToCartesian(cx, cy, maxOuterR, toDisplayAngle(currentAngle)).y}`}
              stroke={theme.appBarNotificationBadge}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Circle
              cx={polarToCartesian(cx, cy, maxOuterR, toDisplayAngle(currentAngle)).x}
              cy={polarToCartesian(cx, cy, maxOuterR, toDisplayAngle(currentAngle)).y}
              r={3}
              fill={CHRONODEX_STROKE}
            />
            <SvgText
              x={polarToCartesian(cx, cy, innerR * 1.2, toDisplayAngle(currentAngle)).x}
              y={polarToCartesian(cx, cy, innerR * 1.2, toDisplayAngle(currentAngle)).y}
              fill={theme.appBarNotificationBadge}
              fontSize={12}
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`}
            </SvgText>
          </G>
        )}
      </Svg>
      {segmentTitle ? (
        <View style={[styles.titleOverlay, { width: size, height: size }]} pointerEvents="none">
          <View style={styles.titleInner}>
            <Text style={styles.segmentTitle} numberOfLines={2}>
              {segmentTitle}
            </Text>
          </View>
        </View>
      ) : null}
      <View
        style={StyleSheet.absoluteFill}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          handlePress(locationX, locationY);
        }}
        pointerEvents="box-only"
      />
    </View>
  );

  return isSemiCircle && panGesture ? (
    <GestureDetector gesture={panGesture}>{content}</GestureDetector>
  ) : (
    content
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  titleOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInner: {
    maxWidth: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.heading,
    textAlign: 'center',
  },
});
