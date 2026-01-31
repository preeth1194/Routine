import { getLabel } from '@/lib/labels';
import { TAB_ICONS, TAB_LABEL_KEYS } from '@/constants/navigation';

export type TabRouteName = keyof typeof TAB_LABEL_KEYS;

/**
 * Get tab config for a route - label and icon
 */
export function getTabConfig(routeName: string) {
  return {
    title: getLabel(TAB_LABEL_KEYS[routeName] ?? routeName),
    icon: TAB_ICONS[routeName] ?? 'ellipse',
  };
}

/**
 * All tab routes with their display config
 */
export const TAB_ROUTES = (['index', 'daily-routine', 'journal', 'insights', 'profile'] as const).map(
  (name) => ({
    name,
    ...getTabConfig(name),
  })
);
