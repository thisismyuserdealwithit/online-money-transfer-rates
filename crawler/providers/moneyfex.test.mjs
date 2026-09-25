import assert from "node:assert/strict";
import test from "node:test";
import { moneyfex, moneyfexRequest, parseMoneyfexQuote } from "./moneyfex.mjs";
import { UnsupportedRouteError } from "./shared.mjs";

const corridor = {
  sourceLocale: "gb", sourceCurrency: "GBP", sourceAmount: 200,
  destinationLocale: "ng", destinationCurrency: "NGN",
};

function fixture(changes = {}) {
  return { response: {
    SendingAmount: 200, ReceivingAmount: 350000, Fee: 1.99, TotalAmount: 201.99,
    ExchangeRate: 1750, SendingCurrency: "GBP", ReceivingCurrency: "NGN",
    SendingCountry: "GB", ReceivingCountry: "NG", IsIntroductoryRate: false,
    IsIntroductoryFee: false, ActualFee: 0, IsValid: { Data: true }, TransferMethod: 4,
    ...changes,
  } };
}

test("MoneyFex keeps the explicit fee added on top of the requested source amount", () => {
  assert.deepEqual(parseMoneyfexQuote(fixture(), corridor), {
    recipientAmount: 350000, feeAmount: 1.99, feeCurrency: "GBP", exchangeRate: 1750,
    totalDebit: 201.99, promotion: false,
  });
  assert.deepEqual(moneyfexRequest(corridor), {
    SendingAmount: 200, ReceivingAmount: 0, SendingCurrency: "GBP", ReceivingCurrency: "NGN",
    SendingCountry: "GB", ReceivingCountry: "NG", IsReceivingAmount: false, TransferMethod: 4,
  });
});

test("MoneyFex requires the exact amount, countries, currencies and bank payout echo", () => {
  for (const changes of [
    { SendingAmount: 200.01 }, { SendingAmount: "200" }, { SendingCurrency: "EUR" },
    { ReceivingCurrency: "GBP" }, { SendingCountry: "GG" }, { ReceivingCountry: "GH" },
    { TransferMethod: 1 }, { TransferMethod: "4" },
  ]) assert.throws(() => parseMoneyfexQuote(fixture(changes), corridor), /wrong/);
});

test("MoneyFex rejects absent or invalid fees instead of inventing a zero fee", () => {
  for (const Fee of [undefined, null, "", "1.99", -1, NaN, Infinity]) {
    assert.throws(() => parseMoneyfexQuote(fixture({ Fee }), corridor), /Fee/);
  }
  assert.equal(parseMoneyfexQuote(fixture({ Fee: 0, TotalAmount: 200 }), corridor).feeAmount, 0);
});

test("MoneyFex rejects invalid totals, rates and recipient amounts", () => {
  for (const changes of [
    { TotalAmount: 200 }, { TotalAmount: undefined }, { TotalAmount: 0 },
    { ReceivingAmount: 349999 }, { ReceivingAmount: 0 }, { ReceivingAmount: "350000" },
    { ExchangeRate: 1749 }, { ExchangeRate: 0 }, { ExchangeRate: null },
  ]) assert.throws(() => parseMoneyfexQuote(fixture(changes), corridor));
});

test("MoneyFex rejects provider validation failures and incomplete responses", () => {
  for (const IsValid of [undefined, null, { Data: false }, { Data: "true" }]) {
    assert.throws(() => parseMoneyfexQuote(fixture({ IsValid }), corridor), /did not validate/);
  }
  for (const payload of [null, {}, { response: [] }]) {
    assert.throws(() => parseMoneyfexQuote(payload, corridor), /no public quote/);
  }
});

test("MoneyFex preserves either promotional flag and rejects ambiguous flags", () => {
  assert.equal(parseMoneyfexQuote(fixture({ IsIntroductoryRate: true }), corridor).promotion, true);
  assert.equal(parseMoneyfexQuote(fixture({ IsIntroductoryFee: true, Fee: 0, ActualFee: 1.99, TotalAmount: 200 }), corridor).promotion, true);
  for (const field of ["IsIntroductoryRate", "IsIntroductoryFee"]) {
    for (const value of [undefined, null, "false", 0]) {
      assert.throws(() => parseMoneyfexQuote(fixture({ [field]: value }), corridor), /Introductory/);
    }
  }
});

test("MoneyFex limits coverage to UK GBP and the configured public destination pairs", () => {
  for (const destinationLocale of ["es", "fr", "de", "ie", "it", "nl", "pt"]) {
    assert.equal(moneyfex.supports({ ...corridor, destinationLocale, destinationCurrency: "EUR" }), true);
  }
  assert.equal(moneyfex.supports(corridor), true);
  for (const route of [
    { ...corridor, destinationLocale: "pk", destinationCurrency: "PKR" },
    { ...corridor, destinationCurrency: "EUR" },
    { ...corridor, sourceLocale: "ie" }, { ...corridor, sourceCurrency: "EUR" },
  ]) {
    assert.equal(moneyfex.supports(route), false);
    assert.throws(() => parseMoneyfexQuote(fixture(), route), UnsupportedRouteError);
  }
});

test("MoneyFex never shares a cached quote across destination countries or amounts", () => {
  const spain = { ...corridor, destinationLocale: "es", destinationCurrency: "EUR" };
  assert.notEqual(moneyfex.cacheKey(spain), moneyfex.cacheKey({ ...spain, destinationLocale: "fr" }));
  assert.notEqual(moneyfex.cacheKey(spain), moneyfex.cacheKey({ ...spain, sourceAmount: 100 }));
  assert.notEqual(moneyfex.cacheKey(spain), moneyfex.cacheKey({ ...spain, sourceLocale: "ie" }));
});
