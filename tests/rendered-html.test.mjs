import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

const bindings = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

const context = {
  waitUntil() {},
  passThroughOnException() {},
};

test("renders production discovery metadata", async () => {
  const worker = await loadWorker();

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    bindings,
    context,
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(
    html,
    /<link(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']https:\/\/onlinemoneytransfer\.co\.uk\/["'])[^>]*>/i,
  );
  assert.match(
    html,
    /<meta(?=[^>]*\bproperty=["']og:url["'])(?=[^>]*\bcontent=["']https:\/\/onlinemoneytransfer\.co\.uk\/["'])[^>]*>/i,
  );
});

test("renders SWIFT, BIC and country bank-detail checks", async () => {
  const worker = await loadWorker();

  const swiftResponse = await worker.fetch(
    new Request("http://localhost/swift-codes", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(swiftResponse.status, 200);
  const swiftHtml = await swiftResponse.text();
  assert.match(swiftHtml, /SWIFT codes tell the payment where to look/);
  assert.match(swiftHtml, /What bank details does each country use/);
  assert.match(swiftHtml, /href="\/bank-details\/united-states\/"/);

  const bicResponse = await worker.fetch(
    new Request("http://localhost/bic-codes", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(bicResponse.status, 200);
  const bicHtml = await bicResponse.text();
  assert.match(bicHtml, /Does this BIC look right for the country you are paying/);
  assert.match(bicHtml, /It is not an institution, branch, account-name or fraud check/);

  const countryResponse = await worker.fetch(
    new Request("http://localhost/bank-details/united-states", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(countryResponse.status, 200);
  const countryHtml = await countryResponse.text();
  assert.match(countryHtml, /What details do you need to send money to/);
  assert.match(countryHtml, /ABA routing number/);
  assert.match(countryHtml, /ACH and wire routing instructions are not always interchangeable/);

  const corridorResponse = await worker.fetch(
    new Request("http://localhost/uk-to-united-states", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(corridorResponse.status, 200);
  const corridorHtml = await corridorResponse.text();
  assert.match(corridorHtml, /Check the bank details for/);
  assert.match(corridorHtml, /Full (?:<!-- -->)?United States(?:<!-- -->)? checklist/);
  assert.match(corridorHtml, /Run a private format check/);
  assert.match(corridorHtml, /Compare more companies for/);
  assert.match(
    corridorHtml,
    /href="https:\/\/www\.topmoneycompare\.co\.uk\/transfer-money\/united-kingdom-to-united-states\?amount=200"/,
  );

  const xeIndex = corridorHtml.indexOf('href="/reviews/xe"');
  const moreProvidersIndex = corridorHtml.indexOf('class="tmc-compare-row"');
  const wiseIndex = corridorHtml.indexOf('href="/reviews/wise"');
  assert.ok(xeIndex >= 0, "Xe listing should render on the corridor");
  assert.ok(moreProvidersIndex > xeIndex, "TopMoneyCompare box should follow Xe");
  assert.ok(wiseIndex < 0 || moreProvidersIndex < wiseIndex, "TopMoneyCompare box should precede Wise");

  const homeResponse = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(homeResponse.status, 200);
  assert.doesNotMatch(await homeResponse.text(), /class="tmc-compare-row"/);
});

test("renders the free API documentation and exposes the public feed", async () => {
  const worker = await loadWorker();
  const pageResponse = await worker.fetch(
    new Request("http://localhost/api", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(pageResponse.status, 200);
  const html = await pageResponse.text();
  assert.match(html, /Use our money transfer rates on your own site/);
  assert.match(html, /free for commercial and non-commercial websites/);
  assert.match(html, /The link cannot be hidden in a footer/);
  assert.match(html, /Rates supplied by Online Money Transfer/);
  assert.match(html, /href="\/api"/);

  const apiResponse = await worker.fetch(
    new Request("http://localhost/api/v1/rates/uk-to-united-states?history=14"),
    bindings,
    context,
  );
  assert.equal(apiResponse.status, 200);
  assert.equal(apiResponse.headers.get("access-control-allow-origin"), "*");
  const payload = await apiResponse.json();
  assert.equal(payload.apiVersion, "1.0");
  assert.equal(payload.useTerms.price, "Free");
  assert.equal(payload.useTerms.attributionRequired, true);
  assert.equal(
    payload.useTerms.requiredLink,
    "https://onlinemoneytransfer.co.uk/uk-to-united-states/",
  );

  const corridorResponse = await worker.fetch(
    new Request("http://localhost/uk-to-united-states", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(corridorResponse.status, 200);

  const widget = await readFile(new URL("../public/omt-rates.js", import.meta.url), "utf8");
  assert.match(widget, /window\.OMTRates/);
  assert.match(widget, /Rates supplied by Online Money Transfer/);
  assert.match(widget, /data-older/);
});

test("renders the production coverage ledger", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/coverage", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /The completed quotes, the calculator rates and the failures/);
  assert.match(html, /routes with stored evidence/);
  assert.match(html, /Where we have a price we can stand behind/);
  assert.match(html, /How the latest sweeps behaved/);
  assert.match(html, /United Kingdom(?:<!-- -->)? → (?:<!-- -->)?Spain/);
});

test("renders the UK Remittance Cost Divide study", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/research/uk-remittance-vulnerability-index", {
      headers: { accept: "text/html" },
    }),
    bindings,
    context,
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Sending money to a low-income country costs Britain/);
  assert.match(html, /£<!-- -->6\.97<!-- --> per £100 sent/);
  assert.match(html, /Official £120 basket/);
  assert.match(html, /Official £300 basket/);
  assert.match(html, /The Gambia costs/);
  assert.match(html, /Western Union varies sixfold/);
  assert.match(html, /A customer margin is not the company/);
  assert.match(html, /Why no 2021 bilateral flow estimate appears/);
});

test("serves research data as JSON and CSV", async () => {
  const worker = await loadWorker();
  const jsonResponse = await worker.fetch(
    new Request("http://localhost/api/research/vulnerability-index"),
    bindings,
    context,
  );
  assert.equal(jsonResponse.status, 200);
  assert.match(jsonResponse.headers.get("content-type") ?? "", /^application\/json\b/i);
  const payload = await jsonResponse.json();
  assert.equal(payload.rows.length, 21);
  assert.equal(payload.rows[0].country, "Pakistan");
  assert.equal(payload.benchmarkedCorridors, 6);
  assert.equal(payload.histories.ukAverageCost.at(-1).avgCost200Pct, 4.614);
  assert.equal(payload.officialPriceStudy.corridors.length, 33);
  assert.equal(payload.officialPriceStudy.providerComparisons.length, 8);

  const csvResponse = await worker.fetch(
    new Request("http://localhost/api/research/vulnerability-index/csv"),
    bindings,
    context,
  );
  assert.equal(csvResponse.status, 200);
  assert.match(csvResponse.headers.get("content-type") ?? "", /^text\/csv\b/i);
  assert.match(await csvResponse.text(), /^corridor,country,remittances_pct_gdp_2024,/);

  const historyResponse = await worker.fetch(
    new Request("http://localhost/api/research/vulnerability-index/history/csv"),
    bindings,
    context,
  );
  assert.equal(historyResponse.status, 200);
  const historyCsv = await historyResponse.text();
  assert.match(historyCsv, /^"dataset","geography","code","period",/);
  assert.match(historyCsv, /"2011_1Q","average total cost for UK £120 source amount \(World Bank USD 200 basket\)","8.066"/);

  const officialCorridorsResponse = await worker.fetch(
    new Request("http://localhost/api/research/vulnerability-index/official-corridors/csv"),
    bindings,
    context,
  );
  assert.equal(officialCorridorsResponse.status, 200);
  const officialCorridorsCsv = await officialCorridorsResponse.text();
  assert.match(officialCorridorsCsv, /^source_country,destination_code,destination_country,/);
  assert.match(officialCorridorsCsv, /source_amount_gbp,normalised_cost_per_gbp_100,cost_on_source_amount_gbp,world_bank_standard_basket_usd/);
  assert.match(officialCorridorsCsv, /"The Gambia".*"12.0555"/);

  const providerComparisonsResponse = await worker.fetch(
    new Request("http://localhost/api/research/vulnerability-index/provider-comparisons/csv"),
    bindings,
    context,
  );
  assert.equal(providerComparisonsResponse.status, 200);
  const providerComparisonsCsv = await providerComparisonsResponse.text();
  assert.match(providerComparisonsCsv, /^provider,period,route_position,/);
  assert.match(providerComparisonsCsv, /"Western Union".*"highest".*"South Africa"/);
});

test("renders The Last Mile Tax study", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/research/last-mile-tax", {
      headers: { accept: "text/html" },
    }),
    bindings,
    context,
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Need the £200 in cash/);
  assert.match(html, /£2\.10/);
  assert.match(html, /CASH CHEAPER/);
  assert.match(html, /1\.3bn/);
  assert.match(html, /Without a usable account, the transfer needs a counter/);
  assert.match(html, /HOW THE EXTRA COST APPEARS/);
  assert.match(html, /PUT IT AGAINST UK PAY/);
  assert.match(html, /£122\.76 a year/);
  assert.match(html, /0\.31(?:<!-- -->)?%/);
  assert.match(html, /£(?:<!-- -->)?39,039/);
  assert.match(html, /6\.2(?:<!-- -->)? hours/);
  assert.match(html, /THE TEN BIGGEST CASH PENALTIES/);
  assert.match(html, /8(?:<!-- -->)? of the top 10 are MoneyGram offers/);
  assert.match(html, /The evidence supports an access story, not a simple corruption story/);
  assert.match(html, /Countries are not simply “SWIFT members”/);
  assert.match(html, /The complete access and cost panel/);
  assert.match(html, /linearly interpolate/i);
});

test("renders the guide desk and ten researched guides", async () => {
  const worker = await loadWorker();
  const deskResponse = await worker.fetch(
    new Request("http://localhost/guides", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(deskResponse.status, 200);
  const deskHtml = await deskResponse.text();
  assert.match(deskHtml, /The fee is rarely the whole price/);
  assert.match(deskHtml, /Who Has the Best Money Transfer Rate Today\?/);
  assert.match(deskHtml, /Currency Forward Contracts: The Rate Is Fixed/);
  assert.match(deskHtml, /Swift Does Not Move Your Money/);
  assert.match(deskHtml, /BENEATH THE APP/);

  const expected = [
    ["best-money-transfer-rates", "Who Has the Best Money Transfer Rate Today? Four UK Routes Checked"],
    ["what-are-currency-brokers", "What Does a Currency Broker Actually Do With Your Rate?"],
    ["should-you-time-a-currency-transfer", "Should You Wait for a Better Exchange Rate on a Large Transfer?"],
    ["forward-contracts", "Currency Forward Contracts: The Rate Is Fixed, and So Is the Obligation"],
    ["evolution-of-money-transfer-companies", "From the Agent Counter to Wise: Thirty Years of Money Transfer"],
    ["international-money-transfer-routing", "Where Does an International Transfer Actually Go?"],
    ["swift-iso-20022-payment-protocols", "Swift Does Not Move Your Money. So What Does?"],
    ["currencycloud-network-explained", "Currencycloud: The Payment Company Behind Someone Else's App"],
    ["wise-vs-revolut-infrastructure", "Wise Versus Revolut: Similar Screens, Different Payment Machines"],
    ["prefunding-netting-local-payouts", "Why an Instant International Transfer Needs Money Waiting Abroad"],
  ];

  for (const [slug, title] of expected) {
    const response = await worker.fetch(
      new Request(`http://localhost/guides/${slug}`, { headers: { accept: "text/html" } }),
      bindings,
      context,
    );
    assert.equal(response.status, 200, `guide route ${slug}`);
    const html = await response.text();
    assert.match(html, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(html, /"wordCount":\d+/);
    assert.match(html, /Russell Gous/);
    assert.match(html, /Alon Rajic/);
    assert.match(html, /Documents checked for this guide/);
    assert.match(html, /WHERE THIS GUIDE STOPS/);
  }

  const ratesGuide = await (await worker.fetch(
    new Request("http://localhost/guides/best-money-transfer-rates", { headers: { accept: "text/html" } }),
    bindings,
    context,
  )).text();
  assert.match(ratesGuide, /LIVE UK RATE BOARD/);
  assert.match(ratesGuide, /United Kingdom(?:<!-- -->)? to (?:<!-- -->)?Spain/);
  assert.match(ratesGuide, /See the full rate check/);
  assert.match(ratesGuide, /The £2\.10 cash penalty/);

  const brokerGuide = await (await worker.fetch(
    new Request("http://localhost/guides/what-are-currency-brokers", { headers: { accept: "text/html" } }),
    bindings,
    context,
  )).text();
  assert.match(brokerGuide, /NAMED BROKER DESK/);
  assert.match(brokerGuide, /TorFX/);
  assert.match(brokerGuide, /Key Currency/);
  assert.match(brokerGuide, /Halo entered special administration on 29 May 2026/);
  assert.match(brokerGuide, /Read the FCA notice/);
});

test("renders the rate review desk and provider reviews", async () => {
  const worker = await loadWorker();
  const deskResponse = await worker.fetch(
    new Request("http://localhost/reviews", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(deskResponse.status, 200);
  const deskHtml = await deskResponse.text();
  assert.match(deskHtml, /A pleasant app does not rescue an expensive exchange rate/);
  assert.match(deskHtml, /<strong>34<\/strong>/);
  assert.match(deskHtml, /companies examined/);
  assert.match(deskHtml, /UK bank transfer reviews/);
  assert.match(deskHtml, /Wise/);
  assert.match(deskHtml, /Lloyds Bank Business/);

  const xeResponse = await worker.fetch(
    new Request("http://localhost/reviews/xe", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(xeResponse.status, 200);
  const xeHtml = await xeResponse.text();
  assert.match(xeHtml, /Xe(?:<!-- -->)? rates: what you pay, and what you get for it/);
  assert.match(xeHtml, /Public converter evidence is indicative/);
  assert.match(xeHtml, /Xe(?:<!-- -->)?(?:&#x27;|')s own pricing documents/);
  assert.match(xeHtml, /"ratingValue":4\.6/);
  assert.match(xeHtml, /href="\/reviews\/wise"/);

  const lloydsResponse = await worker.fetch(
    new Request("http://localhost/reviews/lloydsbusiness", { headers: { accept: "text/html" } }),
    bindings,
    context,
  );
  assert.equal(lloydsResponse.status, 200);
  const lloydsHtml = await lloydsResponse.text();
  assert.match(lloydsHtml, /2\.60%/);
  assert.match(lloydsHtml, /Published business FX margins/);
  assert.match(lloydsHtml, /We do not have a reproducible public quote right now/);
});

test("serves Last Mile Tax JSON and CSV evidence", async () => {
  const worker = await loadWorker();
  const jsonResponse = await worker.fetch(
    new Request("http://localhost/api/research/last-mile-tax"),
    bindings,
    context,
  );
  assert.equal(jsonResponse.status, 200);
  const payload = await jsonResponse.json();
  assert.equal(payload.observations, 791);
  assert.equal(payload.corridorRows.length, 33);
  assert.equal(payload.strictMatchedCashAccount.matchedOffers, 17);
  assert.equal(payload.fixedEffectModel.cashPremiumGbp200, 2.0969);
  assert.equal(payload.correlationsWithCashShare.unbankedPct.n, 30);

  const countryResponse = await worker.fetch(
    new Request("http://localhost/api/research/last-mile-tax/csv"),
    bindings,
    context,
  );
  assert.equal(countryResponse.status, 200);
  const countryCsv = await countryResponse.text();
  assert.match(countryCsv, /^destination_code,destination_country,income_group,/);
  assert.match(countryCsv, /"AF","Afghanistan".*"90\.3462"/);

  const matchedResponse = await worker.fetch(
    new Request("http://localhost/api/research/last-mile-tax/matched-offers/csv"),
    bindings,
    context,
  );
  assert.equal(matchedResponse.status, 200);
  const matchedCsv = await matchedResponse.text();
  assert.match(matchedCsv, /^destination_code,destination_country,provider,/);
  assert.match(matchedCsv, /"BR","Brazil","MoneyGram".*"18\.8467"/);
});
