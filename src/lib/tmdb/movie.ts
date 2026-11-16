import { cache } from 'react';
import { splitProviders } from '@/lib/providers';
import { pickTrailer } from '@/lib/trailer';
import { REVALIDATE, TmdbError, tmdbFetch } from './client';
import type { MovieDetails, ProviderSplit, TmdbMovieDetails, TmdbProvider } from './types';

export function parseMovieId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// cache(): generateMetadata e a página pedem o mesmo filme na mesma requisição.
export const getMovie = cache(async (id: number): Promise<MovieDetails | null> => {
  let raw: TmdbMovieDetails;
  try {
    raw = await tmdbFetch<TmdbMovieDetails>(
      `/movie/${id}`,
      {
        language: 'pt-BR',
        append_to_response: 'credits,keywords,videos,watch/providers',
        include_video_language: 'pt,en',
      },
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
    trailerKey: pickTrailer(raw.videos?.results ?? []),
  };
});

export async function getMovieProviders(id: number): Promise<ProviderSplit> {
  const data = await tmdbFetch<{ results?: { BR?: { flatrate?: TmdbProvider[] } } }>(
    `/movie/${id}/watch/providers`,
    { language: 'pt-BR' },
    { revalidate: REVALIDATE.movie },
  );
  return splitProviders(data.results?.BR?.flatrate);
}

export async function getGenres(): Promise<{ id: number; name: string }[]> {
  const data = await tmdbFetch<{ genres?: { id: number; name: string }[] }>(
    '/genre/movie/list',
    { language: 'pt-BR' },
    { revalidate: REVALIDATE.lists },
  );
  return data.genres ?? [];
}

export async function getPerson(id: number): Promise<{ id: number; name: string } | null> {
  try {
    const raw = await tmdbFetch<{ id: number; name: string }>(
      `/person/${id}`,
      { language: 'pt-BR' },
      { revalidate: REVALIDATE.lists },
    );
    return { id: raw.id, name: raw.name };
  } catch (e) {
    if (e instanceof TmdbError && e.status === 404) return null;
    throw e;
  }
}
