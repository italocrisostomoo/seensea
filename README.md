# SeenSea

Catálogo de filmes disponíveis nos **streamings por assinatura do Brasil**. Descubra o que assistir agora, filtre por serviço, gênero e tema, veja em quais plataformas cada filme está e guarde filmes em listas pessoais.

A ideia por trás das listas: às vezes a vontade de ver um filme vem antes da hora de ver. Na quarta você lembra que sexta é dia 13 e guarda um terror para a sexta; uma música ou uma pintura dá vontade de um filme com aquela sensação. O SeenSea guarda esses filmes para depois e também os que você já viu e quer rever.

Demo: [seensea.vercel.app](https://seensea.vercel.app)

## Funcionalidades

- Início com um filme em destaque e prateleiras por tema.
- Explorar com filtros (serviços, gêneros, tema, ator e diretor), ordenação por popularidade, nota ou lançamento e rolagem infinita.
- Busca por nome, com a disponibilidade em cada filme.
- Página do filme com sinopse, elenco, direção, onde assistir, trailer (carregado só após o clique) e prateleiras de filmes parecidos.
- Conta com email e senha. Depois de entrar ou criar a conta, você volta para a página em que estava.
- Duas listas pessoais, em abas na página inicial:
  - **Já assisti**: os filmes que você viu e quer rever.
  - **Quero assistir**: os filmes guardados para depois.

  Um filme fica em uma lista só: marcar na outra muda o filme de lista. A aba fica no endereço (`/?lista=ja-assisti`, `/?lista=quero-assistir`), então dá para mandar o link e o "voltar" do navegador retorna à aba. Filmes que saíram do TMDB aparecem como "Filme indisponível", com botão para remover.
- Estados de carregamento e de erro, mensagens em português, layout responsivo e tema escuro.

## Stack

- Next.js 16 (App Router, `cacheComponents`) e React
- TypeScript
- Tailwind CSS
- TanStack Query (rolagem infinita e listas)
- Supabase (login e banco das listas)
- Vitest

## Como rodar

1. Crie um token de leitura da API do TMDB.
2. Crie um projeto no [Supabase](https://supabase.com).
3. No **SQL Editor** do Supabase, rode os arquivos de `supabase/migrations/` em ordem.
4. Em **Authentication → URL Configuration** do Supabase:
   - Em **Site URL**, ponha o endereço do site.
   - Em **Redirect URLs**, ponha `http://localhost:3000/**`.
5. Copie `.env.example` para `.env.local` e preencha. A URL e a chave _publishable_ (`sb_publishable_...`) ficam em **Settings → API** do Supabase:

   ```
   TMDB_READ_TOKEN=seu_token_aqui
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

6. Instale e rode:

   ```bash
   npm install
   npm run dev
   ```

7. Abra http://localhost:3000. Para os testes: `npm test`.

## Segurança

- **Listas:** cada pessoa só lê e altera a própria lista. Quem garante isso são as regras de acesso (RLS) da tabela `movie_lists`, não o código do navegador. A chave primária (usuário, filme) impede que um filme fique nas duas listas.
- **Chaves:**
  - A chave _publishable_ do Supabase é pública por natureza.
  - O token do TMDB fica só no servidor.
  - A chave secreta do Supabase (`sb_secret_...`) não é usada e nunca deve ir para uma variável `NEXT_PUBLIC_`.
- **`/api/filmes`:** busca os dados das listas no TMDB. Aceita até 50 filmes por pedido e faz no máximo 8 buscas simultâneas, para um pedido não esgotar a cota do token.
- **Função `rls_auto_enable`:** se o **Advisors → Security** do Supabase apontar essa função como executável por `anon` e `authenticated`, feche o acesso:

  ```sql
  revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  ```

## Publicar na Vercel

- **Antes do primeiro deploy**, defina as três variáveis de `.env.example` em **Production e Preview**. As `NEXT_PUBLIC_` entram no código durante a compilação. Sem elas, o site inteiro deixa de funcionar, não só o login.
- **Aviso da Vercel sobre `NEXT_PUBLIC_`:** a Vercel avisa que as duas variáveis do Supabase vão para o navegador. Use **Change to Config**, sem tirar o prefixo. A `TMDB_READ_TOKEN` continua secreta.
- **Sem `TMDB_READ_TOKEN`:** a página inicial mostra a tela de erro.

## Decisões e limites conhecidos

- **Confirmação de email desligada:** por ser um projeto de portfólio, o cadastro entra direto. O envio de email gratuito do Supabase é muito limitado, e com a confirmação ligada visitantes não conseguiriam criar conta. O custo: dá para cadastrar um email que não é seu.
- **Sem "esqueci minha senha":** depende do mesmo envio de email.
- **Projeto pausado:** o plano gratuito do Supabase pausa projetos parados há alguns dias. Se o login falhar, o projeto pode estar pausado.
- **Página de filme inexistente:** `/filme/abc` responde 404 de verdade (via `src/proxy.ts`). Já um ID válido que não existe no TMDB vira "soft 404": status 200, `noindex` e a tela "Filme não encontrado".

## Créditos

<a href="https://www.themoviedb.org"><strong>TMDB</strong></a>: This product uses the TMDB API but is not endorsed or certified by TMDB.

Os dados de disponibilidade em streaming vêm do **JustWatch**, via TMDB.

## Como foi planejado

- Catálogo:
  - [Especificação (design)](docs/superpowers/specs/2026-11-15-catalogo-filmes-design.md)
  - [Plano de implementação](docs/superpowers/plans/2026-11-15-catalogo-filmes.md)
- Login e listas:
  - [Plano de implementação](docs/superpowers/plans/2026-11-16-supabase-auth-listas.md)
  - O plano previa duas tabelas. Durante o desenvolvimento, elas viraram uma só (`movie_lists`), para que um filme fique em apenas uma lista.
