'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authHref, safeNext } from '@/lib/auth';

export function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Link
        href={authHref('login', safeNext(pathname))}
        className="rounded-md bg-fg/10 px-3 py-2 text-sm font-medium text-fg transition hover:bg-fg/20"
      >
        Entrar
      </Link>
    );
  }

  return (
    <button
      onClick={handleLogout}
      title={`Conectado como ${user.email}`}
      className="rounded-md bg-fg/10 px-3 py-2 text-sm font-medium text-fg transition hover:bg-fg/20"
    >
      Sair
    </button>
  );
}
