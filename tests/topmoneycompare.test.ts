import assert from "node:assert/strict";
import test from "node:test";
import { corridors, getCorridor } from "../lib/data";
import { topMoneyCompareCorridorUrl } from "../lib/topmoneycompare";

test("builds a supported TopMoneyCompare URL for every OMT corridor", () => {
  for (const corridor of corridors) {
    const url = new URL(topMoneyCompareCorridorUrl(corridor));
    assert.equal(url.origin, "https://www.topmoneycompare.co.uk");
    assert.match(url.pathname, /^\/transfer-money\/[a-z-]+-to-[a-z-]+$/);
    assert.equal(url.searchParams.get("amount"), String(corridor.testAmount));
  }
});

test("uses TopMoneyCompare's exact UK and regional slugs", () => {
  assert.equal(
    topMoneyCompareCorridorUrl(getCorridor("uk-to-united-states")!),
    "https://www.topmoneycompare.co.uk/transfer-money/united-kingdom-to-united-states?amount=200",
  );
  assert.equal(
    topMoneyCompareCorridorUrl(getCorridor("europe-to-united-states")!),
    "https://www.topmoneycompare.co.uk/transfer-money/europe-to-united-states?amount=850",
  );
});
