'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMovieList, type ListType } from '@/hooks/useMovieList';
import { authHref } from '@/lib/auth';

interface MovieListButtonProps {
  tmdbId: number;
  type: ListType;
}

const base = 'rounded px-3 py-1.5 text-sm transition disabled:opacity-50';
const outline = 'border border-fg/30 text-fg/70 hover:bg-fg/10';

export function MovieListButton({ tmdbId, type }: MovieListButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { isInList, addMovie, removeMovie, loading: listLoading } = useMovieList(type);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const label = type === 'watched' ? 'Já assisti' : 'Quero assistir';

  // Enquanto não se sabe se a pessoa está logada (ou o que há na lista), o botão espera desativado.
  if (authLoading || (user && listLoading)) {
    return (
      <button disabled className={`${base} ${outline}`}>
        + {label}
      </button>
    );
  }

  if (!user) {
    return (
      <button onClick={() => router.push(authHref('login', pathname))} className={`${base} ${outline}`}>
        Faça login
      </button>
    );
  }

  const inList = isInList(tmdbId);

  const handleClick = async () => {
    setFailed(false);
    setSaving(true);
    try {
      if (inList) await removeMovie(tmdbId);
      else await addMovie(tmdbId);
    } catch (error) {
      console.error('[lista] falha ao atualizar:', error);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={saving}
        aria-pressed={inList}
        className={`${base} ${inList ? 'bg-fg/20 text-fg' : outline}`}
      >
        {saving ? <span className="inline-block animate-spin">⟳</span> : inList ? <>✓ {label}</> : <>+ {label}</>}
      </button>
      {failed && (
        <span role="alert" className="self-center text-xs text-red-300">
          Não deu certo. Tente de novo.
        </span>
      )}
    </>
  );
}
