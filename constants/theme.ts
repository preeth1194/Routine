/**
 * Routine app theme - Oasis/Fresh Green palette
 * Updated for health, growth, and clarity
 */
export const theme = {
  // Brand colors from the Oasis palette
  deepForest: '#2d3e1d',   // Deepest green for text
  leafGreen: '#88b562',    // Primary action color
  softSage: '#d5e4c3',     // Muted green for progress backgrounds
  mintGlow: '#f4f9f0',     // Background tint
  white: '#ffffff',

  // Semantic tokens
  primary: '#88b562',           // LeafGreen for brand presence
  primaryCTA: '#88b562',        // Primary buttons
  heading: '#2d3e1d',           // DeepForest for strong headers
  secondary: '#88b562',         // Consistent green accents
  accent: '#2d3e1d',            // Dark accents for icons
  tabActive: '#2d3e1d',         // Dark for active navigation
  tabInactive: '#88b562',       // Green for inactive nav

  // Sliding pill tab bar
  tabBarBackground: '#ffffff',
  tabBarBorder: '#f4f9f0',
  tabBarPill: '#88b562',        // Green pill
  tabBarIconInactive: '#88b562',
  tabBarIconActive: '#ffffff',
  tabBarLabelActive: '#ffffff',

  // Neutrals - fresh backgrounds
  background: '#ffffff',
  backgroundSecondary: '#f4f9f0', // Soft mint tint for sections
  cardBackground: '#ffffff',
  cardBorder: '#d5e4c3',         // Sage border for subtle cards
  text: '#2d3e1d',               // DeepForest for high readability
  textSecondary: '#88b562',      // Green for secondary info

  // App bar – labels and icons follow theme
  appBarGreeting: '#2d3e1d',     // Same as heading
  appBarSubtitle: '#88b562',     // Same as textSecondary
  appBarAppName: '#2d3e1d',      // Same as heading
  appBarIconColor: '#2d3e1d',    // Same as accent/heading
  appBarIconBackground: '#ffffff',
  appBarNotificationBadge: '#e74c3c',
} as const;
/**
 * Typography - font families
 * Plus Jakarta Sans for headings, Satoshi for body
 */
export const typography = {
  heading: 'PlusJakartaSans_700Bold',
  headingMedium: 'PlusJakartaSans_500Medium',
  headingSemiBold: 'PlusJakartaSans_600SemiBold',
  body: 'PlusJakartaSans_400Regular', // Use for general CBT content
  bodyMedium: 'PlusJakartaSans_500Medium', 
} as const;