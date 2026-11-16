import { NextResponse } from 'next/server';
import { getMovie } from '@/lib/tmdb/movie';
import type { MovieSummary } from '@/lib/tmdb/types';

const MAX_IDS = 200;

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('ids') ?? '';
  const parts = raw === '' ? [] : raw.split(',');
  if (parts.length > MAX_IDS || parts.some((p) => !/^[1-9]\d*$/.test(p))) {
    return NextResponse.json({ error: 'ids' }, { status: 400 });
  }

  const results = await Promise.allSettled(parts.map((p) => getMovie(Number(p))));
  const movies: MovieSummary[] = [];
  for (const r of results) {
    if (r.status === 'rejected') {
      console.error('[api/filmes] falha ao buscar filme:', r.reason);
      continue;
    }
    const m = r.value;
    if (!m) continue;
    movies.push({ id: m.id, title: m.title, year: m.year, posterPath: m.posterPath, backdropPath: m.backdropPath, rating: m.rating });
  }
  return NextResponse.json(movies);
}
