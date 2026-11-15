// IDs verificados em 2026-11-15 via /watch/providers/movie?watch_region=BR
export interface Service {
  id: number;
  name: string;
  slug: string;
  aliasIds: number[];
}

export const SERVICES: Service[] = [
  { id: 8, name: 'Netflix', slug: 'netflix', aliasIds: [1796] },
  { id: 119, name: 'Prime Video', slug: 'prime-video', aliasIds: [2100] },
  { id: 337, name: 'Disney+', slug: 'disney-plus', aliasIds: [] },
  { id: 1899, name: 'HBO Max', slug: 'hbo-max', aliasIds: [1825] },
  { id: 350, name: 'Apple TV', slug: 'apple-tv', aliasIds: [2243] },
  { id: 307, name: 'Globoplay', slug: 'globoplay', aliasIds: [] },
  { id: 531, name: 'Paramount+', slug: 'paramount-plus', aliasIds: [2303, 582] },
];

export const MAIN_SERVICE_IDS: number[] = SERVICES.map((s) => s.id);
