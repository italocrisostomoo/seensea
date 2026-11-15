import type { MoviePage } from '@/lib/tmdb/types';

// `totalPages` já vem limitado a 500 por discoverMovies; nunca pedimos além dele.
export function getNextPageParam(last: MoviePage): number | undefined {
  return last.page < last.totalPages ? last.page + 1 : undefined;
}
