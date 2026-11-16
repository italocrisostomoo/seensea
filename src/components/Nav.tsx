'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { LogoMark } from './LogoMark';

const icon = 'size-6 fill-none stroke-current stroke-[1.75] [stroke-linecap:round] [stroke-linejoin:round]';

const ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: '/',
    label: 'Início',
    icon: (
      <svg viewBox="0 0 24 24" className={icon} aria-hidden>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
  {
    href: '/explorar',
    label: 'Explorar',
    icon: (
      <svg viewBox="0 0 24 24" className={icon} aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5z" />
      </svg>
    ),
  },
  {
    href: '/buscar',
    label: 'Buscar',
    icon: (
      <svg viewBox="0 0 24 24" className={icon} aria-hidden>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4.2-4.2" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: trilho de ícones fixo à esquerda, por cima do destaque. */}
      <nav
        aria-label="Principal"
        className="fixed inset-y-0 left-0 z-40 hidden w-(--rail) flex-col items-center bg-gradient-to-r from-black/85 via-black/50 to-transparent py-8 md:flex"
      >
        <Link href="/" aria-label="SeenSea, início" className="text-accent transition-colors hover:text-fg">
          <LogoMark className="w-9" />
        </Link>
        <ul className="my-auto flex flex-col gap-6">
          {ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-16 flex-col items-center gap-1.5 py-1 text-[0.6875rem] font-medium transition-colors ${
                    active ? 'text-fg' : 'text-fg-faint hover:text-fg'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <span
                    aria-hidden
                    className={`h-0.5 w-5 rounded-full bg-accent transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Celular: barra no topo, sobreposta à imagem e rolando junto com a página. */}
      <header className="absolute inset-x-0 top-0 z-40 flex items-center gap-1 bg-gradient-to-b from-black/80 to-transparent px-4 pb-6 pt-3 md:hidden">
        <Link href="/" className="mr-auto flex items-center gap-2 text-lg font-bold text-fg">
          <LogoMark className="w-7 text-accent" />
          <span className="heading">SeenSea</span>
        </Link>
        {ITEMS.slice(1).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive(pathname, item.href) ? 'page' : undefined}
            className="flex size-11 items-center justify-center rounded-full text-fg-muted aria-[current=page]:text-fg"
          >
            {item.icon}
          </Link>
        ))}
      </header>
    </>
  );
}
