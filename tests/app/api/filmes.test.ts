import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/tmdb/movie', () => ({ getMovie: vi.fn() }));

import { GET } from '@/app/api/filmes/route';
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

beforeEach(() => {
  vi.mocked(getMovie).mockReset();
  vi.mocked(getMovie).mockImplementation(async (id) => details(id));
});

describe('GET /api/filmes', () => {
  it('devolve os resumos na ordem dos ids', async () => {
    const res = await GET(new Request('http://x/api/filmes?ids=3,1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { id: 3, title: 'Filme 3', year: 2020, posterPath: '/p3.jpg', backdropPath: '/b3.jpg', rating: 7.5 },
      { id: 1, title: 'Filme 1', year: 2020, posterPath: '/p1.jpg', backdropPath: '/b1.jpg', rating: 7.5 },
    ]);
  });

  it('pula filmes que sumiram do TMDB', async () => {
    vi.mocked(getMovie).mockImplementation(async (id) => (id === 2 ? null : details(id)));
    const body = await (await GET(new Request('http://x/api/filmes?ids=1,2'))).json();
    expect(body.map((m: { id: number }) => m.id)).toEqual([1]);
  });

  it('pula filmes cuja busca falhou', async () => {
    vi.mocked(getMovie).mockImplementation(async (id) => {
      if (id === 2) throw new Error('boom');
      return details(id);
    });
    const body = await (await GET(new Request('http://x/api/filmes?ids=1,2'))).json();
    expect(body.map((m: { id: number }) => m.id)).toEqual([1]);
  });

  it('lista vazia quando não há ids', async () => {
    const res = await GET(new Request('http://x/api/filmes?ids='));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
    expect(getMovie).not.toHaveBeenCalled();
  });

  it.each(['abc', '1,x', '0', '-2', '1.5'])('400 para ids inválidos (%j)', async (ids) => {
    const res = await GET(new Request(`http://x/api/filmes?ids=${ids}`));
    expect(res.status).toBe(400);
    expect(getMovie).not.toHaveBeenCalled();
  });

  it('400 para mais de 200 ids', async () => {
    const ids = Array.from({ length: 201 }, (_, i) => i + 1).join(',');
    expect((await GET(new Request(`http://x/api/filmes?ids=${ids}`))).status).toBe(400);
  });
});
