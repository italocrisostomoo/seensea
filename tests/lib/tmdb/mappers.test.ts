import { expect, it } from 'vitest';
import { toMovieSummary } from '@/lib/tmdb/mappers';
import type { TmdbMovieListItem } from '@/lib/tmdb/types';

const base: TmdbMovieListItem = {
  id: 1, title: 'A', release_date: '2014-11-06', poster_path: '/p.jpg',
  backdrop_path: null, vote_average: 8.437, genre_ids: [],
};

it('converte o item cru, com ano e nota de uma casa', () => {
  expect(toMovieSummary(base))
    .toEqual({ id: 1, title: 'A', year: 2014, posterPath: '/p.jpg', backdropPath: null, rating: 8.4 });
});
it('posterPath é null quando poster_path vem null', () => {
  expect(toMovieSummary({ ...base, poster_path: null }).posterPath).toBeNull();
});
it('ano é null quando release_date vem vazio', () => {
  expect(toMovieSummary({ ...base, release_date: '' }).year).toBeNull();
});
