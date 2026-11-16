export function PosterGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-zinc-800" />
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8" aria-busy="true">
      <PosterGridSkeleton />
    </main>
  );
}
