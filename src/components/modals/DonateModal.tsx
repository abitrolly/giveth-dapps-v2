import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import styled from 'styled-components';
import {
	brandColors,
	H3,
	H6,
	P,
	neutralColors,
	Button,
	semanticColors,
	IconInfo,
	IconWalletApprove,
} from '@giveth/ui-design-system';

import { useIntl } from 'react-intl';
import { Modal } from '@/components/modals/Modal';
import { IProject } from '@/apollo/types/types';
import { compareAddresses, formatPrice } from '@/lib/helpers';
import FixedToast from '@/components/toasts/FixedToast';
import { mediaQueries } from '@/lib/constants/constants';
import { IMeGQL, IProjectAcceptedToken } from '@/apollo/types/gqlTypes';
import { ISuccessDonation } from '@/components/views/donate/CryptoDonation';
import { confirmDonation } from '@/components/views/donate/helpers';
import { IModal } from '@/types/common';
import { EDonationFailedType } from '@/components/modals/FailedDonation';
import { client } from '@/apollo/apolloClient';
import { VALIDATE_TOKEN } from '@/apollo/gql/gqlUser';
import { useAppDispatch } from '@/features/hooks';
import { signOut } from '@/features/user/user.thunks';
import { setShowSignWithWallet } from '@/features/modal/modal.slice';
import { useModalAnimation } from '@/hooks/useModalAnimation';

export interface IDonateModalProps extends IModal {
	setFailedModalType: (i: EDonationFailedType) => void;
	setTxHash: (i: string) => void;
	project: IProject;
	token: IProjectAcceptedToken;
	amount: number;
	price?: number;
	anonymous?: boolean;
	setSuccessDonation: (i: ISuccessDonation) => void;
	givBackEligible?: boolean;
	mainProjectAddress?: string;
	secondaryProjectAddress?: string;
}

const DonateModal = (props: IDonateModalProps) => {
	const { project, token, amount, price, setShowModal } = props;

	const web3Context = useWeb3React();
	const dispatch = useAppDispatch();
	const { isAnimating, closeModal } = useModalAnimation(setShowModal);

	const { formatMessage } = useIntl();
	const [donating, setDonating] = useState(false);
	const [donationSaved, setDonationSaved] = useState(false);

	const { title } = project || {};

	const avgPrice = price && price * amount;

	const validateToken = () => {
		setDonating(true);
		client
			.query({
				query: VALIDATE_TOKEN,
				fetchPolicy: 'no-cache',
			})
			.then((res: IMeGQL) => {
				const address = res.data?.me?.walletAddress;
				if (compareAddresses(address, web3Context.account)) {
					handleDonate();
				} else {
					handleFailedValidation();
				}
			})
			.catch(handleFailedValidation);
	};

	const handleFailedValidation = () => {
		dispatch(signOut());
		dispatch(setShowSignWithWallet(true));
		closeModal();
	};

	const handleDonate = () => {
		confirmDonation({
			...props,
			setDonationSaved,
			web3Context,
			setDonating,
		}).then();
	};

	return (
		<Modal
			closeModal={closeModal}
			isAnimating={isAnimating}
			headerTitle={formatMessage({ id: 'label.donating' })}
			headerTitlePosition='left'
			headerIcon={<IconWalletApprove size={32} />}
		>
			<DonateContainer>
				<DonatingBox>
					<P>{formatMessage({ id: 'label.you_are_donating' })}</P>
					<H3>
						{formatPrice(amount)} {token.symbol}
					</H3>
					{avgPrice ? <H6>{formatPrice(avgPrice)} USD</H6> : null}
					<P>
						{formatMessage({ id: 'label.to' })} <span>{title}</span>
					</P>
				</DonatingBox>
				<Buttons>
					{donationSaved && (
						<FixedToast
							message='Your donation is being processed, you can close this modal.'
							color={semanticColors.blueSky[700]}
							backgroundColor={semanticColors.blueSky[100]}
							icon={
								<IconInfo
									size={16}
									color={semanticColors.blueSky[700]}
								/>
							}
						/>
					)}
					<DonateButton
						loading={donating}
						buttonType='primary'
						disabled={donating}
						label={
							donating
								? formatMessage({ id: 'label.donating' })
								: formatMessage({ id: 'label.donate' })
						}
						onClick={validateToken}
					/>
					{donationSaved && (
						<CloseButton
							label='CLOSE THIS MODAL'
							buttonType='texty'
							onClick={closeModal}
						/>
					)}
				</Buttons>
			</DonateContainer>
		</Modal>
	);
};

const DonateContainer = styled.div`
	background: white;
	color: black;
	padding: 24px 24px 38px;
	margin: 0;
	width: 100%;
	${mediaQueries.tablet} {
		width: 494px;
	}
`;

const DonatingBox = styled.div`
	color: ${brandColors.deep[900]};
	> :first-child {
		margin-bottom: 8px;
	}
	h3 {
		margin-top: -5px;
	}
	h6 {
		color: ${neutralColors.gray[700]};
		margin-top: -5px;
	}
	> :last-child {
		margin: 12px 0 32px 0;
		> span {
			font-weight: 500;
		}
	}
`;

const DonateButton = styled(Button)<{ disabled: boolean }>`
	background: ${props =>
		props.disabled ? brandColors.giv[200] : brandColors.giv[500]};
	:hover:enabled {
		background: ${brandColors.giv[700]};
	}
	:disabled {
		cursor: not-allowed;
	}
	> :first-child > div {
		border-top: 3px solid ${brandColors.giv[200]};
		animation-timing-function: linear;
	}
	text-transform: uppercase;
`;

const Buttons = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;

	> :first-child {
		margin: 15px 0;
	}
`;

const CloseButton = styled(Button)`
	margin: 5px 0 0 0;
	:hover {
		background: transparent;
	}
`;

export default DonateModal;
