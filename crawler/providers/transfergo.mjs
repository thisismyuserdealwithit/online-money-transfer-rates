import { basicResult, numeric, UnsupportedRouteError } from "./shared.mjs";
import { execFileSync } from "node:child_process";

const supportedSourceLocales = new Set(["gb", "es", "fr", "de", "ie", "it", "nl", "pt", "pl"]);
const bankFundingCodes = new Set(["bank", "tink", "openBanking"]);
const bankPayoutCodes = new Set(["accountIdentifier", "iban", "bankAccount", "swift", "ngLocalAccountNgn"]);

function isBankToBank(option) {
  return option?.availability?.isAvailable !== false
    && bankFundingCodes.has(option?.payIn?.code)
    && bankPayoutCodes.has(option?.payOut?.code);
}

export function selectBankToBankOption(options) {
  if (!Array.isArray(options)) return undefined;
  const defaultOption = options.find((item) => item.isDefault);
  return isBankToBank(defaultOption) ? defaultOption : options.find(isBankToBank);
}

function countryCode(locale) {
  return locale === "gb" ? "GB" : locale.toUpperCase();
}

function deliveryLabel(value) {
  const labels = {
    in_one_business_day: "Within one business day",
    should_arrive_in_one_hour: "Usually within one hour",
    in_one_hour: "Usually within one hour",
    instant: "Usually in minutes",
  };
  return labels[value] ?? "Check provider";
}

export const transfergo = {
  slug: "transfergo",
  name: "TransferGo",
  homepage: "https://www.transfergo.com/gb/send-money-abroad",
  cacheKey(corridor) {
    return `${corridor.sourceLocale}:${corridor.destinationLocale}:${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return supportedSourceLocales.has(corridor.sourceLocale);
  },
  async capture(page, corridor, capturedAt) {
    const params = new URLSearchParams({
      fromCurrencyCode: corridor.sourceCurrency,
      toCurrencyCode: corridor.destinationCurrency,
      fromCountryCode: countryCode(corridor.sourceLocale),
      toCountryCode: countryCode(corridor.destinationLocale),
      amount: String(corridor.sourceAmount),
      calculationBase: "sendAmount",
      business: "0",
    });
    const url = `https://app.transfergo.com/api/booking/quotes?${params}`;
    const text = execFileSync("curl", ["-sS", "--max-time", "45", url], { encoding: "utf8", maxBuffer: 8_000_000 });
    if (!text.trim()) throw new Error("TransferGo returned an empty public quote");
    await page.route((candidate) => candidate.href === url, (route) => route.fulfill({ status: 200, contentType: "application/json", body: text }), { times: 1 });
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    if (!response?.ok()) throw new Error(`TransferGo quote endpoint returned ${response?.status() ?? "no response"}`);
    const visibleText = await page.locator("body").innerText();
    const payload = JSON.parse(visibleText);
    if (payload?.error) throw new Error(`TransferGo ${payload.error}`);
    const options = Array.isArray(payload?.options) ? payload.options : [];
    const defaultOption = options.find((item) => item.isDefault);
    const option = selectBankToBankOption(options);
    if (!option) {
      const defaultRoute = `${defaultOption?.payIn?.code ?? "unknown"} to ${defaultOption?.payOut?.code ?? "unknown"}`;
      throw new UnsupportedRouteError(`TransferGo offers no public bank-to-bank option; default is ${defaultRoute}`);
    }

    const sourceAmount = numeric(String(option.sendingAmount?.value));
    const recipientAmount = numeric(String(option.receivingAmount?.value));
    const feeAmount = numeric(String(option.fee?.value));
    const exchangeRate = numeric(String(option.rate?.value));
    if (Math.abs(sourceAmount - corridor.sourceAmount) >= 0.01) throw new Error("TransferGo did not quote the requested source amount");
    if (option.sendingAmount?.currency !== corridor.sourceCurrency || option.receivingAmount?.currency !== corridor.destinationCurrency) {
      throw new Error("TransferGo returned the wrong currencies");
    }
    const promotion = Boolean(option.promotion?.isApplied || option.promotion?.isFxDiscountApplied);
    const viewport = page.viewportSize() ?? { width: 1440, height: 1000 };
    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: viewport.width, height: Math.min(160, viewport.height) },
      timeout: 20_000,
    });

    return basicResult(this, corridor, capturedAt, {
      quoteType: promotion ? "indicative" : "verified",
      recipientAmount,
      feeAmount,
      feeCurrency: option.fee?.currency || corridor.sourceCurrency,
      exchangeRate,
      quoteUrl: page.url(),
      deliveryEstimate: deliveryLabel(option.visibility?.estimateLabel),
      planName: promotion ? "Promotional TransferGo quote" : "Bank transfer to bank account",
      promotion,
      screenshot,
      raw: {
        parser: "public-booking-quote-endpoint",
        optionCode: option.code,
        selectedDefaultOption: Boolean(option.isDefault),
        payIn: option.payIn.code,
        payOut: option.payOut.code,
        promotion: option.promotion,
      },
    });
  },
};
