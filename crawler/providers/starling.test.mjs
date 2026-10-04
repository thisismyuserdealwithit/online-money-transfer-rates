import assert from "node:assert/strict";
import test from "node:test";
import { parseStarlingHttpResponse } from "./starling.mjs";

const corridor = { sourceCurrency: "GBP", destinationCurrency: "CAD" };
const payload = (rate = 1.75, changes = {}) => ({
  forward: { sourceCurrency: "GBP", targetCurrency: "CAD", rate, ...changes },
});
const response = (body, status = 200) => `${JSON.stringify(body)}\n${status}`;

test("Starling preserves a successful exact-pair public rate", () => {
  const data = payload();
  assert.deepEqual(parseStarlingHttpResponse(response(data), corridor), { response: data, exchangeRate: 1.75 });
  assert.equal(parseStarlingHttpResponse(response(payload("1.75")), corridor).exchangeRate, 1.75);
});

test("Starling reports the observed CAD and AUD HTTP400 validation failures accurately", () => {
  const rejected = { errors: [{ message: "REQUEST_VALIDATION_FAILED" }], success: false };
  for (const destinationCurrency of ["CAD", "AUD"]) {
    assert.throws(
      () => parseStarlingHttpResponse(response(rejected, 400), { ...corridor, destinationCurrency }),
      { message: "Starling public rate endpoint returned HTTP 400: REQUEST_VALIDATION_FAILED" },
    );
  }
});

test("Starling rejects unsuccessful statuses even when a rate is present", () => {
  for (const status of [301, 400, 403, 429, 500]) {
    assert.throws(() => parseStarlingHttpResponse(response(payload(), status), corridor), new RegExp(`HTTP ${status}`));
  }
  assert.throws(() => parseStarlingHttpResponse("<!doctype html>upstream unavailable\n503", corridor), /HTTP 503/);
});

test("Starling rejects provider errors inside successful HTTP responses", () => {
  for (const failure of [
    { ...payload(), success: false },
    { ...payload(), errors: [{ message: "REQUEST_VALIDATION_FAILED" }] },
    { ...payload(), errors: [{}] },
  ]) assert.throws(() => parseStarlingHttpResponse(response(failure), corridor), /rejected the public rate request/);
});

test("Starling never substitutes the reverse rate or accepts another currency pair", () => {
  for (const data of [
    {}, null,
    payload(1.75, { sourceCurrency: "EUR" }),
    payload(1.75, { targetCurrency: "AUD" }),
    { reverse: payload().forward },
    { ...payload(1.75, { sourceCurrency: "CAD", targetCurrency: "GBP" }), reverse: payload().forward },
  ]) assert.throws(() => parseStarlingHttpResponse(response(data), corridor), /wrong currency pair/);
  assert.throws(() => parseStarlingHttpResponse(response(payload(1.75, { sourceCurrency: "EUR" })), { ...corridor, sourceCurrency: "EUR" }), /wrong currency pair/);
});

test("Starling rejects absent, malformed, zero and nonfinite rates", () => {
  for (const rate of [undefined, null, "", " ", "garbage", "1.75oops", "0x10", 0, -1, Infinity, NaN, "Infinity", "NaN", "1e999", [], {}]) {
    assert.throws(() => parseStarlingHttpResponse(response(payload(1.75, { rate })), corridor), /invalid exchange rate/);
  }
});

test("Starling rejects empty, malformed JSON and missing HTTP evidence", () => {
  for (const text of ["\n200", "<!doctype html>\n200", "{invalid}\n200"]) {
    assert.throws(() => parseStarlingHttpResponse(text, corridor), /empty public rate response|invalid JSON/);
  }
  for (const text of [JSON.stringify(payload()), `${JSON.stringify(payload())}\n000`, `${JSON.stringify(payload())}\n200x`]) {
    assert.throws(() => parseStarlingHttpResponse(text, corridor), /valid HTTP status/);
  }
});
