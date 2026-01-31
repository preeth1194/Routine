import en from '@/locales/en.json';

type Labels = typeof en;

const labels: Labels = en;

/**
 * Get a label by dot-notation key (e.g. 'tabs.home', 'screens.notFound.title')
 */
export function getLabel(key: string): string {
  const parts = (key as string).split('.');
  let value: unknown = labels;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return key as string;
    }
  }

  return typeof value === 'string' ? value : (key as string);
}

/**
 * Get nested label object (e.g. 'screens.notFound' returns the notFound object)
 */
export function getLabels<T = Record<string, string>>(key: string): T {
  const parts = (key as string).split('.');
  let value: unknown = labels;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return {} as T;
    }
  }

  return (value as T) ?? ({} as T);
}

export { labels };
