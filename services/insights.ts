/**
 * Insights service for analytics and statistics
 */
import * as database from './database';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import type { Habit } from '@/models/Habit';
import type { Task } from '@/models/Task';
import { isChecklistItemCompleted } from '@/models/Task';

export interface InsightsData {
  // Habit stats
  totalHabits: number;
  habitsCompletedToday: number;
  currentStreak: number;
  longestStreak: number;
  weeklyCompletionRate: number;
  
  // Task stats
  totalTasks: number;
  totalChecklistItems: number;
  completedChecklistItems: number;
  taskCompletionRate: number;
  
  // Activity data for charts
  weeklyActivity: Array<{ day: string; completed: number; total: number }>;
  habitsByGoal: Array<{ goalName: string; count: number; completedToday: number }>;
}

/**
 * Insights service
 */
class InsightsService {
  /**
   * Get insights for a specific board
   */
  async getInsightsForBoard(boardId: string): Promise<InsightsData> {
    const habits = await database.getAllHabitsForBoard(boardId);
    const tasks = await database.getAllTasksForBoard(boardId);
    const goals = await database.getGoalsByBoardId(boardId);

    return this.calculateInsights(habits, tasks, goals);
  }

  /**
   * Get global insights across all boards
   */
  async getGlobalInsights(): Promise<InsightsData> {
    const boards = await database.getAllBoards();
    
    let allHabits: Habit[] = [];
    let allTasks: Task[] = [];
    let allGoals: { id: string; name: string }[] = [];

    for (const board of boards) {
      const habits = await database.getAllHabitsForBoard(board.id);
      const tasks = await database.getAllTasksForBoard(board.id);
      const goals = await database.getGoalsByBoardId(board.id);
      
      allHabits = [...allHabits, ...habits];
      allTasks = [...allTasks, ...tasks];
      allGoals = [...allGoals, ...goals.map((g) => ({ id: g.id, name: g.name }))];
    }

    return this.calculateInsights(allHabits, allTasks, allGoals);
  }

  private calculateInsights(
    habits: Habit[],
    tasks: Task[],
    goals: { id: string; name: string }[]
  ): InsightsData {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Habit stats
    const totalHabits = habits.length;
    const habitsCompletedToday = habits.filter((h) =>
      h.completionDates.includes(today)
    ).length;

    const currentStreak = this.calculateCurrentStreak(habits);
    const longestStreak = Math.max(0, ...habits.map((h) => h.streak));

    // Weekly completion rate
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const daysThisWeek = eachDayOfInterval({ start: weekStart, end: new Date() });
    
    let weeklyCompleted = 0;
    let weeklyTotal = 0;
    
    for (const day of daysThisWeek) {
      const dateStr = format(day, 'yyyy-MM-dd');
      for (const habit of habits) {
        // Check if habit was scheduled on this day
        if (habit.schedule === 'daily' || 
            (habit.weeklyDays && habit.weeklyDays.includes(day.getDay()))) {
          weeklyTotal++;
          if (habit.completionDates.includes(dateStr)) {
            weeklyCompleted++;
          }
        }
      }
    }
    
    const weeklyCompletionRate = weeklyTotal > 0 
      ? Math.round((weeklyCompleted / weeklyTotal) * 100) 
      : 0;

    // Task stats
    const totalTasks = tasks.length;
    const totalChecklistItems = tasks.reduce(
      (sum, t) => sum + t.checklist.length,
      0
    );
    const completedChecklistItems = tasks.reduce(
      (sum, t) => sum + t.checklist.filter(isChecklistItemCompleted).length,
      0
    );
    const taskCompletionRate = totalChecklistItems > 0
      ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
      : 0;

    // Weekly activity chart data
    const weeklyActivity = this.getWeeklyActivity(habits);

    // Habits by goal
    const habitsByGoal = goals.map((goal) => {
      const goalHabits = habits.filter((h) => h.goalId === goal.id);
      const completedToday = goalHabits.filter((h) =>
        h.completionDates.includes(today)
      ).length;
      return {
        goalName: goal.name,
        count: goalHabits.length,
        completedToday,
      };
    }).filter((g) => g.count > 0);

    return {
      totalHabits,
      habitsCompletedToday,
      currentStreak,
      longestStreak,
      weeklyCompletionRate,
      totalTasks,
      totalChecklistItems,
      completedChecklistItems,
      taskCompletionRate,
      weeklyActivity,
      habitsByGoal,
    };
  }

  private calculateCurrentStreak(habits: Habit[]): number {
    if (habits.length === 0) return 0;

    // Calculate the overall streak based on completing all scheduled habits each day
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      let allCompleted = true;
      let anyScheduled = false;

      for (const habit of habits) {
        const isScheduled = habit.schedule === 'daily' ||
          (habit.weeklyDays && habit.weeklyDays.includes(currentDate.getDay()));
        
        if (isScheduled) {
          anyScheduled = true;
          if (!habit.completionDates.includes(dateStr)) {
            allCompleted = false;
            break;
          }
        }
      }

      if (anyScheduled && allCompleted) {
        streak++;
      } else if (anyScheduled && !allCompleted && i > 0) {
        // Allow today to be incomplete
        break;
      }

      currentDate = subDays(currentDate, 1);
    }

    return streak;
  }

  private getWeeklyActivity(
    habits: Habit[]
  ): Array<{ day: string; completed: number; total: number }> {
    const weekStart = startOfWeek(new Date());
    const days = eachDayOfInterval({ start: weekStart, end: new Date() });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayLabel = format(day, 'EEE');
      
      let completed = 0;
      let total = 0;

      for (const habit of habits) {
        const isScheduled = habit.schedule === 'daily' ||
          (habit.weeklyDays && habit.weeklyDays.includes(day.getDay()));
        
        if (isScheduled) {
          total++;
          if (habit.completionDates.includes(dateStr)) {
            completed++;
          }
        }
      }

      return { day: dayLabel, completed, total };
    });
  }
}

// Export singleton instance
export const insightsService = new InsightsService();
