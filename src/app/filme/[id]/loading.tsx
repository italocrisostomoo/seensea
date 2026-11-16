export default function Loading() {
  return (
    <main className="flex-1" aria-busy="true">
      <span className="sr-only">Carregando filme…</span>
      <div className="ambient-wash flex min-h-[min(88svh,52rem)] items-end gap-12 px-5 pb-14 md:-ml-(--rail) md:pl-[calc(var(--rail)+3rem)] md:pr-12">
        <div className="flex max-w-2xl flex-1 flex-col gap-5">
          <div className="h-28 w-80 max-w-full animate-pulse rounded-lg bg-white/10" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
          <div className="h-24 animate-pulse rounded bg-white/5" />
          <div className="h-10 w-1/2 animate-pulse rounded bg-white/5" />
        </div>
        <div className="ml-auto hidden aspect-[2/3] w-64 animate-pulse rounded-xl bg-white/10 lg:block xl:w-72" />
      </div>
    </main>
  );
}
