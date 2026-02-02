import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/constants/theme';
import type { VisionBoard } from '@/models/VisionBoard';
import type { GridTile } from '@/models/types';
import { getGridTilesByBoardId, getVisionComponentsByBoardId } from '@/services/database';
import { visionBoardCardStyles as styles } from '@/styles/components/VisionBoardCard.styles';
import { getImageSource } from '@/utils/fileSystem';

type VisionBoardCardProps = {
  board: VisionBoard;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function VisionBoardCard({
  board,
  onPress,
  onEdit,
  onDelete,
}: VisionBoardCardProps) {
  const [tiles, setTiles] = useState<GridTile[]>([]);
  const [previewImage, setPreviewImage] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreviewData();
  }, [board.id, board.layoutType]);

  async function loadPreviewData() {
    setLoading(true);
    try {
      if (board.layoutType === 'grid') {
        const gridTiles = await getGridTilesByBoardId(board.id);
        setTiles(gridTiles);
      } else {
        // Freeform - get first image component
        const components = await getVisionComponentsByBoardId(board.id);
        const imageComponent = components.find(c => c.type === 'image');
        if (imageComponent) {
          setPreviewImage(getImageSource(imageComponent.imagePath, imageComponent.imageUrl));
        }
      }
    } catch (error) {
      console.error('Failed to load preview data:', error);
    } finally {
      setLoading(false);
    }
  }

  function renderGridPreview() {
    // Show up to 9 tiles in a 3x3 grid
    const displayTiles = [...Array(9)].map((_, i) => {
      const tile = tiles.find(t => t.position === i);
      return tile;
    });

    return (
      <View style={styles.gridPreview}>
        {displayTiles.map((tile, index) => (
          <View key={index} style={styles.gridCell}>
            {tile && (tile.imagePath || tile.imageUrl) ? (
              <Image
                source={{ uri: getImageSource(tile.imagePath, tile.imageUrl) }}
                style={styles.gridCellImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.gridCellPlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={16}
                  color={theme.textSecondary}
                />
              </View>
            )}
          </View>
        ))}
      </View>
    );
  }

  function renderFreeformPreview() {
    if (previewImage) {
      return (
        <Image
          source={{ uri: previewImage }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="grid-outline"
          size={48}
          color={theme.textSecondary}
          style={styles.emptyIcon}
        />
      </View>
    );
  }

  return (
    <Pressable
      style={[styles.container, board.isActive && styles.activeContainer]}
      onPress={onPress}
    >
      <View style={styles.previewContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        ) : board.layoutType === 'grid' ? (
          renderGridPreview()
        ) : (
          renderFreeformPreview()
        )}

        {/* Board info overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.9)']}
          style={styles.overlayGradient}
        />
        <View style={styles.overlay}>
          <Text style={styles.boardName} numberOfLines={1}>
            {board.name}
          </Text>
          <Text style={styles.boardMeta}>
            {board.layoutType === 'grid' ? 'Grid Board' : 'Vision Board'}
          </Text>
        </View>

        {/* Active indicator */}
        {board.isActive && (
          <View style={styles.activeIndicator}>
            <Text style={styles.activeIndicatorText}>Active</Text>
          </View>
        )}
      </View>

      {/* Actions row */}
      {(onEdit || onDelete) && (
        <View style={styles.actionsRow}>
          {onEdit && (
            <Pressable
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Ionicons name="pencil" size={18} color={theme.text} />
            </Pressable>
          )}
          {onDelete && (
            <Pressable
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Ionicons name="trash-outline" size={18} color={theme.text} />
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}
