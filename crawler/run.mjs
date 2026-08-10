import { chromium } from "playwright";
import { createHash, randomUUID } from "node:crypto";
import { corridors } from "./corridors.mjs";
import { atlanticMoney } from "./providers/atlanticmoney.mjs";
import { currencyfair } from "./providers/currencyfair.mjs";
import { instarem } from "./providers/instarem.mjs";
import { lloydsBusiness } from "./providers/lloydsbusiness.mjs";
import { natWestBusiness } from "./providers/natwestbusiness.mjs";
import { paysend } from "./providers/paysend.mjs";
import { remitly } from "./providers/remitly.mjs";
import { ria } from "./providers/ria.mjs";
import { revolut } from "./providers/revolut.mjs";
import { singx } from "./providers/singx.mjs";
import { santanderUk } from "./providers/santanderuk.mjs";
import { starling } from "./providers/starling.mjs";
import { taptapSend } from "./providers/taptapsend.mjs";
import { transfergo } from "./providers/transfergo.mjs";
import { wise } from "./providers/wise.mjs";
import { wiseComparison } from "./providers/wisecomparison.mjs";
import { westernunion } from "./providers/westernunion.mjs";
import { xe } from "./providers/xe.mjs";

const endpoint = process.env.INGEST_ENDPOINT;
const token = process.env.INGEST_TOKEN;
const dryRun = process.env.DRY_RUN === "1";
const summaryOnly = process.env.SUMMARY_ONLY === "1";
if (!dryRun && (!endpoint || !token)) throw new Error("INGEST_ENDPOINT and INGEST_TOKEN are required");

const providerRegistry = [wise, currencyfair, atlanticMoney, instarem, ria, taptapSend, paysend, westernunion, revolut, xe, transfergo, singx, remitly, starling, natWestBusiness, lloydsBusiness, santanderUk, wiseComparison];
const corridorFilter = new Set((process.env.CORRIDOR_FILTER || "").split(",").map((value) => value.trim()).filter(Boolean));
const providerFilter = new Set((process.env.PROVIDER_FILTER || "").split(",").map((value) => value.trim()).filter(Boolean));
const invalidatesPreviousCurrent = new Set((process.env.INVALIDATE_PREVIOUS_CURRENT_FILTER || "").split(",").map((value) => value.trim()).filter(Boolean));
const selectedCorridors = corridorFilter.size ? corridors.filter((corridor) => corridorFilter.has(corridor.slug)) : corridors;
const providers = providerFilter.size ? providerRegistry.filter((provider) => providerFilter.has(provider.slug)) : providerRegistry;
const sitesBypassToken = process.env.SITES_BYPASS_TOKEN;
if (!selectedCorridors.length) throw new Error("CORRIDOR_FILTER did not match any corridors");
if (!providers.length) throw new Error("PROVIDER_FILTER did not match any providers");

function validateQuote(quote) {
  const numericFields = [quote.sourceAmount, quote.recipientAmount, quote.feeAmount, quote.exchangeRate];
  if (numericFields.some((value) => !Number.isFinite(value) || value < 0)) throw new Error("Quote contains an invalid number");
  if (quote.sourceAmount <= 0 || quote.recipientAmount <= 0 || quote.exchangeRate <= 0) throw new Error("Quote contains a zero amount or rate");
  const netSource = quote.sourceAmount - quote.feeAmount;
  if (netSource <= 0) throw new Error("Fee exceeds source amount");
  const effectiveRate = quote.recipientAmount / netSource;
  const deviation = Math.abs(effectiveRate - quote.exchangeRate) / quote.exchangeRate;
  const tolerance = quote.quoteType === "verified" ? 0.03 : 0.25;
  if (deviation > tolerance) throw new Error(`Quote failed rate cross-check (${(deviation * 100).toFixed(1)}% deviation)`);
  if (!quote.screenshot || quote.screenshot.byteLength < 5_000) throw new Error("Proof screenshot is missing or too small");
}
const runStartedAt = new Date().toISOString();
const runId = `crawl-${runStartedAt.slice(0, 10)}-${randomUUID().slice(0, 8)}`;
const proxyServer = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const browser = await chromium.launch({ headless: true, ...(proxyServer ? { proxy: { server: proxyServer } } : {}) });
const context = await browser.newContext({
  ignoreHTTPSErrors: Boolean(proxyServer),
  locale: "en-GB",
  timezoneId: "Europe/London",
  viewport: { width: 1440, height: 1000 },
  userAgent: "OnlineMoneyTransferRateMonitor/1.0 (+https://onlinemoneytransfer.co.uk/methodology)",
});

const captureCache = new Map();
const captureFailures = new Map();
const providerTransportFailures = new Map();

function captureCacheKey(provider, corridor) {
  return provider.cacheKey
    ? `${provider.slug}:${provider.cacheKey(corridor)}`
    : `${provider.slug}:${corridor.sourceLocale || corridor.sourceCountry}:${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
}

async function captureQuote(provider, corridor) {
  const providerTransportFailure = providerTransportFailures.get(provider.slug);
  if (providerTransportFailure) throw new Error(`Provider endpoint already failed in this run: ${providerTransportFailure}`);
  const cacheKey = captureCacheKey(provider, corridor);
  const cached = captureCache.get(cacheKey);
  if (cached) {
    return {
      ...cached,
      corridorSlug: corridor.slug,
      sourceCountry: corridor.sourceCountry,
      destinationCountry: corridor.destinationCountry,
      raw: { ...(cached.raw || {}), reusedCurrencyQuote: true },
    };
  }
  const cachedFailure = captureFailures.get(cacheKey);
  if (cachedFailure) throw new Error(`Equivalent quote already failed in this run: ${cachedFailure}`);

  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const page = await context.newPage();
    try {
      const quote = await provider.capture(page, corridor, new Date().toISOString());
      validateQuote(quote);
      captureCache.set(cacheKey, quote);
      return quote;
    } catch (error) {
      lastError = error;
    } finally {
      await page.close();
    }
  }
  const failureMessage = lastError instanceof Error ? lastError.message : String(lastError);
  captureFailures.set(cacheKey, failureMessage);
  if (/curl:\s*\(28\)|ETIMEDOUT|ECONNREFUSED|Could not resolve host/i.test(failureMessage)) {
    providerTransportFailures.set(provider.slug, failureMessage);
  }
  throw lastError;
}

async function ingest(payload) {
  if (dryRun) return;
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          ...(sitesBypassToken ? { "OAI-Sites-Authorization": `Bearer ${sitesBypassToken}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(90_000),
      });
      if (response.ok) return;
      lastError = new Error(`Ingest returned ${response.status}: ${await response.text()}`);
      if (response.status < 500) break;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

const outcomes = [];
const storedProviderKeys = new Set();

async function storeCapturedQuote(corridor, quote) {
  validateQuote(quote);
  const providerKey = `${corridor.slug}:${quote.providerSlug}`;
  if (storedProviderKeys.has(providerKey)) {
    outcomes.push({ corridor: corridor.slug, provider: quote.providerSlug, status: "superseded", reason: "A direct capture already succeeded" });
    return;
  }
  const screenshotBase64 = quote.screenshot.toString("base64");
  const capturedAt = quote.capturedAt;
  const fingerprint = createHash("sha256").update(`${corridor.slug}:${quote.providerSlug}:${capturedAt}`).digest("hex").slice(0, 20);
  const payload = {
    ...quote,
    id: `${quote.providerSlug}-${fingerprint}`,
    crawlRunId: runId,
    screenshotBase64,
    invalidatesPreviousCurrent: invalidatesPreviousCurrent.has(`${corridor.slug}:${quote.providerSlug}`),
  };
  delete payload.screenshot;
  await ingest(payload);
  storedProviderKeys.add(providerKey);
  outcomes.push({ corridor: corridor.slug, provider: quote.providerSlug, status: "stored", recipientAmount: quote.recipientAmount, quoteType: quote.quoteType });
  if (!summaryOnly) console.log(`[${dryRun ? "captured" : "stored"}] ${corridor.slug} · ${quote.providerSlug} · ${quote.recipientAmount} ${corridor.destinationCurrency}`);
}

async function storeCapturedQuotes(corridor, quotes) {
  const candidates = [];
  for (const quote of quotes) {
    validateQuote(quote);
    const providerKey = `${corridor.slug}:${quote.providerSlug}`;
    if (storedProviderKeys.has(providerKey)) {
      outcomes.push({ corridor: corridor.slug, provider: quote.providerSlug, status: "superseded", reason: "A direct capture already succeeded" });
    } else {
      candidates.push({ quote, providerKey });
    }
  }
  if (!candidates.length) return;
  const screenshot = candidates[0].quote.screenshot;
  if (candidates.some(({ quote }) => !quote.screenshot.equals(screenshot))) {
    for (const { quote } of candidates) await storeCapturedQuote(corridor, quote);
    return;
  }

  const payloads = candidates.map(({ quote }) => {
    const capturedAt = quote.capturedAt;
    const fingerprint = createHash("sha256").update(`${corridor.slug}:${quote.providerSlug}:${capturedAt}`).digest("hex").slice(0, 20);
    const payload = {
      ...quote,
      id: `${quote.providerSlug}-${fingerprint}`,
      crawlRunId: runId,
      invalidatesPreviousCurrent: invalidatesPreviousCurrent.has(`${corridor.slug}:${quote.providerSlug}`),
    };
    delete payload.screenshot;
    return payload;
  });
  if (!dryRun) {
    await ingest({
      kind: "quote-batch",
      screenshotBase64: screenshot.toString("base64"),
      screenshotMimeType: candidates[0].quote.screenshotMimeType,
      quotes: payloads,
    });
  }
  for (const { quote, providerKey } of candidates) {
    storedProviderKeys.add(providerKey);
    outcomes.push({ corridor: corridor.slug, provider: quote.providerSlug, status: "stored", recipientAmount: quote.recipientAmount, quoteType: quote.quoteType });
    if (!summaryOnly) console.log(`[${dryRun ? "captured" : "stored"}] ${corridor.slug} · ${quote.providerSlug} · ${quote.recipientAmount} ${corridor.destinationCurrency}`);
  }
}

try {
  for (const corridor of selectedCorridors) {
    for (const provider of providers) {
      if (provider.supports && !provider.supports(corridor)) {
        outcomes.push({ corridor: corridor.slug, provider: provider.slug, status: "unsupported" });
        continue;
      }
      try {
        if (provider.captureAll) {
          const page = await context.newPage();
          try {
            const quotes = await provider.captureAll(page, corridor, new Date().toISOString());
            await storeCapturedQuotes(corridor, quotes);
          } finally {
            await page.close();
          }
          continue;
        }
        const quote = await captureQuote(provider, corridor);
        await storeCapturedQuote(corridor, quote);
      } catch (error) {
        outcomes.push({ corridor: corridor.slug, provider: provider.slug, status: "failed", error: error instanceof Error ? error.message : String(error) });
        if (!summaryOnly) console.error(`[failed] ${corridor.slug} · ${provider.slug} · ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
} finally {
  await context.close();
  await browser.close();
}

const stored = outcomes.filter((item) => item.status === "stored").length;
const failed = outcomes.filter((item) => item.status === "failed").length;
const attempted = stored + failed;
if (!dryRun) {
  const errors = outcomes
    .filter((item) => item.status === "failed")
    .slice(0, 80)
    .map((item) => ({ corridor: item.corridor, provider: item.provider, error: item.error }));
  await ingest({
    kind: "run-summary",
    crawlRunId: runId,
    startedAt: runStartedAt,
    completedAt: new Date().toISOString(),
    attempted,
    succeeded: stored,
    failed,
    errorSummary: errors.length ? JSON.stringify(errors) : undefined,
  });
}
const corridorSummary = selectedCorridors.map((corridor) => {
  const items = outcomes.filter((item) => item.corridor === corridor.slug);
  return {
    corridor: corridor.slug,
    stored: items.filter((item) => item.status === "stored").length,
    failed: items.filter((item) => item.status === "failed").length,
    unsupported: items.filter((item) => item.status === "unsupported").length,
  };
});
const providerSummary = providers.map((provider) => {
  const items = outcomes.filter((item) => item.provider === provider.slug);
  const errors = new Map();
  for (const item of items) {
    if (item.status !== "failed") continue;
    const reason = item.error || "Unknown failure";
    errors.set(reason, (errors.get(reason) || 0) + 1);
  }
  return {
    provider: provider.slug,
    stored: items.filter((item) => item.status === "stored").length,
    failed: items.filter((item) => item.status === "failed").length,
    unsupported: items.filter((item) => item.status === "unsupported").length,
    errors: [...errors.entries()].map(([error, count]) => ({ error, count })),
  };
});
const failures = outcomes
  .filter((item) => item.status === "failed")
  .map(({ corridor, provider, error }) => ({ corridor, provider, error }));
console.log(JSON.stringify(summaryOnly
  ? { runId, stored, failed, providerSummary, corridorSummary, failures }
  : { runId, stored, failed, outcomes }, null, 2));
if (stored === 0 || failed > Math.max(6, stored)) process.exitCode = 1;
