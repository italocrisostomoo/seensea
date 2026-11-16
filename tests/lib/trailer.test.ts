import { expect, it } from 'vitest';
import { pickTrailer } from '@/lib/trailer';

const v = (key: string, site: string, type: string, iso_639_1: string) => ({ key, site, type, iso_639_1 });

it('prefere trailer do YouTube em português', () =>
  expect(pickTrailer([v('en1', 'YouTube', 'Trailer', 'en'), v('pt1', 'YouTube', 'Trailer', 'pt')])).toBe('pt1'));
it('cai para inglês', () => expect(pickTrailer([v('en1', 'YouTube', 'Trailer', 'en')])).toBe('en1'));
it('ignora teaser e vídeos fora do YouTube', () =>
  expect(pickTrailer([v('a', 'Vimeo', 'Trailer', 'pt'), v('b', 'YouTube', 'Teaser', 'pt')])).toBeNull());
it('retorna null sem vídeos', () => expect(pickTrailer([])).toBeNull());
it('ignora trailers em outros idiomas', () =>
  expect(pickTrailer([v('fr1', 'YouTube', 'Trailer', 'fr')])).toBeNull());
