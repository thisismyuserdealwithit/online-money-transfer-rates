#!/usr/bin/env node
import { createHash } from "node:crypto";

const source = "https://online-money-transfer-rates.masterblaster1.chatgpt.site";
const target = "https://online-money-transfer-rates-1.onrender.com";
const sourceToken = process.env.SITES_BYPASS_TOKEN;
const ingestToken = process.env.INGEST_TOKEN;
if (!sourceToken || !ingestToken) throw new Error("Migration tokens are missing");

const sourceHeaders = { "OAI-Sites-Authorization": `Bearer ${sourceToken}` };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url, init = {}, attempts = 8) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.ok) return response;
      last = new Error(`${response.status} ${await response.text()}`);
      if (response.status < 500 && response.status !== 429) throw last;
    } catch (error) {
      last = error;
    } finally {
      clearTimeout(timer);
    }
    await sleep(Math.min(10_000, 500 * (2 ** attempt)));
  }
  throw new Error(`Request failed for ${url}: ${last?.message ?? last}`);
}

const getJson = (url, init) => request(url, init).then((response) => response.json());

async function mapLimit(items, limit, mapper) {
  const output = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return output;
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function quoteUrl(html, fallback) {
  const match = html.match(/class="browser-bar"[\s\S]*?<span>(https:\/\/[\s\S]*?)<\/span>/i);
  const value = match ? decodeHtml(match[1].replace(/<!--.*?-->/g, "")).trim() : fallback;
  try {
    return new URL(value).protocol === "https:" ? value : fallback;
  } catch {
    return fallback;
  }
}

async function readRates(origin, corridors, headers = {}) {
  return mapLimit(corridors, 6, ({ corridorSlug }) => (
    getJson(`${origin}/api/v1/rates/${encodeURIComponent(corridorSlug)}?history=30`, { headers })
  ));
}

async function ingest(payload) {
  return getJson(`${target}/api/ingest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ingestToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

async function migrate(record, index, total) {
  const { corridor, crawlRunId, rate } = record;
  const receipt = `${source}/${corridor.route}/receipts/${encodeURIComponent(rate.id)}/`;
  const [imageResponse, html] = await Promise.all([
    request(`${source}/api/proof/${encodeURIComponent(rate.id)}`, { headers: sourceHeaders }),
    request(`${source}/proof/${encodeURIComponent(rate.id)}`, { headers: sourceHeaders })
      .then((response) => response.text()),
  ]);
  const contentType = imageResponse.headers.get("content-type")?.split(";")[0];
  if (contentType !== "image/png" && contentType !== "image/jpeg") {
    throw new Error(`Invalid proof content type for ${rate.id}: ${contentType}`);
  }
  const image = Buffer.from(await imageResponse.arrayBuffer());
  if (image.length < 1_000 || image.length > 6_000_000) {
    throw new Error(`Invalid proof size for ${rate.id}: ${image.length}`);
  }
  const response = await ingest({
    kind: "quote",
    id: rate.id,
    crawlRunId,
    corridorSlug: corridor.route,
    sourceCountry: corridor.fromCountry,
    destinationCountry: corridor.toCountry,
    providerSlug: rate.providerSlug,
    providerName: rate.provider,
    providerHomepage: `https://onlinemoneytransfer.co.uk/reviews/${rate.providerSlug}/`,
    quoteType: rate.quoteType,
    sourceAmount: rate.sourceAmount,
    sourceCurrency: rate.sourceCurrency,
    recipientAmount: rate.recipientAmount,
    recipientCurrency: rate.recipientCurrency,
    feeAmount: rate.feeAmount,
    feeCurrency: rate.feeCurrency,
    exchangeRate: rate.exchangeRate,
    deliveryEstimate: rate.deliveryEstimate,
    fundingMethod: rate.fundingMethod,
    payoutMethod: rate.payoutMethod,
    planName: rate.pricingBasis,
    promotion: rate.promotion,
    capturedAt: rate.capturedAt,
    quoteUrl: quoteUrl(html, receipt),
    screenshotBase64: image.toString("base64"),
    screenshotMimeType: contentType,
    invalidatesPreviousCurrent: false,
    raw: {
      migratedFrom: source,
      originalReceiptUrl: rate.receiptUrl,
      originalPublicStatus: rate.status,
      originalCrawlRunId: crawlRunId,
      proofSha256: createHash("sha256").update(image).digest("hex"),
    },
  });
  if ((index + 1) % 10 === 0 || index + 1 === total) {
    console.log(`${index + 1}/${total} missing quotes transferred`);
  }
  return response.duplicate ? 0 : 1;
}

async function main() {
  const coverage = await getJson(`${source}/api/coverage`, { headers: sourceHeaders });
  if (coverage.populatedCorridors !== 52 || coverage.latestProviderRecords !== 691) {
    throw new Error(`Unexpected source coverage: ${coverage.populatedCorridors}, ${coverage.latestProviderRecords}`);
  }
  const sourceRates = await readRates(source, coverage.corridors, sourceHeaders);
  const targetRates = await readRates(target, coverage.corridors);
  const sourceRecords = new Map();
  for (const data of sourceRates) {
    for (const snapshot of data.history) {
      for (const rate of snapshot.rates) {
        sourceRecords.set(rate.id, {
          corridor: data.corridor,
          crawlRunId: snapshot.id,
          rate,
        });
      }
    }
  }
  const currentIds = new Set(sourceRates.flatMap((data) => data.current.rates.map(({ id }) => id)));
  for (const id of currentIds) {
    if (!sourceRecords.has(id)) throw new Error(`Current quote is missing from history: ${id}`);
  }
  const existingIds = new Set(targetRates.flatMap((data) => [
    ...data.current.rates.map(({ id }) => id),
    ...data.history.flatMap(({ rates }) => rates.map(({ id }) => id)),
  ]));
  const pending = [...sourceRecords.values()]
    .filter(({ rate }) => !existingIds.has(rate.id))
    .sort((a, b) => Date.parse(a.rate.capturedAt) - Date.parse(b.rate.capturedAt));
  console.log(`${sourceRecords.size} archived quotes found; ${existingIds.size} already stored; ${pending.length} pending`);
  const inserted = await mapLimit(pending, 4, (record, index) => migrate(record, index, pending.length));

  for (const run of coverage.runs) {
    if (!run.completedAt) continue;
    await ingest({
      kind: "run-summary",
      crawlRunId: run.id,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      attempted: run.attempted,
      succeeded: run.succeeded,
      failed: run.failed,
      errorSummary: run.errorSummary ?? "",
    });
  }

  const finalCoverage = await getJson(`${target}/api/coverage`);
  if (
    finalCoverage.populatedCorridors !== coverage.populatedCorridors
    || finalCoverage.latestProviderRecords !== coverage.latestProviderRecords
    || finalCoverage.newestCaptureAt !== coverage.newestCaptureAt
  ) {
    throw new Error(`Final coverage mismatch: ${JSON.stringify(finalCoverage)}`);
  }
  console.log(
    `Complete: ${inserted.reduce((sum, value) => sum + value, 0)} inserted; `
    + `${finalCoverage.populatedCorridors}/${finalCoverage.expectedCorridors} corridors; `
    + `${finalCoverage.latestProviderRecords} current records; newest ${finalCoverage.newestCaptureAt}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
