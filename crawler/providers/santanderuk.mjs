import { bankEvidenceScreenshot } from "./bank-evidence.mjs";
import { ecbGbpToTarget } from "./ecb-reference.mjs";
import { basicResult } from "./shared.mjs";

const supportedDestinationCurrencies = new Set(["AUD", "CAD", "CHF", "EUR", "HKD", "INR", "NZD", "PHP", "PLN", "SGD", "USD", "ZAR"]);
const pricingSource = "https://www.santander.co.uk/personal/support/current-accounts/making-international-payments";

export const santanderUk = {
  slug: "santanderuk",
  name: "Santander UK",
  homepage: pricingSource,
  cacheKey(corridor) {
    return `${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return corridor.sourceCurrency === "GBP" && supportedDestinationCurrencies.has(corridor.destinationCurrency);
  },
  async capture(page, corridor, capturedAt) {
    const reference = ecbGbpToTarget(corridor.destinationCurrency);
    const paymentFee = 25;
    const publishedMarkupPercent = 3;
    const exchangeRate = reference.rate * (1 - publishedMarkupPercent / 100);
    const recipientAmount = Number(((corridor.sourceAmount - paymentFee) * exchangeRate).toFixed(2));
    const proofUrl = new URL(pricingSource);
    proofUrl.searchParams.set("currency", corridor.destinationCurrency);
    proofUrl.searchParams.set("totalBudget", String(corridor.sourceAmount));
    const evidence = {
      provider: "Santander UK",
      capturedAt,
      classification: "Transparent benchmark model, not a customer quote",
      transferCase: {
        totalBudget: corridor.sourceAmount,
        paymentFee,
        amountConverted: corridor.sourceAmount - paymentFee,
        sourceCurrency: "GBP",
        recipientCurrency: corridor.destinationCurrency,
      },
      ecbDailyReference: reference,
      bankPublishedPricingApplied: {
        exchangeRateMarkupPercent: publishedMarkupPercent,
        publishedBand: "International payments up to £10,000",
        internationalPaymentFee: paymentFee,
      },
      modelExchangeRate: exchangeRate,
      modelRecipientAmount: recipientAmount,
      sources: { pricingSource },
    };
    const screenshot = await bankEvidenceScreenshot(page, proofUrl.toString(), evidence, ["Santander UK", recipientAmount, publishedMarkupPercent]);

    return basicResult(this, corridor, capturedAt, {
      quoteType: "indicative",
      recipientAmount,
      feeAmount: paymentFee,
      feeCurrency: "GBP",
      exchangeRate,
      quoteUrl: proofUrl.toString(),
      deliveryEstimate: "International payment",
      planName: "ECB reference rate less Santander's published 3% markup, plus £25 payment fee",
      screenshot,
      raw: {
        parser: "ecb-reference-plus-published-bank-pricing-model",
        referenceDate: reference.referenceDate,
        totalDebit: corridor.sourceAmount,
        evidence: "ECB daily reference rate and Santander's published markup and payment fee rendered as a transparent benchmark",
        warning: "This is a reproducible pricing model, not a Santander customer quote, so it cannot win the comparison.",
      },
    });
  },
};
