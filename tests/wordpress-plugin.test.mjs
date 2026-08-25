import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pluginUrl = new URL("../integrations/wordpress/online-money-transfer-rates/online-money-transfer-rates.php", import.meta.url);
const readmeUrl = new URL("../integrations/wordpress/online-money-transfer-rates/readme.txt", import.meta.url);

test("WordPress plugin preserves attribution and discloses its external service", async () => {
  const [plugin, readme] = await Promise.all([readFile(pluginUrl, "utf8"), readFile(readmeUrl, "utf8")]);
  assert.match(plugin, /License: GPL-2\.0-or-later/);
  assert.match(plugin, /add_shortcode\( 'omt_rates'/);
  assert.match(plugin, /wp_safe_remote_get/);
  assert.match(plugin, /useTerms/);
  assert.match(plugin, /requiredLink/);
  assert.match(plugin, /capturedAt/);
  assert.match(plugin, /omt_rates_valid_rate/);
  assert.match(plugin, /standardTestAmount/);
  assert.doesNotMatch(plugin, /home_url/);
  assert.doesNotMatch(plugin, /<script/i);
  assert.match(readme, /Tested up to: 7\.1/);
  assert.match(readme, /== External service ==/);
  assert.match(readme, /api\/terms/);
  assert.match(readme, /Privacy policy/);
});
