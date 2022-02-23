import React, { useEffect, useRef, useState } from 'react';
import {
	H3,
	H4,
	P,
	Button,
	OulineButton,
	brandColors,
	neutralColors,
	IconExternalLink,
	Caption,
} from '@giveth/ui-design-system';
import { useMutation } from '@apollo/client';
import { utils } from 'ethers';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import Debounced from 'lodash.debounce';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';

import SignInModal from '../../modals/SignInModal';
import { ADD_PROJECT } from '@/apollo/gql/gqlProjects';
import { getAddressFromENS, isAddressENS } from '@/lib/wallet';
import { IProjectCreation } from '@/apollo/types/types';
import {
	NameInput,
	DescriptionInput,
	CategoryInput,
	LocationInput,
	ImageInput,
	WalletAddressInput,
} from './Inputs';
import { getImageFile } from '@/utils';
import useUser from '@/context/UserProvider';
import Logger from '@/utils/Logger';
import SuccessfulCreation from './SuccessfulCreation';
import { ProjectGuidelineModal } from '@/components/modals/ProjectGuidelineModal';
import {
	isDescriptionHeavy,
	titleValidation,
	walletAddressValidation,
} from '@/helpers/createProjectValidation';
import { gToast, ToastType } from '@/components/toasts';
import { isUserRegistered, slugToProjectView } from '@/lib/helpers';

export enum ECreateErrFields {
	NAME = 'name',
	DESCRIPTION = 'description',
	WALLET_ADDRESS = 'walletAddress',
}

export interface ICreateProjectErrors {
	[ECreateErrFields.NAME]: string;
	[ECreateErrFields.DESCRIPTION]: string;
	[ECreateErrFields.WALLET_ADDRESS]: string;
}

const CreateIndex = () => {
	const { library, chainId } = useWeb3React();
	const [addProjectMutation] = useMutation(ADD_PROJECT);
	const router = useRouter();

	const [creationSuccessful, setCreationSuccessful] = useState<any>(null);
	const [showSigninModal, setShowSigninModal] = useState(false);
	const [showGuidelineModal, setShowGuidelineModal] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [categories, setCategories] = useState([]);
	const [impactLocation, setImpactLocation] = useState<any>('');
	const [image, setImage] = useState<any>(null);
	const [walletAddress, setWalletAddress] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<ICreateProjectErrors>({
		[ECreateErrFields.NAME]: 'Title is required',
		[ECreateErrFields.DESCRIPTION]: '',
		[ECreateErrFields.WALLET_ADDRESS]: '',
	});

	const {
		state: { user, isSignedIn },
		actions: { showSignModal },
	} = useUser();

	const debouncedTitleValidation = useRef<any>();
	const debouncedAddressValidation = useRef<any>();
	const debouncedDescriptionValidation = useRef<any>();

	const submitErrorHandler = (id: string, error: string) => {
		document.getElementById(id)?.scrollIntoView({
			behavior: 'smooth',
		});
		return gToast(error, {
			type: ToastType.DANGER,
			position: 'top-center',
		});
	};

	const onSubmit = async (isDraft?: boolean) => {
		try {
			if (!isSignedIn) {
				return showSignModal();
			}
			if (!isUserRegistered(user)) {
				// TODO: Show modal to register
				return gToast('Please first register', {
					type: ToastType.DANGER,
					position: 'top-center',
				});
			}
			for (let [key, value] of Object.entries(errors)) {
				if (value) {
					submitErrorHandler(key, value);
					return;
				}
			}

			const address = isAddressENS(walletAddress)
				? await getAddressFromENS(walletAddress, library)
				: walletAddress;

			const projectCategories = [];
			for (const category in categories) {
				projectCategories.push(category);
			}

			const projectData: IProjectCreation = {
				title: name,
				description,
				impactLocation,
				categories: projectCategories,
				organisationId: 1,
				walletAddress: utils.getAddress(address),
				imageStatic: null,
				imageUpload: null,
				isDraft: !!isDraft,
			};

			if (!isNaN(image!)) {
				projectData.imageStatic = image?.toString();
			} else if (image) {
				projectData.imageUpload = await getImageFile(image, name);
			}

			console.log(projectData);
			setIsLoading(true);

			const addedProject = await addProjectMutation({
				variables: {
					project: { ...projectData },
				},
			});

			if (addedProject) {
				// Success
				setIsLoading(false);
				const project = addedProject.data?.addProject;
				!isDraft
					? setCreationSuccessful(project)
					: await router.push(slugToProjectView(project.slug));
			}
		} catch (e) {
			setIsLoading(false);
			const error = e as Error;
			Logger.captureException(error);
			gToast(JSON.stringify(error), {
				type: ToastType.DANGER,
				position: 'top-center',
			});
		}
	};

	const hasErrors =
		errors[ECreateErrFields.NAME] ||
		errors[ECreateErrFields.WALLET_ADDRESS] ||
		errors[ECreateErrFields.DESCRIPTION];

	useEffect(() => {
		if (isSignedIn) {
			setShowGuidelineModal(true);
		}
	}, [isSignedIn]);

	useEffect(() => {
		const userAddress = user?.walletAddress;
		if (userAddress) {
			if (!isUserRegistered(user)) {
				// TODO: Show modal to register
				gToast('Please first register', {
					type: ToastType.DANGER,
					position: 'top-center',
				});
			}
			setShowSigninModal(false);
			setWalletAddress(userAddress);
			walletAddressValidation(
				userAddress,
				library,
				errors,
				setErrors,
				chainId,
			);
		}
		if (!user) {
			setShowSigninModal(true);
		}
	}, [user]);

	useEffect(() => {
		debouncedTitleValidation.current = Debounced(titleValidation, 1000);
		debouncedAddressValidation.current = Debounced(
			walletAddressValidation,
			1000,
		);
		debouncedDescriptionValidation.current = Debounced(
			isDescriptionHeavy,
			1000,
		);
	}, []);

	const handleInputChange = (value: string, id: string) => {
		if (id === ECreateErrFields.NAME) {
			setName(value);
			debouncedTitleValidation.current(value, errors, setErrors);
		} else if (id === ECreateErrFields.WALLET_ADDRESS) {
			setWalletAddress(value);
			debouncedAddressValidation.current(
				value,
				library,
				errors,
				setErrors,
				chainId,
			);
		} else if (id === ECreateErrFields.DESCRIPTION) {
			setDescription(value);
			debouncedDescriptionValidation.current(value, errors, setErrors);
		}
	};

	if (creationSuccessful) {
		return <SuccessfulCreation project={creationSuccessful} />;
	}

	return (
		<>
			{showGuidelineModal && (
				<ProjectGuidelineModal
					showModal={showGuidelineModal}
					setShowModal={setShowGuidelineModal}
				/>
			)}
			{showSigninModal && (
				<SignInModal
					showModal={showSigninModal}
					closeModal={() => setShowSigninModal(false)}
				/>
			)}
			{user && (
				<CreateContainer>
					<Title>Create a Project</Title>

					<div>
						<NameInput
							value={name}
							setValue={e =>
								handleInputChange(e, ECreateErrFields.NAME)
							}
							error={errors[ECreateErrFields.NAME]}
						/>
						<DescriptionInput
							setValue={e =>
								handleInputChange(
									e,
									ECreateErrFields.DESCRIPTION,
								)
							}
							error={errors[ECreateErrFields.DESCRIPTION]}
						/>
						<CategoryInput setValue={setCategories} />
						<LocationInput setValue={setImpactLocation} />
						<ImageInput value={image} setValue={setImage} />
						<WalletAddressInput
							value={walletAddress}
							setValue={e =>
								handleInputChange(
									e,
									ECreateErrFields.WALLET_ADDRESS,
								)
							}
							error={errors[ECreateErrFields.WALLET_ADDRESS]}
						/>

						<PublishTitle>{`Let's Publish!`}</PublishTitle>
						<PublishList>
							<li>
								Newly published projects will be
								&quot;unlisted&quot; until reviewed by our team.
							</li>
							<li>
								You can still access your project from your
								account and share it with your friends via the
								project link!
							</li>
							<li>
								You&apos;ll receive an email from us once your
								project is listed.
							</li>
						</PublishList>
						<Buttons>
							<OulineButton
								label='PREVIEW '
								buttonType='primary'
								disabled={isLoading}
								icon={<IconExternalLink size={16} />}
								onClick={() => onSubmit(true)}
							/>
							<Button
								label='PUBLISH'
								buttonType='primary'
								disabled={isLoading}
								onClick={() => onSubmit(false)}
							/>
						</Buttons>
						{hasErrors && (
							<ErrorMessage>
								Empty fields or errors, please check the values
							</ErrorMessage>
						)}
					</div>
				</CreateContainer>
			)}
			<Toaster containerStyle={{ top: '80px' }} />
		</>
	);
};

const CreateContainer = styled.div`
	display: flex;
	flex-direction: column;
	padding: 104px 0 154px 264px;
	width: 677px;
	> div {
		display: flex;
		flex-direction: column;
		margin: 48px 0;
		width: 677px;
	}
`;

const Buttons = styled.div`
	display: flex;
	flex-direction: row;
	margin: 61px 0 32px 0;
	button {
		width: 100%;
		&:first-of-type {
			margin-right: 10px;
		}
	}
`;

const Title = styled(H3)`
	color: ${brandColors.deep[600]};
	font-weight: bold;
`;

const PublishTitle = styled(H4)`
	margin: 45px 0 24px 0;
	color: ${brandColors.deep[900]};
	font-weight: bold;
`;

const PublishList = styled(Caption)`
	color: ${neutralColors.gray[900]};
`;

const ErrorMessage = styled(P)`
	color: ${brandColors.pinky[500]};
	font-weight: bold;
`;

export default CreateIndex;
