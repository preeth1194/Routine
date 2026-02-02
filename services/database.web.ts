/**
 * Web database service - localStorage-backed, no expo-sqlite
 * Used when Platform.OS === 'web' to avoid wa-sqlite.wasm errors
 */
import type { VisionBoard } from '@/models/VisionBoard';
import type { Goal } from '@/models/Goal';
import type { Habit } from '@/models/Habit';
import type { Task, ChecklistItem } from '@/models/Task';
import type { RoutineEvent } from '@/models/RoutineEvent';
import type {
  GridTile,
  VisionComponent,
  JournalEntry,
  Affirmation,
  SyncOutboxItem,
} from '@/models/types';

const STORAGE_KEY = 'visionboard_data';

const webStorage: {
  boards: VisionBoard[];
  goals: Goal[];
  habits: Habit[];
  tasks: Task[];
  gridTiles: GridTile[];
  visionComponents: VisionComponent[];
  journalEntries: JournalEntry[];
  affirmations: Affirmation[];
  routineEvents: RoutineEvent[];
  syncOutbox: SyncOutboxItem[];
} = {
  boards: [],
  goals: [],
  habits: [],
  tasks: [],
  gridTiles: [],
  visionComponents: [],
  journalEntries: [],
  affirmations: [],
  routineEvents: [],
  syncOutbox: [],
};

function saveWebStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(webStorage));
  } catch (e) {
    console.warn('Failed to save web storage:', e);
  }
}

export async function initDatabase(): Promise<void> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.assign(webStorage, parsed);
    }
  } catch (e) {
    console.warn('Failed to load web storage:', e);
  }
}

export function getDatabase(): never {
  throw new Error('Database not available on web.');
}

// BOARDS
export async function getAllBoards(): Promise<VisionBoard[]> {
  return [...webStorage.boards].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getBoardById(id: string): Promise<VisionBoard | null> {
  return webStorage.boards.find((b) => b.id === id) ?? null;
}

export async function getActiveBoard(): Promise<VisionBoard | null> {
  return webStorage.boards.find((b) => b.isActive) ?? null;
}

export async function insertBoard(board: VisionBoard): Promise<void> {
  webStorage.boards.push(board);
  saveWebStorage();
}

export async function updateBoard(board: VisionBoard): Promise<void> {
  const index = webStorage.boards.findIndex((b) => b.id === board.id);
  if (index >= 0) {
    webStorage.boards[index] = { ...board, updatedAt: new Date().toISOString() };
    saveWebStorage();
  }
}

export async function deleteBoard(id: string): Promise<void> {
  webStorage.boards = webStorage.boards.filter((b) => b.id !== id);
  webStorage.goals = webStorage.goals.filter((g) => g.boardId !== id);
  webStorage.gridTiles = webStorage.gridTiles.filter((t) => t.boardId !== id);
  webStorage.visionComponents = webStorage.visionComponents.filter((c) => c.boardId !== id);
  saveWebStorage();
}

export async function setActiveBoard(boardId: string): Promise<void> {
  webStorage.boards.forEach((b) => {
    b.isActive = b.id === boardId;
  });
  saveWebStorage();
}

// GOALS
export async function getGoalsByBoardId(boardId: string): Promise<Goal[]> {
  return webStorage.goals
    .filter((g) => g.boardId === boardId)
    .sort((a, b) => {
      if (a.gridPosition !== undefined && b.gridPosition !== undefined) {
        return a.gridPosition - b.gridPosition;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
}

export async function getGoalById(id: string): Promise<Goal | null> {
  return webStorage.goals.find((g) => g.id === id) ?? null;
}

export async function insertGoal(goal: Goal): Promise<void> {
  webStorage.goals.push(goal);
  saveWebStorage();
}

export async function updateGoal(goal: Goal): Promise<void> {
  const index = webStorage.goals.findIndex((g) => g.id === goal.id);
  if (index >= 0) {
    webStorage.goals[index] = { ...goal, updatedAt: new Date().toISOString() };
    saveWebStorage();
  }
}

export async function deleteGoal(id: string): Promise<void> {
  webStorage.goals = webStorage.goals.filter((g) => g.id !== id);
  webStorage.habits = webStorage.habits.filter((h) => h.goalId !== id);
  webStorage.tasks = webStorage.tasks.filter((t) => t.goalId !== id);
  saveWebStorage();
}

// HABITS
export async function getHabitsByGoalId(goalId: string): Promise<Habit[]> {
  return webStorage.habits.filter((h) => h.goalId === goalId);
}

export async function getHabitById(id: string): Promise<Habit | null> {
  return webStorage.habits.find((h) => h.id === id) ?? null;
}

export async function getAllHabitsForBoard(boardId: string): Promise<Habit[]> {
  const goalIds = webStorage.goals.filter((g) => g.boardId === boardId).map((g) => g.id);
  return webStorage.habits.filter((h) => goalIds.includes(h.goalId));
}

export async function insertHabit(habit: Habit): Promise<void> {
  webStorage.habits.push(habit);
  saveWebStorage();
}

export async function updateHabit(habit: Habit): Promise<void> {
  const index = webStorage.habits.findIndex((h) => h.id === habit.id);
  if (index >= 0) {
    webStorage.habits[index] = { ...habit, updatedAt: new Date().toISOString() };
    saveWebStorage();
  }
}

export async function deleteHabit(id: string): Promise<void> {
  webStorage.habits = webStorage.habits.filter((h) => h.id !== id);
  saveWebStorage();
}

// TASKS
export async function getTasksByGoalId(goalId: string): Promise<Task[]> {
  return webStorage.tasks.filter((t) => t.goalId === goalId);
}

export async function getTaskById(id: string): Promise<Task | null> {
  return webStorage.tasks.find((t) => t.id === id) ?? null;
}

export async function getAllTasksForBoard(boardId: string): Promise<Task[]> {
  const goalIds = webStorage.goals.filter((g) => g.boardId === boardId).map((g) => g.id);
  return webStorage.tasks.filter((t) => goalIds.includes(t.goalId));
}

export async function insertTask(task: Task): Promise<void> {
  webStorage.tasks.push(task);
  saveWebStorage();
}

export async function updateTask(task: Task): Promise<void> {
  const index = webStorage.tasks.findIndex((t) => t.id === task.id);
  if (index >= 0) {
    webStorage.tasks[index] = { ...task, updatedAt: new Date().toISOString() };
    saveWebStorage();
  }
}

export async function deleteTask(id: string): Promise<void> {
  webStorage.tasks = webStorage.tasks.filter((t) => t.id !== id);
  saveWebStorage();
}

// GRID TILES
export async function getGridTilesByBoardId(boardId: string): Promise<GridTile[]> {
  return webStorage.gridTiles
    .filter((t) => t.boardId === boardId)
    .sort((a, b) => a.position - b.position);
}

export async function insertGridTile(tile: GridTile): Promise<void> {
  webStorage.gridTiles.push(tile);
  saveWebStorage();
}

export async function updateGridTile(tile: GridTile): Promise<void> {
  const index = webStorage.gridTiles.findIndex((t) => t.id === tile.id);
  if (index >= 0) {
    webStorage.gridTiles[index] = tile;
    saveWebStorage();
  }
}

export async function deleteGridTile(id: string): Promise<void> {
  webStorage.gridTiles = webStorage.gridTiles.filter((t) => t.id !== id);
  saveWebStorage();
}

export async function deleteGridTilesByBoardId(boardId: string): Promise<void> {
  webStorage.gridTiles = webStorage.gridTiles.filter((t) => t.boardId !== boardId);
  saveWebStorage();
}

// VISION COMPONENTS
export async function getVisionComponentsByBoardId(boardId: string): Promise<VisionComponent[]> {
  return webStorage.visionComponents
    .filter((c) => c.boardId === boardId)
    .sort((a, b) => a.zIndex - b.zIndex);
}

export async function insertVisionComponent(component: VisionComponent): Promise<void> {
  webStorage.visionComponents.push(component);
  saveWebStorage();
}

export async function updateVisionComponent(component: VisionComponent): Promise<void> {
  const index = webStorage.visionComponents.findIndex((c) => c.id === component.id);
  if (index >= 0) {
    webStorage.visionComponents[index] = component;
    saveWebStorage();
  }
}

export async function deleteVisionComponent(id: string): Promise<void> {
  webStorage.visionComponents = webStorage.visionComponents.filter((c) => c.id !== id);
  saveWebStorage();
}

export async function deleteVisionComponentsByBoardId(boardId: string): Promise<void> {
  webStorage.visionComponents = webStorage.visionComponents.filter((c) => c.boardId !== boardId);
  saveWebStorage();
}

// JOURNAL
export async function getAllJournalEntries(): Promise<JournalEntry[]> {
  return [...webStorage.journalEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getJournalEntryByDate(date: string): Promise<JournalEntry | null> {
  return webStorage.journalEntries.find((e) => e.date === date) ?? null;
}

export async function upsertJournalEntry(entry: JournalEntry): Promise<void> {
  const index = webStorage.journalEntries.findIndex((e) => e.date === entry.date);
  if (index >= 0) {
    webStorage.journalEntries[index] = entry;
  } else {
    webStorage.journalEntries.push(entry);
  }
  saveWebStorage();
}

export async function deleteJournalEntry(id: string): Promise<void> {
  webStorage.journalEntries = webStorage.journalEntries.filter((e) => e.id !== id);
  saveWebStorage();
}

// AFFIRMATIONS
export async function getAllAffirmations(): Promise<Affirmation[]> {
  return [...webStorage.affirmations].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function insertAffirmation(affirmation: Affirmation): Promise<void> {
  webStorage.affirmations.push(affirmation);
  saveWebStorage();
}

export async function updateAffirmation(affirmation: Affirmation): Promise<void> {
  const index = webStorage.affirmations.findIndex((a) => a.id === affirmation.id);
  if (index >= 0) {
    webStorage.affirmations[index] = { ...affirmation, updatedAt: new Date().toISOString() };
    saveWebStorage();
  }
}

export async function deleteAffirmation(id: string): Promise<void> {
  webStorage.affirmations = webStorage.affirmations.filter((a) => a.id !== id);
  saveWebStorage();
}

// ROUTINE EVENTS
export async function getRoutineEventsByDate(date: string): Promise<RoutineEvent[]> {
  return webStorage.routineEvents
    .filter((e) => e.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function getRoutineEventsByDateRange(
  startDate: string,
  endDate: string
): Promise<RoutineEvent[]> {
  return webStorage.routineEvents
    .filter((e) => e.date >= startDate && e.date <= endDate)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
}

export async function insertRoutineEvent(event: RoutineEvent): Promise<void> {
  webStorage.routineEvents.push(event);
  saveWebStorage();
}

export async function updateRoutineEvent(event: RoutineEvent): Promise<void> {
  const index = webStorage.routineEvents.findIndex((e) => e.id === event.id);
  if (index >= 0) {
    webStorage.routineEvents[index] = { ...event, updatedAt: new Date().toISOString() };
    saveWebStorage();
  }
}

export async function deleteRoutineEvent(id: string): Promise<void> {
  webStorage.routineEvents = webStorage.routineEvents.filter((e) => e.id !== id);
  saveWebStorage();
}

export async function toggleRoutineEventCompletion(id: string): Promise<RoutineEvent | null> {
  const event = webStorage.routineEvents.find((e) => e.id === id);
  if (!event) return null;
  const updated: RoutineEvent = {
    ...event,
    completed: !event.completed,
    updatedAt: new Date().toISOString(),
  };
  await updateRoutineEvent(updated);
  return updated;
}

// SYNC OUTBOX
export async function getOutbox(): Promise<SyncOutboxItem[]> {
  return [...webStorage.syncOutbox].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function clearOutbox(): Promise<void> {
  webStorage.syncOutbox = [];
  saveWebStorage();
}

export async function removeFromOutbox(id: string): Promise<void> {
  webStorage.syncOutbox = webStorage.syncOutbox.filter((item) => item.id !== id);
  saveWebStorage();
}
