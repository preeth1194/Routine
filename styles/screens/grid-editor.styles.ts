import { StyleSheet, Dimensions } from 'react-native';

import { theme, typography } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 16;
const GRID_GAP = 8;
const TILE_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 2) / 3;

export const gridEditorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  boardName: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.backgroundSecondary,
  },
  content: {
    flex: 1,
    padding: GRID_PADDING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  tileSelected: {
    borderColor: theme.primary,
    borderWidth: 2,
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  tileEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
  },
  tileEmptyText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  tileOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tileName: {
    fontFamily: typography.bodyMedium,
    fontSize: 11,
    color: theme.white,
  },
  // Tile action sheet
  tileActionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  tileAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  tileActionText: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    color: theme.text,
  },
  // Bottom sheet for tile options
  bottomSheet: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.cardBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 16,
  },
  sheetOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetOptionText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: theme.text,
  },
  sheetOptionSubtext: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  // Goal details panel
  goalPanel: {
    backgroundColor: theme.cardBackground,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
    padding: 16,
  },
  goalPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalPanelTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 16,
    color: theme.text,
  },
  goalPanelClose: {
    padding: 4,
  },
  goalStats: {
    flexDirection: 'row',
    gap: 16,
  },
  goalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalStatText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.textSecondary,
  },
  viewTrackerButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  viewTrackerButtonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.white,
  },
  // Add goal modal
  addGoalInput: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    fontFamily: typography.body,
    fontSize: 15,
    color: theme.text,
    marginBottom: 12,
  },
  addGoalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { TILE_SIZE, GRID_PADDING, GRID_GAP };
