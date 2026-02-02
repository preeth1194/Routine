import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';

import { theme } from '@/constants/theme';
import { getLabel } from '@/lib/labels';
import type { Template, GridTile } from '@/models/types';
import { createVisionBoard } from '@/models/VisionBoard';
import { createGoal } from '@/models/Goal';
import { insertBoard, insertGoal, insertGridTile } from '@/services/database';
import { templatesService } from '@/services/templates';
import { templatesStyles as styles } from '@/styles/screens/templates.styles';

export default function TemplatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const data = await templatesService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyTemplate(template: Template) {
    setApplying(true);
    try {
      const boardId = uuidv4();

      // Create board
      const board = createVisionBoard({
        id: boardId,
        name: template.name,
        layoutType: template.layoutType,
      });
      await insertBoard(board);

      // Create goals
      for (let i = 0; i < template.goals.length && i < 9; i++) {
        const templateGoal = template.goals[i];
        const goalId = uuidv4();

        const goal = createGoal({
          id: goalId,
          boardId,
          name: templateGoal.name,
          category: templateGoal.category,
          gridPosition: i,
          imageUrl: templateGoal.imageUrl,
        });
        await insertGoal(goal);

        // Create grid tile for grid boards
        if (template.layoutType === 'grid') {
          const tile: GridTile = {
            id: uuidv4(),
            boardId,
            goalId,
            position: i,
            imageUrl: templateGoal.imageUrl,
          };
          await insertGridTile(tile);
        }
      }

      setSelectedTemplate(null);

      // Navigate to the new board
      if (template.layoutType === 'grid') {
        router.replace(`/boards/grid-editor?id=${boardId}` as any);
      } else {
        router.replace(`/boards/freeform-editor?id=${boardId}` as any);
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
      setApplying(false);
    }
  }

  function renderTemplate(template: Template) {
    return (
      <View key={template.id} style={styles.templateCard}>
        {template.previewImageUrl && (
          <Image
            source={{ uri: template.previewImageUrl }}
            style={styles.templateImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.templateContent}>
          <Text style={styles.templateName}>{template.name}</Text>
          {template.description && (
            <Text style={styles.templateDescription} numberOfLines={2}>
              {template.description}
            </Text>
          )}
          <View style={styles.templateMeta}>
            <View style={styles.templateType}>
              <Ionicons
                name={template.layoutType === 'grid' ? 'grid' : 'move'}
                size={14}
                color={theme.textSecondary}
              />
              <Text style={styles.templateTypeText}>
                {template.layoutType === 'grid' ? getLabel('templates.grid') : getLabel('templates.freeform')}
              </Text>
            </View>
            <Text style={styles.goalCount}>
              {getLabel('templates.goalsCount').replace('{{count}}', String(template.goals.length))}
            </Text>
          </View>
          <Pressable
            style={styles.useButton}
            onPress={() => setSelectedTemplate(template)}
          >
            <Text style={styles.useButtonText}>
              {getLabel('templates.preview')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderPreviewModal() {
    if (!selectedTemplate) return null;

    return (
      <Modal
        visible={!!selectedTemplate}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedTemplate(null)}
      >
        <View style={styles.previewOverlay}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setSelectedTemplate(null)}
          />
          <View style={styles.previewSheet}>
            <View style={styles.previewHandle} />
            <ScrollView contentContainerStyle={styles.previewContent}>
              {selectedTemplate.previewImageUrl && (
                <Image
                  source={{ uri: selectedTemplate.previewImageUrl }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.previewTitle}>{selectedTemplate.name}</Text>
              {selectedTemplate.description && (
                <Text style={styles.previewDescription}>
                  {selectedTemplate.description}
                </Text>
              )}

              <Text style={styles.previewGoalsTitle}>{getLabel('templates.includedGoals')}</Text>
              {selectedTemplate.goals.map((goal, index) => (
                <View key={index} style={styles.previewGoal}>
                  <View style={styles.previewGoalBullet} />
                  <Text style={styles.previewGoalText}>
                    {goal.name}
                    {goal.category && ` (${goal.category})`}
                  </Text>
                </View>
              ))}

              <View style={styles.previewButtons}>
                <Pressable
                  style={styles.previewButtonSecondary}
                  onPress={() => setSelectedTemplate(null)}
                >
                  <Text style={styles.previewButtonSecondaryText}>
                    {getLabel('common.cancel')}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.previewButtonPrimary,
                    applying && { opacity: 0.7 },
                  ]}
                  onPress={() => handleApplyTemplate(selectedTemplate)}
                  disabled={applying}
                >
                  <Text style={styles.previewButtonPrimaryText}>
                    {applying
                      ? getLabel('common.loading')
                      : getLabel('templates.useTemplate')}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
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
          <Text style={styles.headerTitle}>{getLabel('templates.title')}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>{getLabel('templates.browse')}</Text>
          <Text style={styles.introSubtitle}>
            {getLabel('templates.introSubtitle')}
          </Text>
        </View>

        {templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="copy-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={styles.emptyText}>{getLabel('templates.empty')}</Text>
          </View>
        ) : (
          <View style={styles.templatesGrid}>
            {templates.map(renderTemplate)}
          </View>
        )}
      </ScrollView>

      {renderPreviewModal()}
    </View>
  );
}
