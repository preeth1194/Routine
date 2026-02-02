import { StyleSheet, Dimensions } from 'react-native';

import { theme, typography } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const insightsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: theme.text,
  },
  headerSubtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  statCardLarge: {
    width: '100%',
  },
  statValue: {
    fontFamily: typography.heading,
    fontSize: 32,
    color: theme.primary,
  },
  statLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 4,
  },
  statIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
    marginBottom: 12,
  },
  // Chart container
  chartContainer: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  chartTitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
    marginBottom: 16,
  },
  // Bar chart
  barChartContainer: {
    height: 150,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    paddingHorizontal: 8,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    backgroundColor: theme.softSage,
    borderRadius: 4,
    marginBottom: 8,
    minHeight: 4,
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  barLabel: {
    fontFamily: typography.body,
    fontSize: 11,
    color: theme.textSecondary,
  },
  // Progress ring
  progressRing: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  progressText: {
    position: 'absolute',
    fontFamily: typography.heading,
    fontSize: 28,
    color: theme.primary,
  },
  progressLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 8,
  },
  // Goals breakdown
  goalsBreakdown: {
    gap: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.text,
  },
  goalMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalProgressText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: theme.primary,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: typography.headingSemiBold,
    fontSize: 18,
    color: theme.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
