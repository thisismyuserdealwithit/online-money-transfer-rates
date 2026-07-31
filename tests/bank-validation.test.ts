import assert from "node:assert/strict";
import test from "node:test";
import {
  abaChecksumPass,
  bicFormatPass,
  cleanBankCode,
  ibanChecksumPass,
} from "../lib/bank-validation";

test("normalises and checks BIC structure", () => {
  assert.equal(cleanBankCode("aaaa gb 2l xxx"), "AAAAGB2LXXX");
  assert.equal(bicFormatPass("AAAAGB2L"), true);
  assert.equal(bicFormatPass("AAAA GB 2L XXX"), true);
  assert.equal(bicFormatPass("AAAAG12L"), false);
  assert.equal(bicFormatPass("AAAAGB2"), false);
});

test("checks an IBAN MOD97 checksum", () => {
  assert.equal(ibanChecksumPass("GB82 WEST 1234 5698 7654 32"), true);
  assert.equal(ibanChecksumPass("GB82 WEST 1234 5698 7654 31"), false);
});

test("checks the ABA routing-number checksum", () => {
  assert.equal(abaChecksumPass("123-456-780"), true);
  assert.equal(abaChecksumPass("123-456-781"), false);
  assert.equal(abaChecksumPass("12345678"), false);
});
