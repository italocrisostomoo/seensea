export interface TmdbMovieListItem {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genre_ids: number[];
}

export interface TmdbPaged<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MovieSummary {
  id: number;
  title: string;
  year: number | null;
  posterPath: string | null;
  backdropPath: string | null;
  rating: number;
}

export interface MoviePage {
  results: MovieSummary[];
  page: number;
  totalPages: number;
}

export type SortOrder = 'popularidade' | 'nota' | 'lancamento';
