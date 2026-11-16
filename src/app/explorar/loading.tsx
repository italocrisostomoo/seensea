import { PageShell } from '@/components/PageShell';
import { PosterGridSkeleton } from '../loading';

export default function Loading() {
  return (
    <PageShell title="Explorar">
      <div className="mb-8 h-36 animate-pulse rounded-xl bg-white/5" aria-hidden="true" />
      <PosterGridSkeleton />
    </PageShell>
  );
}
