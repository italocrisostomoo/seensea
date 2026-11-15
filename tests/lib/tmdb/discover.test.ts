import { afterEach, expect, it, vi } from 'vitest';
import { MAIN_SERVICE_IDS } from '@/config/services';
import { buildDiscoverParams, discoverMovies } from '@/lib/tmdb/discover';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it('aplica os parâmetros fixos e todos os serviços principais com OU', () => {
  const p = buildDiscoverParams({}, '2026-11-15');
  expect(p.get('watch_region')).toBe('BR');
  expect(p.get('with_watch_monetization_types')).toBe('flatrate');
  expect(p.get('language')).toBe('pt-BR');
  expect(p.get('include_adult')).toBe('false');
  expect(p.get('with_watch_providers')).toBe(MAIN_SERVICE_IDS.join('|'));
  expect(p.get('sort_by')).toBe('popularity.desc');
  expect(p.get('page')).toBe('1');
});
it('usa só os serviços escolhidos quando há filtro', () => {
  expect(buildDiscoverParams({ services: [8, 119] }, '2026-11-15').get('with_watch_providers')).toBe('8|119');
});
it('discoverMovies limita totalPages a 500', async () => {
  vi.stubEnv('TMDB_READ_TOKEN', 'tok');
  const body = { page: 1, results: [], total_pages: 812, total_results: 16240 };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body))));
  expect((await discoverMovies({})).totalPages).toBe(500);
});

const D = '2026-11-15';
it('gêneros: E por padrão (vírgula), OU com genreMatch any (barra)', () => {
  expect(buildDiscoverParams({ genres: [18, 878] }, D).get('with_genres')).toBe('18,878');
  expect(buildDiscoverParams({ genres: [18, 878], genreMatch: 'any' }, D).get('with_genres')).toBe('18|878');
});
it('keywords com OU, ator e diretor', () => {
  const p = buildDiscoverParams({ keywordIds: [1, 2], castId: 3, crewId: 4 }, D);
  expect([p.get('with_keywords'), p.get('with_cast'), p.get('with_crew')]).toEqual(['1|2', '3', '4']);
});
it('ordem nota exige mínimo de votos', () => {
  const p = buildDiscoverParams({ sort: 'nota' }, D);
  expect([p.get('sort_by'), p.get('vote_count.gte')]).toEqual(['vote_average.desc', '200']);
});
it('ordem lançamento não traz datas futuras', () => {
  const p = buildDiscoverParams({ sort: 'lancamento' }, '2026-11-15');
  expect([p.get('sort_by'), p.get('primary_release_date.lte')]).toEqual(['primary_release_date.desc', '2026-11-15']);
});
it('página é limitada a 1..500', () => {
  expect(buildDiscoverParams({ page: 900 }, D).get('page')).toBe('500');
});
