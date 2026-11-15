import { THEMES, type Theme } from '@/config/themes';

export function findTheme(slug: string): Theme | undefined {
  return THEMES.find((t) => t.slug === slug);
}

export function themesForMovie(keywordIds: number[]): Theme[] {
  const ids = new Set(keywordIds);
  return THEMES.filter((t) => t.keywordIds.some((k) => ids.has(k)));
}
