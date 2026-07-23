import { execFileSync } from "node:child_process";
import { basicResult, numeric } from "./shared.mjs";

const providerHomepages = {
  asda: "https://money.asda.com/travel/travel-money/",
  barclays: "https://www.barclays.co.uk/ways-to-bank/international-payments/",
  hsbc: "https://www.hsbc.co.uk/international/money-transfer/",
  instarem: "https://www.instarem.com/",
  lloyds: "https://www.lloydsbank.com/international-payments.html",
  monese: "https://www.monese.com/",
  nationwide: "https://www.nationwide.co.uk/help/payments/international-payments/",
  natwest: "https://www.natwest.com/current-accounts/international-payments.html",
  ofx: "https://www.ofx.com/",
  paypal: "https://www.paypal.com/uk/digital-wallet/send-receive-money/send-money-internationally",
  rbs: "https://www.rbs.co.uk/current-accounts/international-payments.html",
  santander: "https://www.santander.co.uk/personal/support/current-accounts/making-international-payments",
  skrill: "https://www.skrill.com/en/transfer-money/",
  western_union: "https://www.westernunion.com/",
  westernunion: "https://www.westernunion.com/",
  wise: "https://wise.com/",
  xoom: "https://www.xoom.com/",
};

function countryCode(locale) {
  return locale === "gb" ? "GB" : String(locale || "").toUpperCase();
}

function slugFor(alias) {
  const overrides = { western_union: "westernunion" };
  return overrides[alias] ?? String(alias).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function deliveryLabel(quote) {
  const duration = quote?.deliveryEstimation?.duration;
  if (!duration?.min && !duration?.max) return "Check provider";
  if (duration.min === duration.max) return `Wise estimate ${duration.min}`;
  return `Wise estimate ${duration.min ?? ""} to ${duration.max ?? ""}`.trim();
}

export const wiseComparison = {
  slug: "wisecomparison",
  name: "Wise comparison service",
  homepage: "https://wise.com/gb/compare/",
  supports(corridor) {
    return Boolean(corridor.sourceCurrency && corridor.destinationCurrency && corridor.sourceAmount);
  },
  async captureAll(page, corridor, capturedAt) {
    const params = new URLSearchParams({
      sourceCurrency: corridor.sourceCurrency,
      targetCurrency: corridor.destinationCurrency,
      sendAmount: String(corridor.sourceAmount),
      sourceCountry: countryCode(corridor.sourceLocale),
      targetCountry: countryCode(corridor.destinationLocale),
    });
    const quoteUrl = `https://api.wise.com/v4/comparisons/?${params}`;
    const text = execFileSync("curl", ["-sS", "--max-time", "45", "-A", "Mozilla/5.0", quoteUrl], {
      encoding: "utf8",
      maxBuffer: 16_000_000,
    });
    if (!text.trim()) throw new Error("Wise comparison service returned an empty public response");
    const payload = JSON.parse(text);
    if (!Array.isArray(payload?.providers)) throw new Error("Wise comparison service did not return providers");

    await page.route((candidate) => candidate.href === quoteUrl, (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: text,
    }), { times: 1 });
    const response = await page.goto(quoteUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    if (!response?.ok()) throw new Error(`Wise comparison evidence returned ${response?.status() ?? "no response"}`);
    const screenshot = await page.screenshot({ type: "png", fullPage: true, timeout: 20_000 });

    const results = [];
    for (const provider of payload.providers) {
      const alias = String(provider.alias || "").toLowerCase();
      if (!alias || !Array.isArray(provider.quotes)) continue;
      const matching = provider.quotes
        .filter((quote) => Number.isFinite(Number(quote?.rate)) && Number.isFinite(Number(quote?.receivedAmount)))
        .sort((a, b) => Number(b.receivedAmount) - Number(a.receivedAmount))[0];
      if (!matching) continue;
      const providerSlug = slugFor(alias);
      const feeAmount = numeric(String(matching.fee ?? 0));
      const sourceAmount = numeric(String(payload.amount ?? corridor.sourceAmount));
      const recipientAmount = numeric(String(matching.receivedAmount));
      const exchangeRate = numeric(String(matching.rate));
      const quoteCapturedAt = Number.isFinite(Date.parse(matching.dateCollected)) ? matching.dateCollected : capturedAt;
      const homepage = providerHomepages[alias] ?? `https://wise.com/gb/compare/?${params}`;

      results.push(basicResult({ slug: providerSlug, name: provider.name || alias, homepage }, corridor, quoteCapturedAt, {
        quoteType: "indicative",
        sourceAmount,
        recipientAmount,
        feeAmount,
        feeCurrency: corridor.sourceCurrency,
        exchangeRate,
        quoteUrl,
        deliveryEstimate: deliveryLabel(matching),
        planName: "Wise comparison estimate for a bank-funded transfer",
        screenshot,
        raw: {
          parser: "wise-public-v4-comparison-api",
          evidenceSource: "Wise comparison service",
          providerAlias: alias,
          providerType: provider.type,
          providerQuoteCollectedAt: matching.dateCollected,
          markupPercent: matching.markup,
          sourceCountry: matching.sourceCountry,
          targetCountry: matching.targetCountry,
          isConsideredMidMarketRate: Boolean(matching.isConsideredMidMarketRate),
          warning: "Wise describes non-Wise results as estimates based on quotes collected from provider websites, normally around once per hour. Confirm the final provider quote before sending.",
        },
      }));
    }
    if (!results.length) throw new Error("Wise comparison service returned no usable provider quotes");
    return results;
  },
};
