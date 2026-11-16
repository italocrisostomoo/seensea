import Image from "next/image";
import { tmdbImage } from "@/lib/images";
import type { Provider, ProviderSplit } from "@/lib/tmdb/types";

function Logos({ list, size }: { list: Provider[]; size: number }) {
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {list.map((p) => {
        const logo = tmdbImage(p.logoPath, "w185");
        return (
          <li key={p.id}>
            {logo ? (
              <Image
                src={logo}
                alt={p.name}
                title={p.name}
                width={size}
                height={size}
                className="rounded-[22%] ring-1 ring-white/15"
              />
            ) : (
              <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-fg">{p.name}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ServiceBadges({
  providers,
  variant,
}: {
  providers: ProviderSplit;
  /** "page": logos grandes com legenda, para o destaque e a página do filme. "card": compacto, sob o pôster. */
  variant: "page" | "card";
}) {
  const empty = providers.main.length === 0 && providers.others.length === 0;

  if (variant === "card") {
    const all = [...providers.main, ...providers.others];
    return empty ? (
      <p className="px-0.5 text-xs text-fg-faint">Fora dos streamings no Brasil</p>
    ) : (
      <div className="px-0.5">
        <span className="sr-only">Assista em:</span>
        <Logos list={all} size={26} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {providers.main.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-fg-muted">Assista em</span>
          <Logos list={providers.main} size={40} />
        </div>
      )}
      {providers.others.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-fg-muted">Também em</span>
          <Logos list={providers.others} size={32} />
        </div>
      )}
      {empty && <p className="text-sm text-fg-muted">Não disponível em streaming no Brasil no momento</p>}
      <p className="text-xs text-fg-faint">Dados de disponibilidade: JustWatch</p>
    </div>
  );
}
