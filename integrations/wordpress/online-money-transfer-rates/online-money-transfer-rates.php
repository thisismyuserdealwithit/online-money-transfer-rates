<?php
/**
 * Plugin Name: Online Money Transfer Rates
 * Plugin URI: https://github.com/thisismyuserdealwithit/online-money-transfer-rates/tree/main/integrations/wordpress/online-money-transfer-rates
 * Description: Adds a shortcode for current, timestamped money transfer rate evidence with the required corridor attribution.
 * Version: 0.1.0
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: Finofin Limited
 * Author URI: https://onlinemoneytransfer.co.uk/about
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: online-money-transfer-rates
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'OMT_RATES_VERSION', '0.1.0' );

/**
 * Limit a shortcode value to a safe corridor slug.
 *
 * @param string $value Raw route value.
 * @return string
 */
function omt_rates_clean_route( $value ) {
	$route = strtolower( (string) $value );
	$route = preg_replace( '/[^a-z0-9-]/', '', $route );
	return $route ? $route : 'uk-to-united-states';
}

/**
 * Confirm that an API row contains the scalar values used by the table.
 *
 * @param mixed $rate Candidate API row.
 * @return bool
 */
function omt_rates_valid_rate( $rate ) {
	if ( ! is_array( $rate ) ) {
		return false;
	}
	$string_keys = array( 'provider', 'status', 'feeCurrency', 'recipientCurrency', 'sourceCurrency', 'capturedAt' );
	foreach ( $string_keys as $key ) {
		if ( ! isset( $rate[ $key ] ) || ! is_string( $rate[ $key ] ) || '' === $rate[ $key ] ) {
			return false;
		}
	}
	$number_keys = array( 'exchangeRate', 'feeAmount', 'recipientAmount', 'sourceAmount' );
	foreach ( $number_keys as $key ) {
		if ( ! array_key_exists( $key, $rate ) || ! is_numeric( $rate[ $key ] ) ) {
			return false;
		}
	}
	return true;
}

/**
 * Read a public OMT API response with a short WordPress transient cache.
 *
 * @param string $route Corridor route.
 * @return array|WP_Error
 */
function omt_rates_fetch( $route ) {
	$cache_key = 'omt_rates_' . md5( $route );
	$cached    = get_transient( $cache_key );
	if ( is_array( $cached ) ) {
		return $cached;
	}

	$url      = 'https://onlinemoneytransfer.co.uk/api/v1/rates/' . rawurlencode( $route ) . '?history=1';
	$response = wp_safe_remote_get(
		$url,
		array(
			'timeout'    => 8,
			'redirection' => 2,
			'headers'    => array( 'Accept' => 'application/json' ),
			'user-agent' => 'online-money-transfer-rates-wordpress/' . OMT_RATES_VERSION,
		)
	);

	if ( is_wp_error( $response ) ) {
		return $response;
	}
	if ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
		return new WP_Error( 'omt_rates_http', __( 'The rate service did not return a usable response.', 'online-money-transfer-rates' ) );
	}

	$data = json_decode( wp_remote_retrieve_body( $response ), true );
	if (
		! is_array( $data ) ||
		! isset( $data['current'] ) ||
		! is_array( $data['current'] ) ||
		! isset( $data['current']['rates'] ) ||
		! is_array( $data['current']['rates'] )
	) {
		return new WP_Error( 'omt_rates_empty', __( 'No current rate evidence is available for this route.', 'online-money-transfer-rates' ) );
	}
	$data['current']['rates'] = array_values( array_filter( $data['current']['rates'], 'omt_rates_valid_rate' ) );
	if ( empty( $data['current']['rates'] ) ) {
		return new WP_Error( 'omt_rates_empty', __( 'No current rate evidence is available for this route.', 'online-money-transfer-rates' ) );
	}

	set_transient( $cache_key, $data, 5 * MINUTE_IN_SECONDS );
	return $data;
}

/**
 * Render [omt_rates route="uk-to-united-states" limit="10" theme="light"].
 *
 * @param array $attributes Shortcode attributes.
 * @return string
 */
function omt_rates_shortcode( $attributes ) {
	$attributes = shortcode_atts(
		array(
			'route' => 'uk-to-united-states',
			'limit' => '10',
			'theme' => 'light',
		),
		$attributes,
		'omt_rates'
	);

	$route = omt_rates_clean_route( $attributes['route'] );
	$limit = min( 20, max( 1, absint( $attributes['limit'] ) ) );
	$theme = in_array( $attributes['theme'], array( 'light', 'dark', 'auto' ), true ) ? $attributes['theme'] : 'light';
	$data  = omt_rates_fetch( $route );

	wp_enqueue_style(
		'online-money-transfer-rates',
		plugins_url( 'assets/omt-rates.css', __FILE__ ),
		array(),
		OMT_RATES_VERSION
	);

	$fallback_url = 'https://onlinemoneytransfer.co.uk/' . $route;
	if ( is_wp_error( $data ) ) {
		return sprintf(
			'<p class="omt-rates-error">%1$s <a href="%2$s" rel="noopener">%3$s</a></p>',
			esc_html( $data->get_error_message() ),
			esc_url( $fallback_url ),
			esc_html__( 'Open this corridor on Online Money Transfer.', 'online-money-transfer-rates' )
		);
	}

	$rates            = array_slice( $data['current']['rates'], 0, $limit );
	$terms            = isset( $data['useTerms'] ) && is_array( $data['useTerms'] ) ? $data['useTerms'] : array();
	$required_link    = isset( $terms['requiredLink'] ) && is_string( $terms['requiredLink'] ) ? $terms['requiredLink'] : $fallback_url;
	$required_host    = wp_parse_url( $required_link, PHP_URL_HOST );
	$attribution_link = 'onlinemoneytransfer.co.uk' === $required_host ? $required_link : $fallback_url;
	$wording          = isset( $terms['wording'] ) && is_string( $terms['wording'] ) ? $terms['wording'] : __( 'Rates supplied by Online Money Transfer', 'online-money-transfer-rates' );
	$corridor         = isset( $data['corridor'] ) && is_array( $data['corridor'] ) ? $data['corridor'] : array();
	$title            = isset( $corridor['fromCountry'], $corridor['toCountry'] ) && is_string( $corridor['fromCountry'] ) && is_string( $corridor['toCountry'] )
		? sprintf( __( '%1$s to %2$s rates', 'online-money-transfer-rates' ), $corridor['fromCountry'], $corridor['toCountry'] )
		: __( 'Money transfer rates', 'online-money-transfer-rates' );
	$source_amount    = isset( $corridor['standardTestAmount'] ) && is_numeric( $corridor['standardTestAmount'] )
		? $corridor['standardTestAmount']
		: $rates[0]['sourceAmount'];
	$source_currency  = isset( $corridor['fromCurrency'] ) && is_string( $corridor['fromCurrency'] )
		? $corridor['fromCurrency']
		: $rates[0]['sourceCurrency'];
	$snapshot_time    = isset( $data['current']['capturedAt'] ) && is_string( $data['current']['capturedAt'] )
		? $data['current']['capturedAt']
		: '';
	$title            = sprintf(
		/* translators: 1: corridor label, 2: source currency, 3: source amount. */
		__( '%1$s for %2$s %3$s', 'online-money-transfer-rates' ),
		$title,
		$source_currency,
		number_format_i18n( (float) $source_amount, 2 )
	);

	ob_start();
	?>
	<div class="omt-rates omt-rates--<?php echo esc_attr( $theme ); ?>">
		<div class="omt-rates__heading">
			<strong><?php echo esc_html( $title ); ?></strong>
			<?php if ( '' !== $snapshot_time ) : ?>
				<small><?php echo esc_html( sprintf( __( 'Evidence captured %s', 'online-money-transfer-rates' ), $snapshot_time ) ); ?></small>
			<?php endif; ?>
		</div>
		<div class="omt-rates__scroll">
			<table>
				<thead><tr><th><?php esc_html_e( 'Provider', 'online-money-transfer-rates' ); ?></th><th><?php esc_html_e( 'Rate', 'online-money-transfer-rates' ); ?></th><th><?php esc_html_e( 'Fee', 'online-money-transfer-rates' ); ?></th><th><?php esc_html_e( 'Recipient gets', 'online-money-transfer-rates' ); ?></th></tr></thead>
				<tbody>
				<?php foreach ( $rates as $rate ) : ?>
					<tr>
						<th scope="row">
							<?php echo esc_html( $rate['provider'] ); ?>
							<small>
								<?php echo esc_html( $rate['status'] ); ?>
								<?php if ( ! empty( $rate['capturedAt'] ) ) : ?>
									<?php echo esc_html( sprintf( __( ' · captured %s', 'online-money-transfer-rates' ), $rate['capturedAt'] ) ); ?>
								<?php endif; ?>
							</small>
						</th>
						<td><?php echo esc_html( number_format_i18n( (float) $rate['exchangeRate'], 5 ) ); ?></td>
						<td><?php echo esc_html( $rate['feeCurrency'] . ' ' . number_format_i18n( (float) $rate['feeAmount'], 2 ) ); ?></td>
						<td><strong><?php echo esc_html( $rate['recipientCurrency'] . ' ' . number_format_i18n( (float) $rate['recipientAmount'], 2 ) ); ?></strong></td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>
		</div>
		<p class="omt-rates__attribution"><a href="<?php echo esc_url( $attribution_link ); ?>" rel="noopener"><?php echo esc_html( $wording ); ?></a></p>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'omt_rates', 'omt_rates_shortcode' );
