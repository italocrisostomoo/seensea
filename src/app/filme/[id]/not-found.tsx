import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell title="Filme não encontrado">
      <p className="mb-6 max-w-[50ch] text-fg-muted">
        Esse endereço não leva a nenhum filme do catálogo. Busque pelo nome ou volte ao início.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/buscar" className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-black hover:brightness-110">
          Buscar filme
        </Link>
        <Link
          href="/"
          className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium text-fg hover:border-accent hover:text-accent"
        >
          Voltar ao início
        </Link>
      </div>
    </PageShell>
  );
}
