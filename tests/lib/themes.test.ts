import { expect, it } from 'vitest';
import { THEMES } from '@/config/themes';
import { findTheme, themesForMovie } from '@/lib/themes';

it('themesForMovie devolve só temas curados, na ordem do config', () => {
  const ids = [999999, ...THEMES[1].keywordIds, ...THEMES[0].keywordIds];
  expect(themesForMovie(ids).map((t) => t.slug)).toEqual([THEMES[0].slug, THEMES[1].slug]);
});
it('findTheme acha por slug e devolve undefined para desconhecido', () => {
  expect(findTheme(THEMES[0].slug)).toBe(THEMES[0]);
  expect(findTheme('nada')).toBeUndefined();
});
