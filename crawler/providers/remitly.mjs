import { basicResult, dismissConsent, numeric, gotoWithRetry, viewportScreenshot } from "./shared.mjs";

const supportedSourceLocales = new Set(["gb", "us", "ca", "au", "de", "fr", "es", "it", "nl", "ie"]);
const countrySlugByLocale = {
  gb: "united-kingdom", es: "spain", fr: "france", de: "germany", ie: "ireland", it: "italy",
  nl: "netherlands", pt: "portugal", pl: "poland", ch: "switzerland", us: "united-states",
  ca: "canada", au: "australia", nz: "new-zealand", in: "india", pk: "pakistan", ph: "philippines",
  ae: "united-arab-emirates", za: "south-africa", ng: "nigeria", sg: "singapore", hk: "hong-kong",
};

export const remitly = {
  slug: "remitly",
  name: "Remitly",
  homepage: "https://www.remitly.com/",
  cacheKey(corridor) {
    return `${corridor.sourceLocale}:${corridor.destinationLocale}:${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return supportedSourceLocales.has(corridor.sourceLocale) && Boolean(countrySlugByLocale[corridor.destinationLocale]);
  },
  async capture(page, corridor, capturedAt) {
    const destination = countrySlugByLocale[corridor.destinationLocale];
    const url = `https://www.remitly.com/${corridor.sourceLocale}/en/${destination}/pricing`;
    await gotoWithRetry(page, url);
    await dismissConsent(page);

    const main = page.locator("main");
    await main.waitFor({ state: "visible", timeout: 20_000 });
    await page.waitForTimeout(1_200);
    const sendInput = page.getByRole("textbox", { name: "You send" });
    const receiveInput = page.getByRole("textbox", { name: "They receive" });
    if (await sendInput.count() !== 1 || await receiveInput.count() !== 1) throw new Error("Remitly public quote inputs were not available");
    await sendInput.fill(String(corridor.sourceAmount));
    await sendInput.press("Tab");

    let text = "";
    let recipientAmount = 0;
    let exchangeRate = 0;
    let ready = false;
    for (let attempt = 0; attempt < 24; attempt += 1) {
      await page.waitForTimeout(500);
      text = await main.innerText();
      const visibleSource = numeric(await sendInput.inputValue());
      if (Math.abs(visibleSource - corridor.sourceAmount) >= 0.01) {
        await sendInput.fill(String(corridor.sourceAmount));
        await sendInput.press("Tab");
        continue;
      }
      const recipientValue = await receiveInput.inputValue();
      recipientAmount = /loading/i.test(recipientValue) ? 0 : numeric(recipientValue);
      const directRate = text.match(new RegExp(`(?:Welcome|Special|promotional) rate(?: of)?[\\s\\S]{0,80}?([0-9][0-9,.]*)\\s*${corridor.destinationCurrency}\\s*(?:to|=)\\s*1\\s*${corridor.sourceCurrency}`, "i"));
      const ratioRate = text.match(new RegExp(`1\\s*${corridor.sourceCurrency}\\s*=\\s*([0-9][0-9,.]*)\\s*${corridor.destinationCurrency}`, "i"));
      exchangeRate = directRate?.[1] ? numeric(directRate[1]) : ratioRate?.[1] ? numeric(ratioRate[1]) : 0;
      if (Math.abs(visibleSource - corridor.sourceAmount) < 0.01 && exchangeRate > 0 && /(?:Welcome|Special|promotional) rate/i.test(text)) {
        ready = true;
        break;
      }
    }
    if (!ready) throw new Error("Remitly promotional quote did not settle on the requested amount");

    if (recipientAmount <= 0) recipientAmount = corridor.sourceAmount * exchangeRate;
    const advertisedRate = text.match(new RegExp(`(?:Welcome|Special|promotional) rate[\\s\\S]{0,120}?([0-9][0-9,.]*)\\s*${corridor.destinationCurrency}\\s*(?:to|=)\\s*1\\s*${corridor.sourceCurrency}`, "i"));
    const standardRate = text.match(new RegExp(`Standard rate[\\s\\S]{0,80}?1\\s*${corridor.sourceCurrency}\\s*=\\s*([0-9][0-9,.]*)\\s*${corridor.destinationCurrency}`, "i"));
    const screenshot = await viewportScreenshot(page);

    return basicResult(this, corridor, capturedAt, {
      quoteType: "indicative",
      recipientAmount,
      feeAmount: 0,
      feeCurrency: corridor.sourceCurrency,
      exchangeRate,
      quoteUrl: page.url(),
      planName: "First-transfer offer",
      promotion: true,
      screenshot,
      raw: {
        parser: "public-first-transfer-offer",
        advertisedWelcomeRate: advertisedRate?.[1] ? numeric(advertisedRate[1]) : exchangeRate,
        advertisedStandardRate: standardRate?.[1] ? numeric(standardRate[1]) : null,
        recipientAmountComputedFromRate: /loading/i.test(await receiveInput.inputValue()),
        warning: "This is a new-customer promotion and is excluded from the standard winner.",
      },
    });
  },
};
