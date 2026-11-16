import type { MovieSummary } from './tmdb/types';

export type ListType = 'watched' | 'watchlist';

export type HomeTab = 'destaque' | ListType;

const TAB_SLUG: Record<ListType, string> = { watched: 'ja-assisti', watchlist: 'quero-assistir' };

export function tabFromSearch(search: string): HomeTab {
  const slug = new URLSearchParams(search).get('lista');
  if (slug === TAB_SLUG.watched) return 'watched';
  if (slug === TAB_SLUG.watchlist) return 'watchlist';
  return 'destaque';
}

export function tabSearch(tab: HomeTab): string {
  return tab === 'destaque' ? '' : `?lista=${TAB_SLUG[tab]}`;
}

/** Máximo de filmes por pedido a /api/filmes: limita quantas buscas ao TMDB um pedido dispara. */
export const MAX_IDS = 50;

export interface ListMoviesResponse {
  movies: MovieSummary[];
  /** Não existem mais no TMDB. */
  missing: number[];
  /** A busca falhou agora (TMDB fora do ar, limite de requisições); pode dar certo depois. */
  failed: number[];
}

export type ListItem = { kind: 'movie'; movie: MovieSummary } | { kind: 'missing'; id: number };

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function resolveList(ids: number[], res: ListMoviesResponse): ListItem[] {
  const byId = new Map(res.movies.map((m) => [m.id, m]));
  const missing = new Set(res.missing);
  const items: ListItem[] = [];
  for (const id of ids) {
    const movie = byId.get(id);
    if (movie) items.push({ kind: 'movie', movie });
    else if (missing.has(id)) items.push({ kind: 'missing', id });
  }
  return items;
}

export interface ListEntry {
  tmdbId: number;
  status: ListType;
}

export function idsIn(entries: ListEntry[], status: ListType): number[] {
  return entries.filter((e) => e.status === status).map((e) => e.tmdbId);
}

// Um filme fica em uma lista só: marcar na outra lista move o filme para o topo dela.
export function setStatus(entries: ListEntry[], tmdbId: number, status: ListType): ListEntry[] {
  return [{ tmdbId, status }, ...entries.filter((e) => e.tmdbId !== tmdbId)];
}

export function removeEntry(entries: ListEntry[], tmdbId: number, status: ListType): ListEntry[] {
  return entries.filter((e) => !(e.tmdbId === tmdbId && e.status === status));
}
