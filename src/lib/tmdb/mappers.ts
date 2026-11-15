import type { MovieSummary, TmdbMovieListItem } from './types';

export function toMovieSummary(raw: TmdbMovieListItem): MovieSummary {
  const year = raw.release_date ? Number(raw.release_date.slice(0, 4)) : NaN;
  return {
    id: raw.id,
    title: raw.title,
    year: Number.isFinite(year) ? year : null,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    rating: Math.round(raw.vote_average * 10) / 10,
  };
}
