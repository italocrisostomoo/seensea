import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/tmdb/movie', () => ({ getMovie: vi.fn() }));

import { GET } from '@/app/api/filmes/route';
import { MAX_IDS } from '@/lib/lists';
import { getMovie } from '@/lib/tmdb/movie';
import type { MovieDetails } from '@/lib/tmdb/types';

function details(id: number): MovieDetails {
  return {
    id,
    title: `Filme ${id}`,
    year: 2020,
    runtime: 100,
    rating: 7.5,
    overview: null,
    posterPath: `/p${id}.jpg`,
    backdropPath: `/b${id}.jpg`,
    genres: [],
    keywordIds: [],
    directors: [],
    cast: [],
    providers: { main: [], others: [] },
    trailerKey: null,
  };
}

const get = (ids: string) => GET(new Request(`http://x/api/filmes?ids=${ids}`));

beforeEach(() => {
  vi.mocked(getMovie).mockReset();
  vi.mocked(getMovie).mockImplementation(async (id) => details(id));
});

describe('GET /api/filmes', () => {
  it('devolve os resumos na ordem dos ids', async () => {
    const res = await get('3,1');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      movies: [
        { id: 3, title: 'Filme 3', year: 2020, posterPath: '/p3.jpg', backdropPath: '/b3.jpg', rating: 7.5 },
        { id: 1, title: 'Filme 1', year: 2020, posterPath: '/p1.jpg', backdropPath: '/b1.jpg', rating: 7.5 },
      ],
      missing: [],
      failed: [],
    });
  });

  it('separa os filmes que sumiram do TMDB', async () => {
    vi.mocked(getMovie).mockImplementation(async (id) => (id === 2 ? null : details(id)));
    const body = await (await get('1,2')).json();
    expect(body.movies.map((m: { id: number }) => m.id)).toEqual([1]);
    expect(body.missing).toEqual([2]);
    expect(body.failed).toEqual([]);
  });

  it('separa os filmes cuja busca falhou', async () => {
    vi.mocked(getMovie).mockImplementation(async (id) => {
      if (id === 2) throw new Error('boom');
      return details(id);
    });
    const body = await (await get('1,2')).json();
    expect(body.movies.map((m: { id: number }) => m.id)).toEqual([1]);
    expect(body.missing).toEqual([]);
    expect(body.failed).toEqual([2]);
  });

  it('nunca faz mais de 8 buscas ao TMDB ao mesmo tempo', async () => {
    let inFlight = 0;
    let peak = 0;
    vi.mocked(getMovie).mockImplementation(async (id) => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 1));
      inFlight--;
      return details(id);
    });
    const ids = Array.from({ length: MAX_IDS }, (_, i) => i + 1).join(',');
    const body = await (await get(ids)).json();
    expect(body.movies).toHaveLength(MAX_IDS);
    expect(peak).toBeLessThanOrEqual(8);
    expect(peak).toBeGreaterThan(1);
  });

  it('lista vazia quando não há ids', async () => {
    const res = await get('');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ movies: [], missing: [], failed: [] });
    expect(getMovie).not.toHaveBeenCalled();
  });

  it.each(['abc', '1,x', '0', '-2', '1.5'])('400 para ids inválidos (%j)', async (ids) => {
    expect((await get(ids)).status).toBe(400);
    expect(getMovie).not.toHaveBeenCalled();
  });

  it('aceita até 50 ids e recusa 51', async () => {
    expect(MAX_IDS).toBe(50);
    const ids = (n: number) => Array.from({ length: n }, (_, i) => i + 1).join(',');
    expect((await get(ids(50))).status).toBe(200);
    expect((await get(ids(51))).status).toBe(400);
  });
});
