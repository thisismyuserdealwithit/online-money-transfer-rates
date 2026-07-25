import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="brand footer-brand"><span className="brand-mark">OMT</span><span>Online Money Transfer</span></div>
          <p>Public transfer quotes checked daily, with the receipt kept beside the result.</p>
        </div>
        <div>
          <strong>Compare</strong>
          <Link href="/uk-to-spain/">UK to Spain</Link>
          <Link href="/uk-to-united-states/">UK to United States</Link>
          <Link href="/#corridors">All corridors</Link>
          <Link href="/reviews">Company reviews</Link>
          <Link href="/coverage">What we checked today</Link>
        </div>
        <div>
          <strong>About</strong>
          <Link href="/about">Who publishes this site</Link>
          <Link href="/research">Research desk</Link>
          <Link href="/research/uk-remittance-vulnerability-index">UK Cost Divide Study</Link>
          <Link href="/authors/alon-rajic">Alon Rajic</Link>
          <Link href="/authors/russell-gous">Russell Gous</Link>
          <Link href="/editorial-policy">Editorial policy</Link>
          <Link href="/api">Free rates API</Link>
        </div>
        <div>
          <strong>Policies</strong>
          <Link href="/methodology">Methodology</Link>
          <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
          <Link href="/cookie-policy">Cookie policy</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 OnlineMoneyTransfer.co.uk · Published by Finofin Limited</span><span>A rate can move after we check it. Selected links may earn us a commission.</span></div>
    </footer>
  );
}
