import { basicResult, numeric, viewportScreenshot } from "./shared.mjs";

const sourceCountryId = "59C3BBD2-5D26-4A47-8FC1-2EFA628049CE";
const destinationCountryIds = {
  AED: "febe03ee-e3e3-4ece-ad4c-58375b94buae",
  AUD: "56C0C32B-D581-4713-869F-DA6C89C74591",
  CAD: "417B2B0A-3F52-4BF6-B134-A177EA6D7CC9",
  EUR: "4c55e5b4-af58-4822-816c-66e89916954b",
  GBP: "AD470922-45B9-4250-9C24-A272E15A4A30",
  HKD: "05A72C21-EAA8-414C-8C02-C5DA9B097925",
  INR: "A5001AED-DDA1-4296-8312-223D383F96F5",
  NZD: "FAF1B072-44B9-45AD-8686-EDC4A15FF404",
  PHP: "81BB294D-A8BC-11E7-9FEB-5CB9017DC195",
  PKR: "155a5b5e-1c8e-4799-83b2-3e57502283bf",
  SGD: sourceCountryId,
  USD: "AEC2262E-63ED-4F80-A491-C9EE4BFFB903",
  ZAR: "3aac7ee6-gbps-11e8-9c2d-fa7ae01bbzar",
};

export const singx = {
  slug: "singx",
  name: "SingX",
  homepage: "https://sg.singx.co/",
  cacheKey(corridor) {
    return `${corridor.sourceCurrency}:${corridor.destinationCurrency}:${corridor.sourceAmount}`;
  },
  supports(corridor) {
    return corridor.sourceLocale === "sg" && corridor.sourceCurrency === "SGD" && Boolean(destinationCountryIds[corridor.destinationCurrency]);
  },
  async capture(page, corridor, capturedAt) {
    const params = new URLSearchParams({
      fromId: "SGD",
      toId: corridor.destinationCurrency,
      amount: String(corridor.sourceAmount),
      receiveAmt: "0",
      fromCountryId: sourceCountryId,
      toCountryId: destinationCountryIds[corridor.destinationCurrency],
      feeType: "0",
      label: "First",
    });
    const url = `https://sg.singx.co/singx/secure/CommonRestServiceImpl/getExchangeRates?${params}`;
    await page.setExtraHTTPHeaders({ "Content-Type": "application/json", Accept: "application/json" });
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    if (!response?.ok()) throw new Error(`SingX quote endpoint returned ${response?.status() ?? "no response"}`);
    const text = await page.locator("body").innerText();
    const payload = JSON.parse(text);
    if (!payload?.response?.success || !payload.response.data) throw new Error("SingX did not return a public quote");
    const data = payload.response.data;
    const visibleAmount = numeric(String(data.amount));
    if (Math.abs(visibleAmount - corridor.sourceAmount) >= 0.01) throw new Error("SingX did not quote the requested transfer amount");
    const recipientAmount = numeric(String(data.receiveamount));
    const feeAmount = numeric(String(data.singxFee));
    const exchangeRate = numeric(String(data.exchangeRate));
    if (recipientAmount <= 0 || feeAmount < 0 || exchangeRate <= 0) throw new Error("SingX returned an incomplete public quote");
    const screenshot = await viewportScreenshot(page);

    return basicResult(this, corridor, capturedAt, {
      quoteType: "indicative",
      recipientAmount,
      feeAmount,
      feeCurrency: corridor.sourceCurrency,
      exchangeRate,
      quoteUrl: page.url(),
      deliveryEstimate: "Check provider",
      planName: "The displayed SingX fee is added to the transfer amount",
      screenshot,
      raw: {
        parser: "public-quote-endpoint",
        corridorId: data.corridorId,
        totalDebit: visibleAmount + feeAmount,
        warning: "SingX adds its displayed fee to the transfer amount, so this result is excluded from the like-for-like winner.",
      },
    });
  },
};
