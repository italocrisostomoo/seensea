/** Olho cuja pálpebra de baixo é uma onda: "seen" + "sea". */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" className={className} aria-hidden>
      <path
        d="M2 10C6.5 3 25.5 3 30 10"
        className="fill-none stroke-current stroke-[2.2] [stroke-linecap:round]"
      />
      <path
        d="M2 10c2.3 3 4.7 3 7 0s4.7-3 7 0 4.7 3 7 0 4.7-3 7 0"
        className="fill-none stroke-current stroke-[2.2] [stroke-linecap:round]"
      />
      <circle cx="16" cy="8.6" r="2.6" className="fill-current" />
    </svg>
  );
}
