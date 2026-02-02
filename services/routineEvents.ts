import { format, addDays, startOfWeek } from 'date-fns';
import type { RoutineEvent } from '@/models/RoutineEvent';
import { createRoutineEvent } from '@/models/RoutineEvent';
import * as database from './database';
import { cancelReminderForEvent, scheduleReminderForEvent } from './reminderNotifications';
import { v4 as uuidv4 } from 'uuid';

export async function getEventsForDate(date: Date): Promise<RoutineEvent[]> {
  const dateStr = format(date, 'yyyy-MM-dd');
  return database.getRoutineEventsByDate(dateStr);
}

export async function getEventsForWeek(weekStart: Date): Promise<RoutineEvent[]> {
  const startStr = format(weekStart, 'yyyy-MM-dd');
  const endDate = addDays(weekStart, 6);
  const endStr = format(endDate, 'yyyy-MM-dd');
  return database.getRoutineEventsByDateRange(startStr, endStr);
}

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export async function createEvent(
  date: string,
  title: string,
  startTime: string,
  endTime: string,
  icon?: string,
  color?: string,
  reminderMinutesBefore?: number
): Promise<RoutineEvent> {
  const event = createRoutineEvent({
    id: uuidv4(),
    date,
    title,
    startTime,
    endTime,
    icon,
    color,
    reminderMinutesBefore,
  });
  await database.insertRoutineEvent(event);
  if (event.reminderMinutesBefore != null) {
    scheduleReminderForEvent(event).catch(() => {});
  }
  return event;
}

export async function updateEvent(event: RoutineEvent): Promise<void> {
  await cancelReminderForEvent(event.id);
  await database.updateRoutineEvent({
    ...event,
    updatedAt: new Date().toISOString(),
  });
  if (event.reminderMinutesBefore != null) {
    scheduleReminderForEvent(event).catch(() => {});
  }
}

export async function deleteEvent(id: string): Promise<void> {
  await cancelReminderForEvent(id);
  await database.deleteRoutineEvent(id);
}

export async function toggleEventCompletion(id: string): Promise<RoutineEvent | null> {
  return database.toggleRoutineEventCompletion(id);
}
