import { execFileSync } from "node:child_process";
import { basicResult, numeric } from "./shared.mjs";

const supportedSourceCurrencies = new Set(["GBP", "EUR"]);
const supportedDestinationCurrencies = new Set(["AUD", "CAD", "DKK", "EUR", "GBP", "NOK", "PLN", "SEK", "USD"]);

function getJson(url) {
  const text = execFileSync("curl", ["-sS", "--max-time", "45", "-A", "Mozilla/5.0", url], {
    encoding: "utf8",
    maxBuffer: 8_000_000,
  });
  if (!text.trim()) throw new Error("Atlantic Money returned an empty public response");
  return { payload: JSON.parse(text), text };
}

export const atlanticMoney = {
  slug: "atlanticmoney",
  name: "Atlantic Money",
  homepage: "https://atlantic.money/gb/en/",
  cacheKey(corridor) {
    return `${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return supportedSourceCurrencies.has(corridor.sourceCurrency)
      && supportedDestinationCurrencies.has(corridor.destinationCurrency)
      && corridor.sourceCurrency !== corridor.destinationCurrency;
  },
  async capture(page, corridor, capturedAt) {
    const params = new URLSearchParams({
      sourceCurrencyCode: corridor.sourceCurrency,
      destinationCurrencyCode: corridor.destinationCurrency,
      entryMode: "source",
      amount: String(corridor.sourceAmount),
    });
    const quoteUrl = `https://api.atlantic.money/gw/transfer/public/v2/estimate?${params}`;
    const { payload, text } = getJson(quoteUrl);
    const results = payload?.payload?.results;
    if (!Array.isArray(results)) throw new Error("Atlantic Money did not return public transfer options");
    const option = results.find((candidate) => candidate.deliveryOption?.type === "standard");
    if (!option || (Array.isArray(option.checks) && option.checks.length)) {
      throw new Error("Atlantic Money did not return an available standard quote");
    }

    const sourceAmount = numeric(String(option.sourceMoney?.amount));
    const recipientAmount = numeric(String(option.destinationMoney?.amount));
    const feeAmount = numeric(String(option.totalFee?.amount));
    const exchangeRate = numeric(String(option.quote?.rate));
    if (Math.abs(sourceAmount - corridor.sourceAmount) >= 0.01) throw new Error("Atlantic Money did not quote the requested amount");
    if (option.sourceMoney?.currency?.code !== corridor.sourceCurrency || option.destinationMoney?.currency?.code !== corridor.destinationCurrency) {
      throw new Error("Atlantic Money returned the wrong currencies");
    }
    const expectedRecipient = (sourceAmount - feeAmount) * exchangeRate;
    if (Math.abs(expectedRecipient - recipientAmount) > 0.02) throw new Error("Atlantic Money quote failed its amount cross-check");

    const standardFee = numeric(String(option.fixedFeeWithoutPromo?.amount ?? feeAmount));
    const promotion = feeAmount + 0.001 < standardFee;
    await page.route((candidate) => candidate.href === quoteUrl, (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: text,
    }), { times: 1 });
    const evidenceResponse = await page.goto(quoteUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    if (!evidenceResponse?.ok()) throw new Error(`Atlantic Money evidence view returned ${evidenceResponse?.status() ?? "no response"}`);
    const evidenceText = await page.locator("body").innerText();
    if (!evidenceText.includes(String(recipientAmount)) || !evidenceText.includes('"type":"standard"')) {
      throw new Error("Atlantic Money evidence view did not contain the standard quote");
    }
    const screenshot = await page.screenshot({ type: "png", fullPage: true, timeout: 20_000 });

    return basicResult(this, corridor, capturedAt, {
      quoteType: promotion ? "indicative" : "verified",
      recipientAmount,
      feeAmount,
      feeCurrency: option.totalFee?.currency?.code || corridor.sourceCurrency,
      exchangeRate,
      quoteUrl,
      deliveryEstimate: option.deliveryOption?.deliveryDate ? `By ${option.deliveryOption.deliveryDate.slice(0, 10)}` : "Check provider",
      planName: promotion ? "Promotional Atlantic Money fee" : "Standard bank transfer",
      promotion,
      screenshot,
      raw: {
        parser: "public-standard-estimate-api",
        quoteType: option.quote?.type,
        quoteExpiresAt: option.quote?.expiresAt,
        fixedFee: option.fixedFee?.amount,
        standardFee: option.fixedFeeWithoutPromo?.amount,
        deliveryOption: option.deliveryOption?.type,
        evidence: "Exact public estimate response rendered as JSON for the proof screenshot",
        warning: promotion ? "A promotional fee was applied and this result is excluded from the standard winner." : undefined,
      },
    });
  },
};
