import styled from 'styled-components';
import React, { ChangeEvent, FC, useState } from 'react';
import { IconWalletOutline } from '@giveth/ui-design-system/lib/cjs/components/icons/WalletOutline';
import { Button } from '@giveth/ui-design-system';
import { Modal } from '@/components/modals/Modal';
import { IModal } from '@/types/common';
import Input from '@/components/Input';
import { mediaQueries } from '@/lib/constants/constants';
import { IAddress } from '@/components/views/verification/manageFunds/ManageFundsIndex';
import SelectNetwork from '@/components/views/verification/manageFunds/SelectNetwork';
import { ISelectedNetwork } from '@/components/views/verification/manageFunds/types';

interface IProps extends IModal {
	addAddress: (address: IAddress) => void;
}

const networkOptions = [
	{
		value: {
			name: 'Ethereum',
		},
		label: 'Ethereum Mainnet',
		name: 'Ethereum',
		isGivbackEligible: true,
	},
	{
		value: {
			name: 'Gnosis',
		},
		label: 'Gnosis',
		name: 'Gnosis',
		isGivbackEligible: true,
	},
];

const AddAddressModal: FC<IProps> = ({ setShowModal, addAddress }) => {
	const [walletAddress, setWalletAddress] = useState(
		'0x6d97d65adff6771b31671443a6b9512104312d3d',
	);
	const [title, setTitle] = useState('Address #1');
	const [selectedNetwork, setSelectedNetwork] = useState<ISelectedNetwork>();
	const [customInput, setCustomInput] = useState('');

	const handleSubmit = () => {
		addAddress({
			walletAddress,
			title,
			network: selectedNetwork?.label || '',
		});
		setShowModal(false);
	};

	return (
		<Modal
			setShowModal={setShowModal}
			headerTitlePosition='left'
			headerTitle='Add an Address'
			headerIcon={<IconWalletOutline />}
		>
			<Container>
				<SelectNetwork
					tokenList={networkOptions}
					selectedNetwork={selectedNetwork}
					inputValue={customInput}
					onChange={setSelectedNetwork}
					placeholder='Search network name'
					onInputChange={setCustomInput}
				/>
				<br />
				<Input
					onChange={(e: ChangeEvent<HTMLInputElement>) =>
						setTitle(e.target.value)
					}
					value={title}
					name='AddressTitle'
					label='Address Title'
					caption='Choose a title for this address.'
				/>
				<br />
				<Input
					onChange={(e: ChangeEvent<HTMLInputElement>) =>
						setWalletAddress(e.target.value)
					}
					value={walletAddress}
					name='Address'
					label='Receiving address'
					caption='Enter the related address.'
				/>
				<Buttons>
					<Button
						size='small'
						label='ADD NEW ADDRESS'
						buttonType='secondary'
						onClick={handleSubmit}
					/>
					<Button size='small' label='CANCEL' buttonType='texty' />
				</Buttons>
			</Container>
		</Modal>
	);
};

const Buttons = styled.div`
	margin-top: 80px;
	> :last-child {
		margin-top: 10px;
		:hover {
			background-color: transparent;
		}
	}
	> * {
		width: 100%;
	}
`;

const Container = styled.div`
	width: 100vw;
	padding: 26px;
	text-align: left;
	${mediaQueries.mobileL} {
		width: 425px;
	}
	${mediaQueries.tablet} {
		width: 480px;
	}
`;

export default AddAddressModal;
