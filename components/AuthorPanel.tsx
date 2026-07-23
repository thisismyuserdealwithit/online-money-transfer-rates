import Link from "next/link";

export function AuthorPanel({ label = "Editorial responsibility" }: { label?: string }) {
  return (
    <section className="author-panel" aria-labelledby="author-panel-title">
      <div>
        <span className="kicker">{label}</span>
        <h2 id="author-panel-title">The names attached to this work</h2>
        <p>The checking desk produces the rate records. Finofin Limited is responsible for the published explanations and for correcting them when the evidence changes.</p>
      </div>
      <div className="author-card">
        <span className="author-initials">AR</span>
        <div><strong>Alon Rajic</strong><small>Publisher and research lead</small><Link href="/authors/alon-rajic">Background and responsibilities →</Link></div>
      </div>
      <div className="author-card">
        <span className="author-initials">RG</span>
        <div><strong>Russell Gous</strong><small>Head of content</small><Link href="/authors/russell-gous">Background and responsibilities →</Link></div>
      </div>
    </section>
  );
}
