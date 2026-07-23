import { basicResult, dismissConsent, gotoWithRetry, viewportScreenshot } from "./shared.mjs";

export const wise = {
  slug: "wise",
  name: "Wise",
  homepage: "https://wise.com/",
  cacheKey(corridor) {
    return `${corridor.sourceLocale || "gb"}:${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  async capture(page, corridor, capturedAt) {
    const url = `https://wise.com/${corridor.sourceLocale || "gb"}/send-money/?sourceCurrency=${corridor.sourceCurrency}&targetCurrency=${corridor.destinationCurrency}&sourceAmount=${corridor.sourceAmount}`;
    await gotoWithRetry(page, url);
    await dismissConsent(page);
    const main = page.locator("main");
    await main.waitFor({ state: "visible", timeout: 20_000 });
    const sendInput = page.getByRole("textbox", { name: "You send exactly" });
    const receiveInput = page.getByRole("textbox", { name: "Recipient gets" });
    await sendInput.waitFor({ state: "visible", timeout: 20_000 });
    await receiveInput.waitFor({ state: "visible", timeout: 20_000 });
    const text = await main.innerText();
    const visibleSource = Number((await sendInput.inputValue()).replace(/,/g, ""));
    if (Math.abs(visibleSource - corridor.sourceAmount) > 0.01) throw new Error("Wise did not load the requested source amount");
    const recipientAmount = Number((await receiveInput.inputValue()).replace(/,/g, ""));
    const feeMatch = text.match(new RegExp(`Total fees[\\s\\S]{0,100}?([0-9][0-9,.]*)\\s*${corridor.sourceCurrency}`, "i"));
    const feeAmount = feeMatch?.[1] ? Number(feeMatch[1].replace(/,/g, "")) : 0;
    const rateMatch = text.match(new RegExp(`1\\s*${corridor.sourceCurrency}\\s*=\\s*([0-9][0-9,.]*)\\s*${corridor.destinationCurrency}`, "i"));
    const exchangeRate = rateMatch?.[1]
      ? Number(rateMatch[1].replace(/,/g, ""))
      : recipientAmount / Math.max(0.01, corridor.sourceAmount - feeAmount);
    const verified = Boolean(feeMatch && rateMatch);
    const screenshot = await viewportScreenshot(page);
    return basicResult(this, corridor, capturedAt, {
      quoteType: verified ? "verified" : "indicative",
      recipientAmount,
      feeAmount,
      feeCurrency: corridor.sourceCurrency,
      exchangeRate,
      quoteUrl: page.url(),
      deliveryEstimate: text.match(/Arrives\s+([^\n]+)/i)?.[1]?.trim() || "Check provider",
      screenshot,
      raw: {
        parser: verified ? "public-send-money-quote" : "partial-public-send-money-quote",
        rateGuaranteeShown: /Guaranteed for/i.test(text),
        missingFee: !feeMatch,
        missingRate: !rateMatch,
      },
    });
  },
};
