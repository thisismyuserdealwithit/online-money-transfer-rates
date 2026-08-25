import assert from "node:assert/strict";
import test from "node:test";
import { OnlineMoneyTransferClient, attributionFor } from "../index.js";

test("builds rate and corridor requests", async () => {
  const requests = [];
  const client = new OnlineMoneyTransferClient({
    baseUrl: "https://example.test/",
    fetch: async (url, options) => {
      requests.push({ url, options });
      return new Response(JSON.stringify({ useTerms: { requiredLink: "https://example.test/uk-to-spain", wording: "Rates supplied", placement: "Beside rates" } }), { status: 200 });
    },
  });

  await client.listCorridors();
  const rates = await client.getRates("uk-to-spain", { history: 7 });
  assert.deepEqual(requests, [
    {
      url: "https://example.test/api/v1/corridors",
      options: { headers: { accept: "application/json" } },
    },
    {
      url: "https://example.test/api/v1/rates/uk-to-spain?history=7",
      options: { headers: { accept: "application/json" } },
    },
  ]);
  assert.equal(attributionFor(rates).href, "https://example.test/uk-to-spain");
});

test("rejects invalid routes and history windows", async () => {
  const client = new OnlineMoneyTransferClient({ fetch: async () => new Response("{}") });
  await assert.rejects(() => client.getRates("https://bad.example"), TypeError);
  await assert.rejects(() => client.getRates("uk-to-spain", { history: 31 }), RangeError);
});
