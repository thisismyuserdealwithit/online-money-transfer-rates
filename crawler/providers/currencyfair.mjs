import { basicResult, dismissConsent, find, gotoWithRetry, receiptScreenshot } from "./shared.mjs";

const supported = new Set(["AED", "AUD", "CAD", "CHF", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "NOK", "NZD", "PLN", "SEK", "SGD", "USD", "ZAR"]);

export const currencyfair = {
  slug: "currencyfair",
  name: "CurrencyFair",
  homepage: "https://www.currencyfair.com/",
  cacheKey(corridor) {
    return `${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return supported.has(corridor.sourceCurrency) && supported.has(corridor.destinationCurrency);
  },
  async capture(page, corridor, capturedAt) {
    await gotoWithRetry(page, "https://www.currencyfair.com/convert");
    await dismissConsent(page);
    const form = page.locator("form").filter({ hasText: "Recipient gets" });
    await form.waitFor({ state: "visible", timeout: 20_000 });

    const send = form.locator(".input-currency--one");
    await send.locator("button.input-currency-button").click();
    await page.getByRole("button", { name: new RegExp(`^${corridor.sourceCurrency}\\s`) }).click();
    const receive = form.locator(".input-currency--two");
    await receive.locator("button.input-currency-button").click();
    await page.getByRole("button", { name: new RegExp(`^${corridor.destinationCurrency}\\s`) }).click();
    const input = send.locator('input[type="tel"]');
    await input.click();
    await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await input.press("Backspace");
    await input.type(String(corridor.sourceAmount), { delay: 75 });
    await input.press("Enter");

    let text = "";
    let ready = false;
    for (let attempt = 0; attempt < 24; attempt += 1) {
      await page.waitForTimeout(500);
      text = await form.innerText();
      const visibleAmount = Number((await input.inputValue()).replace(/,/g, ""));
      const hasRate = new RegExp(`1\\s*${corridor.sourceCurrency}\\s*=\\s*[0-9.,]+\\s*${corridor.destinationCurrency}`, "i").test(text);
      if (Math.abs(visibleAmount - corridor.sourceAmount) < 0.01 && hasRate && /fee included/i.test(text)) { ready = true; break; }
    }
    if (!ready) throw new Error("CurrencyFair quote did not settle on the requested amount and currency pair");
    const recipientAmount = find(text, /Recipient gets\s*[^0-9]*([0-9][0-9,.]*)/i, "recipient amount");
    const exchangeRate = find(text, new RegExp(`1\\s*${corridor.sourceCurrency}\\s*=\\s*([0-9][0-9,.]*)\\s*${corridor.destinationCurrency}`, "i"), "exchange rate");
    const targetFee = text.match(new RegExp(`fee included\\s*([0-9][0-9,.]*)\\s*${corridor.destinationCurrency}`, "i"))
      ?? text.match(new RegExp(`([0-9][0-9,.]*)\\s*${corridor.destinationCurrency}\\s*fee included`, "i"));
    const feeInTarget = targetFee?.[1] ? Number(targetFee[1].replace(/,/g, "")) : 0;
    const feeAmount = feeInTarget / exchangeRate;
    const screenshot = await receiptScreenshot(form, page);
    return basicResult(this, corridor, capturedAt, {
      quoteType: "verified",
      recipientAmount,
      feeAmount,
      feeCurrency: corridor.sourceCurrency,
      exchangeRate,
      quoteUrl: page.url(),
      screenshot,
      raw: { providerFeeAmount: feeInTarget, providerFeeCurrency: corridor.destinationCurrency },
    });
  },
};
