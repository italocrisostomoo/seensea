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

const SORT_BY: Record<SortOrder, string> = {
  popularidade: 'popularity.desc',
  nota: 'vote_average.desc',
  lancamento: 'primary_release_date.desc',
};

export function buildDiscoverParams(q: DiscoverQuery, today: string): URLSearchParams {
  const services = q.services?.length ? q.services : MAIN_SERVICE_IDS;
  const sort = q.sort ?? 'popularidade';
  const page = Math.min(Math.max(Math.trunc(q.page ?? 1), 1), MAX_PAGE);
  const p = new URLSearchParams({
    watch_region: 'BR',
    with_watch_monetization_types: 'flatrate',
    language: 'pt-BR',
    include_adult: 'false',
    with_watch_providers: services.join('|'),
    sort_by: SORT_BY[sort],
    page: String(page),
  });
  if (q.genres?.length) p.set('with_genres', q.genres.join(q.genreMatch === 'any' ? '|' : ','));
  if (q.keywordIds?.length) p.set('with_keywords', q.keywordIds.join('|'));
  if (q.castId) p.set('with_cast', String(q.castId));
  if (q.crewId) p.set('with_crew', String(q.crewId));
  if (sort === 'nota') p.set('vote_count.gte', '200');
  if (sort === 'lancamento') p.set('primary_release_date.lte', today);
  return p;
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
