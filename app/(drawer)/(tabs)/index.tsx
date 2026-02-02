import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { TabScreenContainer } from '@/components/TabScreenContainer';
import { VisionBoardCard } from '@/components/VisionBoardCard';
import { FAB } from '@/components/FAB';
import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import type { VisionBoard } from '@/models/VisionBoard';
import { createVisionBoard } from '@/models/VisionBoard';
import type { BoardLayoutType } from '@/models/types';
import {
  getAllBoards,
  insertBoard,
  deleteBoard,
  setActiveBoard,
} from '@/services/database';
import { syncService } from '@/services/sync';
import { dashboardStyles as styles } from '@/styles/screens/dashboard.styles';

export default function DashboardScreen() {
  const router = useRouter();
  const [boards, setBoards] = useState<VisionBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create modal state
  const [newBoardName, setNewBoardName] = useState('');
  const [selectedLayout, setSelectedLayout] = useState<BoardLayoutType>('grid');

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoards() {
    try {
      const allBoards = await getAllBoards();
      setBoards(allBoards);
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncService.syncIfNeeded();
      await loadBoards();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  async function handleCreateBoard() {
    if (!newBoardName.trim()) return;

    try {
      const board = createVisionBoard({
        id: uuidv4(),
        name: newBoardName.trim(),
        layoutType: selectedLayout,
      });

      await insertBoard(board);
      setBoards((prev) => [board, ...prev]);
      setShowCreateModal(false);
      setNewBoardName('');

      // Navigate to editor
      if (selectedLayout === 'grid') {
        router.push(`/boards/grid-editor?id=${board.id}` as any);
      } else {
        router.push(`/boards/freeform-editor?id=${board.id}` as any);
      }
    } catch (error) {
      console.error('Failed to create board:', error);
      Alert.alert(getLabel('common.error'), 'Failed to create board');
    }
  }

  function handleOpenBoard(board: VisionBoard) {
    if (board.layoutType === 'grid') {
      router.push(`/boards/grid-editor?id=${board.id}` as any);
    } else {
      router.push(`/boards/freeform-editor?id=${board.id}` as any);
    }
  }

  function handleEditBoard(board: VisionBoard) {
    handleOpenBoard(board);
  }

  async function handleDeleteBoard(board: VisionBoard) {
    Alert.alert(
      getLabel('common.delete'),
      getLabel('boards.deleteConfirm'),
      [
        { text: getLabel('common.cancel'), style: 'cancel' },
        {
          text: getLabel('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBoard(board.id);
              setBoards((prev) => prev.filter((b) => b.id !== board.id));
            } catch (error) {
              console.error('Failed to delete board:', error);
            }
          },
        },
      ]
    );
  }

  function renderEmptyState() {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="grid-outline"
          size={64}
          color={theme.textSecondary}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>{getLabel('boards.empty')}</Text>
        <Text style={styles.emptySubtitle}>
          {getLabel('boards.emptySubtitle')}
        </Text>
      </View>
    );
  }

  function renderCreateModal() {
    return (
      <Modal
        visible={showCreateModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCreateModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{getLabel('boards.new')}</Text>

            {/* Board Name Input */}
            <Text style={styles.inputLabel}>{getLabel('boards.boardName')}</Text>
            <TextInput
              style={styles.textInput}
              value={newBoardName}
              onChangeText={setNewBoardName}
              placeholder={getLabel('boards.boardNamePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />

            {/* Layout Selection */}
            <Text style={styles.inputLabel}>{getLabel('boards.selectLayout')}</Text>

            {/* Grid Option */}
            <Pressable
              style={[
                styles.layoutOption,
                selectedLayout === 'grid' && styles.layoutOptionSelected,
              ]}
              onPress={() => setSelectedLayout('grid')}
            >
              <View
                style={[
                  styles.layoutIcon,
                  selectedLayout === 'grid' && styles.layoutIconSelected,
                ]}
              >
                <Ionicons
                  name="grid"
                  size={24}
                  color={selectedLayout === 'grid' ? theme.white : theme.text}
                />
              </View>
              <View style={styles.layoutTextContainer}>
                <Text style={styles.layoutTitle}>
                  {getLabel('boards.gridBoard')}
                </Text>
                <Text style={styles.layoutDescription}>
                  Structured 3x3 grid with image tiles
                </Text>
              </View>
            </Pressable>

            {/* Freeform Option */}
            <Pressable
              style={[
                styles.layoutOption,
                selectedLayout === 'freeform' && styles.layoutOptionSelected,
              ]}
              onPress={() => setSelectedLayout('freeform')}
            >
              <View
                style={[
                  styles.layoutIcon,
                  selectedLayout === 'freeform' && styles.layoutIconSelected,
                ]}
              >
                <Ionicons
                  name="move"
                  size={24}
                  color={selectedLayout === 'freeform' ? theme.white : theme.text}
                />
              </View>
              <View style={styles.layoutTextContainer}>
                <Text style={styles.layoutTitle}>
                  {getLabel('boards.freeformBoard')}
                </Text>
                <Text style={styles.layoutDescription}>
                  Drag and drop goals anywhere
                </Text>
              </View>
            </Pressable>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalButtonSecondary}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>
                  {getLabel('common.cancel')}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButtonPrimary,
                  !newBoardName.trim() && styles.modalButtonPrimaryDisabled,
                ]}
                onPress={handleCreateBoard}
                disabled={!newBoardName.trim()}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {getLabel('boards.create')}
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
      <TabScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </TabScreenContainer>
    );
  }

  return (
    <TabScreenContainer>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        >
          {boards.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {getLabel('boards.title')}
                </Text>
              </View>
              {boards.map((board) => (
                <VisionBoardCard
                  key={board.id}
                  board={board}
                  onPress={() => handleOpenBoard(board)}
                  onEdit={() => handleEditBoard(board)}
                  onDelete={() => handleDeleteBoard(board)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <FAB icon="add" onPress={() => setShowCreateModal(true)} />
        {renderCreateModal()}
      </View>
    </TabScreenContainer>
  );
}
