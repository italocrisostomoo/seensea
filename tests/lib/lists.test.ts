import { describe, expect, it } from 'vitest';
import { chunk, idsIn, removeEntry, resolveList, setStatus, type ListEntry } from '@/lib/lists';
import type { MovieSummary } from '@/lib/tmdb/types';

const movie = (id: number): MovieSummary => ({
  id,
  title: `Filme ${id}`,
  year: 2020,
  posterPath: null,
  backdropPath: null,
  rating: 7,
});

describe('chunk', () => {
  it('divide em pedaços de no máximo n, mantendo a ordem', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([], 2)).toEqual([]);
  });
});

describe('resolveList', () => {
  it('mantém a ordem da lista e marca os filmes que sumiram do TMDB', () => {
    const items = resolveList([3, 2, 1], { movies: [movie(1), movie(3)], missing: [2], failed: [] });
    expect(items).toEqual([
      { kind: 'movie', movie: movie(3) },
      { kind: 'missing', id: 2 },
      { kind: 'movie', movie: movie(1) },
    ]);
  });

  it('deixa de fora os que falharam agora, para aparecerem quando der certo', () => {
    const items = resolveList([1, 2], { movies: [movie(1)], missing: [], failed: [2] });
    expect(items).toEqual([{ kind: 'movie', movie: movie(1) }]);
  });
});

const entries: ListEntry[] = [
  { tmdbId: 1, status: 'watchlist' },
  { tmdbId: 2, status: 'watched' },
  { tmdbId: 3, status: 'watchlist' },
];

describe('idsIn', () => {
  it('separa os ids de cada lista mantendo a ordem', () => {
    expect(idsIn(entries, 'watchlist')).toEqual([1, 3]);
    expect(idsIn(entries, 'watched')).toEqual([2]);
  });
});

describe('setStatus', () => {
  it('move o filme de "Quero assistir" para "Já assisti" sem deixá-lo nas duas', () => {
    const next = setStatus(entries, 3, 'watched');
    expect(idsIn(next, 'watched')).toEqual([3, 2]);
    expect(idsIn(next, 'watchlist')).toEqual([1]);
    expect(next.filter((e) => e.tmdbId === 3)).toHaveLength(1);
  });

  it('adiciona um filme novo no topo da lista', () => {
    expect(idsIn(setStatus(entries, 9, 'watchlist'), 'watchlist')).toEqual([9, 1, 3]);
  });

  it('marcar de novo na mesma lista não duplica', () => {
    expect(setStatus(entries, 2, 'watched').filter((e) => e.tmdbId === 2)).toHaveLength(1);
  });
});

describe('removeEntry', () => {
  it('tira o filme da lista indicada', () => {
    expect(idsIn(removeEntry(entries, 1, 'watchlist'), 'watchlist')).toEqual([3]);
  });

  it('não mexe no filme se ele está na outra lista', () => {
    expect(removeEntry(entries, 2, 'watchlist')).toEqual(entries);
  });
});
