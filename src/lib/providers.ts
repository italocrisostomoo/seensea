import { SERVICES } from '@/config/services';
import type { Provider, ProviderSplit, TmdbProvider } from './tmdb/types';

export function splitProviders(flatrateBR: TmdbProvider[] | undefined): ProviderSplit {
  const raw = flatrateBR ?? [];
  const mainIds = new Set<number>();
  const others: Provider[] = [];
  const otherIds = new Set<number>();

  for (const p of raw) {
    const service = SERVICES.find((s) => s.id === p.provider_id || s.aliasIds.includes(p.provider_id));
    if (service) {
      mainIds.add(service.id);
    } else if (!otherIds.has(p.provider_id)) {
      otherIds.add(p.provider_id);
      others.push({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path });
    }
  }

  const main: Provider[] = SERVICES.filter((s) => mainIds.has(s.id)).map((s) => {
    // Prefere o logo do serviço original; senão o de uma variante.
    const match =
      raw.find((p) => p.provider_id === s.id) ?? raw.find((p) => s.aliasIds.includes(p.provider_id));
    return { id: s.id, name: s.name, logoPath: match?.logo_path ?? null };
  });

  return { main, others };
}

export function availability(s: ProviderSplit): 'main' | 'other' | 'none' {
  if (s.main.length > 0) return 'main';
  if (s.others.length > 0) return 'other';
  return 'none';
}
