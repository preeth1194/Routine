import type { CompletionFeedback } from './types';
import { format } from 'date-fns';

/**
 * Checklist item within a task
 */
export interface ChecklistItem {
  id: string;
  text: string;
  completedOn?: string; // YYYY-MM-DD when checked
  feedbackByDate?: Record<string, CompletionFeedback>;
  dueDate?: string; // YYYY-MM-DD
}

/**
 * Task model
 * Represents a task attached to a goal with checklist items
 */
export interface Task {
  id: string;
  goalId: string;
  name: string;
  checklist: ChecklistItem[];
  dueDate?: string; // YYYY-MM-DD
  completionFeedbackByDate?: Record<string, CompletionFeedback>;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Create a new Task with defaults
 */
export function createTask(
  params: Pick<Task, 'id' | 'goalId' | 'name'> & Partial<Task>
): Task {
  return {
    checklist: [],
    createdAt: new Date().toISOString(),
    ...params,
  };
}

/**
 * Create a new ChecklistItem with defaults
 */
export function createChecklistItem(
  params: Pick<ChecklistItem, 'id' | 'text'> & Partial<ChecklistItem>
): ChecklistItem {
  return {
    ...params,
  };
}

/**
 * Check if a checklist item is completed
 */
export function isChecklistItemCompleted(item: ChecklistItem): boolean {
  return Boolean(item.completedOn);
}

/**
 * Check if a checklist item is completed on a specific date
 */
export function isChecklistItemCompletedOnDate(item: ChecklistItem, date: Date): boolean {
  if (!item.completedOn) return false;
  return item.completedOn === format(date, 'yyyy-MM-dd');
}

/**
 * Toggle completion for a checklist item
 * Uses sentinel pattern to allow clearing completedOn
 */
export function toggleChecklistItemCompletion(
  item: ChecklistItem,
  date: Date
): ChecklistItem {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  if (item.completedOn === dateStr) {
    // Uncheck - clear completedOn
    return {
      ...item,
      completedOn: undefined,
    };
  } else {
    // Check - set completedOn
    return {
      ...item,
      completedOn: dateStr,
    };
  }
}

/**
 * Add feedback to a checklist item for a specific date
 */
export function addChecklistItemFeedback(
  item: ChecklistItem,
  date: Date,
  feedback: CompletionFeedback
): ChecklistItem {
  const dateStr = format(date, 'yyyy-MM-dd');
  return {
    ...item,
    feedbackByDate: {
      ...item.feedbackByDate,
      [dateStr]: feedback,
    },
  };
}

/**
 * Check if a task is fully completed (all checklist items checked)
 */
export function isTaskFullyCompleted(task: Task): boolean {
  if (task.checklist.length === 0) return false;
  return task.checklist.every(item => isChecklistItemCompleted(item));
}

/**
 * Get completion percentage for a task
 */
export function getTaskCompletionPercentage(task: Task): number {
  if (task.checklist.length === 0) return 0;
  const completedCount = task.checklist.filter(isChecklistItemCompleted).length;
  return Math.round((completedCount / task.checklist.length) * 100);
}

/**
 * Add a checklist item to a task
 */
export function addChecklistItem(task: Task, item: ChecklistItem): Task {
  return {
    ...task,
    checklist: [...task.checklist, item],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Remove a checklist item from a task
 */
export function removeChecklistItem(task: Task, itemId: string): Task {
  return {
    ...task,
    checklist: task.checklist.filter(item => item.id !== itemId),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update a checklist item in a task
 */
export function updateChecklistItem(task: Task, updatedItem: ChecklistItem): Task {
  return {
    ...task,
    checklist: task.checklist.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Add task-level feedback for a specific date
 */
export function addTaskFeedback(
  task: Task,
  date: Date,
  feedback: CompletionFeedback
): Task {
  const dateStr = format(date, 'yyyy-MM-dd');
  return {
    ...task,
    completionFeedbackByDate: {
      ...task.completionFeedbackByDate,
      [dateStr]: feedback,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Check if task is past its due date
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today && !isTaskFullyCompleted(task);
}
