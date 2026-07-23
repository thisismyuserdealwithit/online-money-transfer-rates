import { basicResult, dismissConsent, numeric, gotoWithRetry, viewportScreenshot } from "./shared.mjs";

const countrySlugByLocale = {
  gb: "united-kingdom",
  es: "spain",
  fr: "france",
  de: "germany",
  ie: "ireland",
  it: "italy",
  nl: "netherlands",
  pt: "portugal",
  pl: "poland",
  ch: "switzerland",
  us: "the-united-states-of-america",
  ca: "canada",
  au: "australia",
  nz: "new-zealand",
  in: "india",
  pk: "pakistan",
  ph: "philippines",
  ae: "uae",
  za: "south-africa",
  ng: "nigeria",
  sg: "singapore",
  hk: "hong-kong",
};

function countrySlug(locale) {
  return countrySlugByLocale[locale];
}

export const paysend = {
  slug: "paysend",
  name: "Paysend",
  homepage: "https://paysend.com/",
  cacheKey(corridor) {
    return `${corridor.sourceLocale}:${corridor.destinationLocale}:${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return Boolean(countrySlug(corridor.sourceLocale) && countrySlug(corridor.destinationLocale));
  },
  async capture(page, corridor, capturedAt) {
    const from = countrySlug(corridor.sourceLocale);
    const to = countrySlug(corridor.destinationLocale);
    const url = `https://paysend.com/en/send-money/from-${from}-to-${to}`;
    await gotoWithRetry(page, url);
    await dismissConsent(page);

    const quotePage = page.locator("body");
    await quotePage.waitFor({ state: "visible", timeout: 20_000 });
    const inputs = quotePage.getByRole("textbox");
    if (await inputs.count() < 2) throw new Error("Paysend public quote inputs were not available");
    const sendInput = inputs.nth(0);
    const receiveInput = inputs.nth(1);
    await page.waitForTimeout(1_200);
    await sendInput.fill(String(corridor.sourceAmount));
    await sendInput.press("Tab");

    let text = "";
    let recipientAmount = 0;
    let ready = false;
    let stableChecks = 0;
    let promotionalQuote = false;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await page.waitForTimeout(500);
      text = await quotePage.innerText();
      const visibleSource = numeric(await sendInput.inputValue());
      if (Math.abs(visibleSource - corridor.sourceAmount) >= 0.01) {
        stableChecks = 0;
        await sendInput.fill(String(corridor.sourceAmount));
        await sendInput.press("Tab");
        continue;
      }
      recipientAmount = numeric(await receiveInput.inputValue());
      const rateLine = text.match(/Today.?s rate:\s*([^\n]+)/i)?.[1] || "";
      const hasRate = rateLine.includes(corridor.sourceCurrency) && rateLine.includes(corridor.destinationCurrency);
      const feeMatch = text.match(new RegExp(`Fee:[\\s\\S]{0,40}?([0-9][0-9,.]*)\\s*${corridor.sourceCurrency}`, "i"));
      const headline = rateLine.match(/1(?:\.00)?\s*([A-Z]{3})\s*=\s*([0-9][0-9,.]*)\s*([A-Z]{3})/i);
      if (!recipientAmount || !hasRate || !feeMatch?.[1] || !headline?.[1] || !headline?.[2] || !headline?.[3]) {
        stableChecks = 0;
        continue;
      }
      const feeAmount = numeric(feeMatch[1]);
      const headlineValue = numeric(headline[2]);
      const leftCurrency = headline[1].toUpperCase();
      const rightCurrency = headline[3].toUpperCase();
      const directHeadlineRate = leftCurrency === corridor.sourceCurrency && rightCurrency === corridor.destinationCurrency
        ? headlineValue
        : leftCurrency === corridor.destinationCurrency && rightCurrency === corridor.sourceCurrency
          ? 1 / headlineValue
          : null;
      const effectiveRate = recipientAmount / Math.max(0.01, corridor.sourceAmount - feeAmount);
      const deviation = directHeadlineRate ? Math.abs(effectiveRate - directHeadlineRate) / directHeadlineRate : 1;
      if (deviation > 0.03) {
        if (/New customer offer/i.test(text)) {
          promotionalQuote = true;
          stableChecks += 1;
          if (stableChecks >= 3) { ready = true; break; }
          continue;
        }
        stableChecks = 0;
        await sendInput.fill(String(corridor.sourceAmount));
        await sendInput.press("Tab");
        continue;
      }
      stableChecks += 1;
      if (stableChecks >= 3) { ready = true; break; }
    }
    if (!ready) throw new Error("Paysend quote did not settle on the requested amount and currency pair");

    const feeMatch = text.match(new RegExp(`Fee:[\\s\\S]{0,40}?([0-9][0-9,.]*)\\s*${corridor.sourceCurrency}`, "i"));
    const headlineRate = text.match(/Today.?s rate:\s*([^\n]+)/i)?.[1]?.trim();
    if (!headlineRate || !feeMatch?.[1]) throw new Error("Paysend did not expose a complete public quote");
    const feeAmount = numeric(feeMatch[1]);
    const exchangeRate = recipientAmount / Math.max(0.01, corridor.sourceAmount - feeAmount);
    const screenshot = await viewportScreenshot(page);
    const finalSource = numeric(await sendInput.inputValue());
    const finalRecipient = numeric(await receiveInput.inputValue());
    if (Math.abs(finalSource - corridor.sourceAmount) > 0.01 || Math.abs(finalRecipient - recipientAmount) > 0.01) {
      throw new Error("Paysend quote changed during proof capture");
    }

    return basicResult(this, corridor, capturedAt, {
      quoteType: promotionalQuote ? "indicative" : "verified",
      recipientAmount,
      feeAmount,
      feeCurrency: corridor.sourceCurrency,
      exchangeRate,
      quoteUrl: page.url(),
      deliveryEstimate: text.match(/Should arrive:\s*([^\n]+)/i)?.[1]?.trim() || "Check provider",
      planName: promotionalQuote ? "New customer offer" : undefined,
      promotion: promotionalQuote,
      screenshot,
      raw: {
        parser: promotionalQuote ? "public-new-customer-offer" : "public-corridor-quote",
        publicRoute: `${from}-to-${to}`,
        headlineRate,
        warning: promotionalQuote ? "The recipient amount uses a new-customer special rate and is excluded from the standard winner." : undefined,
      },
    });
  },
};
