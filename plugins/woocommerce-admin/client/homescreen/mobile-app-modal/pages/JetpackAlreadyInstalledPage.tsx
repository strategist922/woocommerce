/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { recordEvent } from '@woocommerce/tracks';
import { useSelect } from '@wordpress/data';
import { OPTIONS_STORE_NAME } from '@woocommerce/data';

/**
 * Internal dependencies
 */
import { ModalContentLayoutWithTitle } from '../layouts/ModalContentLayoutWithTitle';
import { SendMagicLinkButton } from '../components';

interface JetpackAlreadyInstalledPageProps {
	wordpressAccountEmailAddress: string | undefined;
	isRetryingMagicLinkSend: boolean;
	sendMagicLinkHandler: () => void;
}

export const JetpackAlreadyInstalledPage: React.FC<
	JetpackAlreadyInstalledPageProps
> = ( {
	wordpressAccountEmailAddress,
	sendMagicLinkHandler,
	isRetryingMagicLinkSend,
} ) => {
	const DISMISSED_MOBILE_APP_MODAL_OPTION =
		'woocommerce_admin_dismissed_mobile_app_modal';

	const { repeatUser, isLoading } = useSelect( ( select ) => {
		const { hasFinishedResolution, getOption } =
			select( OPTIONS_STORE_NAME );

		return {
			isLoading: ! hasFinishedResolution( 'getOption', [
				DISMISSED_MOBILE_APP_MODAL_OPTION,
			] ),
			repeatUser:
				getOption( DISMISSED_MOBILE_APP_MODAL_OPTION ) === 'yes',
		};
	} );

	useEffect( () => {
		if ( ! isLoading && ! isRetryingMagicLinkSend ) {
			recordEvent( 'magic_prompt_view', {
				// jetpack_state value is implied by the precondition of rendering this screen
				jetpack_state: 'full-connection',
				repeat_user: repeatUser,
			} );
		}
	}, [ repeatUser, isLoading, isRetryingMagicLinkSend ] );

	return (
		<ModalContentLayoutWithTitle>
			<>
				<div className="modal-subheader jetpack-already-installed">
					<h3>
						{ sprintf(
							/* translators: %s: user's WordPress.com account email address */
							__(
								'We’ll send a magic link to %s. Open it on your smartphone or tablet to sign into your store instantly.',
								'woocommerce'
							),
							wordpressAccountEmailAddress
						) }
					</h3>
				</div>
				<SendMagicLinkButton onClickHandler={ sendMagicLinkHandler } />
			</>
		</ModalContentLayoutWithTitle>
	);
};
