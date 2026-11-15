import { MAIN_SERVICE_IDS } from '@/config/services';
import type { DiscoverQuery } from '@/lib/tmdb/discover';
import type { SortOrder } from '@/lib/tmdb/types';
import { findTheme } from '@/lib/themes';

export interface Filters {
  services: number[];
  genres: number[];
  theme: string | null;
  castId: number | null;
  crewId: number | null;
  sort: SortOrder;
}

export const DEFAULT_FILTERS: Filters = {
  services: [],
  genres: [],
  theme: null,
  castId: null,
  crewId: null,
  sort: 'popularidade',
};

const SORTS: SortOrder[] = ['popularidade', 'nota', 'lancamento'];

function positiveInt(raw: string | null): number | null {
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}

function idList(raw: string | null, allowed?: number[]): number[] {
  if (!raw) return [];
  const ids = raw
    .split(',')
    .map((s) => positiveInt(s.trim()))
    .filter((n): n is number => n !== null && (!allowed || allowed.includes(n)));
  return [...new Set(ids)];
}

export function parseFilters(sp: URLSearchParams): Filters {
  const tema = sp.get('tema');
  const ordem = sp.get('ordem');
  return {
    services: idList(sp.get('servicos'), MAIN_SERVICE_IDS),
    genres: idList(sp.get('generos')),
    theme: tema && findTheme(tema) ? tema : null,
    castId: positiveInt(sp.get('ator')),
    crewId: positiveInt(sp.get('diretor')),
    sort: SORTS.find((s) => s === ordem) ?? DEFAULT_FILTERS.sort,
  };
}

export function filtersToSearchParams(f: Filters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.services.length) sp.set('servicos', f.services.join(','));
  if (f.genres.length) sp.set('generos', f.genres.join(','));
  if (f.theme) sp.set('tema', f.theme);
  if (f.castId !== null) sp.set('ator', String(f.castId));
  if (f.crewId !== null) sp.set('diretor', String(f.crewId));
  if (f.sort !== DEFAULT_FILTERS.sort) sp.set('ordem', f.sort);
  return sp;
}

export function filtersToDiscoverQuery(f: Filters): DiscoverQuery {
  const theme = f.theme ? findTheme(f.theme) : undefined;
  return {
    services: f.services,
    genres: f.genres,
    keywordIds: theme?.keywordIds,
    castId: f.castId ?? undefined,
    crewId: f.crewId ?? undefined,
    sort: f.sort,
  };
}

export function exploreHref(partial: Partial<Filters>): string {
  const qs = filtersToSearchParams({ ...DEFAULT_FILTERS, ...partial }).toString();
  return qs ? `/explorar?${qs}` : '/explorar';
}
