# SeenSea

Catálogo de filmes disponíveis nos **streamings por assinatura do Brasil**. Descubra o que assistir agora, filtre por serviço, gênero e tema, e veja em quais plataformas cada filme está.

Demo: [seensea.vercel.app](https://seensea.vercel.app)

## Funcionalidades

- Início com um filme em destaque e prateleiras por tema.
- Explorar com filtros (serviços, gêneros, tema, ator e diretor), ordenação por popularidade, nota ou lançamento e rolagem infinita.
- Busca por nome, com a disponibilidade em cada filme.
- Página do filme com sinopse, elenco, direção, onde assistir, trailer (carregado só após o clique) e prateleiras de filmes parecidos.
- Conta com email e senha, e duas listas pessoais: **Já assisti** (para rever quando quiser) e **Quero assistir** (para guardar para depois). Um filme fica em uma lista só; marcar na outra muda o filme de lista. As listas ficam em abas na página inicial.
- Estados de carregamento e de erro, layout responsivo e tema escuro.

## Stack

- Next.js 16 (App Router, `cacheComponents`) e React
- TypeScript
- Tailwind CSS
- TanStack Query (rolagem infinita e listas)
- Supabase (login e banco das listas)
- Vitest

## Como rodar

1. Crie um token de leitura da API do TMDB.
2. Crie um projeto no [Supabase](https://supabase.com) e, no **SQL Editor**, rode os arquivos de `supabase/migrations/` em ordem. Em **Authentication → URL Configuration**, ponha o endereço do site em **Site URL** e `http://localhost:3000/**` em **Redirect URLs**.
3. Copie `.env.example` para `.env.local` e preencha. A URL e a chave _publishable_ (`sb_publishable_...`) ficam em **Settings → API** do Supabase:

   ```
   TMDB_READ_TOKEN=seu_token_aqui
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   A chave _publishable_ é pública por natureza: quem protege as listas de cada pessoa são as regras de acesso (RLS) da tabela `movie_lists`. Nunca ponha a chave secreta (`sb_secret_...`) numa variável `NEXT_PUBLIC_`.

4. Instale e rode:

   ```bash
   npm install
   npm run dev
   ```

5. Abra http://localhost:3000. Para os testes: `npm test`.

O token do TMDB fica só no servidor e nunca vai para o navegador.

## Publicar na Vercel

Defina as três variáveis de `.env.example` nas variáveis de ambiente do projeto, em **Production e Preview**, **antes** do deploy: as `NEXT_PUBLIC_` entram no código durante a compilação, e sem elas o site inteiro deixa de funcionar, não só o login. Sem `TMDB_READ_TOKEN`, a página inicial mostra a tela de erro. A Vercel avisa que `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` vai para o navegador; com a chave _publishable_, isso é esperado. Trade-off conhecido: `/filme/abc` responde 404 de verdade (via `src/proxy.ts`), mas um ID válido que não existe no TMDB vira "soft 404" (status 200, `noindex` e a tela "Filme não encontrado").

## Créditos

<a href="https://www.themoviedb.org"><strong>TMDB</strong></a>: This product uses the TMDB API but is not endorsed or certified by TMDB.

Os dados de disponibilidade em streaming vêm do **JustWatch**, via TMDB.

## Como foi planejado

- [Especificação (design)](docs/superpowers/specs/2026-11-15-catalogo-filmes-design.md)
- [Plano de implementação](docs/superpowers/plans/2026-11-15-catalogo-filmes.md)
