import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-7 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="brand-mark"><span className="brand-letter">A</span></span>
          <p>© 2026 Aven. Des opportunités plus claires.</p>
        </div>
        <nav className="flex flex-wrap gap-5" aria-label="Liens légaux">
          <Link href="/privacy">Confidentialité</Link>
          <Link href="/terms">Conditions</Link>
          <Link href="/cookies">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
