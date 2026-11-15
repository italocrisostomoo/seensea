// IDs dos serviços PENDENTES de verificação contra
// /watch/providers/movie?watch_region=BR (aguardando o token do TMDB).
// Verificar e preencher aliasIds (ex.: "Netflix Standard with Ads") assim que houver token.
// Os aliasIds provisórios (Netflix 1796, Prime Video 2100) também estão PENDENTES de verificação.
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
  { id: 1899, name: 'Max', slug: 'max', aliasIds: [] },
  { id: 350, name: 'Apple TV+', slug: 'apple-tv-plus', aliasIds: [] },
  { id: 307, name: 'Globoplay', slug: 'globoplay', aliasIds: [] },
  { id: 531, name: 'Paramount+', slug: 'paramount-plus', aliasIds: [] },
];

export const MAIN_SERVICE_IDS: number[] = SERVICES.map((s) => s.id);
