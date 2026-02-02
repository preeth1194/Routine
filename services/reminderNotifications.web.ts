/**
 * Web stub: no local notifications. Reminders are no-op on web.
 */
import type { RoutineEvent } from '@/models/RoutineEvent';

export async function scheduleReminderForEvent(_event: RoutineEvent): Promise<void> {
  // No-op on web
}

export async function cancelReminderForEvent(_eventId: string): Promise<void> {
  // No-op on web
}
