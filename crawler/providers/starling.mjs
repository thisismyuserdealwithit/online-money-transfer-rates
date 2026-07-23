import { execFileSync } from "node:child_process";
import { bankEvidenceScreenshot } from "./bank-evidence.mjs";
import { basicResult, numeric } from "./shared.mjs";

const supportedDestinationCurrencies = new Set(["AUD", "CAD", "CHF", "EUR", "HKD", "NZD", "PLN", "SGD", "USD", "ZAR"]);
const localDeliveryCurrencies = new Set(["EUR", "PLN", "USD"]);

function getJson(url) {
  const text = execFileSync("curl", ["-sS", "--max-time", "45", "-A", "Mozilla/5.0", url], {
    encoding: "utf8",
    maxBuffer: 4_000_000,
  });
  if (!text.trim()) throw new Error("Starling returned an empty public rate response");
  return JSON.parse(text);
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
    const response = getJson(quoteUrl);
    const exchangeRate = numeric(String(response?.forward?.rate));
    if (response?.forward?.sourceCurrency !== "GBP" || response?.forward?.targetCurrency !== corridor.destinationCurrency) {
      throw new Error("Starling returned the wrong currency pair");
    }
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
