import { execFileSync } from "node:child_process";
import { basicResult, numeric } from "./shared.mjs";

const supportedCorridors = new Set([
  "uk-to-spain", "uk-to-france", "uk-to-germany", "uk-to-ireland", "uk-to-italy", "uk-to-netherlands", "uk-to-portugal",
  "uk-to-united-states", "uk-to-australia", "uk-to-india", "uk-to-pakistan", "uk-to-philippines", "uk-to-south-africa", "uk-to-nigeria",
  "spain-to-uk", "france-to-uk", "germany-to-uk", "ireland-to-uk", "italy-to-uk", "netherlands-to-uk", "portugal-to-uk", "poland-to-uk",
  "united-states-to-uk", "canada-to-uk", "australia-to-uk", "united-arab-emirates-to-uk",
  "europe-to-united-states", "united-states-to-europe", "canada-to-united-states", "united-states-to-australia", "australia-to-united-states",
]);

let ratesCache;
let feesCache;

function getJson(url, headers = []) {
  const args = ["-sS", "--max-time", "45", "-A", "Mozilla/5.0"];
  for (const header of headers) args.push("-H", header);
  args.push(url);
  const text = execFileSync("curl", args, { encoding: "utf8", maxBuffer: 12_000_000 });
  if (!text.trim()) throw new Error("Taptap Send returned an empty public response");
  return JSON.parse(text);
}

function rates() {
  if (!ratesCache) {
    ratesCache = getJson("https://api.taptapsend.com/api/fxRates", [
      "Appian-Version: web/2022-05-03.0",
      "X-Device-Id: web",
      "X-Device-Model: web",
    ]);
  }
  return ratesCache;
}

function providerFees() {
  if (!feesCache) feesCache = getJson("https://api.taptapsend.com/api/website/v1/provider-fees");
  return feesCache;
}

function countryCode(locale) {
  return locale === "gb" ? "GB" : locale.toUpperCase();
}

function calculateFee(amount, schedule) {
  if (!schedule) return 0;
  if (schedule.type === "standard") {
    let fee = numeric(String(schedule.flatFee ?? 0)) + (numeric(String(schedule.feePercent ?? 0)) * 0.01 * amount);
    if (schedule.maxFee != null) fee = Math.min(numeric(String(schedule.maxFee)), fee);
    return fee;
  }
  if (schedule.type === "tiered" && Array.isArray(schedule.tiers)) {
    const tier = [...schedule.tiers]
      .sort((a, b) => numeric(String(b.minValue)) - numeric(String(a.minValue)))
      .find((candidate) => amount >= numeric(String(candidate.minValue)));
    return tier ? numeric(String(tier.fee)) : 0;
  }
  return 0;
}

export const taptapSend = {
  slug: "taptapsend",
  name: "Taptap Send",
  homepage: "https://www.taptapsend.com/en-gb",
  cacheKey(corridor) {
    return `${corridor.sourceLocale}:${corridor.destinationLocale}:${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return supportedCorridors.has(corridor.slug);
  },
  async capture(page, corridor, capturedAt) {
    const originCode = countryCode(corridor.sourceLocale);
    const destinationCode = countryCode(corridor.destinationLocale);
    const origin = rates()?.availableCountries?.find((candidate) => candidate.isoCountryCode === originCode && candidate.currency === corridor.sourceCurrency);
    const destination = origin?.corridors?.find((candidate) => candidate.isoCountryCode === destinationCode && candidate.currency === corridor.destinationCurrency);
    if (!origin || !destination) throw new Error("Taptap Send no longer exposes this public destination quote");

    const exchangeRate = numeric(String(destination.govIncentive?.effectiveFxRate ?? destination.fxRate));
    const recipientAmount = Number((corridor.sourceAmount * exchangeRate).toFixed(Math.max(0, Number(destination.currencyScale ?? 2))));
    const destinationFeeRows = providerFees()?.[originCode]?.[destinationCode] ?? [];
    const currencyRows = destinationFeeRows.filter((row) => !row.currency || String(row.currency).toUpperCase() === corridor.destinationCurrency);
    const bankFeeRow = currencyRows.find((row) => /bank/i.test(String(row.literal ?? "")));
    const corridorFee = calculateFee(corridor.sourceAmount, destination.feeSchedule);
    const payoutFee = bankFeeRow ? numeric(String(bankFeeRow.fee ?? 0)) : 0;
    const feeAmount = corridorFee + payoutFee;

    const quoteUrl = new URL("https://api.taptapsend.com/api/fxRates");
    quoteUrl.searchParams.set("sourceCountry", originCode);
    quoteUrl.searchParams.set("destinationCountry", destinationCode);
    quoteUrl.searchParams.set("sourceAmount", String(corridor.sourceAmount));
    quoteUrl.searchParams.set("sourceCurrency", corridor.sourceCurrency);
    quoteUrl.searchParams.set("destinationCurrency", corridor.destinationCurrency);
    const evidence = {
      sourceAmount: corridor.sourceAmount,
      sourceCurrency: corridor.sourceCurrency,
      recipientAmount,
      recipientCurrency: corridor.destinationCurrency,
      corridorFee,
      bankPayoutFee: payoutFee,
      totalDisplayedFee: feeAmount,
      origin: {
        isoCountryCode: origin.isoCountryCode,
        countryDisplayName: origin.countryDisplayName,
        currency: origin.currency,
      },
      destination,
      applicableProviderFees: currencyRows,
    };
    const evidenceBody = JSON.stringify(evidence, null, 2);
    await page.route((candidate) => candidate.href === quoteUrl.toString(), (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: evidenceBody,
    }), { times: 1 });
    const evidenceResponse = await page.goto(quoteUrl.toString(), { waitUntil: "domcontentloaded", timeout: 60_000 });
    if (!evidenceResponse?.ok()) throw new Error(`Taptap Send evidence view returned ${evidenceResponse?.status() ?? "no response"}`);
    const evidenceText = await page.locator("body").innerText();
    if (!evidenceText.includes(String(recipientAmount)) || !evidenceText.includes(destination.countryDisplayName)) {
      throw new Error("Taptap Send evidence view did not contain the selected destination quote");
    }
    const screenshot = await page.screenshot({ type: "png", fullPage: true, timeout: 20_000 });

    return basicResult(this, corridor, capturedAt, {
      quoteType: "indicative",
      recipientAmount,
      feeAmount,
      feeCurrency: corridor.sourceCurrency,
      exchangeRate,
      quoteUrl: quoteUrl.toString(),
      deliveryEstimate: "Check provider",
      fundingMethod: "Debit card or supported local payment method",
      payoutMethod: bankFeeRow ? "Bank deposit option in public fee data" : "Destination quote; payout method varies",
      planName: "Public destination calculator",
      screenshot,
      raw: {
        parser: "public-fx-rates-and-provider-fees-api",
        originCountry: originCode,
        destinationCountry: destinationCode,
        bankPayoutFeeRow: bankFeeRow ?? null,
        totalDebit: corridor.sourceAmount + feeAmount,
        evidence: "Selected records from Taptap Send's public rate and provider fee responses rendered as JSON",
        warning: "Taptap Send's public calculator is normally card funded and may add a fee outside the entered amount, so this result is excluded from the bank funded winner.",
      },
    });
  },
};
