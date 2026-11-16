export default function Loading() {
  return (
    <main className="flex-1" aria-busy="true">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:flex-row">
        <div className="mx-auto aspect-[2/3] w-56 shrink-0 animate-pulse rounded-lg bg-zinc-800 md:mx-0 md:w-72" />
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="h-9 w-3/4 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-800" />
          <div className="h-24 animate-pulse rounded bg-zinc-800" />
          <div className="h-12 w-1/2 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>
    </main>
  );
}
