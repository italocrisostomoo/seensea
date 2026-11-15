import { MAIN_SERVICE_IDS } from '@/config/services';
import { REVALIDATE, tmdbFetch } from './client';
import { toMovieSummary } from './mappers';
import type { MoviePage, SortOrder, TmdbMovieListItem, TmdbPaged } from './types';

const MAX_PAGE = 500;

export interface DiscoverQuery {
  services?: number[];
  genres?: number[];
  genreMatch?: 'all' | 'any';
  keywordIds?: number[];
  castId?: number;
  crewId?: number;
  sort?: SortOrder;
  page?: number;
}

// Nesta etapa trata só services, sort 'popularidade' e page.
export function buildDiscoverParams(q: DiscoverQuery, today: string): URLSearchParams {
  void today;
  const services = q.services?.length ? q.services : MAIN_SERVICE_IDS;
  return new URLSearchParams({
    watch_region: 'BR',
    with_watch_monetization_types: 'flatrate',
    language: 'pt-BR',
    include_adult: 'false',
    with_watch_providers: services.join('|'),
    sort_by: 'popularity.desc',
    page: String(q.page ?? 1),
  });
}

export async function discoverMovies(q: DiscoverQuery): Promise<MoviePage> {
  const today = new Date().toISOString().slice(0, 10);
  const data = await tmdbFetch<TmdbPaged<TmdbMovieListItem>>(
    '/discover/movie',
    buildDiscoverParams(q, today),
    { revalidate: REVALIDATE.discover },
  );
  return {
    results: data.results.map(toMovieSummary),
    page: data.page,
    totalPages: Math.min(data.total_pages, MAX_PAGE),
  };
}
