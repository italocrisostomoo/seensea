import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-white">Filme não encontrado</h1>
      <Link href="/" className="text-amber-400 hover:underline">
        Voltar ao início
      </Link>
    </main>
  );
}
