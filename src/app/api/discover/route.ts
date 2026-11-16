import { NextResponse } from 'next/server';
import { filtersToDiscoverQuery, parseFilters } from '@/lib/filters';
import { TmdbError } from '@/lib/tmdb/client';
import { discoverMovies, MAX_PAGE } from '@/lib/tmdb/discover';

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const raw = sp.get('pagina');
  const page = raw !== null && /^\d+$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
    return NextResponse.json({ error: 'pagina' }, { status: 400 });
  }

  try {
    const data = await discoverMovies({ ...filtersToDiscoverQuery(parseFilters(sp)), page });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof TmdbError) return NextResponse.json({ error: 'tmdb' }, { status: 502 });
    throw err;
  }
}
