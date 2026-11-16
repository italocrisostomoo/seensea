import { PosterGridSkeleton } from '../loading';

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8" aria-busy="true">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-zinc-800" />
      <div className="mb-6 h-32 animate-pulse rounded-lg bg-zinc-900" />
      <PosterGridSkeleton />
    </main>
  );
}
