import type { HabitSchedule, TimerMode, CompletionFeedback } from './types';
import { format, isToday, parseISO, differenceInDays, startOfDay } from 'date-fns';

/**
 * Time-bound specification for habits
 */
export interface HabitTimeBoundSpec {
  mode: TimerMode;
  duration: number; // minutes for 'time', song count for 'song'
}

/**
 * Habit model
 * Represents a habit attached to a goal
 */
export interface Habit {
  id: string;
  goalId: string;
  name: string;
  schedule: HabitSchedule;
  weeklyDays?: number[]; // 0-6 (Sunday-Saturday) for weekly habits
  completionDates: string[]; // YYYY-MM-DD
  streak: number;
  timeBound?: HabitTimeBoundSpec;
  feedbackByDate?: Record<string, CompletionFeedback>;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Create a new Habit with defaults
 */
export function createHabit(
  params: Pick<Habit, 'id' | 'goalId' | 'name'> & Partial<Habit>
): Habit {
  return {
    schedule: 'daily',
    completionDates: [],
    streak: 0,
    createdAt: new Date().toISOString(),
    ...params,
  };
}

/**
 * Check if a habit is scheduled for a given date
 */
export function isScheduledOnDate(habit: Habit, date: Date): boolean {
  if (habit.schedule === 'daily') {
    return true;
  }
  
  if (habit.schedule === 'weekly' && habit.weeklyDays) {
    const dayOfWeek = date.getDay();
    return habit.weeklyDays.includes(dayOfWeek);
  }
  
  return false;
}

/**
 * Check if a habit is completed on a given date
 */
export function isCompletedOnDate(habit: Habit, date: Date): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return habit.completionDates.includes(dateStr);
}

/**
 * Check if a habit is completed today
 */
export function isCompletedToday(habit: Habit): boolean {
  return isCompletedOnDate(habit, new Date());
}

/**
 * Get the feedback for a specific date
 */
export function getFeedbackForDate(habit: Habit, date: Date): CompletionFeedback | undefined {
  const dateStr = format(date, 'yyyy-MM-dd');
  return habit.feedbackByDate?.[dateStr];
}

/**
 * Toggle completion for a habit on a given date
 */
export function toggleCompletion(habit: Habit, date: Date): Habit {
  const dateStr = format(date, 'yyyy-MM-dd');
  const isCompleted = habit.completionDates.includes(dateStr);
  
  let newCompletionDates: string[];
  if (isCompleted) {
    // Remove completion
    newCompletionDates = habit.completionDates.filter(d => d !== dateStr);
  } else {
    // Add completion
    newCompletionDates = [...habit.completionDates, dateStr].sort();
  }
  
  return {
    ...habit,
    completionDates: newCompletionDates,
    streak: calculateStreak(newCompletionDates, habit.schedule, habit.weeklyDays),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Add feedback for a specific date
 */
export function addFeedback(habit: Habit, date: Date, feedback: CompletionFeedback): Habit {
  const dateStr = format(date, 'yyyy-MM-dd');
  return {
    ...habit,
    feedbackByDate: {
      ...habit.feedbackByDate,
      [dateStr]: feedback,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate the current streak based on completion dates
 */
export function calculateStreak(
  completionDates: string[],
  schedule: HabitSchedule,
  weeklyDays?: number[]
): number {
  if (completionDates.length === 0) return 0;
  
  const sortedDates = [...completionDates].sort().reverse();
  const today = startOfDay(new Date());
  let streak = 0;
  let currentDate = today;
  
  // Check if completed today or yesterday (to maintain streak)
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(new Date(today.getTime() - 86400000), 'yyyy-MM-dd');
  
  if (!sortedDates.includes(todayStr) && !sortedDates.includes(yesterdayStr)) {
    return 0;
  }
  
  // Count consecutive days
  for (let i = 0; i < 365; i++) { // Max 365 days
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Check if this day is scheduled
    const isScheduled = schedule === 'daily' || 
      (weeklyDays && weeklyDays.includes(currentDate.getDay()));
    
    if (isScheduled) {
      if (sortedDates.includes(dateStr)) {
        streak++;
      } else if (i > 0) { // Don't break on today if not completed yet
        break;
      }
    }
    
    // Move to previous day
    currentDate = new Date(currentDate.getTime() - 86400000);
  }
  
  return streak;
}

/**
 * Check if a habit is time-bound
 */
export function isTimeBound(habit: Habit): boolean {
  return Boolean(habit.timeBound);
}

/**
 * Check if a habit is song-based
 */
export function isSongBased(habit: Habit): boolean {
  return habit.timeBound?.mode === 'song';
}
