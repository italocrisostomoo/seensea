import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/tmdb/discover', () => ({ discoverMovies: vi.fn() }));

import { GET } from '@/app/api/discover/route';
import { TmdbError } from '@/lib/tmdb/client';
import { discoverMovies } from '@/lib/tmdb/discover';

const page = { results: [], page: 3, totalPages: 9 };

beforeEach(() => {
  vi.mocked(discoverMovies).mockReset();
  vi.mocked(discoverMovies).mockResolvedValue(page);
});

describe('GET /api/discover', () => {
  it('repassa filtros e página para o discover', async () => {
    const res = await GET(new Request('http://x/api/discover?servicos=8&pagina=3'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(page);
    expect(discoverMovies).toHaveBeenCalledWith(
      expect.objectContaining({ services: [8], page: 3 }),
    );
  });

  it.each(['0', '501', 'abc', '1.5', '-2', ''])('400 para página inválida (%j)', async (p) => {
    const res = await GET(new Request(`http://x/api/discover?pagina=${p}`));
    expect(res.status).toBe(400);
    expect(discoverMovies).not.toHaveBeenCalled();
  });

  it('400 quando a página falta', async () => {
    expect((await GET(new Request('http://x/api/discover?servicos=8'))).status).toBe(400);
  });

  it('aceita os limites 1 e 500', async () => {
    expect((await GET(new Request('http://x/api/discover?pagina=1'))).status).toBe(200);
    expect((await GET(new Request('http://x/api/discover?pagina=500'))).status).toBe(200);
  });

  it('502 quando o TMDB falha', async () => {
    vi.mocked(discoverMovies).mockRejectedValue(new TmdbError(500, 'boom'));
    const res = await GET(new Request('http://x/api/discover?pagina=2'));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'tmdb' });
  });
});
