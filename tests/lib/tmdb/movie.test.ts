import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getGenres, getMovie, getMovieProviders, getPerson, parseMovieId } from '@/lib/tmdb/movie';

beforeEach(() => vi.stubEnv('TMDB_READ_TOKEN', 'tok'));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

const fixture = {
  id: 7,
  title: 'Filme',
  release_date: '',
  runtime: 0,
  vote_average: 7.46,
  overview: '',
  poster_path: null,
  backdrop_path: null,
  genres: [],
  credits: {
    cast: Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Ator ${i}`,
      profile_path: null,
      order: 14 - i,
    })),
    crew: [
      { id: 100, name: 'Diretora', job: 'Director', profile_path: '/d.jpg' },
      { id: 101, name: 'Roteirista', job: 'Writer', profile_path: null },
    ],
  },
  keywords: { keywords: [{ id: 5, name: 'k' }] },
  videos: {
    results: [
      { key: 'teaser1', site: 'YouTube', type: 'Teaser', iso_639_1: 'pt' },
      { key: 'trailerPt', site: 'YouTube', type: 'Trailer', iso_639_1: 'pt' },
    ],
  },
  'watch/providers': {
    results: {
      BR: {
        flatrate: [
          { provider_id: 8, provider_name: 'Netflix', logo_path: '/n.jpg' },
          { provider_id: 11, provider_name: 'MUBI', logo_path: '/m.jpg' },
        ],
      },
    },
  },
};

it.each([
  ['abc', null],
  ['0', null],
  ['-5', null],
  ['12.5', null],
  ['157336', 157336],
])('parseMovieId(%s) = %s', (raw, out) => expect(parseMovieId(raw)).toBe(out));

it('getMovie retorna null quando o TMDB responde 404', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({}, 404)));
  expect(await getMovie(999999999)).toBeNull();
});
it('getMovie propaga outros erros', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({}, 500)));
  await expect(getMovie(1)).rejects.toMatchObject({ status: 500 });
});
it('getMovie pede append_to_response com videos, include_video_language=pt,en e language pt-BR', async () => {
  const fetchMock = vi.fn().mockResolvedValue(json(fixture));
  vi.stubGlobal('fetch', fetchMock);
  await getMovie(7);
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.pathname).toBe('/3/movie/7');
  expect(url.searchParams.get('append_to_response')).toBe('credits,keywords,videos,watch/providers');
  expect(url.searchParams.get('include_video_language')).toBe('pt,en');
  expect(url.searchParams.get('language')).toBe('pt-BR');
});
it('getMovie mapeia: overview vazio vira null, diretores por job, elenco ≤ 10, providers do BR', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(fixture)));
  const m = (await getMovie(7))!;
  expect(m.overview).toBeNull();
  expect(m.year).toBeNull();
  expect(m.runtime).toBeNull();
  expect(m.rating).toBe(7.5);
  expect(m.keywordIds).toEqual([5]);
  expect(m.trailerKey).toBe('trailerPt');
  expect(m.directors).toEqual([{ id: 100, name: 'Diretora', profilePath: '/d.jpg' }]);
  expect(m.cast).toHaveLength(10);
  expect(m.cast[0].id).toBe(15); // menor `order` primeiro
  expect(m.providers.main.map((x) => x.id)).toEqual([8]);
  expect(m.providers.others.map((x) => x.name)).toEqual(['MUBI']);
});
it('getMovieProviders lê /movie/{id}/watch/providers do BR', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(json({ results: { BR: { flatrate: fixture['watch/providers'].results.BR.flatrate } } }));
  vi.stubGlobal('fetch', fetchMock);
  const s = await getMovieProviders(7);
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.pathname).toBe('/3/movie/7/watch/providers');
  expect(url.searchParams.get('language')).toBe('pt-BR');
  expect(s.main.map((x) => x.id)).toEqual([8]);
});

it('getPerson retorna null no 404 e { id, name } no 200', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({}, 404)));
  expect(await getPerson(1)).toBeNull();
  const fetchMock = vi.fn().mockResolvedValue(json({ id: 5, name: 'Fulana', biography: 'x' }));
  vi.stubGlobal('fetch', fetchMock);
  expect(await getPerson(5)).toEqual({ id: 5, name: 'Fulana' });
  expect(new URL(fetchMock.mock.calls[0][0]).pathname).toBe('/3/person/5');
});
it('getGenres devolve os gêneros de /genre/movie/list', async () => {
  const fetchMock = vi.fn().mockResolvedValue(json({ genres: [{ id: 18, name: 'Drama' }] }));
  vi.stubGlobal('fetch', fetchMock);
  expect(await getGenres()).toEqual([{ id: 18, name: 'Drama' }]);
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.pathname).toBe('/3/genre/movie/list');
  expect(url.searchParams.get('language')).toBe('pt-BR');
});
it('getMovie sem vídeos tem trailerKey null', async () => {
  const semVideos = { ...fixture, videos: { results: [] } };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(semVideos)));
  expect((await getMovie(8))!.trailerKey).toBeNull();
});
