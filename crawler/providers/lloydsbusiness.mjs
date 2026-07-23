import { bankEvidenceScreenshot } from "./bank-evidence.mjs";
import { ecbGbpToTarget } from "./ecb-reference.mjs";
import { basicResult } from "./shared.mjs";

const supportedDestinationCurrencies = new Set(["AUD", "CAD", "CHF", "EUR", "HKD", "INR", "NZD", "PHP", "PLN", "SGD", "USD", "ZAR"]);
const marginSource = "https://www.lloydsbank.com/business/fx-margins.html";
const feeSource = "https://www.lloydsbank.com/business/commercial-banking/rates-and-charges/international-services-rates-and-charges.html";

export const lloydsBusiness = {
  slug: "lloydsbusiness",
  name: "Lloyds Bank Business",
  homepage: marginSource,
  cacheKey(corridor) {
    return `${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return corridor.sourceCurrency === "GBP" && supportedDestinationCurrencies.has(corridor.destinationCurrency);
  },
  async capture(page, corridor, capturedAt) {
    const reference = ecbGbpToTarget(corridor.destinationCurrency);
    const paymentFee = 15;
    const publishedMarginPercent = 2.60;
    const exchangeRate = reference.rate * (1 - publishedMarginPercent / 100);
    const recipientAmount = Number(((corridor.sourceAmount - paymentFee) * exchangeRate).toFixed(2));
    const proofUrl = new URL(marginSource);
    proofUrl.searchParams.set("currency", corridor.destinationCurrency);
    proofUrl.searchParams.set("totalBudget", String(corridor.sourceAmount));
    const evidence = {
      provider: "Lloyds Bank Business",
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
        exchangeRateMarginPercent: publishedMarginPercent,
        marginBand: "Transfers below £25,000",
        onlineInternationalPaymentFee: paymentFee,
      },
      modelExchangeRate: exchangeRate,
      modelRecipientAmount: recipientAmount,
      sources: { marginSource, feeSource },
    };
    const screenshot = await bankEvidenceScreenshot(page, proofUrl.toString(), evidence, ["Lloyds Bank Business", recipientAmount, publishedMarginPercent]);

    return basicResult(this, corridor, capturedAt, {
      quoteType: "indicative",
      recipientAmount,
      feeAmount: paymentFee,
      feeCurrency: "GBP",
      exchangeRate,
      quoteUrl: proofUrl.toString(),
      deliveryEstimate: "Online international payment",
      planName: "ECB reference rate less Lloyds' published 2.60% margin, plus £15 online fee",
      screenshot,
      raw: {
        parser: "ecb-reference-plus-published-bank-pricing-model",
        referenceDate: reference.referenceDate,
        totalDebit: corridor.sourceAmount,
        evidence: "ECB daily reference rate and Lloyds' published margin and payment fee rendered as a transparent benchmark",
        warning: "This is a reproducible pricing model, not a Lloyds customer quote, so it cannot win the comparison.",
      },
    });
  },
};
