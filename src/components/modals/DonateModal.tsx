import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import styled from 'styled-components';
import {
	brandColors,
	Button,
	IconDonation,
	Lead,
	neutralColors,
} from '@giveth/ui-design-system';

import { Modal } from '@/components/modals/Modal';
import { IProject } from '@/apollo/types/types';
import { compareAddresses, formatTxLink } from '@/lib/helpers';
import { mediaQueries } from '@/lib/constants/constants';
import { IMeGQL, IProjectAcceptedToken } from '@/apollo/types/gqlTypes';
import { ISuccessDonation } from '@/components/views/donate/CryptoDonation';
import { createDonation } from '@/components/views/donate/helpers';
import { IModal } from '@/types/common';
import FailedDonation, {
	EDonationFailedType,
} from '@/components/modals/FailedDonation';
import { client } from '@/apollo/apolloClient';
import { VALIDATE_TOKEN } from '@/apollo/gql/gqlUser';
import { useAppDispatch } from '@/features/hooks';
import { signOut } from '@/features/user/user.thunks';
import { setShowSignWithWallet } from '@/features/modal/modal.slice';
import { useModalAnimation } from '@/hooks/useModalAnimation';
import config from '@/configuration';
import DonateSummary from '@/components/views/donate/DonateSummary';
import ExternalLink from '@/components/ExternalLink';
import InlineToast, { EToastType } from '@/components/toasts/InlineToast';

export interface IDonateModalProps extends IModal {
	project: IProject;
	token: IProjectAcceptedToken;
	amount: number;
	donationToGiveth: number;
	price?: number;
	anonymous?: boolean;
	setSuccessDonation: (i: ISuccessDonation) => void;
	givBackEligible?: boolean;
	projectWalletAddress: string;
	givethWalletAddress: string;
}

const DonateModal = (props: IDonateModalProps) => {
	const {
		project,
		token,
		amount,
		price,
		setShowModal,
		projectWalletAddress,
		givethWalletAddress,
		donationToGiveth,
		anonymous,
		setSuccessDonation,
		givBackEligible,
	} = props;

	const web3Context = useWeb3React();
	const { account, chainId } = web3Context;
	const dispatch = useAppDispatch();
	const { isAnimating, closeModal } = useModalAnimation(setShowModal);
	const isDonatingToGiveth = donationToGiveth > 0;

	const [donating, setDonating] = useState(false);
	const [donationSaved, setDonationSaved] = useState(false);
	const [firstTxHash, setFirstTxHash] = useState('');
	const [secondTxHash, setSecondTxHash] = useState('');
	const [isFirstTxSuccess, setIsFirstTxSuccess] = useState(false);
	const [secondTxStatus, setSecondTxStatus] = useState<EToastType>();
	const [failedModalType, setFailedModalType] =
		useState<EDonationFailedType>();

	const { title } = project || {};

	const avgPrice = price && price * amount;
	const donationToGivethAmount = (amount * donationToGiveth) / 100;
	const donationToGivethPrice = price && donationToGivethAmount * price;

	const validateToken = async () => {
		setDonating(true);
		client
			.query({
				query: VALIDATE_TOKEN,
				fetchPolicy: 'no-cache',
			})
			.then((res: IMeGQL) => {
				const address = res.data?.me?.walletAddress;
				if (compareAddresses(address, account)) {
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

	const delayedCloseModal = (txHash1: string, txHash2?: string) => {
		const txHash = txHash2 ? [txHash1, txHash2] : [txHash1];
		setTimeout(() => {
			closeModal();
			setSuccessDonation({ txHash, givBackEligible });
		}, 3000);
	};

	const handleDonate = () => {
		const txProps = {
			anonymous,
			web3Context,
			setDonating,
			amount,
			token,
			setFailedModalType,
		};
		createDonation({
			...txProps,
			setTxHash: setFirstTxHash,
			setDonationSaved,
			walletAddress: projectWalletAddress,
			projectId: Number(project.id),
		}).then(({ isSaved, txHash: firstHash }) => {
			setIsFirstTxSuccess(true);
			if (isDonatingToGiveth) {
				createDonation({
					...txProps,
					setTxHash: setSecondTxHash,
					walletAddress: givethWalletAddress,
					amount: donationToGivethAmount,
					projectId: config.GIVETH_PROJECT_ID,
				})
					.then(({ txHash: secondHash }) => {
						setSecondTxStatus(EToastType.Success);
						isSaved && delayedCloseModal(firstHash, secondHash);
					})
					.catch(({ txHash: secondHash }) => {
						setSecondTxStatus(EToastType.Error);
						isSaved && delayedCloseModal(firstHash, secondHash);
					});
			} else if (isSaved) {
				delayedCloseModal(firstHash);
			}
		});
	};

	return (
		<>
			<Modal
				closeModal={closeModal}
				isAnimating={isAnimating}
				headerTitle={donationSaved ? 'Donation submitted' : 'Donating'}
				headerTitlePosition='left'
				headerIcon={<IconDonation size={32} />}
			>
				<DonateContainer>
					<DonatingBox>
						<Lead>
							{isFirstTxSuccess
								? 'Donation submitted'
								: 'You are donating'}
						</Lead>
						<DonateSummary
							value={amount}
							tokenSymbol={token.symbol}
							usdValue={avgPrice}
							title={title}
						/>
						{isFirstTxSuccess && (
							<TxStatus>
								<InlineToast
									type={EToastType.Success}
									message={`Donation to the ${title} successful`}
								/>
								{firstTxHash && (
									<ExternalLink
										href={formatTxLink(
											chainId,
											firstTxHash,
										)}
										title='View on Etherscan'
										color={brandColors.pinky[500]}
									/>
								)}
							</TxStatus>
						)}
						{isDonatingToGiveth && (
							<>
								<Lead>
									{isFirstTxSuccess
										? 'Donation submitted'
										: 'also'}
								</Lead>
								<DonateSummary
									value={donationToGivethAmount}
									tokenSymbol={token.symbol}
									usdValue={donationToGivethPrice}
									title='The Giveth DAO'
								/>
								{secondTxStatus && (
									<TxStatus>
										<InlineToast
											type={secondTxStatus}
											message={`Donation to the Giveth DAO ${
												secondTxStatus ===
												EToastType.Success
													? 'successful'
													: 'failed'
											}`}
										/>
										{secondTxHash && (
											<ExternalLink
												href={formatTxLink(
													chainId,
													secondTxHash,
												)}
												title='View on Etherscan'
												color={brandColors.pinky[500]}
											/>
										)}
									</TxStatus>
								)}
							</>
						)}
					</DonatingBox>
					<Buttons>
						{donationSaved && (
							<InlineToast
								type={EToastType.Info}
								message='Your donation is being processed.'
							/>
						)}
						<DonateButton
							loading={donating}
							buttonType='primary'
							disabled={donating}
							label={donating ? 'DONATING' : 'DONATE'}
							onClick={validateToken}
						/>
					</Buttons>
				</DonateContainer>
			</Modal>
			{failedModalType && (
				<FailedDonation
					txUrl={formatTxLink(chainId, firstTxHash || secondTxHash)}
					setShowModal={() => setFailedModalType(undefined)}
					type={failedModalType}
				/>
			)}
		</>
	);
};

const TxStatus = styled.div`
	margin-bottom: 12px;
	> div:first-child {
		margin-bottom: 12px;
	}
`;

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
