import assert from "node:assert/strict";
import test from "node:test";
import { corridors } from "../lib/data.ts";
import { isPublishedCorridor, publishedCorridorSlugs } from "../lib/corridor-publication.ts";

test("keeps the reviewed corridor publication set valid and stable", () => {
  const known = new Set(corridors.map((corridor) => corridor.slug));
  assert.equal(new Set(publishedCorridorSlugs).size, publishedCorridorSlugs.length);
  assert.equal(publishedCorridorSlugs.length, 11);
  for (const slug of publishedCorridorSlugs) {
    assert.equal(known.has(slug), true, `${slug} must remain a configured corridor`);
    assert.equal(isPublishedCorridor(slug), true);
  }
  assert.equal(isPublishedCorridor("uk-to-hong-kong"), false);
});
