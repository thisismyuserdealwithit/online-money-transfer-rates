import { env } from "cloudflare:workers";

type IngestPayload = {
  kind?: "quote" | "quote-batch" | "run-summary";
  id?: string; crawlRunId?: string; corridorSlug?: string; sourceCountry?: string;
  destinationCountry?: string; providerSlug?: string; providerName?: string;
  providerHomepage?: string; quoteType?: "verified" | "indicative";
  sourceAmount?: number; sourceCurrency?: string; recipientAmount?: number;
  recipientCurrency?: string; feeAmount?: number; feeCurrency?: string;
  exchangeRate?: number; deliveryEstimate?: string; fundingMethod?: string;
  payoutMethod?: string; planName?: string; promotion?: boolean; capturedAt?: string;
  quoteUrl?: string; screenshotBase64?: string; screenshotMimeType?: "image/png" | "image/jpeg";
  raw?: unknown;
  invalidatesPreviousCurrent?: boolean;
  startedAt?: string; completedAt?: string; attempted?: number; succeeded?: number;
  failed?: number; errorSummary?: string;
  quotes?: IngestPayload[];
};

type NormalizedQuote = {
  id: string; crawlRunId: string; corridorSlug: string; sourceCountry: string;
  destinationCountry: string; providerSlug: string; providerName: string;
  providerHomepage: string; quoteType: "verified" | "indicative";
  sourceAmount: number; sourceCurrency: string; recipientAmount: number;
  recipientCurrency: string; feeAmount: number; feeCurrency: string;
  exchangeRate: number; fundingMethod: string; payoutMethod: string;
  capturedAt: string; quoteUrl: string; previousStatus: "invalid" | "stale";
  deliveryEstimate: string | null; planName: string | null; promotion: number;
  rawPayload: string;
};

function requiredString(value: unknown, name: string, max = 500) {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error(`${name} is invalid`);
  return value.trim();
}

function currency(value: unknown, name: string) {
  const code = requiredString(value, name, 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) throw new Error(`${name} must be a three letter currency code`);
  return code;
}

function amount(value: unknown, name: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error(`${name} is invalid`);
  return value;
}

function bytesFromBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeQuote(body: IngestPayload): NormalizedQuote {
  const id = requiredString(body.id, "id", 100);
  const crawlRunId = requiredString(body.crawlRunId, "crawlRunId", 100);
  const corridorSlug = requiredString(body.corridorSlug, "corridorSlug", 100);
  const sourceCountry = requiredString(body.sourceCountry, "sourceCountry", 100);
  const destinationCountry = requiredString(body.destinationCountry, "destinationCountry", 100);
  const providerSlug = requiredString(body.providerSlug, "providerSlug", 60);
  const providerName = requiredString(body.providerName, "providerName", 100);
  const providerHomepage = requiredString(body.providerHomepage, "providerHomepage", 500);
  const quoteType = body.quoteType === "verified" ? "verified" : "indicative";
  const sourceAmount = amount(body.sourceAmount, "sourceAmount");
  const sourceCurrency = currency(body.sourceCurrency, "sourceCurrency");
  const recipientAmount = amount(body.recipientAmount, "recipientAmount");
  const recipientCurrency = currency(body.recipientCurrency, "recipientCurrency");
  const feeAmount = amount(body.feeAmount ?? 0, "feeAmount");
  const feeCurrency = currency(body.feeCurrency ?? sourceCurrency, "feeCurrency");
  const exchangeRate = amount(body.exchangeRate, "exchangeRate");
  const fundingMethod = requiredString(body.fundingMethod, "fundingMethod", 60);
  const payoutMethod = requiredString(body.payoutMethod, "payoutMethod", 60);
  const capturedAt = requiredString(body.capturedAt, "capturedAt", 40);
  if (!Number.isFinite(Date.parse(capturedAt))) throw new Error("capturedAt is invalid");
  const quoteUrl = requiredString(body.quoteUrl, "quoteUrl", 1000);
  if (!quoteUrl.startsWith("https://")) throw new Error("quoteUrl must use https");
  return {
    id, crawlRunId, corridorSlug, sourceCountry, destinationCountry, providerSlug,
    providerName, providerHomepage, quoteType, sourceAmount, sourceCurrency,
    recipientAmount, recipientCurrency, feeAmount, feeCurrency, exchangeRate,
    fundingMethod, payoutMethod, capturedAt, quoteUrl,
    previousStatus: body.invalidatesPreviousCurrent ? "invalid" : "stale",
    deliveryEstimate: typeof body.deliveryEstimate === "string" ? body.deliveryEstimate.slice(0, 200) : null,
    planName: typeof body.planName === "string" ? body.planName.slice(0, 200) : null,
    promotion: body.promotion ? 1 : 0,
    rawPayload: JSON.stringify(body.raw ?? {}),
  };
}

export async function POST(request: Request) {
  const configuredToken = (env as unknown as Record<string, unknown>).INGEST_TOKEN;
  const manualToken = (env as unknown as Record<string, unknown>).MANUAL_INGEST_TOKEN;
  const suppliedToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const allowedTokens = [configuredToken, manualToken].filter((value): value is string => typeof value === "string" && value.length > 0);
  if (!suppliedToken || !allowedTokens.includes(suppliedToken)) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as IngestPayload;
    if (body.kind === "run-summary") {
      const crawlRunId = requiredString(body.crawlRunId, "crawlRunId", 100);
      const startedAt = requiredString(body.startedAt, "startedAt", 40);
      const completedAt = requiredString(body.completedAt, "completedAt", 40);
      if (!Number.isFinite(Date.parse(startedAt)) || !Number.isFinite(Date.parse(completedAt))) throw new Error("Run timestamps are invalid");
      const attempted = Math.floor(amount(body.attempted, "attempted"));
      const succeeded = Math.floor(amount(body.succeeded, "succeeded"));
      const failed = Math.floor(amount(body.failed, "failed"));
      const status = succeeded === 0 ? "failed" : failed > 0 ? "partial" : "completed";
      const errorSummary = typeof body.errorSummary === "string" ? body.errorSummary.slice(0, 12_000) : null;
      await env.DB.prepare(`
        INSERT INTO crawl_runs (id, started_at, completed_at, status, attempted, succeeded, failed, error_summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          started_at = excluded.started_at,
          completed_at = excluded.completed_at,
          status = excluded.status,
          attempted = excluded.attempted,
          succeeded = excluded.succeeded,
          failed = excluded.failed,
          error_summary = excluded.error_summary
      `).bind(crawlRunId, startedAt, completedAt, status, attempted, succeeded, failed, errorSummary).run();
      return Response.json({ crawlRunId, status, stored: true }, { status: 201 });
    }
    if (body.kind === "quote-batch") {
      if (!Array.isArray(body.quotes) || body.quotes.length < 1 || body.quotes.length > 30) {
        throw new Error("quotes must contain between 1 and 30 records");
      }
      const quotes = body.quotes.map(normalizeQuote);
      const first = quotes[0];
      if (quotes.some((quote) => quote.corridorSlug !== first.corridorSlug || quote.crawlRunId !== first.crawlRunId)) {
        throw new Error("Batched quotes must share a corridor and crawl run");
      }
      const uniqueKeys = new Set<string>();
      if (quotes.some((quote) => {
        const key = `${quote.providerSlug}:${quote.capturedAt}`;
        if (uniqueKeys.has(key)) return true;
        uniqueKeys.add(key);
        return false;
      })) throw new Error("Batched quotes contain a duplicate provider capture");

      const screenshotBase64 = requiredString(body.screenshotBase64, "screenshotBase64", 9_000_000);
      const mime = body.screenshotMimeType === "image/jpeg" ? "image/jpeg" : "image/png";
      const screenshot = bytesFromBase64(screenshotBase64);
      if (screenshot.byteLength > 6_000_000) throw new Error("screenshot exceeds 6 MB");
      const digest = hex(await crypto.subtle.digest("SHA-256", screenshot));
      const extension = mime === "image/jpeg" ? "jpg" : "png";
      const screenshotKey = `proof/${first.corridorSlug}/${first.crawlRunId}/shared-${digest.slice(0, 20)}.${extension}`;
      const db = env.DB;
      const fresh: NormalizedQuote[] = [];
      for (const quote of quotes) {
        const existing = await db.prepare(`
          SELECT id FROM quotes
          WHERE corridor_slug = ? AND provider_slug = ? AND captured_at = ?
          LIMIT 1
        `).bind(quote.corridorSlug, quote.providerSlug, quote.capturedAt).first<{ id: string }>();
        if (!existing) fresh.push(quote);
      }
      if (!fresh.length) {
        return Response.json({ stored: true, duplicate: true, received: quotes.length, inserted: 0 });
      }

      await env.BUCKET.put(screenshotKey, screenshot, { httpMetadata: { contentType: mime, cacheControl: "public, max-age=31536000, immutable" } });
      const now = new Date().toISOString();
      await db.batch([
        db.prepare("INSERT OR IGNORE INTO corridors (slug, source_country, source_currency, destination_country, destination_currency, test_amount, active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)").bind(first.corridorSlug, first.sourceCountry, first.sourceCurrency, first.destinationCountry, first.recipientCurrency, first.sourceAmount, now),
        db.prepare("INSERT OR IGNORE INTO crawl_runs (id, started_at, status, attempted, succeeded, failed) VALUES (?, ?, 'running', 0, 0, 0)").bind(first.crawlRunId, first.capturedAt),
      ]);
      for (let index = 0; index < fresh.length; index += 4) {
        const chunk = fresh.slice(index, index + 4);
        const statements = [];
        for (const quote of chunk) {
          statements.push(
            db.prepare("INSERT OR IGNORE INTO providers (slug, name, homepage, enabled, created_at) VALUES (?, ?, ?, 1, ?)").bind(quote.providerSlug, quote.providerName, quote.providerHomepage, now),
            db.prepare("UPDATE quotes SET status = ? WHERE corridor_slug = ? AND provider_slug = ? AND status = 'current'").bind(quote.previousStatus, quote.corridorSlug, quote.providerSlug),
            db.prepare(`INSERT INTO quotes (
              id, crawl_run_id, corridor_slug, provider_slug, provider_name, quote_type, status,
              source_amount, source_currency, recipient_amount, recipient_currency, fee_amount, fee_currency,
              exchange_rate, delivery_estimate, funding_method, payout_method, plan_name, promotion,
              captured_at, quote_url, screenshot_key, screenshot_sha256, raw_payload, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'current', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
              .bind(quote.id, quote.crawlRunId, quote.corridorSlug, quote.providerSlug, quote.providerName, quote.quoteType, quote.sourceAmount, quote.sourceCurrency, quote.recipientAmount, quote.recipientCurrency, quote.feeAmount, quote.feeCurrency, quote.exchangeRate, quote.deliveryEstimate, quote.fundingMethod, quote.payoutMethod, quote.planName, quote.promotion, quote.capturedAt, quote.quoteUrl, screenshotKey, digest, quote.rawPayload, now),
          );
        }
        statements.push(db.prepare("UPDATE crawl_runs SET attempted = attempted + ?, succeeded = succeeded + ? WHERE id = ?").bind(chunk.length, chunk.length, first.crawlRunId));
        await db.batch(statements);
      }
      return Response.json({ stored: true, received: quotes.length, inserted: fresh.length, screenshotSha256: digest }, { status: 201 });
    }
    const id = requiredString(body.id, "id", 100);
    const crawlRunId = requiredString(body.crawlRunId, "crawlRunId", 100);
    const corridorSlug = requiredString(body.corridorSlug, "corridorSlug", 100);
    const sourceCountry = requiredString(body.sourceCountry, "sourceCountry", 100);
    const destinationCountry = requiredString(body.destinationCountry, "destinationCountry", 100);
    const providerSlug = requiredString(body.providerSlug, "providerSlug", 60);
    const providerName = requiredString(body.providerName, "providerName", 100);
    const providerHomepage = requiredString(body.providerHomepage, "providerHomepage", 500);
    const quoteType = body.quoteType === "verified" ? "verified" : "indicative";
    const sourceAmount = amount(body.sourceAmount, "sourceAmount");
    const sourceCurrency = currency(body.sourceCurrency, "sourceCurrency");
    const recipientAmount = amount(body.recipientAmount, "recipientAmount");
    const recipientCurrency = currency(body.recipientCurrency, "recipientCurrency");
    const feeAmount = amount(body.feeAmount ?? 0, "feeAmount");
    const feeCurrency = currency(body.feeCurrency ?? sourceCurrency, "feeCurrency");
    const exchangeRate = amount(body.exchangeRate, "exchangeRate");
    const fundingMethod = requiredString(body.fundingMethod, "fundingMethod", 60);
    const payoutMethod = requiredString(body.payoutMethod, "payoutMethod", 60);
    const capturedAt = requiredString(body.capturedAt, "capturedAt", 40);
    if (!Number.isFinite(Date.parse(capturedAt))) throw new Error("capturedAt is invalid");
    const quoteUrl = requiredString(body.quoteUrl, "quoteUrl", 1000);
    if (!quoteUrl.startsWith("https://")) throw new Error("quoteUrl must use https");
    const screenshotBase64 = requiredString(body.screenshotBase64, "screenshotBase64", 9_000_000);
    const mime = body.screenshotMimeType === "image/jpeg" ? "image/jpeg" : "image/png";
    const screenshot = bytesFromBase64(screenshotBase64);
    if (screenshot.byteLength > 6_000_000) throw new Error("screenshot exceeds 6 MB");
    const digest = hex(await crypto.subtle.digest("SHA-256", screenshot));
    const extension = mime === "image/jpeg" ? "jpg" : "png";
    const screenshotKey = `proof/${corridorSlug}/${capturedAt.slice(0, 10)}/${id}.${extension}`;
    const now = new Date().toISOString();
    const previousStatus = body.invalidatesPreviousCurrent ? "invalid" : "stale";
    const db = env.DB;

    const existing = await db.prepare(`
      SELECT id, screenshot_sha256
      FROM quotes
      WHERE corridor_slug = ? AND provider_slug = ? AND captured_at = ?
      LIMIT 1
    `).bind(corridorSlug, providerSlug, capturedAt).first<{ id: string; screenshot_sha256: string }>();

    if (existing) {
      return Response.json({
        id: existing.id,
        screenshotSha256: existing.screenshot_sha256,
        stored: true,
        duplicate: true,
      });
    }

    await env.BUCKET.put(screenshotKey, screenshot, { httpMetadata: { contentType: mime, cacheControl: "public, max-age=31536000, immutable" } });
    await db.batch([
      db.prepare("INSERT OR IGNORE INTO corridors (slug, source_country, source_currency, destination_country, destination_currency, test_amount, active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)").bind(corridorSlug, sourceCountry, sourceCurrency, destinationCountry, recipientCurrency, sourceAmount, now),
      db.prepare("INSERT OR IGNORE INTO providers (slug, name, homepage, enabled, created_at) VALUES (?, ?, ?, 1, ?)").bind(providerSlug, providerName, providerHomepage, now),
      db.prepare("INSERT OR IGNORE INTO crawl_runs (id, started_at, status, attempted, succeeded, failed) VALUES (?, ?, 'running', 0, 0, 0)").bind(crawlRunId, capturedAt),
      db.prepare("UPDATE quotes SET status = ? WHERE corridor_slug = ? AND provider_slug = ? AND status = 'current'").bind(previousStatus, corridorSlug, providerSlug),
      db.prepare(`INSERT INTO quotes (
        id, crawl_run_id, corridor_slug, provider_slug, provider_name, quote_type, status,
        source_amount, source_currency, recipient_amount, recipient_currency, fee_amount, fee_currency,
        exchange_rate, delivery_estimate, funding_method, payout_method, plan_name, promotion,
        captured_at, quote_url, screenshot_key, screenshot_sha256, raw_payload, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'current', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(id, crawlRunId, corridorSlug, providerSlug, providerName, quoteType, sourceAmount, sourceCurrency, recipientAmount, recipientCurrency, feeAmount, feeCurrency, exchangeRate, body.deliveryEstimate ?? null, fundingMethod, payoutMethod, body.planName ?? null, body.promotion ? 1 : 0, capturedAt, quoteUrl, screenshotKey, digest, JSON.stringify(body.raw ?? {}), now),
      db.prepare("UPDATE crawl_runs SET attempted = attempted + 1, succeeded = succeeded + 1 WHERE id = ?").bind(crawlRunId),
    ]);

    return Response.json({ id, screenshotSha256: digest, stored: true }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid payload" }, { status: 400 });
  }
}
