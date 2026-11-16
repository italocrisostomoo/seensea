import { expect, it } from 'vitest';
import { THEMES } from '@/config/themes';
import { relatedShelves } from '@/lib/related';
import type { MovieDetails, Person } from '@/lib/tmdb/types';

const d = (id: number, name: string): Person => ({ id, name, profilePath: null });
const g = (id: number) => ({ id, name: `g${id}` });
function movie(over: Partial<MovieDetails>): MovieDetails {
  return {
    id: 1,
    title: 'Filme',
    year: 2020,
    runtime: 100,
    rating: 7,
    overview: null,
    posterPath: null,
    backdropPath: null,
    genres: [],
    keywordIds: [],
    directors: [],
    cast: [],
    providers: { main: [], others: [] },
    trailerKey: null,
    ...over,
  };
}

it('ordem tema → diretor → gênero', () => {
  const m = movie({ keywordIds: THEMES[0].keywordIds, directors: [d(525, 'Diretora X')], genres: [g(18), g(878)] });
  const shelves = relatedShelves(m);
  expect(shelves.map((s) => s.title)).toEqual([`Mais de ${THEMES[0].name}`, 'Mais de Diretora X', 'Do mesmo gênero']);
  expect(shelves[0].query).toEqual({ keywordIds: THEMES[0].keywordIds });
  expect(shelves[0].href).toBe(`/explorar?tema=${THEMES[0].slug}`);
  expect(shelves[1].query).toEqual({ crewId: 525 });
  expect(shelves[1].href).toBe('/explorar?diretor=525');
  expect(shelves[2].query).toEqual({ genres: [18, 878], genreMatch: 'any' });
  expect(shelves[2].href).toBe('/explorar?generos=18');
});
it('sem tema curado, sem diretor e sem gênero → lista vazia', () => {
  expect(relatedShelves(movie({ keywordIds: [999999], directors: [], genres: [] }))).toEqual([]);
});
it('omite só as prateleiras que não se aplicam', () => {
  const m = movie({ keywordIds: [999999], directors: [d(1, 'A')], genres: [] });
  expect(relatedShelves(m).map((s) => s.title)).toEqual(['Mais de A']);
});
