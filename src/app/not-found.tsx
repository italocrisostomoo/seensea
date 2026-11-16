import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell title="Página não encontrada">
      <p className="mb-6 max-w-[50ch] text-fg-muted">
        Esse endereço não existe no SeenSea. Volte ao início ou busque um filme pelo nome.
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
