import { execFileSync } from "node:child_process";
import { bankEvidenceScreenshot } from "./bank-evidence.mjs";
import { basicResult, numeric } from "./shared.mjs";

const supportedDestinationCurrencies = new Set(["AED", "AUD", "CAD", "CHF", "EUR", "HKD", "INR", "NZD", "PHP", "PKR", "PLN", "SGD", "USD", "ZAR"]);
const calculatorUrl = "https://www.natwest.com/business/support-centre/making-and-accepting-payments/electronic-payments/international-transfers/fx-currency-calculator.html";
const endpoint = "https://www.natwest.com/services/tool/fxcurrency/indicative";
const resourcePath = "/content/natwest_com/en_uk/business/support-centre/making-and-accepting-payments/electronic-payments/international-transfers/fx-currency-calculator";

function fetchQuote(amount, targetCurrency) {
  const text = execFileSync("curl", [
    "-sS", "--max-time", "45", "-A", "Mozilla/5.0",
    "-H", `Referer: ${calculatorUrl}`,
    "-X", "POST", endpoint,
    "--data-urlencode", "fromCurrency=GBP",
    "--data-urlencode", `toCurrency=${targetCurrency}`,
    "--data-urlencode", `amount=${amount}`,
    "--data-urlencode", "amountCurrency=GBP",
    "--data-urlencode", "decimalPlaces=6",
    "--data-urlencode", `resourcePath=${resourcePath}`,
  ], { encoding: "utf8", maxBuffer: 4_000_000 });
  if (!text.trim()) throw new Error("NatWest returned an empty public calculator response");
  return JSON.parse(text);
}

export const natWestBusiness = {
  slug: "natwestbusiness",
  name: "NatWest Business",
  homepage: calculatorUrl,
  cacheKey(corridor) {
    return `${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return corridor.sourceCurrency === "GBP" && supportedDestinationCurrencies.has(corridor.destinationCurrency);
  },
  async capture(page, corridor, capturedAt) {
    const paymentFee = corridor.destinationCurrency === "EUR" ? 0.50 : 15;
    const conversionAmount = Number((corridor.sourceAmount - paymentFee).toFixed(2));
    const response = fetchQuote(conversionAmount, corridor.destinationCurrency);
    const data = response?.data;
    const exchangeRate = numeric(String(data?.indicativeRate));
    const recipientAmount = numeric(String(data?.counterAmount));
    if (data?.fromCurrency !== "GBP" || data?.toCurrency !== corridor.destinationCurrency) {
      throw new Error("NatWest returned the wrong currency pair");
    }
    if (Math.abs(numeric(String(data?.amount)) - conversionAmount) > 0.01) {
      throw new Error("NatWest returned the wrong conversion amount");
    }
    const proofUrl = new URL(calculatorUrl);
    proofUrl.searchParams.set("fromCurrency", "GBP");
    proofUrl.searchParams.set("toCurrency", corridor.destinationCurrency);
    proofUrl.searchParams.set("totalBudget", String(corridor.sourceAmount));
    const evidence = {
      provider: "NatWest Business",
      capturedAt,
      transferCase: {
        totalBudget: corridor.sourceAmount,
        paymentFee,
        amountConverted: conversionAmount,
        sourceCurrency: "GBP",
        recipientCurrency: corridor.destinationCurrency,
      },
      exactPublicCalculatorResponse: response,
      publishedFeeApplied: corridor.destinationCurrency === "EUR" ? "£0.50 SEPA payment" : "£15 online international payment",
      calculatedRecipientAmount: recipientAmount,
      sources: {
        liveCalculator: calculatorUrl,
        paymentFees: "https://www.natwest.com/business/support-centre/making-and-accepting-payments/electronic-payments/international-transfers.html",
      },
    };
    const screenshot = await bankEvidenceScreenshot(page, proofUrl.toString(), evidence, ["NatWest Business", recipientAmount, exchangeRate]);

    return basicResult(this, corridor, capturedAt, {
      quoteType: "indicative",
      recipientAmount,
      feeAmount: paymentFee,
      feeCurrency: "GBP",
      exchangeRate,
      quoteUrl: proofUrl.toString(),
      deliveryEstimate: corridor.destinationCurrency === "EUR" ? "SEPA payment" : "International payment",
      planName: "Business Current Account public indicative rate plus published payment fee",
      screenshot,
      raw: {
        parser: "public-business-indicative-calculator",
        providerTimestamp: data?.timestamp,
        conversionAmount,
        totalDebit: corridor.sourceAmount,
        evidence: "Exact NatWest public calculator response plus the applicable published payment fee rendered as JSON",
        warning: "NatWest labels this public Business Current Account rate indicative, so it cannot win the comparison.",
      },
    });
  },
};
