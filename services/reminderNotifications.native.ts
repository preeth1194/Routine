/**
 * Schedules and cancels local notifications for routine event reminders (iOS/Android).
 * Lazy-loads expo-notifications to avoid Expo Go crash on Android (push was removed in SDK 53).
 */
import { Platform } from 'react-native';

import type { RoutineEvent } from '@/models/RoutineEvent';

const ROUTINE_CHANNEL_ID = 'routine-reminders';
const REMINDER_ID_PREFIX = 'routine-reminder-';

let Notifications: typeof import('expo-notifications') | null = null;
let loadFailed = false;

function getNotifications(): typeof import('expo-notifications') | null {
  if (loadFailed) return null;
  if (Notifications) return Notifications;
  try {
    Notifications = require('expo-notifications');
    return Notifications;
  } catch {
    loadFailed = true;
    return null;
  }
}

function getReminderIdentifier(eventId: string): string {
  return `${REMINDER_ID_PREFIX}${eventId}`;
}

function getReminderDate(event: RoutineEvent): Date | null {
  const minutesBefore = event.reminderMinutesBefore;
  if (minutesBefore === undefined || minutesBefore === null) return null;

  const [y, m, d] = event.date.split('-').map(Number);
  const [startH, startM] = event.startTime.split(':').map(Number);
  const eventStart = new Date(y, m - 1, d, startH, startM, 0, 0);
  return new Date(eventStart.getTime() - minutesBefore * 60 * 1000);
}

async function ensureReady(N: typeof import('expo-notifications')): Promise<boolean> {
  try {
    const { status: existing } = await N.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await N.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return false;

    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync(ROUTINE_CHANNEL_ID, {
        name: 'Event reminders',
        importance: N.AndroidImportance.HIGH,
        sound: 'default',
      });
    }
    return true;
  } catch {
    return false;
  }
}

export async function scheduleReminderForEvent(event: RoutineEvent): Promise<void> {
  const N = getNotifications();
  if (!N) return;

  const reminderDate = getReminderDate(event);
  if (!reminderDate) return;

  const now = new Date();
  if (reminderDate.getTime() <= now.getTime()) return;

  const ready = await ensureReady(N);
  if (!ready) return;

  try {
    const identifier = getReminderIdentifier(event.id);
    await N.scheduleNotificationAsync({
      identifier,
      content: {
        title: 'Alarm',
        body: event.title,
        data: { eventId: event.id, screen: 'daily-routine' },
        sound: true,
        ...(Platform.OS === 'android' && {
          priority: N.AndroidNotificationPriority.HIGH,
        }),
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
        channelId: Platform.OS === 'android' ? ROUTINE_CHANNEL_ID : undefined,
      },
    });
  } catch (e) {
    console.warn('Failed to schedule reminder:', e);
  }
}

export async function cancelReminderForEvent(eventId: string): Promise<void> {
  const N = getNotifications();
  if (!N) return;

  try {
    await N.cancelScheduledNotificationAsync(getReminderIdentifier(eventId));
  } catch (e) {
    console.warn('Failed to cancel reminder:', e);
  }
}
