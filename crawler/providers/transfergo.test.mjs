import assert from "node:assert/strict";
import test from "node:test";
import { selectBankToBankOption } from "./transfergo.mjs";

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
