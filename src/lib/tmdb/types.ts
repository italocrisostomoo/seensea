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

export interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

export interface Provider {
  id: number;
  name: string;
  logoPath: string | null;
}

export interface ProviderSplit {
  main: Provider[];
  others: Provider[];
}

export interface Person {
  id: number;
  name: string;
  profilePath: string | null;
}

export interface MovieDetails {
  id: number;
  title: string;
  year: number | null;
  runtime: number | null;
  rating: number;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  genres: { id: number; name: string }[];
  keywordIds: number[];
  directors: Person[];
  cast: Person[];
  providers: ProviderSplit;
  trailerKey: string | null;
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; profile_path: string | null; order: number }[];
    crew: { id: number; name: string; profile_path: string | null; job: string }[];
  };
  videos?: { results: { key: string; site: string; type: string; iso_639_1: string }[] };
  keywords?: { keywords: { id: number; name: string }[] };
  'watch/providers'?: { results?: { BR?: { flatrate?: TmdbProvider[] } } };
}
