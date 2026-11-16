import { PageShell } from '@/components/PageShell';

export function PosterGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 xl:grid-cols-6"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <PageShell title={<span className="text-fg-faint">Carregando…</span>}>
      <PosterGridSkeleton />
    </PageShell>
  );
}
