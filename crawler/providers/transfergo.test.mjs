import assert from "node:assert/strict";
import test from "node:test";
import { parseTransferGoHttpResponse, selectBankToBankOption } from "./transfergo.mjs";

function option(payIn, payOut, extra = {}) {
  return {
    availability: { isAvailable: true },
    payIn: { code: payIn },
    payOut: { code: payOut },
    ...extra,
  };
}

test("keeps an eligible default TransferGo route", () => {
  const defaultRoute = option("bank", "iban", { isDefault: true });
  assert.equal(selectBankToBankOption([defaultRoute]), defaultRoute);
});

test("uses a bank-to-bank alternative when the default pays a card", () => {
  const eligible = option("bank", "accountIdentifier");
  assert.equal(selectBankToBankOption([
    option("bank", "vgsCard", { isDefault: true }),
    eligible,
  ]), eligible);
});

test("accepts open banking funding and local Nigerian bank payout", () => {
  const openBanking = option("tink", "iban");
  const nigeria = option("bank", "ngLocalAccountNgn");
  assert.equal(selectBankToBankOption([openBanking]), openBanking);
  assert.equal(selectBankToBankOption([nigeria]), nigeria);
});

test("rejects card and wallet routes", () => {
  assert.equal(selectBankToBankOption([
    option("card", "paymentLink", { isDefault: true }),
    option("bank", "phWallet"),
  ]), undefined);
});

function httpResponse(status, body, headers = ["Content-Type: application/json"]) {
  return [`HTTP/2 ${status}`, ...headers, "", body].join("\r\n");
}

test("accepts the public JSON response without changing its body or option selection", () => {
  const eligible = option("bank", "iban", { isDefault: true });
  const body = JSON.stringify({ options: [eligible] });
  const result = parseTransferGoHttpResponse(httpResponse(200, body));
  assert.equal(result.status, 200);
  assert.equal(result.body, body);
  assert.deepEqual(selectBankToBankOption(result.payload.options), eligible);
});

test("reports the observed HTML rate limit with its retry delay and pauses the provider", () => {
  const response = httpResponse(429, "<!doctype html><title>Access denied</title>", [
    "Content-Type: text/html; charset=UTF-8", "Retry-After: 23245",
    "Set-Cookie: secret-cookie-value",
  ]);
  assert.throws(() => parseTransferGoHttpResponse(response), (error) => {
    assert.equal(error.status, 429);
    assert.equal(error.pauseProvider, true);
    assert.equal(error.retryAfter, "23245");
    assert.match(error.message, /HTTP 429 \(rate limited\); Retry-After: 23245 seconds/);
    assert.doesNotMatch(error.message, /doctype|secret-cookie-value/);
    return true;
  });
});

test("pauses on access denial and preserves an HTTP-date Retry-After value", () => {
  const retryAfter = "Mon, 05 Oct 2026 00:00:00 GMT";
  assert.throws(() => parseTransferGoHttpResponse(httpResponse(403, "denied", [
    "content-type: text/plain", `rEtRy-AfTeR: ${retryAfter}`,
  ])), (error) => {
    assert.equal(error.status, 403);
    assert.equal(error.pauseProvider, true);
    assert.equal(error.retryAfter, retryAfter);
    assert.match(error.message, /HTTP 403 \(access denied\)/);
    assert.ok(error.message.endsWith(retryAfter));
    return true;
  });
});

test("keeps other HTTP errors distinguishable without pausing the provider", () => {
  for (const status of [301, 404, 500, 503]) {
    assert.throws(() => parseTransferGoHttpResponse(httpResponse(status, "not JSON")), (error) => {
      assert.equal(error.status, status);
      assert.equal(error.pauseProvider, undefined);
      assert.equal(error.retryAfter, undefined);
      assert.match(error.message, new RegExp(`HTTP ${status}`));
      return true;
    });
  }
});

test("uses the origin status after proxy CONNECT and informational headers", () => {
  const preliminary = "HTTP/1.1 200 Connection established\r\n\r\nHTTP/1.1 103 Early Hints\r\nLink: </app.js>\r\n\r\n";
  assert.throws(() => parseTransferGoHttpResponse(preliminary + httpResponse(429, "limited")), (error) => {
    assert.equal(error.status, 429);
    assert.equal(error.pauseProvider, true);
    return true;
  });
  const success = parseTransferGoHttpResponse(preliminary + "HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\n\n{\"options\":[]}");
  assert.deepEqual(success.payload, { options: [] });
});

test("rejects successful HTML and malformed JSON with descriptive messages", () => {
  assert.throws(() => parseTransferGoHttpResponse(httpResponse(200, "<!doctype html>", ["Content-Type: text/html"])), /non-JSON quote response.*HTTP 200.*text\/html/);
  assert.throws(() => parseTransferGoHttpResponse(httpResponse(200, "<!doctype html>")), /HTML instead of a public quote.*HTTP 200/);
  assert.throws(() => parseTransferGoHttpResponse(httpResponse(200, "{bad-json")), /invalid JSON instead of a public quote.*HTTP 200/);
});

test("rejects empty responses and JSON values that cannot contain quote options", () => {
  assert.throws(() => parseTransferGoHttpResponse(httpResponse(204, "")), /empty public quote.*HTTP 204/);
  for (const body of ["null", "[]", "true", "1", "\"text\""]) {
    assert.throws(() => parseTransferGoHttpResponse(httpResponse(200, body)), /invalid public quote object/);
  }
});

test("does not mistake JSON error bodies for HTTP success or lose application errors", () => {
  assert.throws(() => parseTransferGoHttpResponse(httpResponse(429, '{"error":"limited"}')), (error) => error.status === 429 && error.pauseProvider === true);
  assert.deepEqual(parseTransferGoHttpResponse(httpResponse(200, '{"error":"unsupported"}')).payload, { error: "unsupported" });
});

test("requires real HTTP status metadata instead of assuming a successful response", () => {
  assert.throws(() => parseTransferGoHttpResponse('{"options":[]}'), /missing HTTP headers/);
  assert.throws(() => parseTransferGoHttpResponse("not-http\r\n\r\n{}"), /invalid HTTP status line/);
});
