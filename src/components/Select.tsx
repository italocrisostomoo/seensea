'use client';

import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Lista de escolha única no visual do SeenSea (o <select> nativo não aceita estilo na lista aberta).
 * Segue o padrão de listbox: setas, Home/End, Enter/Espaço para escolher, Esc para fechar.
 */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  highlight = false,
  dividerAfterFirst = false,
}: {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  /** Destaca o botão quando o filtro está em uso. */
  highlight?: boolean;
  /** Separa a primeira opção (ex.: "Todos os temas") das demais. */
  dividerAfterFirst?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const selected = options[selectedIndex];

  function openList() {
    setActive(selectedIndex);
    setOpen(true);
  }

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }

  function choose(index: number) {
    const option = options[index];
    close(true);
    if (option && option.value !== value) onChange(option.value);
  }

  // Ao abrir, o foco vai para a lista; ao navegar, a opção ativa fica à vista.
  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);
  useEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id]);

  // Clique fora fecha sem escolher.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function onButtonKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      openList();
    }
  }

  function onListKeyDown(e: KeyboardEvent) {
    const last = options.length - 1;
    const moves: Record<string, () => number> = {
      ArrowDown: () => Math.min(active + 1, last),
      ArrowUp: () => Math.max(active - 1, 0),
      Home: () => 0,
      End: () => last,
    };
    if (moves[e.key]) {
      e.preventDefault();
      setActive(moves[e.key]());
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'Tab') {
      close(false);
    }
  }

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        id={`${id}-button`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onButtonKeyDown}
        className={`flex items-center gap-2.5 rounded-full border py-2 pl-4 pr-3 text-sm transition-colors ${
          highlight || open
            ? 'border-accent/60 bg-accent/10'
            : 'border-white/15 bg-white/5 hover:border-white/30'
        }`}
      >
        <span className="text-fg-muted">{label}</span>
        <span className="font-semibold text-fg">{selected?.label}</span>
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={`size-4 fill-none stroke-fg-muted stroke-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${id}-button`}
          aria-activedescendant={`${id}-${active}`}
          onKeyDown={onListKeyDown}
          className="animate-[pop_140ms_ease-out] absolute left-0 top-full z-30 mt-2 max-h-[min(30rem,65vh)] w-max min-w-full origin-top-left overflow-y-auto rounded-2xl border border-white/12 bg-[color-mix(in_oklab,var(--ambient)_22%,#060606)] p-1.5 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.95)] focus:outline-none"
        >
          {options.map((option, i) => {
            const isSelected = i === selectedIndex;
            const isActive = i === active;
            return (
              <Fragment key={option.value}>
              <li
                id={`${id}-${i}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(i)}
                onMouseMove={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between gap-8 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-white/10' : ''
                } ${isSelected ? 'font-semibold text-accent' : isActive ? 'text-fg' : 'text-fg-muted'}`}
              >
                {option.label}
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className={`size-4 shrink-0 fill-none stroke-current stroke-[2.5] ${isSelected ? '' : 'invisible'}`}
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </li>
              {dividerAfterFirst && i === 0 && (
                <li role="presentation" aria-hidden className="mx-3.5 my-1.5 h-px bg-white/10" />
              )}
              </Fragment>
            );
          })}
        </ul>
      )}
    </div>
  );
}
