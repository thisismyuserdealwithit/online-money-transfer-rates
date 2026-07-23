export async function bankEvidenceScreenshot(page, quoteUrl, evidence, requiredText = []) {
  const evidenceBody = JSON.stringify(evidence, null, 2);
  await page.route((candidate) => candidate.href === quoteUrl, (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: evidenceBody,
  }), { times: 1 });
  const response = await page.goto(quoteUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (!response?.ok()) throw new Error(`Bank evidence view returned ${response?.status() ?? "no response"}`);
  const text = await page.locator("body").innerText();
  for (const expected of requiredText) {
    if (!text.includes(String(expected))) throw new Error(`Bank evidence view did not contain ${expected}`);
  }
  return page.screenshot({ type: "png", fullPage: true, timeout: 20_000 });
}
