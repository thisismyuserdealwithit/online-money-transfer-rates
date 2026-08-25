=== Online Money Transfer Rates ===
Tags: money transfer, exchange rates, remittance, currency, shortcode
Requires at least: 6.4
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Show current, timestamped money transfer rate evidence with a visible link to the matching source corridor.

== Description ==

Online Money Transfer Rates adds a shortcode that retrieves the current public comparison for one OnlineMoneyTransfer.co.uk corridor.

`[omt_rates route="uk-to-united-states" limit="10" theme="light"]`

The output includes provider names, exchange rates, fees, recipient amounts, evidence status and the corridor-specific attribution required by the data terms. Themes are `light`, `dark` and `auto`.

The plugin stores no settings, visitor identifiers, transfer details or recipient information. Responses are cached in a WordPress transient for five minutes.

== External service ==

This plugin connects to `https://onlinemoneytransfer.co.uk/api/v1/rates/{route}` to retrieve public money transfer rate evidence. The request sends the selected public corridor slug, a generic plugin version in the request user-agent, and ordinary server connection data such as the site server IP address. It does not send the website URL or visitor-entered financial or personal data.

The service is provided by Finofin Limited:

* API terms: https://onlinemoneytransfer.co.uk/api/terms
* Privacy policy: https://onlinemoneytransfer.co.uk/privacy
* API documentation: https://onlinemoneytransfer.co.uk/api

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/` or install it through the WordPress plugin screen.
2. Activate **Online Money Transfer Rates**.
3. Add `[omt_rates route="uk-to-united-states"]` to a post or page.
4. Use the route list at https://onlinemoneytransfer.co.uk/api/v1/corridors to choose another corridor slug.

== Frequently Asked Questions ==

= Is the API free? =

Yes. Displayed rates must keep the visible link to the matching Online Money Transfer corridor. The shortcode adds that link automatically.

= Does the plugin collect visitor data? =

No. The server requests a public rate feed and stores the response temporarily. The shortcode has no visitor input.

= Are these guaranteed live quotes? =

No. Each record has a capture time and evidence status. Rates can move after capture, so the transfer provider should be checked before money is sent.

== Changelog ==

= 0.1.0 =

* Initial shortcode, caching, themes and external-service disclosure.
