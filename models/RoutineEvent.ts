/**
 * Routine event - a time block scheduled for a specific date
 */
export interface RoutineEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  icon?: string; // Ionicons name
  color?: string; // accent for block
  /** Minutes before event start to remind (0 = at time, undefined = no reminder) */
  reminderMinutesBefore?: number;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}

export function createRoutineEvent(
  params: Pick<RoutineEvent, 'id' | 'date' | 'title' | 'startTime' | 'endTime'> &
    Partial<RoutineEvent>
): RoutineEvent {
  return {
    completed: false,
    createdAt: new Date().toISOString(),
    ...params,
  };
}
