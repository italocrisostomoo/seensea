import { splitProviders } from '@/lib/providers';
import { REVALIDATE, TmdbError, tmdbFetch } from './client';
import type { MovieDetails, ProviderSplit, TmdbMovieDetails, TmdbProvider } from './types';

export function parseMovieId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function getMovie(id: number): Promise<MovieDetails | null> {
  let raw: TmdbMovieDetails;
  try {
    raw = await tmdbFetch<TmdbMovieDetails>(
      `/movie/${id}`,
      { language: 'pt-BR', append_to_response: 'credits,keywords,watch/providers' },
      { revalidate: REVALIDATE.movie },
    );
  } catch (e) {
    if (e instanceof TmdbError && e.status === 404) return null;
    throw e;
  }

  const year = raw.release_date ? Number(raw.release_date.slice(0, 4)) : NaN;
  return {
    id: raw.id,
    title: raw.title,
    year: Number.isFinite(year) ? year : null,
    runtime: raw.runtime || null,
    rating: Math.round(raw.vote_average * 10) / 10,
    overview: raw.overview?.trim() ? raw.overview : null,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    genres: raw.genres ?? [],
    keywordIds: (raw.keywords?.keywords ?? []).map((k) => k.id),
    directors: (raw.credits?.crew ?? [])
      .filter((c) => c.job === 'Director')
      .map((c) => ({ id: c.id, name: c.name, profilePath: c.profile_path })),
    cast: [...(raw.credits?.cast ?? [])]
      .sort((a, b) => a.order - b.order)
      .slice(0, 10)
      .map((c) => ({ id: c.id, name: c.name, profilePath: c.profile_path })),
    providers: splitProviders(raw['watch/providers']?.results?.BR?.flatrate),
  };
}

export async function getMovieProviders(id: number): Promise<ProviderSplit> {
  const data = await tmdbFetch<{ results?: { BR?: { flatrate?: TmdbProvider[] } } }>(
    `/movie/${id}/watch/providers`,
    undefined,
    { revalidate: REVALIDATE.movie },
  );
  return splitProviders(data.results?.BR?.flatrate);
}
