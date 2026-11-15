import { afterEach, expect, it, vi } from 'vitest';
import { tmdbFetch } from '@/lib/tmdb/client';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it('envia o token como Bearer e monta a URL com os parâmetros', async () => {
  vi.stubEnv('TMDB_READ_TOKEN', 'tok');
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: 1 })));
  vi.stubGlobal('fetch', fetchMock);
  await tmdbFetch('/discover/movie', { page: '2' }, { revalidate: 60 });
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe('https://api.themoviedb.org/3/discover/movie?page=2');
  expect(init.headers.Authorization).toBe('Bearer tok');
  expect(init.next).toEqual({ revalidate: 60 });
});
it('lança TmdbError com o status quando a resposta não é ok', async () => {
  vi.stubEnv('TMDB_READ_TOKEN', 'tok');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('x', { status: 404 })));
  await expect(tmdbFetch('/movie/1')).rejects.toMatchObject({ name: 'TmdbError', status: 404 });
});
it('lança erro claro quando TMDB_READ_TOKEN não está definido', async () => {
  vi.stubEnv('TMDB_READ_TOKEN', '');
  await expect(tmdbFetch('/x')).rejects.toThrow(/TMDB_READ_TOKEN/);
});
