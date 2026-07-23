import { chromium } from "playwright";
import { atlanticMoney } from "./providers/atlanticmoney.mjs";
import { currencyfair } from "./providers/currencyfair.mjs";
import { instarem } from "./providers/instarem.mjs";
import { lloydsBusiness } from "./providers/lloydsbusiness.mjs";
import { natWestBusiness } from "./providers/natwestbusiness.mjs";
import { paysend } from "./providers/paysend.mjs";
import { remitly } from "./providers/remitly.mjs";
import { ria } from "./providers/ria.mjs";
import { revolut } from "./providers/revolut.mjs";
import { singx } from "./providers/singx.mjs";
import { santanderUk } from "./providers/santanderuk.mjs";
import { starling } from "./providers/starling.mjs";
import { taptapSend } from "./providers/taptapsend.mjs";
import { transfergo } from "./providers/transfergo.mjs";
import { wise } from "./providers/wise.mjs";
import { westernunion } from "./providers/westernunion.mjs";
import { xe } from "./providers/xe.mjs";
import { corridors } from "./corridors.mjs";

const corridor = corridors.find((item) => item.slug === (process.env.CORRIDOR || "uk-to-spain"));
if (!corridor) throw new Error("Test corridor missing");
const providers = { wise, currencyfair, atlanticmoney: atlanticMoney, instarem, ria, taptapsend: taptapSend, paysend, westernunion, remitly, revolut, xe, singx, transfergo, starling, natwestbusiness: natWestBusiness, lloydsbusiness: lloydsBusiness, santanderuk: santanderUk };
const provider = providers[process.env.PROVIDER || "currencyfair"];
if (!provider) throw new Error("Test provider missing");
if (provider.supports && !provider.supports(corridor)) throw new Error("Provider does not support test corridor");
const proxyServer = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const browser = await chromium.launch({ headless: true, ...(proxyServer ? { proxy: { server: proxyServer } } : {}) });
try {
  const page = await browser.newPage({ locale: "en-GB", viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: Boolean(proxyServer) });
  try {
    const result = await provider.capture(page, corridor, new Date().toISOString());
    console.log(JSON.stringify({ provider: result.providerName, sourceAmount: result.sourceAmount, recipientAmount: result.recipientAmount, rate: result.exchangeRate, fee: result.feeAmount, quoteType: result.quoteType, screenshotBytes: result.screenshot.byteLength, url: result.quoteUrl }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      url: page.url(),
      title: await page.title().catch(() => ""),
      textboxValues: await page.getByRole("textbox").evaluateAll((inputs) => inputs.map((input) => input.value)).catch(() => []),
      visibleText: (await page.locator("body").innerText().catch(() => "")).slice(0, 600),
    }, null, 2));
    throw error;
  }
} finally {
  await browser.close();
}
