import Link from "next/link";

export function CompanyTrust() {
  return (
    <section className="company-trust">
      <div className="shell company-trust-grid">
        <div><span className="kicker">WHO IS BEHIND THIS</span><h2>A rate table should have names attached to it</h2></div>
        <div><strong>Finofin Limited</strong><p>Finofin publishes OnlineMoneyTransfer.co.uk and has worked on financial comparison sites since 2015. Its longer-running Money Transfer Comparison project began in 2014.</p></div>
        <div><strong>Editorial responsibility</strong><p>Alon Rajic leads the research operation. Russell Gous runs the written side, drawing on earlier roles at Barclays Corporate Banking and WorldFirst.</p></div>
        <Link href="/about">Meet the people checking the claims →</Link>
      </div>
    </section>
  );
}
