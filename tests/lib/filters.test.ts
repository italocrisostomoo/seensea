import { expect, it } from 'vitest';
import { THEMES } from '@/config/themes';
import {
  DEFAULT_FILTERS,
  exploreHref,
  filtersToDiscoverQuery,
  filtersToSearchParams,
  parseFilters,
} from '@/lib/filters';

it('lê todos os filtros da URL', () => {
  expect(parseFilters(new URLSearchParams('servicos=8,119&generos=18,878&tema=viagem-no-tempo&ator=500&ordem=nota')))
    .toEqual({ services: [8, 119], genres: [18, 878], theme: 'viagem-no-tempo', castId: 500, crewId: null, sort: 'nota' });
});
it('ignora valores inválidos e cai no padrão', () => {
  expect(parseFilters(new URLSearchParams('servicos=abc,999,8&generos=x&tema=inexistente&ator=-3&diretor=1.5&ordem=xyz')))
    .toEqual({ ...DEFAULT_FILTERS, services: [8] });
});
it('ida e volta preserva os filtros e omite os padrões', () => {
  const f = { ...DEFAULT_FILTERS, services: [8], genres: [18] };
  expect(filtersToSearchParams(f).toString()).toBe('servicos=8&generos=18');
  expect(parseFilters(filtersToSearchParams(f))).toEqual(f);
});
it('exploreHref monta o link da grade', () => {
  expect(exploreHref({ crewId: 525 })).toBe('/explorar?diretor=525');
  expect(exploreHref({})).toBe('/explorar');
});
it('filtersToDiscoverQuery resolve o tema em keywordIds', () => {
  const t = THEMES[0];
  expect(filtersToDiscoverQuery({ ...DEFAULT_FILTERS, theme: t.slug }).keywordIds).toEqual(t.keywordIds);
});
