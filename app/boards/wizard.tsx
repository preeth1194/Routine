import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import type { CoreValue, RecommendedGoal, GridTile } from '@/models/types';
import { createVisionBoard } from '@/models/VisionBoard';
import { createGoal } from '@/models/Goal';
import { insertBoard, insertGoal, insertGridTile } from '@/services/database';
import { wizardDefaultsService } from '@/services/wizardDefaults';
import { wizardRecommendationsService } from '@/services/wizardRecommendations';
import { categoryImagesService } from '@/services/categoryImages';
import { wizardStyles as styles } from '@/styles/screens/wizard.styles';

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  fitness: 'fitness',
  briefcase: 'briefcase',
  heart: 'heart',
  'trending-up': 'trending-up',
  'color-palette': 'color-palette',
  airplane: 'airplane',
};

type WizardStep = 'setup' | 'goals' | 'preview';

interface SelectedGoal {
  id: string;
  name: string;
  category?: string;
  whyImportant?: string;
  suggestedHabits?: string[];
  imageUrl?: string;
}

export default function WizardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<WizardStep>('setup');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Step 1 state
  const [boardName, setBoardName] = useState('');
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [selectedValueIds, setSelectedValueIds] = useState<string[]>([]);

  // Step 2 state
  const [recommendations, setRecommendations] = useState<RecommendedGoal[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<SelectedGoal[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Step 3 state
  const [goalImages, setGoalImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    loadDefaults();
  }, []);

  async function loadDefaults() {
    try {
      const { coreValues: values } = await wizardDefaultsService.getDefaults();
      setCoreValues(values);
    } catch (error) {
      console.error('Failed to load defaults:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecommendations() {
    setLoadingRecommendations(true);
    try {
      const allRecs: RecommendedGoal[] = [];
      for (const valueId of selectedValueIds) {
        const recs = await wizardRecommendationsService.getRecommendations(valueId);
        allRecs.push(...recs);
      }
      setRecommendations(allRecs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  }

  async function loadGoalImages() {
    setLoadingImages(true);
    try {
      const images: Record<string, string> = {};
      for (const goal of selectedGoals) {
        if (!goal.imageUrl && goal.category) {
          const imageUrl = await categoryImagesService.getCategoryImageUrl(
            selectedValueIds[0] || 'health',
            goal.category
          );
          if (imageUrl) {
            images[goal.id] = imageUrl;
          }
        }
      }
      setGoalImages(images);
    } catch (error) {
      console.error('Failed to load goal images:', error);
    } finally {
      setLoadingImages(false);
    }
  }

  function toggleValue(valueId: string) {
    setSelectedValueIds((prev) =>
      prev.includes(valueId)
        ? prev.filter((id) => id !== valueId)
        : [...prev, valueId]
    );
  }

  function toggleGoal(goal: RecommendedGoal) {
    setSelectedGoals((prev) => {
      const exists = prev.find((g) => g.id === goal.id);
      if (exists) {
        return prev.filter((g) => g.id !== goal.id);
      }
      if (prev.length >= 9) {
        // Max 9 goals for 3x3 grid
        return prev;
      }
      return [...prev, {
        id: goal.id,
        name: goal.name,
        category: goal.category,
        whyImportant: goal.whyImportant,
        suggestedHabits: goal.suggestedHabits,
        imageUrl: goal.imageUrl,
      }];
    });
  }

  function removeGoal(goalId: string) {
    setSelectedGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  function handleNext() {
    if (step === 'setup') {
      setStep('goals');
      loadRecommendations();
    } else if (step === 'goals') {
      setStep('preview');
      loadGoalImages();
    }
  }

  function handleBack() {
    if (step === 'goals') {
      setStep('setup');
    } else if (step === 'preview') {
      setStep('goals');
    }
  }

  async function handleCreate() {
    setSaving(true);
    try {
      const boardId = uuidv4();
      
      // Create board
      const board = createVisionBoard({
        id: boardId,
        name: boardName.trim() || getLabel('boards.defaultBoardName'),
        layoutType: 'grid',
      });
      await insertBoard(board);

      // Create goals and tiles
      for (let i = 0; i < selectedGoals.length; i++) {
        const selectedGoal = selectedGoals[i];
        const goalId = uuidv4();
        
        const goal = createGoal({
          id: goalId,
          boardId,
          name: selectedGoal.name,
          category: selectedGoal.category,
          whyImportant: selectedGoal.whyImportant,
          gridPosition: i,
          imageUrl: goalImages[selectedGoal.id] || selectedGoal.imageUrl,
        });
        await insertGoal(goal);

        // Create grid tile
        const tile: GridTile = {
          id: uuidv4(),
          boardId,
          goalId,
          position: i,
          imageUrl: goalImages[selectedGoal.id] || selectedGoal.imageUrl,
        };
        await insertGridTile(tile);
      }

      // Navigate to the new board
      router.replace(`/boards/grid-editor?id=${boardId}` as any);
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setSaving(false);
    }
  }

  function getStepProgress(): number {
    switch (step) {
      case 'setup': return 33;
      case 'goals': return 66;
      case 'preview': return 100;
      default: return 0;
    }
  }

  function getStepNumber(): number {
    switch (step) {
      case 'setup': return 1;
      case 'goals': return 2;
      case 'preview': return 3;
      default: return 1;
    }
  }

  function canProceed(): boolean {
    switch (step) {
      case 'setup':
        return boardName.trim().length > 0 && selectedValueIds.length > 0;
      case 'goals':
        return selectedGoals.length > 0;
      case 'preview':
        return selectedGoals.length > 0;
      default:
        return false;
    }
  }

  function renderStep1() {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepTitle}>{getLabel('wizard.step1')}</Text>
        <Text style={styles.stepSubtitle}>
          {getLabel('wizard.step1Subtitle')}
        </Text>

        <Text style={styles.inputLabel}>{getLabel('boards.boardName')}</Text>
        <TextInput
          style={styles.textInput}
          value={boardName}
          onChangeText={setBoardName}
          placeholder={getLabel('boards.boardNamePlaceholder')}
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.inputLabel}>{getLabel('wizard.coreValues')}</Text>
        <View style={styles.valuesGrid}>
          {coreValues.map((value) => {
            const isSelected = selectedValueIds.includes(value.id);
            const iconName = ICON_MAP[value.icon || 'star'] || 'star';

            return (
              <Pressable
                key={value.id}
                style={[
                  styles.valueCard,
                  isSelected && styles.valueCardSelected,
                ]}
                onPress={() => toggleValue(value.id)}
              >
                <View
                  style={[
                    styles.valueIcon,
                    isSelected && styles.valueIconSelected,
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={isSelected ? theme.white : theme.primary}
                  />
                </View>
                <Text style={styles.valueName}>{value.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  function renderStep2() {
    if (loadingRecommendations) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>
            {getLabel('wizard.generating')}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepTitle}>{getLabel('wizard.step2')}</Text>
        <Text style={styles.stepSubtitle}>
          {getLabel('wizard.step2Subtitle').replace('{{count}}', String(selectedGoals.length))}
        </Text>

        <View style={styles.goalsSection}>
          <Text style={styles.goalsSectionTitle}>
            {getLabel('wizard.recommendedGoals')}
          </Text>

          {recommendations.map((goal) => {
            const isAdded = selectedGoals.some((g) => g.id === goal.id);

            return (
              <View
                key={goal.id}
                style={[
                  styles.recommendedGoal,
                  isAdded && styles.recommendedGoalAdded,
                ]}
              >
                <View style={styles.goalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    {goal.category && (
                      <Text style={styles.goalCategory}>{goal.category}</Text>
                    )}
                  </View>
                  <Pressable
                    style={[
                      styles.addGoalButton,
                      isAdded && styles.addGoalButtonAdded,
                    ]}
                    onPress={() => toggleGoal(goal)}
                  >
                    <Text
                      style={[
                        styles.addGoalButtonText,
                        isAdded && styles.addGoalButtonTextAdded,
                      ]}
                    >
                      {isAdded ? getLabel('wizard.added') : getLabel('common.add')}
                    </Text>
                  </Pressable>
                </View>
                {goal.whyImportant && (
                  <Text style={styles.goalWhyImportant}>
                    "{goal.whyImportant}"
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  function renderStep3() {
    if (loadingImages) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>{getLabel('wizard.loadingImages')}</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepTitle}>{getLabel('wizard.step3')}</Text>
        <Text style={styles.stepSubtitle}>
          {getLabel('wizard.step3Subtitle')}
        </Text>

        <View style={styles.previewGrid}>
          {[...Array(9)].map((_, index) => {
            const goal = selectedGoals[index];
            const imageUrl = goal
              ? goalImages[goal.id] || goal.imageUrl
              : undefined;

            return (
              <View key={index} style={styles.previewTile}>
                {goal && imageUrl ? (
                  <>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    <View style={styles.previewGoalName}>
                      <Text
                        style={styles.previewGoalNameText}
                        numberOfLines={1}
                      >
                        {goal.name}
                      </Text>
                    </View>
                  </>
                ) : goal ? (
                  <View style={styles.previewPlaceholder}>
                    <Ionicons
                      name="flag"
                      size={24}
                      color={theme.textSecondary}
                    />
                  </View>
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <Ionicons
                      name="add"
                      size={24}
                      color={theme.textSecondary}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.goalsSectionTitle}>{getLabel('wizard.yourGoals')}</Text>
        <View style={styles.selectedGoalsList}>
          {selectedGoals.map((goal, index) => (
            <View key={goal.id} style={styles.selectedGoal}>
              <View style={styles.selectedGoalNumber}>
                <Text style={styles.selectedGoalNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.selectedGoalInfo}>
                <Text style={styles.selectedGoalName}>{goal.name}</Text>
              </View>
              <Pressable
                style={styles.removeGoalButton}
                onPress={() => removeGoal(goal.id)}
              >
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
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
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (step === 'setup') {
                router.back();
              } else {
                handleBack();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{getLabel('wizard.title')}</Text>
        </View>
        <Text style={styles.stepIndicator}>
          {getLabel('wizard.stepOf').replace('{{current}}', String(getStepNumber())).replace('{{total}}', '3')}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${getStepProgress()}%` }]}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {step === 'setup' && renderStep1()}
        {step === 'goals' && renderStep2()}
        {step === 'preview' && renderStep3()}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.footerButtons}>
          {step !== 'setup' && (
            <Pressable
              style={styles.footerButtonSecondary}
              onPress={handleBack}
            >
              <Text style={styles.footerButtonSecondaryText}>
                {getLabel('common.back')}
              </Text>
            </Pressable>
          )}
          <Pressable
            style={[
              styles.footerButtonPrimary,
              !canProceed() && styles.footerButtonPrimaryDisabled,
              step === 'setup' && { flex: 2 },
            ]}
            onPress={step === 'preview' ? handleCreate : handleNext}
            disabled={!canProceed() || saving}
          >
            <Text style={styles.footerButtonPrimaryText}>
              {saving
                ? getLabel('common.loading')
                : step === 'preview'
                ? getLabel('wizard.createBoard')
                : getLabel('common.next')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
