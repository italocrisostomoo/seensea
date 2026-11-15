import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { searchMovies } from '@/lib/tmdb/search';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv('TMDB_READ_TOKEN', 'tok');
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () =>
    new Response(JSON.stringify({ page: 2, results: [], total_pages: 812, total_results: 1 })),
  );
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it('busca em branco não chama o TMDB', async () => {
  expect(await searchMovies('   ')).toEqual({ results: [], page: 1, totalPages: 0 });
  expect(fetchMock).not.toHaveBeenCalled();
});
it('codifica a consulta e manda os parâmetros fixos', async () => {
  await searchMovies('amélie & co', 2);
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.pathname).toBe('/3/search/movie');
  expect(Object.fromEntries(url.searchParams)).toMatchObject({
    query: 'amélie & co',
    page: '2',
    language: 'pt-BR',
    region: 'BR',
    include_adult: 'false',
  });
});
it('limita totalPages a 500', async () => {
  expect((await searchMovies('x')).totalPages).toBe(500);
});
