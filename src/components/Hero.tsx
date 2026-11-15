import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/images";
import type { MovieSummary, ProviderSplit } from "@/lib/tmdb/types";
import { ServiceBadges } from "./ServiceBadges";

export function Hero({ movie, providers }: { movie: MovieSummary; providers: ProviderSplit }) {
  const backdrop = tmdbImage(movie.backdropPath, "w1280");
  const rating = movie.rating.toFixed(1).replace(".", ",");
  return (
    <section className="relative isolate flex min-h-[22rem] items-end overflow-hidden rounded-xl bg-zinc-900 sm:min-h-[28rem]">
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="-z-10 object-cover"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="flex max-w-2xl flex-col gap-3 p-5 sm:p-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{movie.title}</h1>
        <p className="text-sm text-zinc-300">
          {movie.year ? `${movie.year} · ` : ""}
          <span className="text-amber-400">★ {rating}</span>
        </p>
        <ServiceBadges providers={providers} variant="card" />
        <p className="text-xs text-zinc-400">Dados de disponibilidade: JustWatch</p>
        <Link
          href={`/filme/${movie.id}`}
          className="w-fit rounded-md bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          Ver filme
        </Link>
      </div>
    </section>
  );
}
