import { REVALIDATE, tmdbFetch } from './client';
import { MAX_PAGE } from './discover';
import { toMovieSummary } from './mappers';
import type { MoviePage, TmdbMovieListItem, TmdbPaged } from './types';

export async function searchMovies(query: string, page = 1): Promise<MoviePage> {
  const q = query.trim();
  if (q === '') return { results: [], page: 1, totalPages: 0 };
  const safePage = Math.min(Math.max(Math.trunc(page) || 1, 1), MAX_PAGE);
  const data = await tmdbFetch<TmdbPaged<TmdbMovieListItem>>(
    '/search/movie',
    {
      query: q,
      page: String(safePage),
      language: 'pt-BR',
      region: 'BR',
      include_adult: 'false',
    },
    { revalidate: REVALIDATE.search },
  );
  return {
    results: data.results.map(toMovieSummary),
    page: data.page,
    totalPages: Math.min(data.total_pages, MAX_PAGE),
  };
}
