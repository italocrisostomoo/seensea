# Catálogo de filmes em streaming (Brasil) — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App web em Next.js que permite navegar pelos filmes disponíveis agora nos streamings por assinatura do Brasil, usando a API do TMDB.

**Architecture:** Um único projeto Next.js (App Router). Toda chamada ao TMDB acontece no servidor, por um módulo isolado `src/lib/tmdb/`. As páginas são server components. A única parte que busca dados no navegador é a rolagem infinita de `/explorar`, que chama uma rota própria (`/api/discover`) via TanStack Query. A configuração curada (serviços e temas) fica em `src/config/`. As tarefas seguem a ordem das aulas do curso: cada uma termina com algo visível na tela.

**Tech Stack:** Next.js 16.4.6 (App Router, Turbopack), React, TypeScript, Tailwind CSS (o que vier com create-next-app), Vitest, TanStack Query v5 (só a partir da Tarefa 6), deploy na Vercel. Node 24 e npm.

**Spec:** `docs/superpowers/specs/2026-11-15-catalogo-filmes-design.md`. Leia o spec antes de começar qualquer tarefa.

## Pré-requisitos (com o autor, antes da Tarefa 1)

- Conta no TMDB e o **API Read Access Token** (em themoviedb.org → Configurações → API). O autor cola o token em `.env.local` como `TMDB_READ_TOKEN=...`. Nunca coloque o token num commit nem neste plano.
- Sem o token, os testes (que usam `fetch` falso) passam, mas nenhuma tela funciona.

## Global Constraints

- Todo discover leva `watch_region=BR`, `with_watch_monetization_types=flatrate`, `language=pt-BR` e `include_adult=false`.
- Todas as chamadas ao TMDB levam `language=pt-BR`; a busca leva também `region=BR` e `include_adult=false`.
- Token só no servidor: `process.env.TMDB_READ_TOKEN`, enviado como `Authorization: Bearer <token>`. `src/lib/tmdb/client.ts` começa com `import 'server-only'`. Nenhum componente `'use client'` importa valores de `src/lib/tmdb/`. Módulos usados no cliente (ex.: `src/lib/filters.ts`) só importam **tipos** de lá, com `import type`, para que o `server-only` não entre no bundle do navegador.
- Nunca usar `/movie/{id}/recommendations`.
- Página máxima do discover: 500. `totalPages` exposto ao app = `min(total_pages, 500)`.
- Ordenação "nota" sempre com `vote_count.gte=200`.
- Imagens só de `https://image.tmdb.org/t/p/<tamanho><path>`, via `next/image` (com `remotePatterns` configurado).
- Sem botão "quero assistir". `MovieCard` tem um slot `footer?: ReactNode`, que será o lugar da ação futura.
- Interface 100% em pt-BR. Textos fixos (usar exatamente estes):
  - `Assista em:`
  - `Também em:`
  - `Não disponível em streaming no Brasil no momento` (página do filme)
  - `Não disponível em streaming no Brasil` (cards da busca)
  - `Sinopse indisponível em português.`
  - `Dados de disponibilidade: JustWatch`
  - `This product uses the TMDB API but is not endorsed or certified by TMDB.` (rodapé, junto do logo ou do nome TMDB com link para themoviedb.org)
- Visual escuro, estilo streaming, com Tailwind; layout responsivo (celular incluído).
- Uma biblioteca nova só entra na tarefa que precisa dela.
- Mensagens de commit: `tipo: descrição em português` (ex.: `feat: página do filme`), terminando com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Parâmetros de URL inválidos** (`/explorar?servicos=abc,999&ordem=xyz&tema=inexistente&ator=-3`): devem ser ignorados e virar o padrão, sem erro. Teste em `parseFilters` (Tarefa 4).
2. **ID de filme inválido ou inexistente** (`/filme/abc`, `/filme/0`, `/filme/999999999`): mostra a página 404 "Filme não encontrado", não um erro 500. Testes de `parseMovieId` e de `getMovie` retornando `null` no 404 (Tarefa 3).
3. **Dados faltando no TMDB** (`poster_path: null`, `release_date: ""`, `overview: ""`, `profile_path: null`, filme sem gêneros): o app mostra placeholder, ano em branco, o texto de sinopse indisponível, e não monta a prateleira de gênero. Testes de mapeamento (Tarefas 1 e 3) e de `relatedShelves` (Tarefa 8).
4. **Fim da rolagem infinita** (`total_pages: 0`, `1` ou `> 500`): a grade para de pedir páginas no ponto certo e nunca pede a página 501. Teste de `getNextPageParam` (Tarefa 6) e do limite em `discoverMovies` (Tarefa 1).
5. **Busca vazia ou com caracteres especiais** (`/buscar?q=%20%20`, `q=amélie & co`): uma busca em branco não chama o TMDB e mostra "Digite o nome de um filme."; o texto especial vai codificado corretamente. Testes de `searchMovies` (Tarefa 9).

---

## Mapa de arquivos

```
src/
  config/services.ts        serviços principais (id, nome, slug, aliasIds)
  config/themes.ts          temas curados (slug, nome, keywordIds)
  lib/tmdb/client.ts        tmdbFetch + TmdbError + tempos de cache (server-only)
  lib/tmdb/types.ts         tipos crus do TMDB + tipos do app (MovieSummary, MovieDetails, ...)
  lib/tmdb/mappers.ts       conversão cru → app (toMovieSummary, ...)
  lib/tmdb/discover.ts      buildDiscoverParams, discoverMovies
  lib/tmdb/movie.ts         getMovie, getMovieProviders, getPerson, getGenres
  lib/tmdb/search.ts        searchMovies
  lib/images.ts             tmdbImage
  lib/providers.ts          splitProviders, availability
  lib/themes.ts             findTheme, themesForMovie
  lib/filters.ts            Filters, parseFilters, filtersToSearchParams, filtersToDiscoverQuery, exploreHref
  lib/pagination.ts         getNextPageParam
  lib/related.ts            relatedShelves
  lib/trailer.ts            pickTrailer
  components/               Header, Footer, SearchBar, MovieCard, MovieGrid, Shelf, ServiceBadges,
                            FiltersPanel, InfiniteMovieGrid, useScrollRestoration, Trailer
  app/                      layout, page (início), filme/[id], explorar, buscar, api/discover, providers.tsx,
                            not-found, error, loading
tests/                      espelha src/lib (ex.: tests/lib/filters.test.ts)
```

---

### Task 1 (Aula 1): Projeto, cliente TMDB e grade simples na página inicial

**Files:**
- Create: projeto via create-next-app; `vitest.config.ts`; `.env.example`; `src/config/services.ts`; `src/lib/tmdb/{client,types,mappers,discover}.ts`; `src/lib/images.ts`; `src/components/{Header,Footer,MovieCard,MovieGrid}.tsx`
- Modify: `.gitignore`; `next.config.ts`; `src/app/layout.tsx`; `src/app/page.tsx`; `package.json` (script `test`)
- Test: `tests/lib/tmdb/client.test.ts`, `tests/lib/tmdb/mappers.test.ts`, `tests/lib/tmdb/discover.test.ts`, `tests/lib/images.test.ts`

**Interfaces:**
- Produces:
  - `config/services.ts`: `interface Service { id: number; name: string; slug: string; aliasIds: number[] }`, `SERVICES: Service[]` (na ordem de exibição), `MAIN_SERVICE_IDS: number[]` (os `id`s de `SERVICES`).
  - `lib/tmdb/client.ts`: `class TmdbError extends Error { status: number }`; `tmdbFetch<T>(path: string, params?: Record<string, string> | URLSearchParams, opts?: { revalidate?: number }): Promise<T>`; `REVALIDATE = { lists: 86400, discover: 21600, movie: 21600, search: 3600 }`.
  - `lib/tmdb/types.ts`: `TmdbMovieListItem` (`id, title, release_date, poster_path, backdrop_path, vote_average, genre_ids`), `TmdbPaged<T>` (`page, results, total_pages, total_results`); `MovieSummary { id: number; title: string; year: number | null; posterPath: string | null; backdropPath: string | null; rating: number }`; `MoviePage { results: MovieSummary[]; page: number; totalPages: number }`; `type SortOrder = 'popularidade' | 'nota' | 'lancamento'`.
  - `lib/tmdb/mappers.ts`: `toMovieSummary(raw: TmdbMovieListItem): MovieSummary`.
  - `lib/tmdb/discover.ts`: `interface DiscoverQuery { services?: number[]; genres?: number[]; genreMatch?: 'all' | 'any'; keywordIds?: number[]; castId?: number; crewId?: number; sort?: SortOrder; page?: number }`; `buildDiscoverParams(q: DiscoverQuery, today: string): URLSearchParams`; `discoverMovies(q: DiscoverQuery): Promise<MoviePage>`. Nesta tarefa, `buildDiscoverParams` trata só `services`, `sort: 'popularidade'` e `page`. A Tarefa 4 completa o resto.
  - `lib/images.ts`: `tmdbImage(path: string | null, size: 'w185' | 'w342' | 'w780' | 'w1280'): string | null`.
  - `components/MovieCard.tsx`: `MovieCard({ movie: MovieSummary, footer?: ReactNode })`, com link para `/filme/{id}`, pôster (ou placeholder com o título), título, ano e nota (★ com uma casa decimal, vírgula). **Sem logos de serviço.**
  - `components/MovieGrid.tsx`: `MovieGrid({ movies: MovieSummary[] })`, uma grade responsiva (2 colunas no celular, até 6 no desktop).

- [ ] **Step 1: Criar o projeto.** Pare o servidor de esboços se estiver rodando. Mova `.superpowers/` temporariamente para fora (o create-next-app recusa pastas desconhecidas), rode `npx create-next-app@16.4.6 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes` e devolva `.superpowers/` ao lugar.
  Esperado: `npm run dev` abre a página padrão do Next em `http://localhost:3000`.
- [ ] **Step 2: Configurar git e ambiente.** Acrescente ao `.gitignore`: `.superpowers/` e `.env*.local` (confira se `.env*` já não está coberto). Crie `.env.example` com `TMDB_READ_TOKEN=`. Confirme com o autor que `.env.local` existe com o token.
  Esperado: `git status` não mostra `.env.local` nem `.superpowers/`.
- [ ] **Step 3: Instalar o Vitest.** `npm i -D vitest`, script `"test": "vitest run"`. Em `vitest.config.ts`, use `environment: 'node'`, o alias `@` → `src` e o alias `server-only` → um arquivo vazio (`tests/empty.ts`), porque o pacote lança erro fora do Next.
- [ ] **Step 4: Confirmar os IDs dos serviços** com `curl -s -H "Authorization: Bearer $TMDB_READ_TOKEN" "https://api.themoviedb.org/3/watch/providers/movie?watch_region=BR&language=pt-BR"`. Preencha `SERVICES` com Netflix, Prime Video, Disney+, Max, Apple TV+, Globoplay e Paramount+, nessa ordem. IDs prováveis: 8, 119, 337, 1899, 350, 307 e 531. Em `aliasIds`, coloque variantes do mesmo serviço que aparecem no BR (ex.: "Netflix Standard with Ads", "Amazon Prime Video with Ads"). Anote no topo do arquivo, como comentário, a data da verificação.
- [ ] **Step 5: Escrever os testes que falham.**

```ts
// tests/lib/tmdb/client.test.ts
it('envia o token como Bearer e monta a URL com os parâmetros', async () => {
  vi.stubEnv('TMDB_READ_TOKEN', 'tok');
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: 1 })));
  vi.stubGlobal('fetch', fetchMock);
  await tmdbFetch('/discover/movie', { page: '2' }, { revalidate: 60 });
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe('https://api.themoviedb.org/3/discover/movie?page=2');
  expect(init.headers.Authorization).toBe('Bearer tok');
  expect(init.next).toEqual({ revalidate: 60 });
});
it('lança TmdbError com o status quando a resposta não é ok', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('x', { status: 404 })));
  await expect(tmdbFetch('/movie/1')).rejects.toMatchObject({ name: 'TmdbError', status: 404 });
});
it('lança erro claro quando TMDB_READ_TOKEN não está definido', async () => {
  vi.stubEnv('TMDB_READ_TOKEN', '');
  await expect(tmdbFetch('/x')).rejects.toThrow(/TMDB_READ_TOKEN/);
});

// tests/lib/tmdb/mappers.test.ts
it('converte o item cru, com ano e nota de uma casa', () => {
  expect(toMovieSummary({ id: 1, title: 'A', release_date: '2014-11-06', poster_path: '/p.jpg',
    backdrop_path: null, vote_average: 8.437, genre_ids: [] }))
    .toEqual({ id: 1, title: 'A', year: 2014, posterPath: '/p.jpg', backdropPath: null, rating: 8.4 });
});
it('ano é null quando release_date vem vazio', () => {
  expect(toMovieSummary({ ...base, release_date: '' }).year).toBeNull();
});

// tests/lib/images.test.ts
it('monta a URL da imagem', () => expect(tmdbImage('/a.jpg', 'w342')).toBe('https://image.tmdb.org/t/p/w342/a.jpg'));
it('retorna null sem path', () => expect(tmdbImage(null, 'w342')).toBeNull());

// tests/lib/tmdb/discover.test.ts
it('aplica os parâmetros fixos e todos os serviços principais com OU', () => {
  const p = buildDiscoverParams({}, '2026-11-15');
  expect(p.get('watch_region')).toBe('BR');
  expect(p.get('with_watch_monetization_types')).toBe('flatrate');
  expect(p.get('language')).toBe('pt-BR');
  expect(p.get('include_adult')).toBe('false');
  expect(p.get('with_watch_providers')).toBe(MAIN_SERVICE_IDS.join('|'));
  expect(p.get('sort_by')).toBe('popularity.desc');
  expect(p.get('page')).toBe('1');
});
it('usa só os serviços escolhidos quando há filtro', () => {
  expect(buildDiscoverParams({ services: [8, 119] }, '2026-11-15').get('with_watch_providers')).toBe('8|119');
});
it('discoverMovies limita totalPages a 500', async () => {
  // fetch falso devolvendo { page: 1, results: [], total_pages: 812, total_results: 16240 }
  expect((await discoverMovies({})).totalPages).toBe(500);
});
```

- [ ] **Step 6: Rodar** `npm test`. Esperado: FAIL (módulos não existem).
- [ ] **Step 7: Implementar** `services.ts`, `client.ts`, `types.ts`, `mappers.ts`, `images.ts` e `discover.ts` conforme as Interfaces. `discoverMovies` chama `buildDiscoverParams(q, hoje em ISO yyyy-mm-dd)` e usa `REVALIDATE.discover`.
- [ ] **Step 8: Rodar** `npm test`. Esperado: PASS.
- [ ] **Step 9: Montar a tela.**
  - `next.config.ts`: `images.remotePatterns` para `https://image.tmdb.org/t/p/**`.
  - `layout.tsx`: `lang="pt-BR"`, fundo escuro, `Header` (logo "🎬 Catálogo" com link para `/`) e `Footer` (aviso do TMDB, texto exato das Global Constraints).
  - `page.tsx` (temporário até a Tarefa 7): título "Disponíveis no streaming" + `MovieGrid` com `discoverMovies({})`.
  - Metadata do site: `title: { default: 'Catálogo', template: '%s · Catálogo' }`.
- [ ] **Step 10: Verificar.** `npm run lint && npm run build` sem erros. Com `npm run dev`, `/` mostra cerca de 20 pôsteres reais com título, ano e nota, além do aviso do TMDB no rodapé. Clicar num card leva a `/filme/{id}`, que ainda dá 404, o que é esperado nesta etapa.
- [ ] **Step 11: Commit.**

```bash
git add -A
git commit -m "feat: projeto Next.js com cliente TMDB e grade de filmes disponíveis"
```

---

### Task 2 (Aula 1, final): Publicar na Vercel, feito junto com o autor

Esta tarefa usa as contas do autor. Quem executa é a sessão principal, guiando o autor passo a passo. Não é um subagente.

- [ ] **Step 1:** Com o autor, criar um repositório no GitHub (público, para o portfólio) e conectar: `git remote add origin <url>` e `git push -u origin main`. Antes do push, confirme que `git ls-files` não lista `.env.local`.
- [ ] **Step 2:** Com o autor, importar o repositório na Vercel e definir a variável de ambiente `TMDB_READ_TOKEN` em Production e Preview.
- [ ] **Step 3: Verificar.** A URL pública da Vercel mostra a mesma grade do Step 10 da Tarefa 1. Anote a URL no README.

---

### Task 3 (Aula 2): Página do filme

**Files:**
- Create: `src/lib/tmdb/movie.ts`; `src/lib/providers.ts`; `src/components/ServiceBadges.tsx`; `src/app/filme/[id]/page.tsx`; `src/app/not-found.tsx`
- Modify: `src/lib/tmdb/types.ts`; `src/lib/tmdb/mappers.ts`
- Test: `tests/lib/providers.test.ts`, `tests/lib/tmdb/movie.test.ts`

**Interfaces:**
- Consumes: `tmdbFetch`, `TmdbError`, `REVALIDATE`, `SERVICES`, `tmdbImage`.
- Produces:
  - `types.ts`: `TmdbProvider { provider_id: number; provider_name: string; logo_path: string | null }` (formato cru); `Provider { id: number; name: string; logoPath: string | null }`; `ProviderSplit { main: Provider[]; others: Provider[] }`; `Person { id: number; name: string; profilePath: string | null }`; `MovieDetails { id; title; year: number | null; runtime: number | null; rating: number; overview: string | null; posterPath; backdropPath; genres: { id: number; name: string }[]; keywordIds: number[]; directors: Person[]; cast: Person[]; providers: ProviderSplit }`. O elenco são os 10 primeiros por `order`; os diretores são os membros de `crew` com `job === 'Director'`.
  - `lib/providers.ts`: `splitProviders(flatrateBR: TmdbProvider[] | undefined): ProviderSplit`. Variantes listadas em `aliasIds` viram o serviço principal correspondente (com o `name` do config). Duplicados são removidos. `main` segue a ordem de `SERVICES`. `availability(s: ProviderSplit): 'main' | 'other' | 'none'`.
  - `lib/tmdb/movie.ts`: `parseMovieId(raw: string): number | null`; `getMovie(id: number): Promise<MovieDetails | null>` (`null` quando o TMDB responde 404; outros erros propagam); `getMovieProviders(id: number): Promise<ProviderSplit>`.
  - `components/ServiceBadges.tsx`: `ServiceBadges({ providers: ProviderSplit, variant: 'page' | 'card' })`, com os logos de `main` após "Assista em:", os de `others` após "Também em:", e o texto de indisponível adequado a cada variante quando os dois estão vazios. Na variante `page`, mostra a linha "Dados de disponibilidade: JustWatch".

- [ ] **Step 1: Escrever os testes que falham.**

```ts
// tests/lib/providers.test.ts
it('separa principais e outros, na ordem do config', () => {
  const s = splitProviders([p(119, 'Amazon Prime Video'), p(11, 'MUBI'), p(8, 'Netflix')]);
  expect(s.main.map(x => x.id)).toEqual([8, 119]);
  expect(s.others.map(x => x.name)).toEqual(['MUBI']);
});
it('variante com anúncios vira o serviço principal, sem duplicar', () => {
  const netflixAlias = SERVICES.find(s => s.id === 8)!.aliasIds[0];
  const s = splitProviders([p(8, 'Netflix'), p(netflixAlias, 'Netflix Standard with Ads')]);
  expect(s.main).toHaveLength(1);
  expect(s.others).toHaveLength(0);
});
it('availability', () => {
  expect(availability({ main: [], others: [] })).toBe('none');
  expect(availability({ main: [], others: [x] })).toBe('other');
});
it('undefined (filme sem nada no BR) vira listas vazias', () =>
  expect(splitProviders(undefined)).toEqual({ main: [], others: [] }));

// tests/lib/tmdb/movie.test.ts
it.each([['abc', null], ['0', null], ['-5', null], ['12.5', null], ['157336', 157336]])(
  'parseMovieId(%s) = %s', (raw, out) => expect(parseMovieId(raw)).toBe(out));
it('getMovie retorna null quando o TMDB responde 404', async () => { /* fetch 404 */
  expect(await getMovie(999999999)).toBeNull(); });
it('getMovie pede append_to_response=credits,keywords,watch/providers em pt-BR', async () => { /* checa URL */ });
it('getMovie mapeia: overview vazio vira null, diretores por job, elenco ≤ 10, providers do BR', async () => {
  // fixture com overview '', crew [{job:'Director'},{job:'Writer'}], 15 no cast, watch/providers.results.BR.flatrate
});
```

- [ ] **Step 2: Rodar** `npm test`. Esperado: FAIL.
- [ ] **Step 3: Implementar** `providers.ts` e `movie.ts` conforme as Interfaces, usando `REVALIDATE.movie`.
- [ ] **Step 4: Rodar** `npm test`. Esperado: PASS.
- [ ] **Step 5: Montar a página** `app/filme/[id]/page.tsx`.
  - `params` é uma Promise no Next 16. Para ID inválido ou `getMovie` retornando `null`, chamar `notFound()`.
  - Layout como no spec 5.3: fundo com o backdrop, pôster, título, "ano · duração (ex.: 2h49) · ★ nota · gêneros", a sinopse ou `Sinopse indisponível em português.`, `ServiceBadges variant="page"`, diretor(es) e uma fileira de elenco com foto ou placeholder.
  - Nesta tarefa, gêneros, temas e pessoas ainda **não** são links (isso vem na Tarefa 8).
  - `generateMetadata` com título do filme, descrição (sinopse) e `openGraph.images` (backdrop `w1280`), para o link compartilhado ter prévia.
  - `app/not-found.tsx`: "Filme não encontrado", com link para o início.
- [ ] **Step 6: Verificar.** `npm run lint && npm run build`. Em `npm run dev`:
  - um card da grade abre a página do filme com dados reais;
  - `/filme/abc` e `/filme/999999999` mostram "Filme não encontrado";
  - um filme que só está na MUBI mostra "Também em:".
- [ ] **Step 7: Commit** `feat: página do filme com serviços e elenco`.

---

### Task 4 (Aula 3, parte 1): Filtros ↔ URL ↔ discover

**Files:**
- Create: `src/config/themes.ts`; `src/lib/themes.ts`; `src/lib/filters.ts`
- Modify: `src/lib/tmdb/discover.ts` (completar `buildDiscoverParams`)
- Test: `tests/lib/filters.test.ts`, `tests/lib/themes.test.ts`, `tests/lib/tmdb/discover.test.ts`

**Interfaces:**
- Consumes: `DiscoverQuery`, `buildDiscoverParams`, `MAIN_SERVICE_IDS`, `SortOrder`.
- Produces:
  - `config/themes.ts`: `interface Theme { slug: string; name: string; keywordIds: number[] }`, `THEMES: Theme[]`. Nesta tarefa, só os três aprovados: `viagem-no-tempo` "Viagem no tempo", `historias-reais` "Histórias reais", `golpes-e-assaltos` "Golpes e assaltos". Confirme os IDs com `/search/keyword?query=time travel` (e `based on true story`, `heist`) e anote a data.
  - `lib/themes.ts`: `findTheme(slug: string): Theme | undefined`; `themesForMovie(keywordIds: number[]): Theme[]` (na ordem de `THEMES`).
  - `lib/filters.ts`: `interface Filters { services: number[]; genres: number[]; theme: string | null; castId: number | null; crewId: number | null; sort: SortOrder }`; `DEFAULT_FILTERS`; `parseFilters(sp: URLSearchParams): Filters`; `filtersToSearchParams(f: Filters): URLSearchParams`; `filtersToDiscoverQuery(f: Filters): DiscoverQuery`; `exploreHref(partial: Partial<Filters>): string`.
  - Nomes dos parâmetros na URL: `servicos` (IDs separados por vírgula), `generos` (IDs separados por vírgula), `tema` (slug), `ator` (ID), `diretor` (ID), `ordem` (`popularidade` | `nota` | `lancamento`; o padrão é omitido).

- [ ] **Step 1: Escrever os testes que falham.**

```ts
// tests/lib/filters.test.ts
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

// tests/lib/themes.test.ts
it('themesForMovie devolve só temas curados, na ordem do config', () => {
  const ids = [999999, ...THEMES[1].keywordIds, ...THEMES[0].keywordIds];
  expect(themesForMovie(ids).map(t => t.slug)).toEqual([THEMES[0].slug, THEMES[1].slug]);
});

// tests/lib/tmdb/discover.test.ts (novos)
it('gêneros: E por padrão (vírgula), OU com genreMatch any (barra)', () => {
  expect(buildDiscoverParams({ genres: [18, 878] }, D).get('with_genres')).toBe('18,878');
  expect(buildDiscoverParams({ genres: [18, 878], genreMatch: 'any' }, D).get('with_genres')).toBe('18|878');
});
it('keywords com OU, ator e diretor', () => {
  const p = buildDiscoverParams({ keywordIds: [1, 2], castId: 3, crewId: 4 }, D);
  expect([p.get('with_keywords'), p.get('with_cast'), p.get('with_crew')]).toEqual(['1|2', '3', '4']);
});
it('ordem nota exige mínimo de votos', () => {
  const p = buildDiscoverParams({ sort: 'nota' }, D);
  expect([p.get('sort_by'), p.get('vote_count.gte')]).toEqual(['vote_average.desc', '200']);
});
it('ordem lançamento não traz datas futuras', () => {
  const p = buildDiscoverParams({ sort: 'lancamento' }, '2026-11-15');
  expect([p.get('sort_by'), p.get('primary_release_date.lte')]).toEqual(['primary_release_date.desc', '2026-11-15']);
});
it('página é limitada a 1..500', () => {
  expect(buildDiscoverParams({ page: 900 }, D).get('page')).toBe('500');
});
```

- [ ] **Step 2: Rodar** `npm test`. Esperado: FAIL.
- [ ] **Step 3: Implementar** `themes.ts` (config e lib), `filters.ts` e o restante de `buildDiscoverParams`. `parseFilters` aceita em `servicos` só IDs de `MAIN_SERVICE_IDS`. Em `generos`, `ator` e `diretor`, aceita só inteiros positivos. Em `tema`, só um slug existente.
- [ ] **Step 4: Rodar** `npm test`. Esperado: PASS.
- [ ] **Step 5: Commit** `feat: filtros na URL e discover completo`.

---

### Task 5 (Aula 3, parte 2): Página `/explorar` com filtros

**Files:**
- Create: `src/app/explorar/page.tsx`; `src/components/FiltersPanel.tsx` (`'use client'`)
- Modify: `src/lib/tmdb/movie.ts` (adicionar `getGenres` e `getPerson`)
- Test: `tests/lib/tmdb/movie.test.ts`

**Interfaces:**
- Consumes: `parseFilters`, `filtersToSearchParams`, `filtersToDiscoverQuery`, `discoverMovies`, `THEMES`, `SERVICES`, `MovieGrid`.
- Produces:
  - `getGenres(): Promise<{ id: number; name: string }[]>` (`/genre/movie/list`, `REVALIDATE.lists`);
  - `getPerson(id: number): Promise<{ id: number; name: string } | null>` (`null` no 404);
  - `FiltersPanel({ filters: Filters, genres: { id: number; name: string }[], personName: string | null })`.

- [ ] **Step 1: Teste que falha.** `getPerson` retorna `null` no 404 e `{ id, name }` no 200; `getGenres` devolve `genres` da resposta.
- [ ] **Step 2:** Rodar (FAIL), implementar, rodar (PASS).
- [ ] **Step 3: Montar a página.**
  - `explorar/page.tsx`: lê `searchParams` (uma Promise no Next 16) e converte para `URLSearchParams`. Busca, em paralelo, `getGenres()`, `discoverMovies(filtersToDiscoverQuery(f))` e, se houver `castId` ou `crewId`, `getPerson`. Renderiza `FiltersPanel` + `MovieGrid` (só a página 1; a rolagem infinita vem na Tarefa 6).
  - `FiltersPanel`:
    - botões alternáveis de serviço (nomes de `SERVICES`) e de gênero;
    - um seletor de tema com "Todos os temas" + `THEMES`;
    - um seletor de ordem (Popularidade, Nota, Lançamento);
    - a pessoa ativa como etiqueta removível ("Com: Nome ✕");
    - cada mudança faz `router.push('/explorar?' + filtersToSearchParams(novo))`.
  - Grade sem resultados: "Nenhum filme encontrado com esses filtros." + botão "Limpar filtros" (link para `/explorar`).
  - `generateMetadata`: título "Explorar".
  - No celular, os filtros cabem numa área rolável ou recolhível acima da grade.
  - No `Header`, adicionar o link "Explorar".
- [ ] **Step 4: Verificar.** `npm run lint && npm run build`. Em `npm run dev`:
  - marcar "Netflix" e "Drama" atualiza a URL (`?servicos=8&generos=18`) e a grade;
  - recarregar a página mantém os filtros;
  - `/explorar?ator=<id real>` mostra a etiqueta com o nome;
  - `/explorar?servicos=abc&ordem=xyz` abre sem erro, com os padrões.
- [ ] **Step 5: Commit** `feat: página explorar com filtros`.

---

### Task 6 (Aula 4): Rolagem infinita e "voltar" restaurando a posição

**Files:**
- Create: `src/lib/pagination.ts`; `src/app/api/discover/route.ts`; `src/app/providers.tsx` (`'use client'`); `src/components/InfiniteMovieGrid.tsx` (`'use client'`); `src/components/useScrollRestoration.ts`
- Modify: `src/app/layout.tsx` (envolver com `Providers`); `src/app/explorar/page.tsx` (trocar `MovieGrid` por `InfiniteMovieGrid`)
- Test: `tests/lib/pagination.test.ts`, `tests/app/api/discover.test.ts`

**Interfaces:**
- Consumes: `parseFilters`, `filtersToDiscoverQuery`, `filtersToSearchParams`, `discoverMovies`, `MoviePage`, `MovieGrid`/`MovieCard`.
- Produces:
  - `getNextPageParam(last: MoviePage): number | undefined`;
  - `GET /api/discover?<mesmos parâmetros de /explorar>&pagina=N` → `MoviePage` em JSON. Responde 400 se `pagina` não for um inteiro de 1 a 500, e 502 com `{ error: 'tmdb' }` se o TMDB falhar;
  - `InfiniteMovieGrid({ filters: Filters, initialPage: MoviePage })`;
  - `useScrollRestoration(key: string, ready: boolean): void`.

- [ ] **Step 1: Testes que falham.**

```ts
// tests/lib/pagination.test.ts
it.each([
  [{ page: 1, totalPages: 3 }, 2],
  [{ page: 3, totalPages: 3 }, undefined],
  [{ page: 1, totalPages: 0 }, undefined],
  [{ page: 500, totalPages: 500 }, undefined],
])('getNextPageParam(%o) = %s', (last, next) =>
  expect(getNextPageParam({ results: [], ...last })).toBe(next));

// tests/app/api/discover.test.ts (importa GET da rota; discoverMovies mockado com vi.mock)
it('repassa filtros e página para o discover', async () => {
  await GET(new Request('http://x/api/discover?servicos=8&pagina=3'));
  expect(discoverMovies).toHaveBeenCalledWith(expect.objectContaining({ services: [8], page: 3 }));
});
it('400 para página inválida', async () => {
  expect((await GET(new Request('http://x/api/discover?pagina=0'))).status).toBe(400);
  expect((await GET(new Request('http://x/api/discover?pagina=501'))).status).toBe(400);
});
it('502 quando o TMDB falha', async () => { /* discoverMovies rejeita com TmdbError */ });
```

- [ ] **Step 2:** Rodar (FAIL). `npm i @tanstack/react-query`. Implementar `pagination.ts` e a rota. Rodar (PASS).
- [ ] **Step 3: Montar a rolagem infinita.**
  - `providers.tsx`: cria um único `QueryClient` (via `useState`) com `staleTime` e `gcTime` de 1 hora. Isso mantém as páginas já carregadas em memória ao ir e voltar.
  - `InfiniteMovieGrid`: usa `useInfiniteQuery` com `queryKey ['discover', filtersToSearchParams(filters).toString()]`, `initialPageParam: 1` e `initialData: { pages: [initialPage], pageParams: [1] }`. Um sentinela observado por `IntersectionObserver` chama `fetchNextPage` quando `hasNextPage`.
  - Mostrar "Carregando…" enquanto busca. No fim da lista, mostrar "Você chegou ao fim." Em caso de erro, mostrar "Não foi possível carregar mais filmes." + botão "Tentar de novo".
  - `useScrollRestoration`: grava `window.scrollY` em `sessionStorage` (`scroll:<key>`, com throttle via `requestAnimationFrame`, dentro de try/catch). Quando `ready` fica `true` pela primeira vez, restaura a posição gravada. A chave é a mesma string de filtros da `queryKey`.
- [ ] **Step 4: Verificar.** `npm run lint && npm run build`. Em `npm run dev`:
  - rolar `/explorar` até a 5ª página ou mais, abrir um filme e apertar "voltar" no navegador: a grade volta com as mesmas páginas e na mesma posição, sem saltar para o topo;
  - trocar um filtro recomeça na página 1, no topo.
- [ ] **Step 5: Commit** `feat: rolagem infinita com restauração ao voltar`.

---

### Task 7 (Aula 5): Página inicial com destaque e prateleiras de temas

**Files:**
- Create: `src/components/Shelf.tsx`; `src/components/Hero.tsx`
- Modify: `src/config/themes.ts` (completar de 8 a 12 temas); `src/app/page.tsx`

**Interfaces:**
- Consumes: `discoverMovies`, `getMovieProviders`, `THEMES`, `exploreHref`, `MovieCard`, `ServiceBadges`, `tmdbImage`.
- Produces:
  - `Shelf({ title: string; href?: string; movies: MovieSummary[] })`: uma fileira com rolagem horizontal (`overflow-x-auto` + snap), com link "ver tudo →" quando houver `href`. Não renderiza nada se `movies` estiver vazio.
  - `Hero({ movie: MovieSummary; providers: ProviderSplit })`: backdrop `w1280`, título, nota, `ServiceBadges variant="card"` (só logos), a linha "Dados de disponibilidade: JustWatch" e o botão "Ver filme".

- [ ] **Step 1: Completar os temas.** Escolha de 5 a 9 temas além dos três existentes. Critérios: ser claramente reconhecível em português e ter pelo menos 40 filmes disponíveis no BR. Confira com `discoverMovies({ keywordIds })` e veja `total_results` via curl. Use `/search/keyword` para achar os IDs. Os testes da Tarefa 4 continuam passando sem alteração.
- [ ] **Step 2: Montar a página.**
  - `page.tsx`: busca em paralelo `discoverMovies({})` e as prateleiras `THEMES.map(t => discoverMovies({ keywordIds: t.keywordIds }))`.
  - O destaque é o primeiro resultado do discover geral, com `getMovieProviders(destaque.id)`.
  - Cada prateleira mostra até 20 filmes, com `href = exploreHref({ theme: t.slug })`. Se uma prateleira falhar, ela some sem derrubar a página (`Promise.allSettled`).
  - Remover a grade temporária da Tarefa 1.
- [ ] **Step 3: Verificar.** `npm run lint && npm run build`. Em `npm run dev`:
  - `/` mostra o destaque com backdrop e logos, e de 8 a 12 prateleiras que rolam para o lado (inclusive no celular, pelo modo responsivo do DevTools);
  - "ver tudo →" abre `/explorar?tema=<slug>` com o tema já selecionado.
- [ ] **Step 4: Commit** `feat: página inicial com destaque e prateleiras de temas`.

---

### Task 8 (Aula 6): Prateleiras de parecidos e links na página do filme

**Files:**
- Create: `src/lib/related.ts`
- Modify: `src/app/filme/[id]/page.tsx`
- Test: `tests/lib/related.test.ts`

**Interfaces:**
- Consumes: `MovieDetails`, `themesForMovie`, `exploreHref`, `DiscoverQuery`, `discoverMovies`, `Shelf`.
- Produces: `interface RelatedShelf { title: string; href: string; query: DiscoverQuery }`; `relatedShelves(movie: MovieDetails): RelatedShelf[]`, na ordem tema → diretor → gênero, omitindo as que não se aplicam:
  - tema: `title: 'Mais de ' + tema.name`, `href: exploreHref({ theme })`, `query: { keywordIds }`, usando o primeiro de `themesForMovie(movie.keywordIds)`;
  - diretor: `'Mais de ' + directors[0].name`, `exploreHref({ crewId })`, `{ crewId }`;
  - gênero: `'Do mesmo gênero'`, `exploreHref({ genres: [genres[0].id] })`, `{ genres: todos os ids, genreMatch: 'any' }`.

- [ ] **Step 1: Testes que falham.**

```ts
it('ordem tema → diretor → gênero', () => {
  const m = movie({ keywordIds: THEMES[0].keywordIds, directors: [d(525, 'Diretora X')], genres: [g(18), g(878)] });
  expect(relatedShelves(m).map(s => s.title)).toEqual([`Mais de ${THEMES[0].name}`, 'Mais de Diretora X', 'Do mesmo gênero']);
  expect(relatedShelves(m)[2].query).toEqual({ genres: [18, 878], genreMatch: 'any' });
});
it('sem tema curado, sem diretor e sem gênero → lista vazia', () => {
  expect(relatedShelves(movie({ keywordIds: [999999], directors: [], genres: [] }))).toEqual([]);
});
```

- [ ] **Step 2:** Rodar (FAIL), implementar, rodar (PASS).
- [ ] **Step 3: Montar a página.**
  - Busca as prateleiras em paralelo (`Promise.allSettled`) e remove o próprio filme dos resultados. Prateleiras vazias somem (via `Shelf`).
  - Tornar links:
    - cada gênero → `exploreHref({ genres: [id] })`;
    - etiquetas de tema (só `themesForMovie`; a linha some se estiver vazia) → `exploreHref({ theme })`;
    - diretor → `exploreHref({ crewId })`;
    - cada ator → `exploreHref({ castId })`.
- [ ] **Step 4: Verificar.** `npm run lint && npm run build`. Em `npm run dev`:
  - num filme com tema curado, aparecem as três prateleiras, sem o próprio filme;
  - clicar num ator abre `/explorar?ator=<id>` com "Com: Nome";
  - num filme sem tema curado, a linha de temas não aparece e as outras prateleiras sim.
- [ ] **Step 5: Commit** `feat: prateleiras de parecidos e navegação por pessoa, gênero e tema`.

---

### Task 9 (Aula 7): Busca por nome

**Files:**
- Create: `src/lib/tmdb/search.ts`; `src/components/SearchBar.tsx` (`'use client'`); `src/app/buscar/page.tsx`
- Modify: `src/components/Header.tsx` (incluir `SearchBar`)
- Test: `tests/lib/tmdb/search.test.ts`

**Interfaces:**
- Consumes: `tmdbFetch`, `toMovieSummary`, `getMovieProviders`, `MovieCard` (`footer`), `ServiceBadges variant="card"`.
- Produces: `searchMovies(query: string, page?: number): Promise<MoviePage>`. Com `query.trim() === ''`, devolve `{ results: [], page: 1, totalPages: 0 }` **sem chamar o TMDB**. Usa `REVALIDATE.search` e limita `totalPages` a 500.

- [ ] **Step 1: Testes que falham.**

```ts
it('busca em branco não chama o TMDB', async () => {
  const f = vi.fn(); vi.stubGlobal('fetch', f);
  expect(await searchMovies('   ')).toEqual({ results: [], page: 1, totalPages: 0 });
  expect(f).not.toHaveBeenCalled();
});
it('codifica a consulta e manda os parâmetros fixos', async () => {
  await searchMovies('amélie & co', 2);
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.pathname).toBe('/3/search/movie');
  expect(Object.fromEntries(url.searchParams)).toMatchObject(
    { query: 'amélie & co', page: '2', language: 'pt-BR', region: 'BR', include_adult: 'false' });
});
```

- [ ] **Step 2:** Rodar (FAIL), implementar, rodar (PASS).
- [ ] **Step 3: Montar a busca.**
  - `SearchBar`: um campo "Buscar filme…". Ao enviar, faz `router.push('/buscar?q=' + encodeURIComponent(q))`.
  - `buscar/page.tsx`: lê `q` e `pagina` e chama `searchMovies`. Para cada resultado, chama `getMovieProviders` em paralelo (`Promise.allSettled`; se uma chamada falhar, o card fica sem a linha de serviços). Renderiza `MovieGrid` usando o `footer` do `MovieCard` com `ServiceBadges variant="card"`.
  - Sem `q`: "Digite o nome de um filme." Sem resultados: "Nenhum filme encontrado para "<q>"."
  - Links "Anterior" e "Próxima" mudam `pagina`, respeitando `totalPages`.
  - Mostrar "Dados de disponibilidade: JustWatch" abaixo dos resultados.
  - `generateMetadata`: `Busca: <q>`.
- [ ] **Step 4: Verificar.** `npm run lint && npm run build`. Em `npm run dev`:
  - buscar um filme conhecido que está na Netflix mostra o logo;
  - um filme antigo fora dos streamings mostra "Não disponível em streaming no Brasil";
  - `/buscar?q=%20` mostra "Digite o nome de um filme."
- [ ] **Step 5: Commit** `feat: busca por nome com disponibilidade`.

---

### Task 10 (Aula 8): Acabamento — trailer, carregamento, erros e responsividade

**Files:**
- Create: `src/lib/trailer.ts`; `src/components/Trailer.tsx`; `src/app/loading.tsx`; `src/app/filme/[id]/loading.tsx`; `src/app/explorar/loading.tsx`; `src/app/error.tsx` (`'use client'`); `README.md` (substituir o padrão)
- Modify: `src/lib/tmdb/types.ts` (adicionar `trailerKey: string | null` a `MovieDetails`); `src/lib/tmdb/movie.ts` (adicionar `videos` ao `append_to_response` e `include_video_language=pt,en`); `src/app/filme/[id]/page.tsx`
- Test: `tests/lib/trailer.test.ts`, `tests/lib/tmdb/movie.test.ts`

**Interfaces:**
- Produces: `pickTrailer(videos: { key: string; site: string; type: string; iso_639_1: string }[]): string | null` e `Trailer({ youtubeKey: string; title: string })`. O trailer é um embed de `https://www.youtube-nocookie.com/embed/<key>`, carregado só depois do clique numa capa com "▶ Trailer".

- [ ] **Step 1: Testes que falham.**

```ts
it('prefere trailer do YouTube em português', () =>
  expect(pickTrailer([v('en1', 'YouTube', 'Trailer', 'en'), v('pt1', 'YouTube', 'Trailer', 'pt')])).toBe('pt1'));
it('cai para inglês', () => expect(pickTrailer([v('en1', 'YouTube', 'Trailer', 'en')])).toBe('en1'));
it('ignora teaser e vídeos fora do YouTube', () =>
  expect(pickTrailer([v('a', 'Vimeo', 'Trailer', 'pt'), v('b', 'YouTube', 'Teaser', 'pt')])).toBeNull());
it('getMovie inclui videos e include_video_language=pt,en', async () => { /* checa URL e trailerKey */ });
```

- [ ] **Step 2:** Rodar (FAIL), implementar, rodar (PASS).
- [ ] **Step 3: Montar o acabamento.**
  - `Trailer` na página do filme, só quando houver `trailerKey`.
  - `loading.tsx` com skeletons: uma grade de retângulos no formato de pôster e, na página do filme, blocos no lugar do cabeçalho.
  - `error.tsx`: "Não foi possível carregar os filmes agora." + botão "Tentar de novo" (`reset`).
  - `README.md` em português: o que é o app, a URL publicada, como rodar (`.env.local` com `TMDB_READ_TOKEN`, `npm install`, `npm run dev`, `npm test`) e os créditos ao TMDB e ao JustWatch.
- [ ] **Step 4: Verificar responsividade e atribuições.** `npm run lint && npm run build && npm test`. No DevTools, a 375px de largura: sem rolagem horizontal da página; a grade com 2 colunas; prateleiras e filtros usáveis; o cabeçalho com a busca cabendo. O aviso do TMDB aparece no rodapé de todas as páginas, e "Dados de disponibilidade: JustWatch" aparece onde há logos de serviço (página do filme e busca; no destaque da início, abaixo dos logos).
- [ ] **Step 5: Commit** `feat: trailer, estados de carregamento e erro, README`. Depois, push. A Vercel publica sozinha. Confira a URL pública.
