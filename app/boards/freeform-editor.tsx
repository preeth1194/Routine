import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
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
import type { VisionComponent } from '@/models/types';
import {
  getBoardById,
  getGoalsByBoardId,
  insertGoal,
  getVisionComponentsByBoardId,
  insertVisionComponent,
  updateVisionComponent,
  deleteVisionComponent,
} from '@/services/database';
import { freeformEditorStyles as styles } from '@/styles/screens/freeform-editor.styles';

const DEFAULT_SIZE = 150;

export default function FreeformEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [board, setBoard] = useState<VisionBoard | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [components, setComponents] = useState<VisionComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);

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

      const componentsData = await getVisionComponentsByBoardId(id!);
      setComponents(componentsData);
    } catch (error) {
      console.error('Failed to load board:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPendingImageUri(result.assets[0].uri);
      setShowAddSheet(false);
      setShowAddGoalModal(true);
    }
  }

  async function handleAddGoal() {
    if (!newGoalName.trim() || !pendingImageUri) return;

    // Create goal
    const goal = createGoal({
      id: uuidv4(),
      boardId: id!,
      name: newGoalName.trim(),
      imagePath: pendingImageUri,
    });
    await insertGoal(goal);
    setGoals((prev) => [...prev, goal]);

    // Create component
    const screenWidth = Dimensions.get('window').width;
    const component: VisionComponent = {
      id: uuidv4(),
      boardId: id!,
      goalId: goal.id,
      type: 'image',
      position: {
        x: (screenWidth - DEFAULT_SIZE) / 2,
        y: 100,
      },
      size: { width: DEFAULT_SIZE, height: DEFAULT_SIZE },
      zIndex: components.length,
      imagePath: pendingImageUri,
    };
    await insertVisionComponent(component);
    setComponents((prev) => [...prev, component]);

    // Reset state
    setNewGoalName('');
    setPendingImageUri(null);
    setShowAddGoalModal(false);
    setSelectedComponentId(component.id);
  }

  async function handleAddText() {
    const screenWidth = Dimensions.get('window').width;
    const component: VisionComponent = {
      id: uuidv4(),
      boardId: id!,
      type: 'text',
      position: {
        x: (screenWidth - DEFAULT_SIZE) / 2,
        y: 100,
      },
      size: { width: DEFAULT_SIZE, height: 60 },
      zIndex: components.length,
      text: 'New Goal',
      color: theme.text,
    };
    await insertVisionComponent(component);
    setComponents((prev) => [...prev, component]);
    setShowAddSheet(false);
    setSelectedComponentId(component.id);
  }

  function handleComponentPress(componentId: string) {
    setSelectedComponentId(selectedComponentId === componentId ? null : componentId);
  }

  async function handleDeleteSelected() {
    if (!selectedComponentId) return;

    Alert.alert(
      getLabel('common.delete'),
      'Delete this component?',
      [
        { text: getLabel('common.cancel'), style: 'cancel' },
        {
          text: getLabel('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteVisionComponent(selectedComponentId);
            setComponents((prev) => prev.filter((c) => c.id !== selectedComponentId));
            setSelectedComponentId(null);
          },
        },
      ]
    );
  }

  function handleViewTracker() {
    const component = components.find((c) => c.id === selectedComponentId);
    if (component?.goalId) {
      router.push(`/boards/goal-viewer?goalId=${component.goalId}&boardId=${id}` as any);
    }
  }

  function renderComponent(component: VisionComponent) {
    const isSelected = selectedComponentId === component.id;
    const goal = component.goalId ? goals.find((g) => g.id === component.goalId) : null;

    return (
      <Pressable
        key={component.id}
        style={[
          styles.component,
          isSelected && styles.componentSelected,
          {
            left: component.position.x,
            top: component.position.y,
            width: component.size.width,
            height: component.size.height,
            zIndex: component.zIndex,
          },
        ]}
        onPress={() => handleComponentPress(component.id)}
      >
        {component.type === 'image' && (component.imagePath || component.imageUrl) ? (
          <>
            <Image
              source={{ uri: component.imagePath || component.imageUrl }}
              style={styles.componentImage}
              resizeMode="cover"
            />
            {goal && (
              <View style={styles.componentOverlay}>
                <Text style={styles.componentName} numberOfLines={1}>
                  {goal.name}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.componentText}>
            <Text style={styles.componentTextContent}>
              {component.text || 'Text'}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  function renderAddSheet() {
    return (
      <Modal
        visible={showAddSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddSheet(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          onPress={() => setShowAddSheet(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add to Board</Text>

            <Pressable style={styles.sheetOption} onPress={handleAddImage}>
              <View style={styles.sheetOptionIcon}>
                <Ionicons name="image" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={styles.sheetOptionText}>Add Image Goal</Text>
                <Text style={styles.sheetOptionSubtext}>
                  Pick an image and add a goal
                </Text>
              </View>
            </Pressable>

            <Pressable style={styles.sheetOption} onPress={handleAddText}>
              <View style={styles.sheetOptionIcon}>
                <Ionicons name="text" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={styles.sheetOptionText}>Add Text</Text>
                <Text style={styles.sheetOptionSubtext}>
                  Add motivational text
                </Text>
              </View>
            </Pressable>
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
        onRequestClose={() => {
          setShowAddGoalModal(false);
          setPendingImageUri(null);
        }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}
          onPress={() => {
            setShowAddGoalModal(false);
            setPendingImageUri(null);
          }}
        >
          <Pressable
            style={{ backgroundColor: theme.background, borderRadius: 16, padding: 24 }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.sheetTitle}>{getLabel('goals.new')}</Text>
            
            {pendingImageUri && (
              <Image
                source={{ uri: pendingImageUri }}
                style={{ width: 100, height: 100, borderRadius: 12, alignSelf: 'center', marginBottom: 16 }}
                resizeMode="cover"
              />
            )}

            <TextInput
              style={{
                backgroundColor: theme.backgroundSecondary,
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                color: theme.text,
                marginBottom: 16,
              }}
              value={newGoalName}
              onChangeText={setNewGoalName}
              placeholder={getLabel('goals.namePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.backgroundSecondary, alignItems: 'center' }}
                onPress={() => {
                  setShowAddGoalModal(false);
                  setPendingImageUri(null);
                }}
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
            {board?.name || 'Vision Board'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {selectedComponentId && (
            <Pressable style={styles.headerButton} onPress={handleDeleteSelected}>
              <Ionicons name="trash-outline" size={20} color={theme.text} />
            </Pressable>
          )}
          <Pressable style={styles.headerButton}>
            <Ionicons name="settings-outline" size={20} color={theme.text} />
          </Pressable>
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvas}>
        {components.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>Your vision board is empty</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add images and goals
            </Text>
          </View>
        ) : (
          <View style={styles.canvasContent}>
            {components.map(renderComponent)}
          </View>
        )}
      </View>

      {/* Toolbar */}
      <View style={[styles.toolbar, { paddingBottom: insets.bottom || 16 }]}>
        <Pressable style={styles.toolbarButton} onPress={() => setShowAddSheet(true)}>
          <Ionicons name="add-circle" size={28} color={theme.primary} />
          <Text style={styles.toolbarButtonText}>Add</Text>
        </Pressable>

        {selectedComponentId && components.find(c => c.id === selectedComponentId)?.goalId && (
          <Pressable style={styles.toolbarButton} onPress={handleViewTracker}>
            <Ionicons name="checkbox" size={28} color={theme.primary} />
            <Text style={styles.toolbarButtonText}>Tracker</Text>
          </Pressable>
        )}
      </View>

      {renderAddSheet()}
      {renderAddGoalModal()}
    </View>
  );
}
