import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          🎬 Catálogo
        </Link>
      </div>
    </header>
  );
}
