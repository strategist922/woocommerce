/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Link, useFormContext } from '@woocommerce/components';
import { Product, SETTINGS_STORE_NAME } from '@woocommerce/data';
import { recordEvent } from '@woocommerce/tracks';
import { useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import interpolateComponents from '@automattic/interpolate-components';
import {
	// @ts-expect-error `__experimentalInputControl` does exist.
	__experimentalInputControl as InputControl,
	BaseControl,
	Card,
	CardBody,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import './pricing-section.scss';
import { ProductSectionLayout } from '../layout/product-section-layout';
import { getInputControlProps } from './utils';
import { ADMIN_URL } from '../../utils/admin-settings';
import { CurrencyContext } from '../../lib/currency-context';
import { useProductHelper } from '../use-product-helper';

export const PricingSection: React.FC = () => {
	const { getInputProps } = useFormContext< Product >();
	const { sanitizePrice } = useProductHelper();
	const { isResolving: isTaxSettingsResolving, taxSettings } = useSelect(
		( select ) => {
			const { getSettings, hasFinishedResolution } =
				select( SETTINGS_STORE_NAME );
			return {
				isResolving: ! hasFinishedResolution( 'getSettings', [
					'tax',
				] ),
				taxSettings: getSettings( 'tax' ).tax || {},
			};
		}
	);
	const pricesIncludeTax =
		taxSettings.woocommerce_prices_include_tax === 'yes';
	const context = useContext( CurrencyContext );

	const taxIncludedInPriceText = __(
		'Per your {{link}}store settings{{/link}}, tax is {{strong}}included{{/strong}} in the price.',
		'woocommerce'
	);
	const taxNotIncludedInPriceText = __(
		'Per your {{link}}store settings{{/link}}, tax is {{strong}}not included{{/strong}} in the price.',
		'woocommerce'
	);

	const taxSettingsElement = interpolateComponents( {
		mixedString: pricesIncludeTax
			? taxIncludedInPriceText
			: taxNotIncludedInPriceText,
		components: {
			link: (
				<Link
					href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=tax` }
					target="_blank"
					type="external"
					onClick={ () => {
						recordEvent(
							'product_pricing_list_price_help_tax_settings_click'
						);
					} }
				>
					<></>
				</Link>
			),
			strong: <strong />,
		},
	} );

	const salePriceTitle = interpolateComponents( {
		mixedString: __(
			'Sale price {{span}}(optional){{/span}}',
			'woocommerce'
		),
		components: {
			span: <span className="woocommerce-product-form__optional-input" />,
		},
	} );

	const regularPriceProps = getInputControlProps( {
		...getInputProps( 'regular_price' ),
		context,
	} );
	const salePriceProps = getInputControlProps( {
		...getInputProps( 'sale_price' ),
		context,
	} );

	return (
		<ProductSectionLayout
			title={ __( 'Pricing', 'woocommerce' ) }
			description={
				<>
					<span>
						{ __(
							'Set a competitive price, put the product on sale, and manage tax calculations.',
							'woocommerce'
						) }
					</span>
					<Link
						className="woocommerce-form-section__header-link"
						href="https://woocommerce.com/posts/how-to-price-products-strategies-expert-tips/"
						target="_blank"
						type="external"
						onClick={ () => {
							recordEvent( 'add_product_pricing_help' );
						} }
					>
						{ __(
							'How to price your product: expert tips',
							'woocommerce'
						) }
					</Link>
				</>
			}
		>
			<Card>
				<CardBody>
					<BaseControl
						id="product_pricing_regular_price"
						className={ regularPriceProps?.className ?? '' }
						help={ regularPriceProps?.help ?? '' }
					>
						<InputControl
							{ ...regularPriceProps }
							label={ __( 'List price', 'woocommerce' ) }
							placeholder={ __( '10.59', 'woocommerce' ) }
							onChange={ ( value: string ) => {
								const sanitizedValue = sanitizePrice( value );
								regularPriceProps?.onChange( sanitizedValue );
							} }
						/>
					</BaseControl>
					{ ! isTaxSettingsResolving && (
						<span className="woocommerce-product-form__secondary-text">
							{ taxSettingsElement }
						</span>
					) }

					<BaseControl
						id="product_pricing_sale_price"
						className={ salePriceProps?.className ?? '' }
						help={ salePriceProps?.help ?? '' }
					>
						<InputControl
							{ ...salePriceProps }
							label={ salePriceTitle }
							placeholder={ __( '8.59', 'woocommerce' ) }
							onChange={ ( value: string ) => {
								const sanitizedValue = sanitizePrice( value );
								salePriceProps?.onChange( sanitizedValue );
							} }
						/>
					</BaseControl>
				</CardBody>
			</Card>
		</ProductSectionLayout>
	);
};
