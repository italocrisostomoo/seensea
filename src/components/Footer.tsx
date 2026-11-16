import { LogoMark } from "./LogoMark";

export function Footer() {
  return (
    <footer className="mt-12 flex flex-col gap-3 border-t border-line px-5 py-8 text-xs text-fg-faint md:flex-row md:items-center md:justify-between md:px-12">
      <p className="flex items-center gap-2 text-fg-muted">
        <LogoMark className="w-6 text-accent" />
        <span className="heading text-sm">SeenSea</span>
      </p>
      <div className="flex flex-col gap-1 md:items-end">
        <p>
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-fg-muted underline hover:text-fg"
          >
            TMDB
          </a>
          : This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
        <p>Dados de disponibilidade: JustWatch</p>
      </div>
    </footer>
  );
}
