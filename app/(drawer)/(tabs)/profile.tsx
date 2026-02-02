import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { TabScreenContainer } from '@/components/TabScreenContainer';
import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import type { Affirmation } from '@/models/types';
import { affirmationsService } from '@/services/affirmations';
import { affirmationsStyles as styles } from '@/styles/screens/affirmations.styles';

export default function AffirmationsScreen() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [dailyAffirmation, setDailyAffirmation] = useState<Affirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newText, setNewText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allAffirmations, daily] = await Promise.all([
        affirmationsService.loadAffirmations(),
        affirmationsService.getDailyAffirmation(),
      ]);
      setAffirmations(allAffirmations);
      setDailyAffirmation(daily);
    } catch (error) {
      console.error('Failed to load affirmations:', error);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  async function handleAdd() {
    if (!newText.trim()) return;

    setIsAdding(true);
    try {
      const affirmation = await affirmationsService.createAffirmation(newText.trim());
      setAffirmations((prev) => [affirmation, ...prev]);
      setNewText('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create affirmation:', error);
      Alert.alert(getLabel('common.error'), getLabel('affirmations.createError'));
    } finally {
      setIsAdding(false);
    }
  }

  async function handleTogglePin(affirmation: Affirmation) {
    try {
      const updated = await affirmationsService.togglePin(affirmation);
      setAffirmations((prev) =>
        prev.map((a) => (a.id === affirmation.id ? updated : a))
      );
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  }

  async function handleDelete(affirmation: Affirmation) {
    Alert.alert(
      getLabel('common.delete'),
      getLabel('affirmations.deleteConfirm'),
      [
        { text: getLabel('common.cancel'), style: 'cancel' },
        {
          text: getLabel('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await affirmationsService.deleteAffirmation(affirmation.id);
              setAffirmations((prev) => prev.filter((a) => a.id !== affirmation.id));
            } catch (error) {
              console.error('Failed to delete affirmation:', error);
            }
          },
        },
      ]
    );
  }

  function renderDailyCard() {
    if (!dailyAffirmation) return null;

    return (
      <View style={styles.dailyCard}>
        <Text style={styles.dailyLabel}>{getLabel('affirmations.daily')}</Text>
        <Text style={styles.dailyText}>"{dailyAffirmation.text}"</Text>
      </View>
    );
  }

  function renderAddForm() {
    if (!showAddForm) {
      return (
        <Pressable
          style={styles.addCard}
          onPress={() => setShowAddForm(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', color: theme.primary }}>
              {getLabel('affirmations.add')}
            </Text>
          </View>
        </Pressable>
      );
    }

    return (
      <View style={styles.addCard}>
        <TextInput
          style={styles.addInput}
          value={newText}
          onChangeText={setNewText}
          placeholder={getLabel('affirmations.placeholder')}
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={3}
          autoFocus
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: theme.backgroundSecondary, alignItems: 'center' }}
            onPress={() => {
              setShowAddForm(false);
              setNewText('');
            }}
          >
            <Text style={{ color: theme.text }}>{getLabel('common.cancel')}</Text>
          </Pressable>
          <Pressable
            style={[styles.addButton, { flex: 1 }, (!newText.trim() || isAdding) && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!newText.trim() || isAdding}
          >
            <Text style={styles.addButtonText}>
              {isAdding ? getLabel('common.loading') : getLabel('common.add')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderAffirmation(affirmation: Affirmation) {
    return (
      <View
        key={affirmation.id}
        style={[
          styles.affirmationCard,
          affirmation.isPinned && styles.affirmationCardPinned,
        ]}
      >
        <View style={styles.affirmationHeader}>
          <Text style={styles.affirmationText}>"{affirmation.text}"</Text>
          <View style={styles.affirmationActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => handleTogglePin(affirmation)}
            >
              <Ionicons
                name={affirmation.isPinned ? 'pin' : 'pin-outline'}
                size={20}
                color={affirmation.isPinned ? theme.primary : theme.textSecondary}
              />
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => handleDelete(affirmation)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>
        {affirmation.isPinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={14} color={theme.primary} />
            <Text style={styles.pinnedText}>{getLabel('affirmations.pinned')}</Text>
          </View>
        )}
      </View>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="heart-outline"
          size={48}
          color={theme.textSecondary}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>{getLabel('affirmations.empty')}</Text>
        <Text style={styles.emptySubtitle}>
          {getLabel('affirmations.emptySubtitle')}
        </Text>
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

  const pinnedAffirmations = affirmations.filter((a) => a.isPinned);
  const otherAffirmations = affirmations.filter((a) => !a.isPinned);

  return (
    <TabScreenContainer>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.listContent}
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
          <Text style={styles.headerSubtitle}>
            {getLabel('affirmations.subtitle')}
          </Text>
        </View>

        {renderDailyCard()}
        
        {renderAddForm()}

        {affirmations.length === 0 && !showAddForm ? (
          renderEmpty()
        ) : (
          <>
            {pinnedAffirmations.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>{getLabel('affirmations.pinned')}</Text>
                {pinnedAffirmations.map(renderAffirmation)}
              </>
            )}

            {otherAffirmations.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>{getLabel('affirmations.allAffirmations')}</Text>
                {otherAffirmations.map(renderAffirmation)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </TabScreenContainer>
  );
}
