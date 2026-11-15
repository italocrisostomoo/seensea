import Image from "next/image";
import { tmdbImage } from "@/lib/images";
import type { Provider, ProviderSplit } from "@/lib/tmdb/types";

function Logos({ list, size }: { list: Provider[]; size: number }) {
  return (
    <>
      {list.map((p) => {
        const logo = tmdbImage(p.logoPath, "w185");
        return logo ? (
          <Image
            key={p.id}
            src={logo}
            alt={p.name}
            title={p.name}
            width={size}
            height={size}
            className="rounded-md"
          />
        ) : (
          <span key={p.id} className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-200">
            {p.name}
          </span>
        );
      })}
    </>
  );
}

export function ServiceBadges({
  providers,
  variant,
}: {
  providers: ProviderSplit;
  variant: "page" | "card";
}) {
  const size = variant === "page" ? 44 : 28;
  const empty = providers.main.length === 0 && providers.others.length === 0;
  return (
    <div className="flex flex-col gap-2">
      {providers.main.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-300">Assista em:</span>
          <Logos list={providers.main} size={size} />
        </div>
      )}
      {providers.others.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-300">Também em:</span>
          <Logos list={providers.others} size={size} />
        </div>
      )}
      {empty && (
        <p className="text-sm text-zinc-400">
          {variant === "page"
            ? "Não disponível em streaming no Brasil no momento"
            : "Não disponível em streaming no Brasil"}
        </p>
      )}
      {variant === "page" && (
        <p className="text-xs text-zinc-500">Dados de disponibilidade: JustWatch</p>
      )}
    </div>
  );
}
