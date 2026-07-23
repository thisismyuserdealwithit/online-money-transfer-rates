import { basicResult, numeric } from "./shared.mjs";

function destinationCode(locale) {
  if (locale === "gb") return "UK";
  if (locale === "de") return "DE";
  return locale.toUpperCase();
}

async function publicJson(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(45_000) });
      const text = await response.text();
      if (!response.ok) throw new Error(`Ria public API returned ${response.status}`);
      if (!text.trim()) throw new Error("Ria returned an empty public response");
      return JSON.parse(text);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export const ria = {
  slug: "ria",
  name: "Ria Money Transfer",
  homepage: "https://www.riamoneytransfer.com/",
  cacheKey(corridor) {
    return `${corridor.sourceLocale}:${corridor.destinationLocale}:${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return corridor.sourceLocale === "us";
  },
  async capture(page, corridor, capturedAt) {
    const apiBase = "https://public.riamoneytransfer.com";
    const session = await publicJson(`${apiBase}/Authorization/session`);
    const token = session?.authToken?.jwtToken;
    if (!token) throw new Error("Ria did not issue a public quote session");

    const selections = {
      countryFrom: "US",
      countryTo: destinationCode(corridor.destinationLocale),
      currencyFrom: corridor.sourceCurrency,
      currencyTo: corridor.destinationCurrency,
      amountFrom: corridor.sourceAmount,
      paymentMethod: "BankAccount",
      deliveryMethod: "BankDeposit",
      promoId: 0,
      shouldCalcAmountFrom: false,
      shouldCalcVariableRates: true,
    };
    const payload = await publicJson(`${apiBase}/MoneyTransferCalculator/Calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Culturecode: "en-US",
        Appversion: "4.0",
        "Client-Type": "PublicSite",
      },
      body: JSON.stringify({ selections }),
    });
    const details = payload?.model?.transferDetails;
    const calculations = details?.calculations;
    const paymentMethods = details?.transferOptions?.paymentMethods || [];
    const deliveryMethods = details?.transferOptions?.deliveryMethods || [];
    const publicError = payload?.errorResponse?.errors?.[0]?.message;
    if (!details || !calculations) throw new Error(publicError || "Ria did not return a public quote");
    if (!paymentMethods.some((method) => method.value === "BankAccount")) throw new Error("Ria did not offer bank account funding for this route");
    if (!deliveryMethods.some((method) => method.value === "BankDeposit")) throw new Error("Ria did not offer bank deposit delivery for this route");

    const sourceAmount = numeric(String(calculations.amountFrom));
    const recipientAmount = numeric(String(calculations.amountTo));
    const feeAmount = numeric(String(calculations.totalFeesAndTaxes ?? calculations.transferFee ?? 0));
    const baseRate = numeric(String(calculations.exchangeRate));
    const promoRate = numeric(String(calculations.exchangeRatePromo || baseRate));
    const exchangeRate = promoRate > 0 ? promoRate : recipientAmount / sourceAmount;
    if (Math.abs(sourceAmount - corridor.sourceAmount) >= 0.01) throw new Error("Ria did not quote the requested amount");
    if (details.selections?.currencyFrom !== corridor.sourceCurrency || details.selections?.currencyTo !== corridor.destinationCurrency) {
      throw new Error("Ria returned the wrong currencies");
    }
    const promotion = promoRate > baseRate * 1.0001;
    const feeAddedOutsideAmount = numeric(String(calculations.totalAmount ?? sourceAmount)) > sourceAmount + 0.001;

    const evidenceUrl = new URL(`${apiBase}/MoneyTransferCalculator/Calculate`);
    evidenceUrl.searchParams.set("countryFrom", "US");
    evidenceUrl.searchParams.set("countryTo", destinationCode(corridor.destinationLocale));
    evidenceUrl.searchParams.set("currencyFrom", corridor.sourceCurrency);
    evidenceUrl.searchParams.set("currencyTo", corridor.destinationCurrency);
    evidenceUrl.searchParams.set("amountFrom", String(corridor.sourceAmount));
    evidenceUrl.searchParams.set("paymentMethod", "BankAccount");
    evidenceUrl.searchParams.set("deliveryMethod", "BankDeposit");
    const evidenceBody = JSON.stringify(payload, null, 2);
    await page.route((candidate) => candidate.href === evidenceUrl.toString(), (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: evidenceBody,
    }), { times: 1 });
    const evidenceResponse = await page.goto(evidenceUrl.toString(), { waitUntil: "domcontentloaded", timeout: 60_000 });
    if (!evidenceResponse?.ok()) throw new Error(`Ria evidence view returned ${evidenceResponse?.status() ?? "no response"}`);
    const evidenceText = await page.locator("body").innerText();
    if (!evidenceText.includes(String(recipientAmount)) || !evidenceText.includes("BankAccount") || !evidenceText.includes("BankDeposit")) {
      throw new Error("Ria evidence view did not contain the parsed bank transfer quote");
    }
    const screenshot = await page.screenshot({ type: "png", fullPage: true, timeout: 20_000 });

    return basicResult(this, corridor, capturedAt, {
      quoteType: promotion || feeAddedOutsideAmount ? "indicative" : "verified",
      recipientAmount,
      feeAmount,
      feeCurrency: corridor.sourceCurrency,
      exchangeRate,
      quoteUrl: evidenceUrl.toString(),
      deliveryEstimate: "Check provider",
      planName: promotion ? "Ria first-transfer offer" : feeAddedOutsideAmount ? "Fee added to the send amount" : "Bank account to bank deposit",
      promotion,
      screenshot,
      raw: {
        parser: "public-money-transfer-calculator",
        paymentMethod: "BankAccount",
        deliveryMethod: "BankDeposit",
        baseRate,
        promoRate,
        totalAmount: calculations.totalAmount,
        evidence: "Exact public POST response replayed as JSON for the proof screenshot",
        warning: promotion
          ? "Ria's anonymous calculator applies a first-transfer rate, so this result is excluded from the standard winner."
          : feeAddedOutsideAmount
            ? "Ria adds its fee outside the entered send amount, so this result is excluded from the like-for-like winner."
            : undefined,
      },
    });
  },
};
