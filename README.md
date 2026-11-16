# SeenSea

Catálogo de filmes disponíveis nos **streamings por assinatura do Brasil**. Descubra o que assistir agora, filtre por serviço, gênero e tema, e veja em quais plataformas cada filme está.

Demo: _em breve_

## Funcionalidades

- Início com um filme em destaque e prateleiras por serviço e por tema.
- Explorar com filtros (serviços, gêneros, tema, ator e diretor), ordenação por popularidade, nota ou lançamento e rolagem infinita.
- Busca por nome, com a disponibilidade em cada filme.
- Página do filme com sinopse, elenco, direção, onde assistir, trailer (carregado só após o clique) e prateleiras de filmes parecidos.
- Estados de carregamento e de erro, layout responsivo e tema escuro.

## Stack

- Next.js 16 (App Router, `cacheComponents`) e React
- TypeScript
- Tailwind CSS
- TanStack Query (rolagem infinita)
- Vitest

## Como rodar

1. Crie um token de leitura da API do TMDB e coloque em `.env.local`:

   ```
   TMDB_READ_TOKEN=seu_token_aqui
   ```

2. Instale e rode:

   ```bash
   npm install
   npm run dev
   ```

3. Abra http://localhost:3000. Para os testes: `npm test`.

O token fica só no servidor e nunca vai para o navegador.

## Créditos

<a href="https://www.themoviedb.org"><strong>TMDB</strong></a>: This product uses the TMDB API but is not endorsed or certified by TMDB.

Os dados de disponibilidade em streaming vêm do **JustWatch**, via TMDB.

## Como foi planejado

- [Especificação (design)](docs/superpowers/specs/2026-11-15-catalogo-filmes-design.md)
- [Plano de implementação](docs/superpowers/plans/2026-11-15-catalogo-filmes.md)
