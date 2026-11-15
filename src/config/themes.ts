// Os keywordIds abaixo são PROVÁVEIS e estão PENDENTES de verificação contra
// /search/keyword (aguardando o token do TMDB). Confirmar e anotar a data da verificação:
// "time travel", "based on true story", "heist".
export interface Theme {
  slug: string;
  name: string;
  keywordIds: number[];
}

export const THEMES: Theme[] = [
  { slug: 'viagem-no-tempo', name: 'Viagem no tempo', keywordIds: [4379] },
  { slug: 'historias-reais', name: 'Histórias reais', keywordIds: [9672] },
  { slug: 'golpes-e-assaltos', name: 'Golpes e assaltos', keywordIds: [10051] },
];
