import { NextResponse } from 'next/server';
import { MAX_IDS, type ListMoviesResponse } from '@/lib/lists';
import { getMovie } from '@/lib/tmdb/movie';
import type { MovieDetails } from '@/lib/tmdb/types';

const CONCURRENCY = 8;

async function fetchAll(ids: number[]): Promise<PromiseSettledResult<MovieDetails | null>[]> {
  const results: PromiseSettledResult<MovieDetails | null>[] = new Array(ids.length);
  let next = 0;
  async function worker() {
    while (next < ids.length) {
      const i = next++;
      try {
        results[i] = { status: 'fulfilled', value: await getMovie(ids[i]) };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, ids.length) }, worker));
  return results;
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('ids') ?? '';
  const parts = raw === '' ? [] : raw.split(',');
  if (parts.length > MAX_IDS || parts.some((p) => !/^[1-9]\d*$/.test(p))) {
    return NextResponse.json({ error: 'ids' }, { status: 400 });
  }
  const ids = parts.map(Number);

  const body: ListMoviesResponse = { movies: [], missing: [], failed: [] };
  (await fetchAll(ids)).forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[api/filmes] falha ao buscar o filme ${ids[i]}:`, r.reason);
      body.failed.push(ids[i]);
    } else if (!r.value) {
      body.missing.push(ids[i]);
    } else {
      const m = r.value;
      body.movies.push({ id: m.id, title: m.title, year: m.year, posterPath: m.posterPath, backdropPath: m.backdropPath, rating: m.rating });
    }
  });
  return NextResponse.json(body);
}
