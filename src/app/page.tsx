import { connection } from "next/server";
import { Suspense } from "react";
import { MovieGrid } from "@/components/MovieGrid";
import { discoverMovies } from "@/lib/tmdb/discover";

// Temporário até a Tarefa 7.
async function AvailableMovies() {
  await connection(); // renderiza em tempo de requisição (usa a data atual e o token)
  const { results } = await discoverMovies({});
  return <MovieGrid movies={results} />;
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Disponíveis no streaming</h1>
      {/* Suspense: a busca ao TMDB roda em tempo de requisição, então o build não exige o token. */}
      <Suspense fallback={<p className="text-zinc-400">Carregando…</p>}>
        <AvailableMovies />
      </Suspense>
    </main>
  );
}
