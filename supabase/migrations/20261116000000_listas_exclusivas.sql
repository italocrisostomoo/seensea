-- Junta "Já assisti" e "Quero assistir" numa tabela só.
-- A chave (user_id, tmdb_id) garante que um filme fica em uma única lista por usuário.

begin;

create table public.movie_lists (
  user_id uuid not null references auth.users (id) on delete cascade,
  tmdb_id int not null check (tmdb_id > 0),
  status text not null check (status in ('watched', 'watchlist')),
  added_at timestamptz not null default now(),
  primary key (user_id, tmdb_id)
);

alter table public.movie_lists enable row level security;

create policy "ver a própria lista" on public.movie_lists
  for select using ((select auth.uid()) = user_id);
create policy "adicionar na própria lista" on public.movie_lists
  for insert with check ((select auth.uid()) = user_id);
create policy "mudar de lista na própria lista" on public.movie_lists
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "remover da própria lista" on public.movie_lists
  for delete using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.movie_lists to authenticated;

-- Copia o que já existe. Se um filme estava nas duas listas, fica em "Já assisti".
insert into public.movie_lists (user_id, tmdb_id, status, added_at)
select user_id, tmdb_id, 'watched', added_at from public.watched_movies
union all
select w.user_id, w.tmdb_id, 'watchlist', w.added_at
from public.watchlist_movies w
where not exists (
  select 1 from public.watched_movies x where x.user_id = w.user_id and x.tmdb_id = w.tmdb_id
);

drop table public.watched_movies;
drop table public.watchlist_movies;

commit;
