import { execFileSync } from "node:child_process";
import { basicResult, numeric } from "./shared.mjs";

const destinationSlugByLocale = {
  es: "spain",
  fr: "france",
  de: "germany",
  ie: "ireland",
  it: "italy",
  nl: "netherlands",
  pt: "portugal",
  pl: "poland",
  ch: "switzerland",
  us: "united-states-of-america",
  ca: "canada",
  au: "australia",
  nz: "new-zealand",
  in: "india",
  pk: "pakistan",
  ph: "philippines",
  ae: "united-arab-emirates",
  za: "south-africa",
  ng: "nigeria",
  sg: "singapore",
  hk: "hong-kong",
};

function getJson(url) {
  const text = execFileSync("curl", ["-sS", "--max-time", "45", "-A", "Mozilla/5.0", url], {
    encoding: "utf8",
    maxBuffer: 8_000_000,
  });
  if (!text.trim()) throw new Error("Instarem returned an empty public response");
  return JSON.parse(text);
}

export const instarem = {
  slug: "instarem",
  name: "Instarem",
  homepage: "https://www.instarem.com/en-gb/",
  cacheKey(corridor) {
    return `${corridor.sourceLocale}:${corridor.destinationLocale}:${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return corridor.sourceLocale === "gb" && Boolean(destinationSlugByLocale[corridor.destinationLocale]);
  },
  async capture(page, corridor, capturedAt) {
    const apiBase = "https://www.instarem.com/api";
    const feeParams = new URLSearchParams({
      source_currency: corridor.sourceCurrency,
      source_amount: String(corridor.sourceAmount),
      destination_currency: corridor.destinationCurrency,
      country_code: "GB",
    });
    const methodsPayload = getJson(`${apiBase}/v1/public/payment-method/fee?${feeParams}`);
    if (!Array.isArray(methodsPayload?.data)) throw new Error("Instarem did not return public payment methods for this route");
    const bankMethod = methodsPayload.data.find((method) => /bank transfer/i.test(method.text || ""));
    if (!bankMethod?.key) throw new Error("Instarem did not offer public bank transfer funding for this route");

    const quoteParams = new URLSearchParams({
      source_currency: corridor.sourceCurrency,
      destination_currency: corridor.destinationCurrency,
      instarem_bank_account_id: String(bankMethod.key),
      country_code: "GB",
      source_amount: String(corridor.sourceAmount),
    });
    const quoteUrl = `${apiBase}/v1/public/transaction/computed-value?${quoteParams}`;
    const quotePayload = getJson(quoteUrl);
    const data = quotePayload?.data;
    if (!quotePayload?.success || !data) throw new Error("Instarem did not return a complete public quote");

    const sourceAmount = numeric(String(data.gross_source_amount));
    const recipientAmount = numeric(String(data.destination_amount));
    const feeAmount = numeric(String(data.transaction_config?.total_fee_amount ?? 0));
    const exchangeRate = numeric(String(data.instarem_fx_rate));
    if (Math.abs(sourceAmount - corridor.sourceAmount) >= 0.01) throw new Error("Instarem did not quote the requested amount");
    if (data.source_currency !== corridor.sourceCurrency || data.destination_currency !== corridor.destinationCurrency) {
      throw new Error("Instarem returned the wrong currencies");
    }

    const regularRate = numeric(String(data.regular_instarem_fx_rate || exchangeRate));
    const regularFee = numeric(String(data.transaction_config?.regular_total_fee_amount ?? feeAmount));
    const promotion = Boolean(data.first_instarem_transaction && (exchangeRate > regularRate || feeAmount < regularFee));
    const evidenceBody = JSON.stringify({ paymentMethod: bankMethod, quote: quotePayload }, null, 2);
    await page.route((candidate) => candidate.href === quoteUrl, (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: evidenceBody,
    }), { times: 1 });
    const evidenceResponse = await page.goto(quoteUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    if (!evidenceResponse?.ok()) throw new Error(`Instarem evidence view returned ${evidenceResponse?.status() ?? "no response"}`);
    const evidenceText = await page.locator("body").innerText();
    if (!evidenceText.includes(String(recipientAmount)) || !evidenceText.includes("Bank Transfer")) {
      throw new Error("Instarem evidence view did not contain the parsed bank transfer quote");
    }
    const screenshot = await page.screenshot({ type: "png", fullPage: true, timeout: 20_000 });

    return basicResult(this, corridor, capturedAt, {
      quoteType: promotion ? "indicative" : "verified",
      recipientAmount,
      feeAmount,
      feeCurrency: corridor.sourceCurrency,
      exchangeRate,
      quoteUrl,
      deliveryEstimate: "Check provider",
      planName: promotion ? "First-transfer Instarem offer" : "Bank transfer to bank account",
      promotion,
      screenshot,
      raw: {
        parser: "public-bank-transfer-api-and-calculator",
        paymentMethod: bankMethod.text,
        paymentMethodCode: bankMethod.code,
        regularRate,
        regularFee,
        rateLastUpdated: data.transaction_config?.fx_rate_last_updated,
        evidence: "Exact public payment method and quote responses rendered as JSON for the proof screenshot",
        warning: promotion ? "The anonymous public quote uses Instarem's first-transfer rate and is excluded from the standard winner." : undefined,
      },
    });
  },
};
