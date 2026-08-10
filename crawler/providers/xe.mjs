import { execFileSync } from "node:child_process";
import { basicResult } from "./shared.mjs";

function readNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!match?.[1]) throw new Error("Xe converter did not expose its server-rendered rate data");
  return { text: match[1], payload: JSON.parse(match[1]) };
}

export const xe = {
  slug: "xe",
  name: "Xe",
  homepage: "https://www.xe.com/",
  cacheKey(corridor) {
    return `${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return Boolean(corridor.sourceCurrency && corridor.destinationCurrency && corridor.sourceAmount);
  },
  async capture(page, corridor, capturedAt) {
    const params = new URLSearchParams({
      Amount: String(corridor.sourceAmount),
      From: corridor.sourceCurrency,
      To: corridor.destinationCurrency,
    });
    const quoteUrl = `https://www.xe.com/currencyconverter/convert/?${params}`;
    const html = execFileSync("curl", ["-sS", "-L", "--compressed", "--max-time", "45", "-A", "Mozilla/5.0", quoteUrl], {
      encoding: "utf8",
      maxBuffer: 20_000_000,
    });
    if (!html.trim()) throw new Error("Xe converter returned an empty public response");

    const { payload } = readNextData(html);
    const ratesData = payload?.props?.pageProps?.initialRatesData;
    const rates = ratesData?.rates;
    const sourceRate = Number(rates?.[corridor.sourceCurrency]);
    const destinationRate = Number(rates?.[corridor.destinationCurrency]);
    if (!Number.isFinite(sourceRate) || !Number.isFinite(destinationRate) || sourceRate <= 0 || destinationRate <= 0) {
      throw new Error(`Xe converter did not return ${corridor.sourceCurrency}/${corridor.destinationCurrency}`);
    }
    const exchangeRate = destinationRate / sourceRate;
    const recipientAmount = corridor.sourceAmount * exchangeRate;
    const xeTimestamp = Number(ratesData.timestamp);
    const quoteCapturedAt = Number.isFinite(xeTimestamp) ? new Date(xeTimestamp).toISOString() : capturedAt;

    const evidence = {
      evidenceSource: "Xe currency converter server-rendered data",
      quoteUrl,
      requestedAmount: corridor.sourceAmount,
      sourceCurrency: corridor.sourceCurrency,
      destinationCurrency: corridor.destinationCurrency,
      xeRatesTimestamp: quoteCapturedAt,
      usdBaseRates: {
        [corridor.sourceCurrency]: sourceRate,
        [corridor.destinationCurrency]: destinationRate,
      },
      calculation: {
        exchangeRate: `${destinationRate} / ${sourceRate}`,
        resultingRate: exchangeRate,
        indicativeRecipientAmount: recipientAmount,
      },
      notice: "Extracted exact fields from Xe's embedded public rate payload. This is an informational mid-market reference, not a transferable customer quote.",
    };

    // Display only the exact Xe fields used for this corridor. The complete
    // embedded table contains hundreds of unrelated currencies and can create a
    // proof image too large for ingestion.
    await page.route((candidate) => candidate.href === quoteUrl, (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(evidence, null, 2),
    }), { times: 1 });
    const response = await page.goto(quoteUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    if (!response?.ok()) throw new Error(`Xe evidence returned ${response?.status() ?? "no response"}`);
    const screenshot = await page.screenshot({ type: "png", fullPage: true, timeout: 20_000 });

    return basicResult(this, corridor, quoteCapturedAt, {
      quoteType: "indicative",
      recipientAmount,
      feeAmount: 0,
      feeCurrency: corridor.sourceCurrency,
      exchangeRate,
      quoteUrl,
      planName: "Xe mid-market reference only",
      deliveryEstimate: "Not a transfer quote",
      screenshot,
      raw: {
        parser: "xe-server-rendered-next-data",
        evidenceSource: "Xe currency converter, exact extracted rate fields",
        xeRatesTimestamp: quoteCapturedAt,
        usdBaseSourceRate: sourceRate,
        usdBaseDestinationRate: destinationRate,
        warning: "Xe states that its converter is informational and is not the rate customers receive. No transfer fee or payout availability is claimed.",
      },
    });
  },
};
