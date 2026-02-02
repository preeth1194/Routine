import { StyleSheet, Dimensions } from 'react-native';

import { theme, typography } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const freeformEditorStyles = StyleSheet.create({
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
    backgroundColor: theme.background,
    zIndex: 10,
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
  canvas: {
    flex: 1,
    backgroundColor: theme.backgroundSecondary,
  },
  canvasContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  component: {
    position: 'absolute',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  componentSelected: {
    borderColor: theme.primary,
  },
  componentImage: {
    width: '100%',
    height: '100%',
  },
  componentText: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    padding: 12,
  },
  componentTextContent: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.text,
    textAlign: 'center',
  },
  componentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  componentName: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: theme.white,
  },
  // Toolbar
  toolbar: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 12,
  },
  toolbarButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  toolbarButtonText: {
    fontFamily: typography.body,
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: 4,
  },
  // Add component sheet
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
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  // Resize handles
  resizeHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: theme.primary,
    borderRadius: 10,
  },
  resizeHandleTopLeft: {
    top: -10,
    left: -10,
  },
  resizeHandleTopRight: {
    top: -10,
    right: -10,
  },
  resizeHandleBottomLeft: {
    bottom: -10,
    left: -10,
  },
  resizeHandleBottomRight: {
    bottom: -10,
    right: -10,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
