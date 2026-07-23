import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label="Online Money Transfer home">
          <span className="brand-mark">OMT</span>
          <span>Online Money Transfer</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/#corridors">Corridors</Link>
          <Link href="/coverage">Today&apos;s checks</Link>
          <Link href="/reviews">Reviews</Link>
          <Link href="/research">Research</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/methodology">Our method</Link>
          <Link href="/about">About</Link>
          <span className="live-pill"><i /> Checked daily</span>
        </nav>
      </div>
    </header>
  );
}
