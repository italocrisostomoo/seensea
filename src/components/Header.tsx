import Link from "next/link";
import { SearchBar } from "./SearchBar";

export function Header() {
  return (
    <header className="border-b border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-y-3 px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          SeenSea
        </Link>
        <nav className="ml-6">
          <Link href="/explorar" className="text-sm text-zinc-300 hover:text-white">
            Explorar
          </Link>
        </nav>
        <SearchBar />
      </div>
    </header>
  );
}
