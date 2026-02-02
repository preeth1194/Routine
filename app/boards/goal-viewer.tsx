import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';

import { HabitItem } from '@/components/HabitItem';
import { TaskItem } from '@/components/TaskItem';
import { CompletionFeedbackSheet } from '@/components/CompletionFeedbackSheet';
import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import type { Goal } from '@/models/Goal';
import { hasImage, getImageSource } from '@/models/Goal';
import type { Habit } from '@/models/Habit';
import { createHabit, toggleCompletion, addFeedback, isCompletedToday } from '@/models/Habit';
import type { Task, ChecklistItem } from '@/models/Task';
import { createTask, createChecklistItem, toggleChecklistItemCompletion, updateChecklistItem, isTaskFullyCompleted } from '@/models/Task';
import type { CompletionFeedback, HabitSchedule } from '@/models/types';
import {
  getGoalById,
  getHabitsByGoalId,
  getTasksByGoalId,
  insertHabit,
  updateHabit,
  insertTask,
  updateTask,
} from '@/services/database';
import { goalViewerStyles as styles } from '@/styles/screens/goal-viewer.styles';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type TabType = 'habits' | 'tasks' | 'insights';

export default function GoalViewerScreen() {
  const { goalId, boardId } = useLocalSearchParams<{ goalId: string; boardId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('habits');

  // Add habit modal
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitSchedule, setNewHabitSchedule] = useState<HabitSchedule>('daily');
  const [newHabitWeeklyDays, setNewHabitWeeklyDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri

  // Add task modal
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  // Feedback modal
  const [showFeedbackSheet, setShowFeedbackSheet] = useState(false);
  const [feedbackContext, setFeedbackContext] = useState<{
    type: 'habit' | 'task' | 'checklist';
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (goalId) {
      loadGoalData();
    }
  }, [goalId]);

  async function loadGoalData() {
    try {
      const goalData = await getGoalById(goalId!);
      if (!goalData) {
        Alert.alert(getLabel('common.error'), getLabel('goals.notFound'));
        router.back();
        return;
      }
      setGoal(goalData);

      const habitsData = await getHabitsByGoalId(goalId!);
      setHabits(habitsData);

      const tasksData = await getTasksByGoalId(goalId!);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load goal:', error);
    } finally {
      setLoading(false);
    }
  }

  // Habit handlers
  async function handleHabitToggle(habit: Habit) {
    const wasCompleted = isCompletedToday(habit);
    const updatedHabit = toggleCompletion(habit, new Date());
    await updateHabit(updatedHabit);
    setHabits((prev) => prev.map((h) => (h.id === habit.id ? updatedHabit : h)));

    // Show feedback if newly completed
    if (!wasCompleted && isCompletedToday(updatedHabit)) {
      setFeedbackContext({
        type: 'habit',
        id: habit.id,
        title: habit.name,
      });
      setShowFeedbackSheet(true);
    }
  }

  async function handleAddHabit() {
    if (!newHabitName.trim()) return;

    const habit = createHabit({
      id: uuidv4(),
      goalId: goalId!,
      name: newHabitName.trim(),
      schedule: newHabitSchedule,
      weeklyDays: newHabitSchedule === 'weekly' ? newHabitWeeklyDays : undefined,
    });

    await insertHabit(habit);
    setHabits((prev) => [...prev, habit]);
    setNewHabitName('');
    setNewHabitSchedule('daily');
    setShowAddHabitModal(false);
  }

  // Task handlers
  async function handleChecklistItemToggle(task: Task, itemId: string) {
    const item = task.checklist.find((i) => i.id === itemId);
    if (!item) return;

    const wasCompleted = Boolean(item.completedOn);
    const updatedItem = toggleChecklistItemCompletion(item, new Date());
    const updatedTask = updateChecklistItem(task, updatedItem);
    
    await updateTask(updatedTask);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));

    // Show feedback if newly completed
    if (!wasCompleted && updatedItem.completedOn) {
      // Check if task is now fully complete
      if (isTaskFullyCompleted(updatedTask)) {
        // Show task-level feedback if more than 1 item
        if (task.checklist.length > 1) {
          setFeedbackContext({
            type: 'task',
            id: task.id,
            title: task.name,
          });
        } else {
          // Single item - show item feedback
          setFeedbackContext({
            type: 'checklist',
            id: itemId,
            title: item.text,
          });
        }
        setShowFeedbackSheet(true);
      } else {
        // Show item feedback
        setFeedbackContext({
          type: 'checklist',
          id: itemId,
          title: item.text,
        });
        setShowFeedbackSheet(true);
      }
    }
  }

  async function handleAddChecklistItem(task: Task) {
    Alert.prompt(
      getLabel('tasks.addChecklist'),
      '',
      async (text) => {
        if (!text?.trim()) return;
        
        const newItem = createChecklistItem({
          id: uuidv4(),
          text: text.trim(),
        });
        
        const updatedTask: Task = {
          ...task,
          checklist: [...task.checklist, newItem],
          updatedAt: new Date().toISOString(),
        };
        
        await updateTask(updatedTask);
        setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
      },
      'plain-text',
      '',
      'default'
    );
  }

  async function handleAddTask() {
    if (!newTaskName.trim()) return;

    const task = createTask({
      id: uuidv4(),
      goalId: goalId!,
      name: newTaskName.trim(),
    });

    await insertTask(task);
    setTasks((prev) => [...prev, task]);
    setNewTaskName('');
    setShowAddTaskModal(false);
  }

  // Feedback handlers
  async function handleFeedbackSave(feedback: CompletionFeedback) {
    if (!feedbackContext) return;

    if (feedbackContext.type === 'habit') {
      const habit = habits.find((h) => h.id === feedbackContext.id);
      if (habit) {
        const updatedHabit = addFeedback(habit, new Date(), feedback);
        await updateHabit(updatedHabit);
        setHabits((prev) => prev.map((h) => (h.id === habit.id ? updatedHabit : h)));
      }
    }
    // Add similar logic for tasks/checklist items

    setShowFeedbackSheet(false);
    setFeedbackContext(null);
  }

  function handleFeedbackSkip() {
    setShowFeedbackSheet(false);
    setFeedbackContext(null);
  }

  function toggleWeekDay(day: number) {
    setNewHabitWeeklyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function renderHabitsTab() {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{getLabel('habits.title')}</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => setShowAddHabitModal(true)}
            >
              <Ionicons name="add" size={20} color={theme.primary} />
              <Text style={styles.addButtonText}>{getLabel('common.add')}</Text>
            </Pressable>
          </View>

          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="repeat" size={32} color={theme.textSecondary} />
              <Text style={styles.emptyText}>{getLabel('habits.empty')}</Text>
            </View>
          ) : (
            habits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onToggle={() => handleHabitToggle(habit)}
              />
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  function renderTasksTab() {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{getLabel('tasks.title')}</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => setShowAddTaskModal(true)}
            >
              <Ionicons name="add" size={20} color={theme.primary} />
              <Text style={styles.addButtonText}>{getLabel('common.add')}</Text>
            </Pressable>
          </View>

          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkbox-outline" size={32} color={theme.textSecondary} />
              <Text style={styles.emptyText}>{getLabel('tasks.empty')}</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onChecklistItemToggle={(itemId) => handleChecklistItemToggle(task, itemId)}
                onAddChecklistItem={() => handleAddChecklistItem(task)}
              />
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  function renderInsightsTab() {
    const totalHabits = habits.length;
    const completedToday = habits.filter(isCompletedToday).length;
    const longestStreak = Math.max(0, ...habits.map((h) => h.streak));
    const totalTaskItems = tasks.reduce((sum, t) => sum + t.checklist.length, 0);
    const completedItems = tasks.reduce(
      (sum, t) => sum + t.checklist.filter((i) => i.completedOn).length,
      0
    );

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLabel('insights.overview')}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedToday}/{totalHabits}</Text>
              <Text style={styles.statLabel}>Habits Today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Longest Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedItems}/{totalTaskItems}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {totalTaskItems > 0 ? Math.round((completedItems / totalTaskItems) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  function renderAddHabitModal() {
    return (
      <Modal
        visible={showAddHabitModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddHabitModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddHabitModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{getLabel('habits.new')}</Text>

            <TextInput
              style={styles.modalInput}
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholder={getLabel('habits.namePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />

            <Text style={styles.modalLabel}>{getLabel('habits.schedule')}</Text>
            <View style={styles.scheduleRow}>
              <Pressable
                style={[
                  styles.scheduleOption,
                  newHabitSchedule === 'daily' && styles.scheduleOptionSelected,
                ]}
                onPress={() => setNewHabitSchedule('daily')}
              >
                <Text style={styles.scheduleOptionText}>{getLabel('habits.daily')}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.scheduleOption,
                  newHabitSchedule === 'weekly' && styles.scheduleOptionSelected,
                ]}
                onPress={() => setNewHabitSchedule('weekly')}
              >
                <Text style={styles.scheduleOptionText}>{getLabel('habits.weekly')}</Text>
              </Pressable>
            </View>

            {newHabitSchedule === 'weekly' && (
              <>
                <Text style={styles.modalLabel}>{getLabel('habits.selectDays')}</Text>
                <View style={styles.weekDaysRow}>
                  {DAY_LABELS.map((label, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.weekDayButton,
                        newHabitWeeklyDays.includes(index) && styles.weekDayButtonSelected,
                      ]}
                      onPress={() => toggleWeekDay(index)}
                    >
                      <Text
                        style={[
                          styles.weekDayText,
                          newHabitWeeklyDays.includes(index) && styles.weekDayTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalButtonSecondary}
                onPress={() => setShowAddHabitModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>
                  {getLabel('common.cancel')}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButtonPrimary,
                  !newHabitName.trim() && styles.modalButtonPrimaryDisabled,
                ]}
                onPress={handleAddHabit}
                disabled={!newHabitName.trim()}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {getLabel('common.add')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  function renderAddTaskModal() {
    return (
      <Modal
        visible={showAddTaskModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddTaskModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{getLabel('tasks.new')}</Text>

            <TextInput
              style={styles.modalInput}
              value={newTaskName}
              onChangeText={setNewTaskName}
              placeholder={getLabel('tasks.namePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalButtonSecondary}
                onPress={() => setShowAddTaskModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>
                  {getLabel('common.cancel')}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButtonPrimary,
                  !newTaskName.trim() && styles.modalButtonPrimaryDisabled,
                ]}
                onPress={handleAddTask}
                disabled={!newTaskName.trim()}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {getLabel('common.add')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  const imageUri = goal ? getImageSource(goal) : undefined;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {goal?.name || 'Goal'}
          </Text>
        </View>
      </View>

      {/* Goal header with image */}
      <View style={styles.goalHeader}>
        {hasImage(goal!) ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.goalImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.goalImage, styles.goalImagePlaceholder]}>
            <Ionicons name="flag" size={32} color={theme.textSecondary} />
          </View>
        )}
        <Text style={styles.goalName}>{goal?.name}</Text>
        {goal?.category && (
          <Text style={styles.goalCategory}>{goal.category}</Text>
        )}
        {goal?.whyImportant && (
          <Text style={styles.goalWhyImportant}>"{goal.whyImportant}"</Text>
        )}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'habits' && styles.tabActive]}
          onPress={() => setActiveTab('habits')}
        >
          <Text
            style={[styles.tabText, activeTab === 'habits' && styles.tabTextActive]}
          >
            {getLabel('tracker.habits')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'tasks' && styles.tabActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text
            style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}
          >
            {getLabel('tracker.tasks')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'insights' && styles.tabActive]}
          onPress={() => setActiveTab('insights')}
        >
          <Text
            style={[styles.tabText, activeTab === 'insights' && styles.tabTextActive]}
          >
            {getLabel('tracker.insights')}
          </Text>
        </Pressable>
      </View>

      {/* Tab content */}
      <View style={styles.content}>
        {activeTab === 'habits' && renderHabitsTab()}
        {activeTab === 'tasks' && renderTasksTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </View>

      {renderAddHabitModal()}
      {renderAddTaskModal()}

      <CompletionFeedbackSheet
        visible={showFeedbackSheet}
        title={getLabel('feedback.title')}
        subtitle={feedbackContext?.title}
        onSave={handleFeedbackSave}
        onSkip={handleFeedbackSkip}
        onClose={() => setShowFeedbackSheet(false)}
      />
    </View>
  );
}
