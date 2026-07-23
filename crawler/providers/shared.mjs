export function numeric(value) {
  if (typeof value !== "string") throw new Error("Missing numeric value");
  const parsed = Number(value.replace(/[^0-9.,-]/g, "").replace(/,/g, ""));
  if (!Number.isFinite(parsed)) throw new Error(`Could not parse number from ${value}`);
  return parsed;
}

export function find(text, pattern, label) {
  const match = text.match(pattern);
  if (!match?.[1]) throw new Error(`Could not read ${label}`);
  return numeric(match[1]);
}

export async function dismissConsent(page) {
  const choices = ["Accept all", "Accept All Cookies", "I agree", "Allow all"];
  for (const name of choices) {
    const button = page.getByRole("button", { name, exact: true });
    if (await button.count() === 1 && await button.isVisible()) {
      await button.click().catch(() => {});
      return;
    }
  }
}

export async function gotoWithRetry(page, url) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      return;
    } catch (error) {
      lastError = error;
      if (attempt === 0) await page.waitForTimeout(1_000);
    }
  }
  throw lastError;
}

export async function receiptScreenshot(locator, page) {
  try {
    await locator.scrollIntoViewIfNeeded();
    return await locator.screenshot({ type: "png", timeout: 20_000 });
  } catch {
    return await page.screenshot({ type: "png", fullPage: false, timeout: 20_000 });
  }
}

export async function viewportScreenshot(page) {
  return page.screenshot({ type: "png", fullPage: false, timeout: 20_000 });
}

export function basicResult(provider, corridor, capturedAt, values) {
  return {
    providerSlug: provider.slug,
    providerName: provider.name,
    providerHomepage: provider.homepage,
    corridorSlug: corridor.slug,
    sourceCountry: corridor.sourceCountry,
    destinationCountry: corridor.destinationCountry,
    sourceAmount: corridor.sourceAmount,
    sourceCurrency: corridor.sourceCurrency,
    recipientCurrency: corridor.destinationCurrency,
    fundingMethod: corridor.fundingMethod,
    payoutMethod: corridor.payoutMethod,
    capturedAt,
    promotion: false,
    screenshotMimeType: "image/png",
    deliveryEstimate: "Check provider",
    ...values,
  };
}
