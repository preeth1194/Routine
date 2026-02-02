import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { TabScreenContainer } from '@/components/TabScreenContainer';
import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import type { JournalEntry } from '@/models/types';
import {
  getAllJournalEntries,
  getJournalEntryByDate,
  upsertJournalEntry,
} from '@/services/database';
import { journalStyles as styles } from '@/styles/screens/journal.styles';

const MOOD_OPTIONS = [
  { value: 1, emoji: '😔' },
  { value: 2, emoji: '😕' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '😊' },
];

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Today's entry state
  const [todayContent, setTodayContent] = useState('');
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayDisplay = format(new Date(), 'EEEE, MMMM d, yyyy');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allEntries, existingToday] = await Promise.all([
        getAllJournalEntries(),
        getJournalEntryByDate(today),
      ]);

      setEntries(allEntries.filter((e) => e.date !== today));

      if (existingToday) {
        setTodayEntry(existingToday);
        setTodayContent(existingToday.content);
        setTodayMood(existingToday.mood ?? null);
      }
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  async function handleSave() {
    if (!todayContent.trim()) return;

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const entry: JournalEntry = {
        id: todayEntry?.id || uuidv4(),
        date: today,
        content: todayContent.trim(),
        mood: todayMood ?? undefined,
        createdAt: todayEntry?.createdAt || now,
        updatedAt: now,
      };

      await upsertJournalEntry(entry);
      setTodayEntry(entry);
    } catch (error) {
      console.error('Failed to save entry:', error);
    } finally {
      setIsSaving(false);
    }
  }

  function getMoodEmoji(mood: number | undefined): string {
    if (!mood) return '';
    return MOOD_OPTIONS.find((m) => m.value === mood)?.emoji || '';
  }

  function renderTodaySection() {
    return (
      <View style={styles.todaySection}>
        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>{getLabel('journal.today')}</Text>
            <Text style={styles.todayDate}>{todayDisplay}</Text>
          </View>

          <View style={styles.todayContent}>
            <TextInput
              style={styles.entryInput}
              value={todayContent}
              onChangeText={setTodayContent}
              placeholder={getLabel('journal.placeholder')}
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={6}
            />
          </View>

          <View style={styles.moodSection}>
            <Text style={styles.moodLabel}>{getLabel('journal.mood')}</Text>
            <View style={styles.moodRow}>
              {MOOD_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.moodButton,
                    todayMood === option.value && styles.moodButtonSelected,
                  ]}
                  onPress={() => setTodayMood(option.value)}
                >
                  <Text style={styles.moodEmoji}>{option.emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSaving || !todayContent.trim()}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? getLabel('common.loading') : getLabel('common.save')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderEntry({ item }: { item: JournalEntry }) {
    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryDate}>
            {format(new Date(item.date), 'EEEE, MMM d')}
          </Text>
          {item.mood && (
            <Text style={styles.entryMood}>{getMoodEmoji(item.mood)}</Text>
          )}
        </View>
        <Text style={styles.entryText} numberOfLines={4}>
          {item.content}
        </Text>
      </View>
    );
  }

  function renderPastEntries() {
    if (entries.length === 0) {
      return null;
    }

    return (
      <View style={styles.pastSection}>
        <Text style={styles.pastTitle}>Past Entries</Text>
        {entries.map((entry) => (
          <View key={entry.id}>{renderEntry({ item: entry })}</View>
        ))}
      </View>
    );
  }

  if (loading) {
    return (
      <TabScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </TabScreenContainer>
    );
  }

  return (
    <TabScreenContainer>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getLabel('journal.title')}</Text>
          <Text style={styles.headerSubtitle}>
            Reflect on your journey and track your growth
          </Text>
        </View>

        {renderTodaySection()}
        {renderPastEntries()}
      </ScrollView>
    </TabScreenContainer>
  );
}
