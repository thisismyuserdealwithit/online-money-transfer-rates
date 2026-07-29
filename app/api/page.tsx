import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free Money Transfer Rates API",
  description: "Add current OMT corridor rates, stored comparisons and receipt links to another website with a free JSON API or JavaScript widget.",
  path: "/api",
});

const widgetCode = `<div id="omt-rates"></div>
<script
  async
  src="https://onlinemoneytransfer.co.uk/omt-rates.js"
  data-target="omt-rates"
  data-route="uk-to-united-states"
  data-history="14"
  data-limit="10">
</script>`;

const attributionCode = `<a href="https://onlinemoneytransfer.co.uk/uk-to-united-states/">
  Rates supplied by Online Money Transfer
</a>`;

export default function ApiPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="api-hero">
          <div className="shell api-hero-grid">
            <div>
              <span className="kicker">OMT DATA FOR OTHER WEBSITES</span>
              <h1>Use our money transfer rates on your own site. Free.</h1>
              <p>Show the most recent OMT comparison, move through earlier stored checks and send readers to the original receipt behind each figure.</p>
              <div className="api-actions">
                <a href="#widget">Get the JavaScript widget</a>
                <a href="#json">Read the JSON API</a>
              </div>
            </div>
            <aside>
              <span>THE ONE CONDITION</span>
              <strong>Link back clearly</strong>
              <p>Use is free for commercial and non-commercial websites as long as the rates are accompanied by a clearly visible link to the relevant corridor on onlinemoneytransfer.co.uk.</p>
            </aside>
          </div>
        </section>

        <section className="shell api-main">
          <div className="api-principles">
            <article><b>01</b><strong>Current comparison</strong><p>The newest usable record held for each company.</p></article>
            <article><b>02</b><strong>Stored history</strong><p>Up to 30 previous crawler runs, kept as distinct snapshots.</p></article>
            <article><b>03</b><strong>Receipt links</strong><p>Evidence stays on OMT rather than being copied to the publisher.</p></article>
          </div>

          <section className="api-attribution">
            <div>
              <span className="kicker">FREE USE TERMS</span>
              <h2>The link cannot be hidden in a footer</h2>
            </div>
            <div>
              <p>The attribution should sit beside or immediately below the rates. It must be readable, clickable and point to the matching OMT corridor. A generic homepage link elsewhere on the site does not meet this condition.</p>
              <p>The supplied widget already includes the correct link. If you use the JSON feed to make your own design, add the attribution yourself.</p>
            </div>
          </section>

          <section className="api-section" id="widget">
            <div className="section-heading">
              <div><span className="kicker">FASTEST OPTION</span><h2>Add the rate table with one script</h2><p>Change only the corridor route. The widget brings its own styling, history controls, receipt links and OMT attribution.</p></div>
            </div>
            <div className="api-code-grid">
              <pre><code>{widgetCode}</code></pre>
              <aside>
                <strong>Widget settings</strong>
                <dl>
                  <div><dt>data-route</dt><dd>The OMT corridor slug</dd></div>
                  <div><dt>data-history</dt><dd>1 to 30 stored checks</dd></div>
                  <div><dt>data-limit</dt><dd>Companies shown per view</dd></div>
                  <div><dt>data-theme</dt><dd>light, dark or auto</dd></div>
                </dl>
              </aside>
            </div>
          </section>

          <section className="api-section" id="json">
            <div className="section-heading">
              <div><span className="kicker">BUILD YOUR OWN DISPLAY</span><h2>Use the JSON endpoint</h2><p>The endpoint accepts cross-origin GET requests and returns the latest rates, historical crawl runs and an OMT receipt URL for every stored result.</p></div>
            </div>
            <div className="api-endpoint">
              <span>GET</span>
              <code>https://onlinemoneytransfer.co.uk/api/v1/rates/uk-to-united-states?history=14</code>
            </div>
            <div className="api-fields">
              <article><strong>current.rates</strong><p>The latest usable record per provider, matching the logic of the main OMT table.</p></article>
              <article><strong>history</strong><p>Exact comparison sweeps, ordered from newest to oldest.</p></article>
              <article><strong>receiptUrl</strong><p>The evidence page for one provider result on the relevant OMT corridor.</p></article>
              <article><strong>eligibleForPriceRanking</strong><p>True only for a fresh, verified and non-promotional bank transfer quote.</p></article>
            </div>
          </section>

          <section className="api-section">
            <div className="section-heading">
              <div><span className="kicker">IF YOU BUILD YOUR OWN TABLE</span><h2>Add this attribution beside the rates</h2></div>
            </div>
            <pre><code>{attributionCode}</code></pre>
            <p className="api-note">Replace the example route with the corridor shown in your table. Do not describe an indicative or stale result as a guaranteed live transfer quote. Cache the response and avoid unnecessary repeated requests.</p>
          </section>

          <aside className="api-help">
            <div><span className="kicker">START WITH A REAL CORRIDOR</span><h2>See the data before you integrate it</h2><p>Open the UK to United States comparison to see the page, rate labels, historical records and receipts that sit behind the API response.</p></div>
            <Link href="/uk-to-united-states/">Open UK to US rates →</Link>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
