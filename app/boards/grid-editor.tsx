import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
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

import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import type { VisionBoard } from '@/models/VisionBoard';
import type { Goal } from '@/models/Goal';
import { createGoal } from '@/models/Goal';
import type { GridTile } from '@/models/types';
import {
  getBoardById,
  updateBoard,
  getGoalsByBoardId,
  insertGoal,
  updateGoal,
  deleteGoal,
  getGridTilesByBoardId,
  insertGridTile,
  updateGridTile,
  deleteGridTile,
  getHabitsByGoalId,
  getTasksByGoalId,
} from '@/services/database';
import { gridEditorStyles as styles } from '@/styles/screens/grid-editor.styles';

export default function GridEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [board, setBoard] = useState<VisionBoard | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tiles, setTiles] = useState<GridTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [showTileOptions, setShowTileOptions] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');

  useEffect(() => {
    if (id) {
      loadBoardData();
    }
  }, [id]);

  async function loadBoardData() {
    try {
      const boardData = await getBoardById(id!);
      if (!boardData) {
        Alert.alert('Error', 'Board not found');
        router.back();
        return;
      }
      setBoard(boardData);

      const goalsData = await getGoalsByBoardId(id!);
      setGoals(goalsData);

      const tilesData = await getGridTilesByBoardId(id!);
      setTiles(tilesData);
    } catch (error) {
      console.error('Failed to load board:', error);
    } finally {
      setLoading(false);
    }
  }

  function getTileForPosition(position: number): GridTile | undefined {
    return tiles.find((t) => t.position === position);
  }

  function getGoalForTile(tile: GridTile | undefined): Goal | undefined {
    if (!tile?.goalId) return undefined;
    return goals.find((g) => g.id === tile.goalId);
  }

  async function handleTilePress(position: number) {
    setSelectedTileIndex(position);
    setShowTileOptions(true);
  }

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      await updateTileImage(selectedTileIndex!, imageUri);
    }
    setShowTileOptions(false);
  }

  async function updateTileImage(position: number, imageUri: string) {
    const existingTile = getTileForPosition(position);

    if (existingTile) {
      const updatedTile: GridTile = {
        ...existingTile,
        imagePath: imageUri,
      };
      await updateGridTile(updatedTile);
      setTiles((prev) =>
        prev.map((t) => (t.position === position ? updatedTile : t))
      );
    } else {
      const newTile: GridTile = {
        id: uuidv4(),
        boardId: id!,
        position,
        imagePath: imageUri,
      };
      await insertGridTile(newTile);
      setTiles((prev) => [...prev, newTile]);
    }
  }

  async function handleAddGoal() {
    if (!newGoalName.trim()) return;

    const goal = createGoal({
      id: uuidv4(),
      boardId: id!,
      name: newGoalName.trim(),
      gridPosition: selectedTileIndex!,
    });

    await insertGoal(goal);
    setGoals((prev) => [...prev, goal]);

    // Update or create tile with goal
    const existingTile = getTileForPosition(selectedTileIndex!);
    if (existingTile) {
      const updatedTile: GridTile = { ...existingTile, goalId: goal.id };
      await updateGridTile(updatedTile);
      setTiles((prev) =>
        prev.map((t) => (t.position === selectedTileIndex ? updatedTile : t))
      );
    } else {
      const newTile: GridTile = {
        id: uuidv4(),
        boardId: id!,
        position: selectedTileIndex!,
        goalId: goal.id,
      };
      await insertGridTile(newTile);
      setTiles((prev) => [...prev, newTile]);
    }

    setNewGoalName('');
    setShowAddGoalModal(false);
    setShowTileOptions(false);
  }

  function handleViewTracker() {
    const tile = getTileForPosition(selectedTileIndex!);
    const goal = getGoalForTile(tile);
    if (goal) {
      router.push(`/boards/goal-viewer?goalId=${goal.id}&boardId=${id}` as any);
    }
    setShowTileOptions(false);
  }

  function renderTile(position: number) {
    const tile = getTileForPosition(position);
    const goal = getGoalForTile(tile);
    const isSelected = selectedTileIndex === position;

    return (
      <Pressable
        key={position}
        style={[styles.tile, isSelected && styles.tileSelected]}
        onPress={() => handleTilePress(position)}
      >
        {tile?.imagePath || tile?.imageUrl ? (
          <>
            <Image
              source={{ uri: tile.imagePath || tile.imageUrl }}
              style={styles.tileImage}
              resizeMode="cover"
            />
            {goal && (
              <View style={styles.tileOverlay}>
                <Text style={styles.tileName} numberOfLines={1}>
                  {goal.name}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.tileEmpty}>
            <Ionicons name="add" size={32} color={theme.textSecondary} />
            <Text style={styles.tileEmptyText}>
              {position + 1}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  function renderTileOptionsSheet() {
    const tile = getTileForPosition(selectedTileIndex!);
    const goal = getGoalForTile(tile);

    return (
      <Modal
        visible={showTileOptions}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTileOptions(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          onPress={() => setShowTileOptions(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {goal ? goal.name : `Tile ${(selectedTileIndex ?? 0) + 1}`}
            </Text>

            <Pressable style={styles.sheetOption} onPress={handlePickImage}>
              <View style={styles.sheetOptionIcon}>
                <Ionicons name="image" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={styles.sheetOptionText}>
                  {tile?.imagePath ? 'Change Image' : 'Add Image'}
                </Text>
                <Text style={styles.sheetOptionSubtext}>
                  Pick from your gallery
                </Text>
              </View>
            </Pressable>

            {!goal && (
              <Pressable
                style={styles.sheetOption}
                onPress={() => {
                  setShowTileOptions(false);
                  setShowAddGoalModal(true);
                }}
              >
                <View style={styles.sheetOptionIcon}>
                  <Ionicons name="flag" size={20} color={theme.primary} />
                </View>
                <View>
                  <Text style={styles.sheetOptionText}>Add Goal</Text>
                  <Text style={styles.sheetOptionSubtext}>
                    Track habits and tasks for this tile
                  </Text>
                </View>
              </Pressable>
            )}

            {goal && (
              <Pressable style={styles.sheetOption} onPress={handleViewTracker}>
                <View style={styles.sheetOptionIcon}>
                  <Ionicons name="checkbox" size={20} color={theme.primary} />
                </View>
                <View>
                  <Text style={styles.sheetOptionText}>View Tracker</Text>
                  <Text style={styles.sheetOptionSubtext}>
                    Manage habits and tasks
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
    );
  }

  function renderAddGoalModal() {
    return (
      <Modal
        visible={showAddGoalModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddGoalModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}
          onPress={() => setShowAddGoalModal(false)}
        >
          <Pressable
            style={{ backgroundColor: theme.background, borderRadius: 16, padding: 24 }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.sheetTitle}>{getLabel('goals.new')}</Text>
            
            <TextInput
              style={styles.addGoalInput}
              value={newGoalName}
              onChangeText={setNewGoalName}
              placeholder={getLabel('goals.namePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />

            <View style={styles.addGoalButtons}>
              <Pressable
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.backgroundSecondary, alignItems: 'center' }}
                onPress={() => setShowAddGoalModal(false)}
              >
                <Text style={{ color: theme.text }}>{getLabel('common.cancel')}</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', opacity: newGoalName.trim() ? 1 : 0.5 }}
                onPress={handleAddGoal}
                disabled={!newGoalName.trim()}
              >
                <Text style={{ color: theme.white }}>{getLabel('common.add')}</Text>
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.boardName} numberOfLines={1}>
            {board?.name || 'Grid Board'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerButton}>
            <Ionicons name="settings-outline" size={20} color={theme.text} />
          </Pressable>
        </View>
      </View>

      {/* Grid */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(renderTile)}
        </View>
      </ScrollView>

      {renderTileOptionsSheet()}
      {renderAddGoalModal()}
    </View>
  );
}
