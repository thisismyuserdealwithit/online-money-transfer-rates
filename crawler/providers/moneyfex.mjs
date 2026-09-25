import { execFileSync } from "node:child_process";
import { basicResult, UnsupportedRouteError } from "./shared.mjs";

const quoteEndpoint = "https://www.moneyfex.com/EstimationSummary/GetTransferSummary";
const destinationCurrencyByLocale = {
  es: "EUR", fr: "EUR", de: "EUR", ie: "EUR", it: "EUR", nl: "EUR", pt: "EUR", ng: "NGN",
};

function supports(corridor) {
  return corridor.sourceLocale === "gb"
    && corridor.sourceCurrency === "GBP"
    && Object.hasOwn(destinationCurrencyByLocale, corridor.destinationLocale)
    && destinationCurrencyByLocale[corridor.destinationLocale] === corridor.destinationCurrency;
}

export function moneyfexRequest(corridor) {
  if (!supports(corridor)) throw new UnsupportedRouteError("MoneyFex does not list this route in the supported public calculator destinations");
  if (typeof corridor.sourceAmount !== "number" || !Number.isFinite(corridor.sourceAmount) || corridor.sourceAmount <= 0) {
    throw new Error("MoneyFex requires a positive source amount");
  }
  return {
    SendingAmount: corridor.sourceAmount,
    ReceivingAmount: 0,
    SendingCurrency: corridor.sourceCurrency,
    ReceivingCurrency: corridor.destinationCurrency,
    SendingCountry: corridor.sourceLocale.toUpperCase(),
    ReceivingCountry: corridor.destinationLocale.toUpperCase(),
    IsReceivingAmount: false,
    TransferMethod: 4,
  };
}

function numberField(response, field, allowZero = false) {
  const value = response[field];
  if (typeof value !== "number" || !Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) {
    throw new Error(`MoneyFex returned an invalid or missing ${field}`);
  }
  return value;
}

export function parseMoneyfexQuote(payload, corridor) {
  const request = moneyfexRequest(corridor);
  const response = payload?.response;
  if (!response || typeof response !== "object" || Array.isArray(response)) throw new Error("MoneyFex returned no public quote");
  if (response.IsValid?.Data !== true) throw new Error("MoneyFex did not validate the requested public quote");
  for (const field of ["SendingAmount", "SendingCurrency", "ReceivingCurrency", "SendingCountry", "ReceivingCountry", "TransferMethod"]) {
    if (response[field] !== request[field]) throw new Error(`MoneyFex returned the wrong ${field}`);
  }
  const sourceAmount = numberField(response, "SendingAmount");
  const recipientAmount = numberField(response, "ReceivingAmount");
  const feeAmount = numberField(response, "Fee", true);
  const totalDebit = numberField(response, "TotalAmount");
  const exchangeRate = numberField(response, "ExchangeRate");
  if (Math.abs(totalDebit - sourceAmount - feeAmount) > 0.010001) {
    throw new Error("MoneyFex total debit does not equal the sending amount plus the fee");
  }
  if (Math.abs(recipientAmount - sourceAmount * exchangeRate) > 0.010001) {
    throw new Error("MoneyFex recipient amount does not match the quoted exchange rate");
  }
  for (const field of ["IsIntroductoryRate", "IsIntroductoryFee"]) {
    if (typeof response[field] !== "boolean") throw new Error(`MoneyFex returned an invalid or missing ${field}`);
  }
  return {
    recipientAmount,
    feeAmount,
    feeCurrency: corridor.sourceCurrency,
    exchangeRate,
    totalDebit,
    promotion: response.IsIntroductoryRate || response.IsIntroductoryFee,
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

export const moneyfex = {
  slug: "moneyfex",
  name: "MoneyFex",
  homepage: "https://www.moneyfex.com/",
  supports,
  cacheKey(corridor) {
    return `${corridor.sourceLocale}:${corridor.destinationLocale}:${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  async capture(page, corridor, capturedAt) {
    const request = moneyfexRequest(corridor);
    const requestBody = JSON.stringify(request);
    const responseBody = execFileSync("curl", [
      "--silent", "--show-error", "--fail", "--max-time", "45",
      "--header", "Content-Type: application/json",
      "--header", "Accept: application/json",
      "--data-binary", "@-", quoteEndpoint,
    ], { input: requestBody, encoding: "utf8", maxBuffer: 2_000_000, timeout: 50_000 });
    if (!responseBody.trim()) throw new Error("MoneyFex returned an empty public quote");
    const payload = JSON.parse(responseBody);
    const { totalDebit, ...values } = parseMoneyfexQuote(payload, corridor);
    const observedAt = new Date(capturedAt).toISOString();
    await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>MoneyFex public API capture</title>
      <style>body{margin:0;background:#f2f5f7;color:#122333;font:17px/1.5 Arial,sans-serif}main{max-width:1240px;margin:32px auto;background:#fff;padding:36px;border:1px solid #d6dfe7;border-radius:12px}h1{margin:0 0 12px;font-size:30px}h2{font-size:20px;margin:24px 0 8px}.label{color:#315d75;font-weight:700}p{margin:8px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f2f5f7;padding:18px;border:1px solid #d6dfe7;font:14px/1.5 monospace}.summary{padding:16px;background:#eaf3f5;margin:20px 0}</style></head><body><main>
      <div class="label">OMT evidence record · public API capture</div><h1>MoneyFex public calculator response</h1>
      <p>This evidence page was rendered by OMT from the public API response. It is not a screenshot of MoneyFex's website.</p>
      <p>Observed: ${escapeHtml(observedAt)} (UTC)</p><p>Provider: ${escapeHtml(this.homepage)}</p><p>Source: POST ${escapeHtml(quoteEndpoint)}</p>
      <div class="summary"><p>Sending amount: ${escapeHtml(corridor.sourceAmount)} ${escapeHtml(corridor.sourceCurrency)} · Fee added: ${escapeHtml(values.feeAmount)} ${escapeHtml(values.feeCurrency)} · Total debit: ${escapeHtml(totalDebit)} ${escapeHtml(corridor.sourceCurrency)}</p>
      <p>Recipient amount: ${escapeHtml(values.recipientAmount)} ${escapeHtml(corridor.destinationCurrency)} · Exchange rate: ${escapeHtml(values.exchangeRate)}</p>
      <p>Bank deposit · Funding: not selected in the public calculator · Promotional quote: ${values.promotion ? "yes" : "no"}</p>
      <p>Indicative estimate, excluded from the standard winner. Confirm the funding method and final price with MoneyFex.</p></div>
      <h2>Exact request body</h2><pre>${escapeHtml(requestBody)}</pre><h2>Exact response body</h2><pre>${escapeHtml(responseBody)}</pre>
      </main></body></html>`, { waitUntil: "domcontentloaded", timeout: 20_000 });
    const screenshot = await page.screenshot({ type: "png", fullPage: true, timeout: 20_000 });
    return basicResult(this, corridor, capturedAt, {
      ...values,
      quoteType: "indicative",
      fundingMethod: "Not selected in public calculator",
      payoutMethod: "Bank deposit",
      quoteUrl: this.homepage,
      planName: "Public calculator; fee added to sending amount",
      screenshot,
      raw: {
        parser: "moneyfex-public-calculator-api",
        evidenceSource: "MoneyFex public calculator API",
        endpoint: quoteEndpoint,
        request,
        response: payload,
        totalDebit,
        feeTreatment: "added-to-sending-amount",
        evidence: "OMT-rendered capture of the exact public API request and response; not a provider website screenshot",
        warning: "Funding method is not selected in the public calculator. Any fee is added to the sending amount when calculating the total debit. This estimate is excluded from the standard winner.",
      },
    });
  },
};
