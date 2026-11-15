export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 px-4 py-6 text-center text-xs text-zinc-400">
      <p>
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-zinc-300 underline"
        >
          TMDB
        </a>
        : This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
      <p className="mt-1">Dados de disponibilidade: JustWatch</p>
    </footer>
  );
}
