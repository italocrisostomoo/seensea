import { connection } from "next/server";
import { Suspense } from "react";
import { Hero } from "@/components/Hero";
import { Shelf } from "@/components/Shelf";
import { THEMES } from "@/config/themes";
import { exploreHref } from "@/lib/filters";
import { discoverMovies } from "@/lib/tmdb/discover";
import { getMovieProviders } from "@/lib/tmdb/movie";

const SHELF_SIZE = 20;

async function HomeContent() {
  await connection(); // renderiza em tempo de requisição (usa a data atual e o token)
  const [general, ...shelves] = await Promise.allSettled([
    discoverMovies({}),
    ...THEMES.map((t) => discoverMovies({ keywordIds: t.keywordIds })),
  ]);

  const featured = general.status === "fulfilled" ? general.value.results[0] : undefined;
  const providers = featured
    ? await getMovieProviders(featured.id).catch(() => null)
    : null;

  return (
    <>
      {featured && providers && <Hero movie={featured} providers={providers} />}
      {THEMES.map((theme, i) => {
        const result = shelves[i];
        if (result.status !== "fulfilled") return null;
        return (
          <Shelf
            key={theme.slug}
            title={theme.name}
            href={exploreHref({ theme: theme.slug })}
            movies={result.value.results.slice(0, SHELF_SIZE)}
          />
        );
      })}
    </>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8">
      {/* Suspense: a busca ao TMDB roda em tempo de requisição, então o build não exige o token. */}
      <Suspense fallback={<p className="text-zinc-400">Carregando…</p>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}
