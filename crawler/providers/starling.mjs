import { execFileSync } from "node:child_process";
import { bankEvidenceScreenshot } from "./bank-evidence.mjs";
import { basicResult } from "./shared.mjs";

const supportedDestinationCurrencies = new Set(["AUD", "CAD", "CHF", "EUR", "HKD", "NZD", "PLN", "SGD", "USD", "ZAR"]);
const localDeliveryCurrencies = new Set(["EUR", "PLN", "USD"]);

function getResponse(url) {
  return execFileSync("curl", ["-sS", "--max-time", "45", "-A", "Mozilla/5.0", "--write-out", "\n%{http_code}", url], {
    encoding: "utf8",
    maxBuffer: 4_000_000,
  });
}

// curl appends the original HTTP status after the response body. Do not replace
// a rejected public API request with a synthetic successful browser response.
export function parseStarlingHttpResponse(text, corridor) {
  const separator = text.lastIndexOf("\n");
  const statusText = text.slice(separator + 1).trim();
  const status = Number(statusText);
  if (separator < 0 || !/^\d{3}$/.test(statusText) || status < 100 || status > 599) {
    throw new Error("Starling public rate response has no valid HTTP status");
  }
  const body = text.slice(0, separator).trim();
  let response;
  try {
    response = JSON.parse(body);
  } catch {
    if (status < 200 || status >= 300) {
      throw new Error(`Starling public rate endpoint returned HTTP ${status}`);
    }
    throw new Error(body ? "Starling returned an invalid JSON rate response" : "Starling returned an empty public rate response");
  }
  const errors = Array.isArray(response?.errors)
    ? response.errors.map((error) => typeof error?.message === "string" ? error.message.slice(0, 120) : "").filter(Boolean).slice(0, 3)
    : [];
  const detail = errors.length ? `: ${errors.join("; ")}` : "";
  if (status < 200 || status >= 300) {
    throw new Error(`Starling public rate endpoint returned HTTP ${status}${detail}`);
  }
  if (response?.success === false || (Array.isArray(response?.errors) && response.errors.length > 0)) {
    throw new Error(`Starling rejected the public rate request${detail}`);
  }
  const forward = response?.forward;
  if (corridor.sourceCurrency !== "GBP" || forward?.sourceCurrency !== corridor.sourceCurrency || forward?.targetCurrency !== corridor.destinationCurrency) {
    throw new Error("Starling returned the wrong currency pair");
  }
  const rawRate = forward.rate;
  const exchangeRate = typeof rawRate === "number" ? rawRate
    : typeof rawRate === "string" && /^\d+(?:\.\d+)?$/.test(rawRate.trim()) ? Number(rawRate) : NaN;
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    throw new Error("Starling returned an invalid exchange rate");
  }
  return { response, exchangeRate };
}

export const starling = {
  slug: "starling",
  name: "Starling Bank",
  homepage: "https://www.starlingbank.com/send-money-abroad/",
  cacheKey(corridor) {
    return `${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return corridor.sourceCurrency === "GBP" && supportedDestinationCurrencies.has(corridor.destinationCurrency);
  },
  async capture(page, corridor, capturedAt) {
    const quoteUrl = `https://api.starlingbank.com/api/v2/fx/rates/?targetCurrency=${corridor.destinationCurrency}&sourceCurrency=GBP`;
    const { response, exchangeRate } = parseStarlingHttpResponse(getResponse(quoteUrl), corridor);
    const conversionFee = Number((corridor.sourceAmount * 0.004).toFixed(2));
    const deliveryFee = localDeliveryCurrencies.has(corridor.destinationCurrency) ? 0.30 : 5.50;
    const feeAmount = Number((conversionFee + deliveryFee).toFixed(2));
    const recipientAmount = Number(((corridor.sourceAmount - feeAmount) * exchangeRate).toFixed(2));
    const evidence = {
      provider: "Starling Bank",
      capturedAt,
      transferCase: {
        sourceAmount: corridor.sourceAmount,
        sourceCurrency: "GBP",
        recipientCurrency: corridor.destinationCurrency,
        fundingMethod: "Starling current account balance",
        payoutMethod: "Bank deposit",
      },
      livePublicRateResponse: response,
      publishedFeesApplied: {
        conversionFeePercent: 0.4,
        conversionFee,
        deliveryNetwork: localDeliveryCurrencies.has(corridor.destinationCurrency) ? "local" : "SWIFT",
        deliveryFee,
        totalFee: feeAmount,
      },
      calculatedRecipientAmount: recipientAmount,
      sources: {
        rateAndConversionFee: "https://www.starlingbank.com/send-money-abroad/",
        countryDeliveryFees: "https://www.starlingbank.com/send-money-abroad/country-fees/",
      },
    };
    const screenshot = await bankEvidenceScreenshot(page, quoteUrl, evidence, ["Starling Bank", recipientAmount, exchangeRate]);

    return basicResult(this, corridor, capturedAt, {
      quoteType: "verified",
      recipientAmount,
      feeAmount,
      feeCurrency: "GBP",
      exchangeRate,
      quoteUrl,
      deliveryEstimate: localDeliveryCurrencies.has(corridor.destinationCurrency) ? "Local bank network" : "SWIFT transfer",
      planName: "Starling personal account, public live rate and published fees",
      screenshot,
      raw: {
        parser: "public-live-rate-api-plus-published-fee-schedule",
        conversionFee,
        deliveryFee,
        totalDebit: corridor.sourceAmount,
        evidence: "Starling's public live rate response and the applicable published fee calculation rendered as JSON",
      },
    });
  },
};
