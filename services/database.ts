/**
 * SQLite database service for native (iOS/Android)
 * Web uses database.web.ts (localStorage) - never imports expo-sqlite
 */
import * as SQLite from 'expo-sqlite';
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

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('visionboard.db');
  await createTables();
  await migrateRoutineEventsReminder();
}

async function migrateRoutineEventsReminder(): Promise<void> {
  try {
    const database = getDatabase();
    await database.runAsync(
      'ALTER TABLE routine_events ADD COLUMN reminder_minutes_before INTEGER'
    );
  } catch {
    // Column already exists or table unchanged
  }
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

async function createTables(): Promise<void> {
  const database = getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      layout_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      is_active INTEGER DEFAULT 0,
      color TEXT,
      background_image_path TEXT,
      background_image_url TEXT,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      board_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      why_important TEXT,
      deadline TEXT,
      image_path TEXT,
      image_url TEXT,
      position_x REAL,
      position_y REAL,
      z_index INTEGER,
      grid_position INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      name TEXT NOT NULL,
      schedule TEXT NOT NULL,
      weekly_days TEXT,
      streak INTEGER DEFAULT 0,
      time_bound_mode TEXT,
      time_bound_duration INTEGER,
      feedback_by_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, date)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      name TEXT NOT NULL,
      due_date TEXT,
      completion_feedback_by_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      text TEXT NOT NULL,
      completed_on TEXT,
      due_date TEXT,
      feedback_by_date TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS grid_tiles (
      id TEXT PRIMARY KEY,
      board_id TEXT NOT NULL,
      goal_id TEXT,
      position INTEGER NOT NULL,
      image_path TEXT,
      image_url TEXT,
      text TEXT,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS vision_components (
      id TEXT PRIMARY KEY,
      board_id TEXT NOT NULL,
      goal_id TEXT,
      type TEXT NOT NULL,
      position_x REAL NOT NULL,
      position_y REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      z_index INTEGER DEFAULT 0,
      image_path TEXT,
      image_url TEXT,
      text TEXT,
      color TEXT,
      rotation REAL DEFAULT 0,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      mood INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS affirmations (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_outbox (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      action TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS routine_events (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_goals_board_id ON goals(board_id);
    CREATE INDEX IF NOT EXISTS idx_habits_goal_id ON habits(goal_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
    CREATE INDEX IF NOT EXISTS idx_checklist_items_task_id ON checklist_items(task_id);
    CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
    CREATE INDEX IF NOT EXISTS idx_grid_tiles_board_id ON grid_tiles(board_id);
    CREATE INDEX IF NOT EXISTS idx_vision_components_board_id ON vision_components(board_id);
    CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
    CREATE INDEX IF NOT EXISTS idx_routine_events_date ON routine_events(date);
  `);
}

// BOARDS
export async function getAllBoards(): Promise<VisionBoard[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM boards ORDER BY created_at DESC');
  return rows.map(rowToBoard);
}

export async function getBoardById(id: string): Promise<VisionBoard | null> {
  const database = getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM boards WHERE id = ?', [id]);
  return row ? rowToBoard(row) : null;
}

export async function getActiveBoard(): Promise<VisionBoard | null> {
  const database = getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM boards WHERE is_active = 1');
  return row ? rowToBoard(row) : null;
}

export async function insertBoard(board: VisionBoard): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `INSERT INTO boards (id, name, layout_type, created_at, updated_at, is_active, color, background_image_path, background_image_url, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      board.id,
      board.name,
      board.layoutType,
      board.createdAt,
      board.updatedAt ?? null,
      board.isActive ? 1 : 0,
      board.color ?? null,
      board.backgroundImagePath ?? null,
      board.backgroundImageUrl ?? null,
      board.syncedAt ?? null,
    ]
  );
  await addToOutbox('board', 'create', board);
}

export async function updateBoard(board: VisionBoard): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `UPDATE boards SET name = ?, layout_type = ?, updated_at = ?, is_active = ?, color = ?,
     background_image_path = ?, background_image_url = ?, synced_at = ? WHERE id = ?`,
    [
      board.name,
      board.layoutType,
      new Date().toISOString(),
      board.isActive ? 1 : 0,
      board.color ?? null,
      board.backgroundImagePath ?? null,
      board.backgroundImageUrl ?? null,
      board.syncedAt ?? null,
      board.id,
    ]
  );
  await addToOutbox('board', 'update', board);
}

export async function deleteBoard(id: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM boards WHERE id = ?', [id]);
  await addToOutbox('board', 'delete', { id });
}

export async function setActiveBoard(boardId: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('UPDATE boards SET is_active = 0');
  await database.runAsync('UPDATE boards SET is_active = 1 WHERE id = ?', [boardId]);
}

function rowToBoard(row: any): VisionBoard {
  return {
    id: row.id,
    name: row.name,
    layoutType: row.layout_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isActive: row.is_active === 1,
    color: row.color,
    backgroundImagePath: row.background_image_path,
    backgroundImageUrl: row.background_image_url,
    syncedAt: row.synced_at,
  };
}

// GOALS
export async function getGoalsByBoardId(boardId: string): Promise<Goal[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM goals WHERE board_id = ? ORDER BY grid_position, z_index, created_at',
    [boardId]
  );
  return rows.map(rowToGoal);
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const database = getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM goals WHERE id = ?', [id]);
  return row ? rowToGoal(row) : null;
}

export async function insertGoal(goal: Goal): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `INSERT INTO goals (id, board_id, name, category, why_important, deadline, image_path, image_url,
     position_x, position_y, z_index, grid_position, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      goal.id,
      goal.boardId,
      goal.name,
      goal.category ?? null,
      goal.whyImportant ?? null,
      goal.deadline ?? null,
      goal.imagePath ?? null,
      goal.imageUrl ?? null,
      goal.position?.x ?? null,
      goal.position?.y ?? null,
      goal.zIndex ?? null,
      goal.gridPosition ?? null,
      goal.createdAt,
      goal.updatedAt ?? null,
    ]
  );
  await addToOutbox('goal', 'create', goal);
}

export async function updateGoal(goal: Goal): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `UPDATE goals SET name = ?, category = ?, why_important = ?, deadline = ?, image_path = ?,
     image_url = ?, position_x = ?, position_y = ?, z_index = ?, grid_position = ?, updated_at = ?
     WHERE id = ?`,
    [
      goal.name,
      goal.category ?? null,
      goal.whyImportant ?? null,
      goal.deadline ?? null,
      goal.imagePath ?? null,
      goal.imageUrl ?? null,
      goal.position?.x ?? null,
      goal.position?.y ?? null,
      goal.zIndex ?? null,
      goal.gridPosition ?? null,
      new Date().toISOString(),
      goal.id,
    ]
  );
  await addToOutbox('goal', 'update', goal);
}

export async function deleteGoal(id: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM goals WHERE id = ?', [id]);
  await addToOutbox('goal', 'delete', { id });
}

function rowToGoal(row: any): Goal {
  return {
    id: row.id,
    boardId: row.board_id,
    name: row.name,
    category: row.category,
    whyImportant: row.why_important,
    deadline: row.deadline,
    imagePath: row.image_path,
    imageUrl: row.image_url,
    position: row.position_x != null ? { x: row.position_x, y: row.position_y } : undefined,
    zIndex: row.z_index,
    gridPosition: row.grid_position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// HABITS
export async function getHabitsByGoalId(goalId: string): Promise<Habit[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM habits WHERE goal_id = ? ORDER BY created_at',
    [goalId]
  );
  const habits: Habit[] = [];
  for (const row of rows as any[]) {
    const completions = await database.getAllAsync(
      'SELECT date FROM habit_completions WHERE habit_id = ?',
      [row.id]
    );
    habits.push(rowToHabit(row, completions.map((c: any) => c.date)));
  }
  return habits;
}

export async function getHabitById(id: string): Promise<Habit | null> {
  const database = getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM habits WHERE id = ?', [id]);
  if (!row) return null;
  const completions = await database.getAllAsync(
    'SELECT date FROM habit_completions WHERE habit_id = ?',
    [id]
  );
  return rowToHabit(row, completions.map((c: any) => c.date));
}

export async function getAllHabitsForBoard(boardId: string): Promise<Habit[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync(
    `SELECT h.* FROM habits h INNER JOIN goals g ON h.goal_id = g.id WHERE g.board_id = ? ORDER BY h.created_at`,
    [boardId]
  );
  const habits: Habit[] = [];
  for (const row of rows as any[]) {
    const completions = await database.getAllAsync(
      'SELECT date FROM habit_completions WHERE habit_id = ?',
      [row.id]
    );
    habits.push(rowToHabit(row, completions.map((c: any) => c.date)));
  }
  return habits;
}

export async function insertHabit(habit: Habit): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `INSERT INTO habits (id, goal_id, name, schedule, weekly_days, streak, time_bound_mode,
     time_bound_duration, feedback_by_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      habit.id,
      habit.goalId,
      habit.name,
      habit.schedule,
      habit.weeklyDays ? JSON.stringify(habit.weeklyDays) : null,
      habit.streak,
      habit.timeBound?.mode ?? null,
      habit.timeBound?.duration ?? null,
      habit.feedbackByDate ? JSON.stringify(habit.feedbackByDate) : null,
      habit.createdAt,
      habit.updatedAt ?? null,
    ]
  );
  for (const date of habit.completionDates) {
    await database.runAsync(
      'INSERT OR IGNORE INTO habit_completions (id, habit_id, date) VALUES (?, ?, ?)',
      [`${habit.id}_${date}`, habit.id, date]
    );
  }
  await addToOutbox('habit', 'create', habit);
}

export async function updateHabit(habit: Habit): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `UPDATE habits SET name = ?, schedule = ?, weekly_days = ?, streak = ?, time_bound_mode = ?,
     time_bound_duration = ?, feedback_by_date = ?, updated_at = ? WHERE id = ?`,
    [
      habit.name,
      habit.schedule,
      habit.weeklyDays ? JSON.stringify(habit.weeklyDays) : null,
      habit.streak,
      habit.timeBound?.mode ?? null,
      habit.timeBound?.duration ?? null,
      habit.feedbackByDate ? JSON.stringify(habit.feedbackByDate) : null,
      new Date().toISOString(),
      habit.id,
    ]
  );
  await database.runAsync('DELETE FROM habit_completions WHERE habit_id = ?', [habit.id]);
  for (const date of habit.completionDates) {
    await database.runAsync(
      'INSERT INTO habit_completions (id, habit_id, date) VALUES (?, ?, ?)',
      [`${habit.id}_${date}`, habit.id, date]
    );
  }
  await addToOutbox('habit', 'update', habit);
}

export async function deleteHabit(id: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM habits WHERE id = ?', [id]);
  await addToOutbox('habit', 'delete', { id });
}

function rowToHabit(row: any, completionDates: string[]): Habit {
  return {
    id: row.id,
    goalId: row.goal_id,
    name: row.name,
    schedule: row.schedule,
    weeklyDays: row.weekly_days ? JSON.parse(row.weekly_days) : undefined,
    completionDates,
    streak: row.streak,
    timeBound: row.time_bound_mode
      ? { mode: row.time_bound_mode, duration: row.time_bound_duration }
      : undefined,
    feedbackByDate: row.feedback_by_date ? JSON.parse(row.feedback_by_date) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// TASKS
export async function getTasksByGoalId(goalId: string): Promise<Task[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM tasks WHERE goal_id = ? ORDER BY created_at',
    [goalId]
  );
  const tasks: Task[] = [];
  for (const row of rows as any[]) {
    const checklistItems = await getChecklistItemsByTaskId(row.id);
    tasks.push(rowToTask(row, checklistItems));
  }
  return tasks;
}

export async function getTaskById(id: string): Promise<Task | null> {
  const database = getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM tasks WHERE id = ?', [id]);
  if (!row) return null;
  const checklistItems = await getChecklistItemsByTaskId(id);
  return rowToTask(row, checklistItems);
}

export async function getAllTasksForBoard(boardId: string): Promise<Task[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync(
    `SELECT t.* FROM tasks t INNER JOIN goals g ON t.goal_id = g.id WHERE g.board_id = ? ORDER BY t.created_at`,
    [boardId]
  );
  const tasks: Task[] = [];
  for (const row of rows as any[]) {
    const checklistItems = await getChecklistItemsByTaskId(row.id);
    tasks.push(rowToTask(row, checklistItems));
  }
  return tasks;
}

export async function insertTask(task: Task): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `INSERT INTO tasks (id, goal_id, name, due_date, completion_feedback_by_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.goalId,
      task.name,
      task.dueDate ?? null,
      task.completionFeedbackByDate ? JSON.stringify(task.completionFeedbackByDate) : null,
      task.createdAt,
      task.updatedAt ?? null,
    ]
  );
  for (let i = 0; i < task.checklist.length; i++) {
    await insertChecklistItem(task.id, task.checklist[i], i);
  }
  await addToOutbox('task', 'create', task);
}

export async function updateTask(task: Task): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `UPDATE tasks SET name = ?, due_date = ?, completion_feedback_by_date = ?, updated_at = ?
     WHERE id = ?`,
    [
      task.name,
      task.dueDate ?? null,
      task.completionFeedbackByDate ? JSON.stringify(task.completionFeedbackByDate) : null,
      new Date().toISOString(),
      task.id,
    ]
  );
  await database.runAsync('DELETE FROM checklist_items WHERE task_id = ?', [task.id]);
  for (let i = 0; i < task.checklist.length; i++) {
    await insertChecklistItem(task.id, task.checklist[i], i);
  }
  await addToOutbox('task', 'update', task);
}

export async function deleteTask(id: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  await addToOutbox('task', 'delete', { id });
}

async function getChecklistItemsByTaskId(taskId: string): Promise<ChecklistItem[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM checklist_items WHERE task_id = ? ORDER BY sort_order',
    [taskId]
  );
  return rows.map(rowToChecklistItem);
}

async function insertChecklistItem(
  taskId: string,
  item: ChecklistItem,
  sortOrder: number
): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `INSERT INTO checklist_items (id, task_id, text, completed_on, due_date, feedback_by_date, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      taskId,
      item.text,
      item.completedOn ?? null,
      item.dueDate ?? null,
      item.feedbackByDate ? JSON.stringify(item.feedbackByDate) : null,
      sortOrder,
    ]
  );
}

function rowToTask(row: any, checklist: ChecklistItem[]): Task {
  return {
    id: row.id,
    goalId: row.goal_id,
    name: row.name,
    checklist,
    dueDate: row.due_date,
    completionFeedbackByDate: row.completion_feedback_by_date
      ? JSON.parse(row.completion_feedback_by_date)
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToChecklistItem(row: any): ChecklistItem {
  return {
    id: row.id,
    text: row.text,
    completedOn: row.completed_on,
    dueDate: row.due_date,
    feedbackByDate: row.feedback_by_date ? JSON.parse(row.feedback_by_date) : undefined,
  };
}

// GRID TILES
export async function getGridTilesByBoardId(boardId: string): Promise<GridTile[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM grid_tiles WHERE board_id = ? ORDER BY position',
    [boardId]
  );
  return rows.map(rowToGridTile);
}

export async function insertGridTile(tile: GridTile): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `INSERT INTO grid_tiles (id, board_id, goal_id, position, image_path, image_url, text)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      tile.id,
      tile.boardId,
      tile.goalId ?? null,
      tile.position,
      tile.imagePath ?? null,
      tile.imageUrl ?? null,
      tile.text ?? null,
    ]
  );
}

export async function updateGridTile(tile: GridTile): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    'UPDATE grid_tiles SET goal_id = ?, position = ?, image_path = ?, image_url = ?, text = ? WHERE id = ?',
    [
      tile.goalId ?? null,
      tile.position,
      tile.imagePath ?? null,
      tile.imageUrl ?? null,
      tile.text ?? null,
      tile.id,
    ]
  );
}

export async function deleteGridTile(id: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM grid_tiles WHERE id = ?', [id]);
}

export async function deleteGridTilesByBoardId(boardId: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM grid_tiles WHERE board_id = ?', [boardId]);
}

function rowToGridTile(row: any): GridTile {
  return {
    id: row.id,
    boardId: row.board_id,
    goalId: row.goal_id,
    position: row.position,
    imagePath: row.image_path,
    imageUrl: row.image_url,
    text: row.text,
  };
}

// VISION COMPONENTS
export async function getVisionComponentsByBoardId(boardId: string): Promise<VisionComponent[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM vision_components WHERE board_id = ? ORDER BY z_index',
    [boardId]
  );
  return rows.map(rowToVisionComponent);
}

export async function insertVisionComponent(component: VisionComponent): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `INSERT INTO vision_components (id, board_id, goal_id, type, position_x, position_y, width, height,
     z_index, image_path, image_url, text, color, rotation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      component.id,
      component.boardId,
      component.goalId ?? null,
      component.type,
      component.position.x,
      component.position.y,
      component.size.width,
      component.size.height,
      component.zIndex,
      component.imagePath ?? null,
      component.imageUrl ?? null,
      component.text ?? null,
      component.color ?? null,
      component.rotation ?? 0,
    ]
  );
}

export async function updateVisionComponent(component: VisionComponent): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `UPDATE vision_components SET goal_id = ?, type = ?, position_x = ?, position_y = ?,
     width = ?, height = ?, z_index = ?, image_path = ?, image_url = ?, text = ?, color = ?, rotation = ?
     WHERE id = ?`,
    [
      component.goalId ?? null,
      component.type,
      component.position.x,
      component.position.y,
      component.size.width,
      component.size.height,
      component.zIndex,
      component.imagePath ?? null,
      component.imageUrl ?? null,
      component.text ?? null,
      component.color ?? null,
      component.rotation ?? 0,
      component.id,
    ]
  );
}

export async function deleteVisionComponent(id: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM vision_components WHERE id = ?', [id]);
}

export async function deleteVisionComponentsByBoardId(boardId: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM vision_components WHERE board_id = ?', [boardId]);
}

function rowToVisionComponent(row: any): VisionComponent {
  return {
    id: row.id,
    boardId: row.board_id,
    goalId: row.goal_id,
    type: row.type,
    position: { x: row.position_x, y: row.position_y },
    size: { width: row.width, height: row.height },
    zIndex: row.z_index,
    imagePath: row.image_path,
    imageUrl: row.image_url,
    text: row.text,
    color: row.color,
    rotation: row.rotation,
  };
}

// JOURNAL
export async function getAllJournalEntries(): Promise<JournalEntry[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM journal_entries ORDER BY date DESC');
  return rows.map(rowToJournalEntry);
}

export async function getJournalEntryByDate(date: string): Promise<JournalEntry | null> {
  const database = getDatabase();
  const row = await database.getFirstAsync(
    'SELECT * FROM journal_entries WHERE date = ?',
    [date]
  );
  return row ? rowToJournalEntry(row) : null;
}

export async function upsertJournalEntry(entry: JournalEntry): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `INSERT INTO journal_entries (id, date, content, mood, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET content = ?, mood = ?, updated_at = ?`,
    [
      entry.id,
      entry.date,
      entry.content,
      entry.mood ?? null,
      entry.createdAt,
      entry.updatedAt,
      entry.content,
      entry.mood ?? null,
      entry.updatedAt,
    ]
  );
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM journal_entries WHERE id = ?', [id]);
}

function rowToJournalEntry(row: any): JournalEntry {
  return {
    id: row.id,
    date: row.date,
    content: row.content,
    mood: row.mood,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// AFFIRMATIONS
export async function getAllAffirmations(): Promise<Affirmation[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM affirmations ORDER BY is_pinned DESC, created_at DESC'
  );
  return rows.map(rowToAffirmation);
}

export async function insertAffirmation(affirmation: Affirmation): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    'INSERT INTO affirmations (id, text, is_pinned, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [
      affirmation.id,
      affirmation.text,
      affirmation.isPinned ? 1 : 0,
      affirmation.createdAt,
      affirmation.updatedAt,
    ]
  );
}

export async function updateAffirmation(affirmation: Affirmation): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    'UPDATE affirmations SET text = ?, is_pinned = ?, updated_at = ? WHERE id = ?',
    [
      affirmation.text,
      affirmation.isPinned ? 1 : 0,
      new Date().toISOString(),
      affirmation.id,
    ]
  );
}

export async function deleteAffirmation(id: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM affirmations WHERE id = ?', [id]);
}

function rowToAffirmation(row: any): Affirmation {
  return {
    id: row.id,
    text: row.text,
    isPinned: row.is_pinned === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ROUTINE EVENTS
export async function getRoutineEventsByDate(date: string): Promise<RoutineEvent[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM routine_events WHERE date = ? ORDER BY start_time ASC',
    [date]
  );
  return rows.map(rowToRoutineEvent);
}

export async function getRoutineEventsByDateRange(
  startDate: string,
  endDate: string
): Promise<RoutineEvent[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM routine_events WHERE date >= ? AND date <= ? ORDER BY date ASC, start_time ASC',
    [startDate, endDate]
  );
  return rows.map(rowToRoutineEvent);
}

export async function insertRoutineEvent(event: RoutineEvent): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `INSERT INTO routine_events (id, date, title, start_time, end_time, icon, color, reminder_minutes_before, completed, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.id,
      event.date,
      event.title,
      event.startTime,
      event.endTime,
      event.icon ?? null,
      event.color ?? null,
      event.reminderMinutesBefore ?? null,
      event.completed ? 1 : 0,
      event.createdAt,
      event.updatedAt ?? null,
    ]
  );
}

export async function updateRoutineEvent(event: RoutineEvent): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `UPDATE routine_events SET title = ?, start_time = ?, end_time = ?, icon = ?, color = ?, reminder_minutes_before = ?, completed = ?, updated_at = ? WHERE id = ?`,
    [
      event.title,
      event.startTime,
      event.endTime,
      event.icon ?? null,
      event.color ?? null,
      event.reminderMinutesBefore ?? null,
      event.completed ? 1 : 0,
      new Date().toISOString(),
      event.id,
    ]
  );
}

export async function deleteRoutineEvent(id: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM routine_events WHERE id = ?', [id]);
}

export async function toggleRoutineEventCompletion(id: string): Promise<RoutineEvent | null> {
  const database = getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM routine_events WHERE id = ?', [id]);
  if (!row) return null;
  const event = rowToRoutineEvent(row);
  const updated: RoutineEvent = {
    ...event,
    completed: !event.completed,
    updatedAt: new Date().toISOString(),
  };
  await updateRoutineEvent(updated);
  return updated;
}

function rowToRoutineEvent(row: any): RoutineEvent {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    startTime: row.start_time,
    endTime: row.end_time,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    reminderMinutesBefore: row.reminder_minutes_before != null ? row.reminder_minutes_before : undefined,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// SYNC OUTBOX
async function addToOutbox(
  type: SyncOutboxItem['type'],
  action: SyncOutboxItem['action'],
  data: object
): Promise<void> {
  const database = getDatabase();
  const id = `${type}_${action}_${Date.now()}`;
  await database.runAsync(
    'INSERT INTO sync_outbox (id, type, action, data, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, type, action, JSON.stringify(data as Record<string, unknown>), new Date().toISOString()]
  );
}

export async function getOutbox(): Promise<SyncOutboxItem[]> {
  const database = getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM sync_outbox ORDER BY created_at');
  return rows.map((row: any) => ({
    id: row.id,
    type: row.type,
    action: row.action,
    data: JSON.parse(row.data),
    createdAt: row.created_at,
  }));
}

export async function clearOutbox(): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM sync_outbox');
}

export async function removeFromOutbox(id: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM sync_outbox WHERE id = ?', [id]);
}
