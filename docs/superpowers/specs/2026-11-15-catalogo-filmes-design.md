# Catálogo de filmes em streaming (Brasil) — Design

Data: 2026-11-15
Status: aprovado pelo autor (2026-11-15)

## 1. Intenção e porquê

Um app web que mostra os filmes disponíveis **agora** nos serviços de streaming por assinatura do Brasil, usando a API do TMDB.

É um projeto para um curso (gravado) e para o portfólio do autor. Ou seja:

- precisa estar publicado num link e funcionar bem numa demonstração;
- precisa mostrar boas decisões técnicas a quem avalia o portfólio;
- **não** precisa aguentar escala de produto nem cobrir todos os casos-limite.

A pessoa que usa o app quer **descobrir filmes**: navegar de forma fluida entre filmes que conhece e outros que não conhece, explorar por assunto e ir de um filme para outro sem esbarrar em becos sem saída. Numa etapa futura, ela vai poder salvar filmes numa lista "quero assistir".

## 2. Objetivos, não-objetivos e anti-objetivos

**Objetivos (v1)**
- Página inicial com prateleiras por tema escolhido a dedo e um filme em destaque.
- Grade com filtros (serviço, gênero, tema) e ordenação.
- Página própria para cada filme, com caminhos para outros filmes.
- Busca por nome.
- Publicado na Vercel com um link público.

**Não-objetivos (v1)**
- Lista "quero assistir": **nenhum botão nesta versão**. Ela vem junto com o banco de dados, numa etapa posterior.
- Banco de dados, contas de usuário e login.
- Séries (só filmes).
- Outros países além do Brasil.
- Aluguel e compra (só streaming por assinatura).
- "O que chegou ao serviço esta semana": o TMDB não informa desde quando um filme está num serviço.

**Anti-objetivos (coisas que tornariam o app um fracasso mesmo funcionando)**
- Exibir, na navegação, filmes que a pessoa não consegue assistir em streaming no Brasil. A única exceção é a busca por nome (ver 5.4), onde o filme aparece marcado como indisponível.
- Expor a chave do TMDB no navegador.
- Links que não podem ser compartilhados, ou um botão "voltar" que perde o estado da navegação.

## 3. Restrições

- **Fonte de dados:** API do TMDB v3. Os dados de disponibilidade ("watch providers") vêm do JustWatch, repassados pelo TMDB.
- **Atribuição obrigatória:** exibir o crédito ao JustWatch onde aparecem os serviços, e ao TMDB (logo + aviso "This product uses the TMDB API but is not endorsed or certified by TMDB") no rodapé ou numa página "Sobre".
- **Região fixa:** `watch_region=BR` e `language=pt-BR` em todas as chamadas.
- **Limite do discover:** no máximo 500 páginas (cerca de 10 mil filmes) por combinação de filtros. É suficiente para navegação e serve como limite natural da rolagem infinita.
- **A busca por nome (`/search/movie`) não filtra por serviço:** a disponibilidade precisa ser consultada filme a filme.
- **A lista de recomendações do TMDB (`/movie/{id}/recommendations`) não filtra por serviço:** por isso não será usada (ver 5.3).
- **A chave do TMDB fica só no servidor:** Read Access Token numa variável de ambiente (ex.: `TMDB_READ_TOKEN`), enviado como `Authorization: Bearer`. Nenhuma chamada ao TMDB sai do navegador.

## 4. Abordagens consideradas

| Abordagem | Prós | Contras |
|---|---|---|
| **Next.js (App Router), projeto único — ESCOLHIDA** | Páginas geradas no servidor (links compartilháveis e indexáveis); chave escondida sem servidor separado; o banco entra depois no mesmo projeto; deploy na Vercel com um clique | Mais conceitos (componentes de servidor e de cliente) |
| React (Vite) + servidor Node/Express separado | Separação front/back bem visível e didática | Dois projetos para publicar; páginas montadas no navegador, então links de filme sem prévia e com SEO fraco |
| Astro + React nas partes interativas | Muito rápido, páginas prontas no servidor | A grade com filtros e a rolagem infinita, a parte mais interativa, dão mais trabalho; menos reconhecido em vagas |
| React chamando o TMDB direto do navegador | O mais simples | Chave exposta, o que é inaceitável no portfólio (descartada logo de início) |

**Escolhida pelo autor:** Next.js, porque a página própria de cada filme (decisão de produto, ver 5.3) depende de renderização no servidor, e porque o banco de dados futuro cabe no mesmo projeto.

## 5. O produto, tela por tela

### 5.1 Definição de "disponível em streaming"

Um filme conta como disponível se aparece com monetização `flatrate` (assinatura) em `watch_region=BR`, em pelo menos um dos **serviços principais** do app.

*Decisão de quem escreveu este documento:* o app trabalha com uma lista curada dos serviços principais no Brasil (ex.: Netflix, Prime Video, Disney+, Max, Apple TV+, Globoplay, Paramount+), com os IDs confirmados via `/watch/providers/movie?watch_region=BR`. Motivo: o TMDB lista dezenas de serviços nichados e com variantes (ex.: "Netflix basic with Ads"), o que poluiria os filtros. A lista pode mudar facilmente num arquivo de configuração.

**Serviços fora da lista curada** (ex.: MUBI): eles não entram nos filtros nem na navegação, mas o app não esconde a informação. Na página do filme e nos cards da busca, aparecem num bloco à parte ("Também em: MUBI"). O aviso "Não disponível em streaming no Brasil" só aparece quando o filme não está em **nenhum** serviço por assinatura no BR. *Decisão de quem escreveu este documento*, para não afirmar algo falso.

Quando nenhum serviço está selecionado no filtro, o app envia todos os serviços principais combinados com OU (`with_watch_providers=8|119|...`). Os parâmetros fixos de todo discover são `watch_region=BR`, `with_watch_monetization_types=flatrate`, `language=pt-BR` e `include_adult=false`.

### 5.2 Página inicial

```
[🎬 Catálogo]  [ Buscar filme…            ]
┌──────────────────────────────────────────┐
│ DESTAQUE: filme mais popular da semana    │
│ Netflix · ★ 7,9            [Ver filme]    │
└──────────────────────────────────────────┘
Viagem no tempo                    ver tudo →
[▢][▢][▢][▢][▢][▢][▢] →
Histórias reais                    ver tudo →
[▢][▢][▢][▢][▢][▢][▢] →
… (8 a 12 prateleiras de tema)
```

- **Destaque:** o filme mais popular entre os disponíveis (discover com `sort_by=popularity.desc`, primeiro resultado), com imagem de fundo, nota e serviços.
- **Prateleiras:** uma por tema curado, cada uma com cerca de 20 filmes que rolam para o lado. "Ver tudo →" leva à grade com aquele tema já filtrado.
- **Temas curados:** de 8 a 12 temas, cada um com nome em português e um ou mais IDs de palavra-chave (keyword) do TMDB, guardados num arquivo de configuração. Exemplos que o autor aprovou: "Viagem no tempo", "Histórias reais", "Golpes e assaltos". *Os demais temas e os IDs são do builder*, que deve confirmá-los via `/search/keyword`, escolhendo temas com volume suficiente de filmes disponíveis no Brasil.

### 5.3 Página do filme — `/filme/[id]`

Página própria, com endereço compartilhável (decisão do autor; descartada a alternativa de janela sobreposta).

```
┌────────┐  Nome do Filme
│ pôster │  2014 · 2h49 · ★ 8,4 · Ficção científica · Drama
│        │  Sinopse em português…
└────────┘  Assista em: [Netflix] [Prime Video]
            Temas: (Viagem no tempo) (Espaço) …
[▶ Trailer]
Direção: Nome · Elenco: (○ Ator 1) (○ Atriz 2) (○ Ator 3) …
Mais deste tema →        [▢][▢][▢][▢][▢]
Mais deste diretor →     [▢][▢][▢][▢]
Dados de disponibilidade: JustWatch
```

- **Dados:** uma chamada a `/movie/{id}?append_to_response=credits,videos,keywords,watch/providers&language=pt-BR`.
- **Serviços:** só os principais em `flatrate` no BR, com logo.
- **Trailer:** exibido quando existir um vídeo do tipo "Trailer" no YouTube; preferir pt-BR e cair para inglês (`include_video_language=pt,en`). Sem trailer, a seção some. *Decisão de quem escreveu este documento* (o autor não se opôs).
- **Temas na página do filme = só os temas curados.** As palavras-chave do TMDB estão só em inglês e são numerosas e irregulares, então a página mostra como etiquetas apenas os temas curados que o filme tem (comparando as keywords dele com os IDs de cada tema). Se o filme não tiver nenhum, a linha de temas some. As keywords brutas nunca aparecem na interface. *Decisão de quem escreveu este documento*, coerente com a escolha do autor por temas curados em português.
- **Tudo é clicável e leva à grade já filtrada:** gênero, tema curado, diretor (`with_crew`) e atores (`with_cast`). A grade sempre aplica o filtro de disponibilidade, então "atriz X" mostra só os filmes dela em streaming.
- **Prateleiras de parecidos**, nesta ordem e mostrando só as que tiverem resultado:
  1. "Mais de *tema*": o primeiro tema curado que o filme tiver (pela ordem do arquivo de configuração);
  2. "Mais de *diretor*" (`with_crew`);
  3. "Mais de *gênero*": sempre presente como rede de segurança, usando os gêneros do filme (`with_genres` com OU) e ordenando por popularidade.

  Todas usam o discover filtrado, **não** `/recommendations`, que não filtra por serviço e mostraria filmes impossíveis de assistir. O próprio filme é excluído das prateleiras. Assim, toda página de filme tem pelo menos um caminho para outro filme.
- **Filme sem nenhum serviço principal** (ex.: acessado pela busca): a página abre normalmente, com o aviso "Não disponível em streaming no Brasil no momento" no lugar de "Assista em".
- **ID inexistente:** página 404.

### 5.4 Grade com filtros — `/explorar`

```
[🎬 Catálogo]  [ Buscar filme…            ]
Serviços: [Netflix✓][Prime][Max][Disney+]…   Ordenar: [Popularidade ▾]
Gêneros:  [Ação][Drama✓][Terror]…
Tema:     (Viagem no tempo ✕)
[▢][▢][▢][▢][▢][▢]
[▢][▢][▢][▢][▢][▢]
… rolagem infinita
```

- **Filtros:** serviços (vários, combinados com OU), gêneros (vários, combinados com E, via vírgula no TMDB), tema (um por vez, escolhido entre os temas curados por um seletor; na URL vai o identificador do tema, ex.: `tema=viagem-no-tempo`, e não o ID da keyword), além de pessoa (ator ou diretor), que chega por link vindo da página do filme e aparece como etiqueta removível.
- **Cards (grade e prateleiras):** mostram só pôster, título, ano e nota, **sem logos de serviço** (decisão do autor). O discover não traz os serviços de cada filme, e buscá-los custaria uma chamada por card. Os logos aparecem só na página do filme, no destaque da página inicial e na busca.
- **Ordenação:** popularidade (padrão), nota e data de lançamento. Para "nota", aplicar um mínimo de votos (ex.: `vote_count.gte=200`) para evitar filmes obscuros com nota 10; o valor exato fica com o builder.
- **Estado na URL:** todos os filtros e a ordenação ficam na query string (ex.: `/explorar?servicos=8,119&generos=18&ordem=nota`). O link é compartilhável.
- **"Voltar" restaura tudo:** ao voltar de um filme para a grade, a pessoa encontra as mesmas páginas já carregadas e a mesma posição de rolagem, e não o topo da página 1. Isso exige um cache de dados no cliente que sobreviva à navegação (ex.: TanStack Query com `useInfiniteQuery`) e restauração de rolagem. *Decisão de quem escreveu este documento*: navegação fluida é o centro do produto, e perder o lugar depois de rolar sete páginas quebraria exatamente isso.
- **Rolagem infinita:** carrega a página seguinte do discover ao chegar ao fim, até `total_pages` (máximo de 500).
- **Sem resultados:** mensagem amigável com um botão para limpar os filtros.
- **Gêneros:** lista de `/genre/movie/list?language=pt-BR`.

### 5.5 Busca por nome

- Campo no topo de todas as páginas. Ao enviar, abre `/buscar?q=...` (a URL é compartilhável).
- Usa `/search/movie?query=...&language=pt-BR&region=BR&include_adult=false`.
- **Mostra todos os resultados**, inclusive os indisponíveis. Para cada resultado, o app consulta a disponibilidade (`/movie/{id}/watch/providers`) e marca o card com os logos dos serviços ou com "Não disponível em streaming no Brasil". Motivo (aprovado pelo autor): quem procura um filme que já conhece quer justamente saber se ele está disponível.
- Paginação simples ou rolagem infinita, a critério do builder.

## 6. Como será construído (decisões já tomadas)

- **Framework:** Next.js com App Router e TypeScript.
- **Acesso ao TMDB só no servidor:** server components e, onde o cliente precisar buscar mais páginas (rolagem infinita), route handlers ou server actions próprios que repassam a chamada. O token nunca chega ao navegador.
- **Camada de acesso ao TMDB isolada:** um módulo (ex.: `lib/tmdb/`) com funções tipadas (`discoverMovies(filtros)`, `getMovie(id)`, `searchMovies(q)`, etc.) e o resto do app sem saber de URLs do TMDB. Isso permite trocar ou adicionar cache, e testar.
- **Configuração curada em arquivos:** serviços principais e temas (nome em português → IDs de palavra-chave).
- **Cache:** aproveitar o cache de `fetch` do Next com revalidação por tempo (ex.: listas de gêneros e serviços por 24h; discover e detalhes por algumas horas). Os valores exatos ficam com o builder. Isso reduz chamadas e mantém a demonstração rápida.
- **Imagens:** servidas de `image.tmdb.org` em tamanhos adequados (ex.: `w342` para pôsteres na grade, `w780` ou `w1280` para o fundo do destaque), com `next/image` configurado para esse domínio.
- **Deploy:** Vercel, com o token como variável de ambiente.

### Ordem de construção: segue as aulas do curso

Decisão do autor: o desenvolvimento acompanha a ordem das aulas, em **fatias verticais**. Cada etapa termina com algo funcionando e visível na tela, em vez de construir camadas inteiras (por exemplo, todo o `lib/tmdb`) antes de mostrar qualquer coisa. A camada de acesso ao TMDB cresce função por função, conforme cada tela precisa dela. Uma sequência plausível, que o builder pode ajustar:

1. Projeto criado + grade simples de filmes disponíveis (discover com os serviços principais), já publicada na Vercel.
2. Página do filme (`/filme/[id]`) com dados, serviços e elenco.
3. Grade com filtros e estado na URL (`/explorar`).
4. Rolagem infinita + "voltar" restaurando a posição.
5. Página inicial com destaque e prateleiras de temas curados.
6. Prateleiras de parecidos + links de pessoa, gênero e tema.
7. Busca por nome com marcação de disponibilidade.
8. Acabamento: trailer, estados de carregamento e erro, responsividade, atribuições.

Cada biblioteca nova (ex.: TanStack Query) entra na etapa em que se torna necessária, não antes, para que cada aula ensine uma coisa de cada vez.

### Caminho aberto para o banco de dados (etapa futura)

Nada de banco agora, mas:
- Os filmes são sempre identificados pelo **ID do TMDB**, que será a chave natural da futura tabela "quero assistir" (`usuario_id`, `tmdb_movie_id`, `criado_em`).
- O card do filme e a página do filme são componentes com um espaço previsto para uma ação (o futuro botão "quero assistir"), sem implementar o botão.
- Como o app já é Next.js com lógica no servidor, o banco (ex.: Postgres via Supabase, com autenticação) entra no mesmo projeto, sem um backend novo.

## 7. Decisões de quem escreveu este documento (o autor pode revisar)

- Lista curada de serviços principais, em vez de todos os que o TMDB retorna (5.1).
- Serviços fora da lista aparecem como "Também em: …"; "indisponível" só quando não há nenhum serviço por assinatura (5.1).
- Na página do filme, só temas curados como etiquetas; prateleiras de parecidos com a ordem tema → diretor → gênero (5.3).
- "Voltar" restaura as páginas carregadas e a posição de rolagem na grade (5.4).
- Trailer incluído quando disponível (5.3).
- Estilização com **Tailwind CSS**.
- **Layout responsivo:** precisa funcionar bem no celular, porque quem avalia portfólio muitas vezes abre o link pelo telefone.
- Visual escuro, no estilo dos serviços de streaming (coerente com os esboços aprovados).
- Interface toda em português; quando o TMDB não tiver sinopse em pt-BR, mostrar "Sinopse indisponível em português" em vez de deixar vazio. O builder pode optar por cair para a sinopse em inglês se achar melhor.
- `include_adult=false` em tudo.

## 8. O que fica com o builder

- A escolha final dos 8 a 12 temas e seus IDs de palavra-chave (além dos três aprovados).
- Os IDs dos serviços principais (confirmados via API).
- Os tempos de cache e o mínimo de votos na ordenação por nota.
- A estrutura de pastas, a biblioteca de busca de dados no cliente (se houver) e a estratégia de testes. Sugestão: testes da camada `lib/tmdb` (montagem de parâmetros a partir dos filtros) e da conversão entre a URL e os filtros, que é onde moram os bugs prováveis.
- Os estados de carregamento (skeletons) e as mensagens de erro quando o TMDB falhar.
- A identidade visual dentro do "escuro, estilo streaming".
