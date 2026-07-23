import { basicResult, dismissConsent, find, gotoWithRetry, viewportScreenshot } from "./shared.mjs";

export const revolut = {
  slug: "revolut",
  name: "Revolut",
  homepage: "https://www.revolut.com/",
  cacheKey(corridor) {
    return `${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  async capture(page, corridor, capturedAt) {
    const from = corridor.sourceCurrency.toLowerCase();
    const to = corridor.destinationCurrency.toLowerCase();
    const url = `https://www.revolut.com/currency-converter/convert-${from}-to-${to}-exchange-rate/?amount=${corridor.sourceAmount}`;
    await gotoWithRetry(page, url);
    await dismissConsent(page);
    const main = page.locator("main");
    await main.waitFor({ state: "visible", timeout: 20_000 });
    const text = await main.innerText();
    const recipientAmount = find(text, new RegExp(`Converted to\\s+(?:${corridor.destinationCurrency}\\s*)?[^0-9]*([0-9][0-9,.]*)`, "i"), "converted amount");
    const exchangeRate = find(text, /Our current rate[\s\S]{0,100}?[=]?\s*[^0-9]*([0-9][0-9,.]*)/i, "exchange rate");
    const feeMatch = text.match(/Additional fees[\s\S]{0,80}?([0-9][0-9,.]*)/i);
    const feeAmount = feeMatch?.[1] ? Number(feeMatch[1].replace(/,/g, "")) : 0;
    const screenshot = await viewportScreenshot(page);
    return basicResult(this, corridor, capturedAt, {
      quoteType: "indicative",
      recipientAmount,
      feeAmount,
      feeCurrency: corridor.sourceCurrency,
      exchangeRate,
      quoteUrl: page.url(),
      planName: "Standard public converter assumption",
      screenshot,
      raw: { warning: "Plan allowances, weekend charges and transfer fees may change the final transferable amount." },
    });
  },
};
