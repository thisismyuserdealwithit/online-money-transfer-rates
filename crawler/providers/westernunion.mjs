import { basicResult, dismissConsent, numeric, gotoWithRetry, viewportScreenshot } from "./shared.mjs";

function countryCode(locale) {
  if (locale === "gb") return "GB";
  return typeof locale === "string" && locale.length === 2 ? locale.toUpperCase() : null;
}

export const westernunion = {
  slug: "westernunion",
  name: "Western Union",
  homepage: "https://www.westernunion.com/",
  cacheKey(corridor) {
    return `${corridor.sourceLocale}:${corridor.destinationLocale}:${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return Boolean(countryCode(corridor.sourceLocale) && countryCode(corridor.destinationLocale));
  },
  async capture(page, corridor, capturedAt) {
    const destinationCode = countryCode(corridor.destinationLocale);
    const url = new URL(`https://www.westernunion.com/${corridor.sourceLocale}/en/web/send-money/start`);
    url.searchParams.set("FundsIn", "BA");
    url.searchParams.set("FundsOut", "BA");
    url.searchParams.set("ISOCurrency", corridor.sourceCurrency);
    url.searchParams.set("ReceiveCountry", destinationCode);
    url.searchParams.set("SendAmount", String(corridor.sourceAmount));
    await gotoWithRetry(page, url.toString());
    await dismissConsent(page);

    const quotePage = page.locator("body");
    await quotePage.waitFor({ state: "visible", timeout: 20_000 });
    const sendInput = page.getByRole("textbox", { name: `Send amount in ${corridor.sourceCurrency}` });
    const receiveInput = page.getByRole("textbox", { name: `Receiver gets in ${corridor.destinationCurrency}` });

    let ready = false;
    for (let attempt = 0; attempt < 24; attempt += 1) {
      await page.waitForTimeout(500);
      if (await sendInput.count() !== 1 || await receiveInput.count() !== 1) continue;
      const sourceAmount = numeric(await sendInput.inputValue());
      const recipientAmount = numeric(await receiveInput.inputValue());
      if (Math.abs(sourceAmount - corridor.sourceAmount) < 0.01 && recipientAmount > 0) {
        ready = true;
        break;
      }
    }
    if (!ready) throw new Error("Western Union quote did not load the requested bank transfer");

    const bankPayout = page.getByText("Bank account", { exact: true });
    if (await bankPayout.count() !== 1) throw new Error("Western Union did not offer bank account payout");
    await bankPayout.click();
    await page.waitForTimeout(700);
    const bankFunding = page.getByText("Bank transfer", { exact: true });
    if (await bankFunding.count() !== 1) throw new Error("Western Union did not offer bank transfer funding");
    await bankFunding.click();
    await page.waitForTimeout(1_000);

    const text = await quotePage.innerText();
    const sourceAmount = numeric(await sendInput.inputValue());
    const recipientAmount = numeric(await receiveInput.inputValue());
    if (Math.abs(sourceAmount - corridor.sourceAmount) > 0.01 || recipientAmount <= 0) throw new Error("Western Union changed the requested quote after method selection");
    const rateMatch = text.match(new RegExp(`1(?:\\.00)?\\s*${corridor.sourceCurrency}\\s*=\\s*([0-9][0-9,.]*)[^\\n]{0,80}?(?:\\(${corridor.destinationCurrency}\\)|${corridor.destinationCurrency})`, "i"));
    const fundingMatch = text.match(new RegExp(`Bank transfer[\\s\\S]{0,240}?Fee(?:\\d+)?\\s*([0-9][0-9,.]*)\\s*${corridor.sourceCurrency}`, "i"));
    if (!rateMatch?.[1] || !fundingMatch?.[1]) throw new Error("Western Union did not expose a complete bank transfer quote");
    const exchangeRate = numeric(rateMatch[1]);
    const feeAmount = numeric(fundingMatch[1]);
    const screenshot = await viewportScreenshot(page);

    return basicResult(this, corridor, capturedAt, {
      quoteType: feeAmount === 0 ? "verified" : "indicative",
      recipientAmount,
      feeAmount,
      feeCurrency: corridor.sourceCurrency,
      exchangeRate,
      quoteUrl: page.url(),
      deliveryEstimate: text.match(/Bank transfer[\s\S]{0,160}?([0-9]+\s+(?:Business\s+)?days?)/i)?.[1] || "Check provider",
      screenshot,
      raw: {
        parser: "public-send-money-bank-quote",
        warning: feeAmount > 0 ? "The public page adds the funding fee outside the entered send amount, so this record is excluded from the like-for-like winner." : undefined,
      },
    });
  },
};
