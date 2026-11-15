import { expect, it } from 'vitest';
import { SERVICES } from '@/config/services';
import { availability, splitProviders } from '@/lib/providers';
import type { TmdbProvider } from '@/lib/tmdb/types';

const p = (provider_id: number, provider_name: string): TmdbProvider => ({
  provider_id,
  provider_name,
  logo_path: null,
});
const x = { id: 11, name: 'MUBI', logoPath: null };

it('separa principais e outros, na ordem do config', () => {
  const s = splitProviders([p(119, 'Amazon Prime Video'), p(11, 'MUBI'), p(8, 'Netflix')]);
  expect(s.main.map((m) => m.id)).toEqual([8, 119]);
  expect(s.others.map((m) => m.name)).toEqual(['MUBI']);
});
it('variante com anúncios vira o serviço principal, sem duplicar', () => {
  const netflixAlias = SERVICES.find((s) => s.id === 8)!.aliasIds[0];
  const s = splitProviders([p(8, 'Netflix'), p(netflixAlias, 'Netflix Standard with Ads')]);
  expect(s.main).toHaveLength(1);
  expect(s.others).toHaveLength(0);
});
it('variante sozinha vira o serviço principal com o nome do config', () => {
  const netflixAlias = SERVICES.find((s) => s.id === 8)!.aliasIds[0];
  const s = splitProviders([p(netflixAlias, 'Netflix Standard with Ads')]);
  expect(s.main).toEqual([{ id: 8, name: 'Netflix', logoPath: null }]);
});
it('availability', () => {
  expect(availability({ main: [], others: [] })).toBe('none');
  expect(availability({ main: [], others: [x] })).toBe('other');
  expect(availability({ main: [{ id: 8, name: 'Netflix', logoPath: null }], others: [] })).toBe('main');
});
it('undefined (filme sem nada no BR) vira listas vazias', () =>
  expect(splitProviders(undefined)).toEqual({ main: [], others: [] }));
