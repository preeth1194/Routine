import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getLabel } from '@/lib/labels';
import type { CompletionFeedback } from '@/models/types';
import { theme } from '@/constants/theme';
import { completionFeedbackSheetStyles as styles } from '@/styles/components/CompletionFeedbackSheet.styles';

const RATING_OPTIONS = [
  { value: 1, emoji: '😔' },
  { value: 2, emoji: '😐' },
  { value: 3, emoji: '🙂' },
  { value: 4, emoji: '😊' },
  { value: 5, emoji: '🤩' },
];

type CompletionFeedbackSheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onSave: (feedback: CompletionFeedback) => void;
  onSkip: () => void;
  onClose: () => void;
};

export function CompletionFeedbackSheet({
  visible,
  title,
  subtitle,
  onSave,
  onSkip,
  onClose,
}: CompletionFeedbackSheetProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState('');

  function handleSave() {
    if (rating) {
      onSave({
        rating,
        note: note.trim() || undefined,
      });
      resetState();
    }
  }

  function handleSkip() {
    onSkip();
    resetState();
  }

  function resetState() {
    setRating(null);
    setNote('');
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.container}>
          <View style={styles.handle} />
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>{getLabel('feedback.title')}</Text>
              <View style={styles.ratingRow}>
                {RATING_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.ratingButton,
                      rating === option.value && styles.ratingButtonSelected,
                    ]}
                    onPress={() => setRating(option.value)}
                  >
                    <Text style={styles.ratingEmoji}>{option.emoji}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.ratingLabelsRow}>
                <Text style={styles.ratingLabelText}>{getLabel('feedback.difficult')}</Text>
                <Text style={styles.ratingLabelText}>{getLabel('feedback.great')}</Text>
              </View>
            </View>

            <View style={styles.noteSection}>
              <Text style={styles.noteLabel}>{getLabel('feedback.addNote')}</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder={getLabel('feedback.notePlaceholder')}
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.buttonsRow}>
              <Pressable style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>{getLabel('common.skip')}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveButton,
                  !rating && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!rating}
              >
                <Text style={styles.saveButtonText}>{getLabel('common.save')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
