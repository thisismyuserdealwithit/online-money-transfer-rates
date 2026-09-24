import assert from "node:assert/strict";
import test from "node:test";
import { corridors } from "../lib/data.ts";
import { isPublishedCorridor, publishedCorridorSlugs } from "../lib/corridor-publication.ts";

test("publishes every configured corridor independently of quote coverage", () => {
  const known = new Set(corridors.map((corridor) => corridor.slug));
  assert.equal(new Set(publishedCorridorSlugs).size, publishedCorridorSlugs.length);
  assert.deepEqual(new Set(publishedCorridorSlugs), known);
  for (const slug of publishedCorridorSlugs) {
    assert.equal(known.has(slug), true, `${slug} must remain a configured corridor`);
    assert.equal(isPublishedCorridor(slug), true);
  }
  assert.equal(isPublishedCorridor("uk-to-hong-kong"), true);
  assert.equal(isPublishedCorridor("not-a-configured-route"), false);
});
