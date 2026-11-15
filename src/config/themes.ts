// keywordIds verificados em 2026-11-15 via /keyword/{id}
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
