// keywordIds verificados em 2026-11-15 via /keyword/{id} e /discover/movie (BR, flatrate, total_results >= 40):
// 4379 time travel (102) · 9672 based on true story (519) · 10051 heist (78)
// 9715 superhero (234) · 4565 dystopia (134) · 10714 serial killer (136) · 9748 revenge (230)
// 7312 road trip (88) · 12377 zombie (75) · 3133 vampire (60)
export interface Theme {
  slug: string;
  name: string;
  keywordIds: number[];
}

export const THEMES: Theme[] = [
  { slug: 'viagem-no-tempo', name: 'Viagem no tempo', keywordIds: [4379] },
  { slug: 'historias-reais', name: 'Histórias reais', keywordIds: [9672] },
  { slug: 'golpes-e-assaltos', name: 'Golpes e assaltos', keywordIds: [10051] },
  { slug: 'super-herois', name: 'Super-heróis', keywordIds: [9715] },
  { slug: 'distopia', name: 'Distopia', keywordIds: [4565] },
  { slug: 'assassinos-em-serie', name: 'Assassinos em série', keywordIds: [10714] },
  { slug: 'vinganca', name: 'Vingança', keywordIds: [9748] },
  { slug: 'viagem-de-carro', name: 'Viagem de carro', keywordIds: [7312] },
  { slug: 'zumbis', name: 'Zumbis', keywordIds: [12377] },
  { slug: 'vampiros', name: 'Vampiros', keywordIds: [3133] },
];
