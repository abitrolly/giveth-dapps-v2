import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import {
	brandColors,
	IconExternalLink,
	IconHelp,
	IconSpark,
	Caption,
	IconAlertCricle,
	IconInfo24,
} from '@giveth/ui-design-system';
import { constants } from 'ethers';
import BigNumber from 'bignumber.js';
import { useWeb3React } from '@web3-react/core';
import { useRouter } from 'next/router';
import config from '../../configuration';
import {
	PoolStakingConfig,
	RegenPoolStakingConfig,
	SimplePoolStakingConfig,
	StakingPlatform,
	StakingType,
} from '@/types/config';
import { IconWithTooltip } from '../IconWithToolTip';
import { BN, formatEthHelper, formatWeiHelper } from '@/helpers/number';
import {
	AngelVaultTooltip,
	ClaimButton,
	Detail,
	DetailLabel,
	Details,
	DetailUnit,
	DetailValue,
	DisableModal,
	DisableModalCloseButton,
	DisableModalContent,
	DisableModalImage,
	DisableModalText,
	FirstDetail,
	GIVgardenTooltip,
	IconContainer,
	IconHelpWraper,
	IntroIcon,
	LiquidityButton,
	SPTitle,
	StakeAmount,
	StakeButton,
	StakeButtonsRow,
	StakeContainer,
	StakePoolInfoContainer,
	StakingPoolContainer,
	StakingPoolExchange,
	StakingPoolExchangeRow,
	StakingPoolLabel,
	StakingPoolSubtitle,
	WrongNetworkContainer,
} from './BaseStakingCard.sc';
import { APRModal } from '../modals/APR';
import { StakeModal } from '../modals/Stake';
import { UnStakeModal } from '../modals/UnStake';
import { StakingPoolImages } from '../StakingPoolImages';
import { V3StakeModal } from '../modals/V3Stake';
import { IconEthereum } from '../Icons/Eth';
import { IconGnosisChain } from '../Icons/GnosisChain';
import { IconGIV } from '../Icons/GIV';
import { IconHoneyswap } from '../Icons/Honeyswap';
import { IconBalancer } from '../Icons/Balancer';
import { IconUniswap } from '../Icons/Uniswap';
import { HarvestAllModal } from '../modals/HarvestAll';
import { useFarms } from '@/context/farm.context';
import { WhatisStreamModal } from '../modals/WhatisStream';
import { IconSushiswap } from '../Icons/Sushiswap';
import { UniV3APRModal } from '../modals/UNIv3APR';
import StakingCardIntro from './StakingCardIntro';
import { getNowUnixMS } from '@/helpers/time';
import FarmCountDown from '../FarmCountDown';
import { Flex, FlexCenter } from '../styled-components/Flex';
import { IStakeInfo } from '@/hooks/useStakingPool';
import { TokenDistroHelper } from '@/lib/contractHelper/TokenDistroHelper';
import { useAppSelector } from '@/features/hooks';
import Routes from '@/lib/constants/Routes';
import { chainName } from '@/lib/constants/constants';
import { SubgraphDataHelper } from '@/lib/subgraph/subgraphDataHelper';
import { IconAngelVault } from '../Icons/AngelVault';
import type { LiquidityPosition } from '@/types/nfts';

export enum StakeCardState {
	NORMAL,
	INTRO,
}

export const getPoolIconWithName = (
	platform: StakingPlatform,
	poolNetwork?: number,
) => {
	switch (poolNetwork) {
		case config.MAINNET_NETWORK_NUMBER:
			return <IconEthereum size={16} />;
		case config.XDAI_NETWORK_NUMBER:
			return <IconGnosisChain size={16} />;
	}
	// if no number is set then it defaults to platform icon
	switch (platform) {
		case StakingPlatform.BALANCER:
			return <IconBalancer size={16} />;
		case StakingPlatform.GIVETH:
			return <IconGIV size={16} />;
		case StakingPlatform.HONEYSWAP:
			return <IconHoneyswap size={16} />;
		case StakingPlatform.UNISWAP:
			return <IconUniswap size={16} />;
		case StakingPlatform.SUSHISWAP:
			return <IconSushiswap size={16} />;
		case StakingPlatform.ICHI:
			return <IconAngelVault size={16} />;
		default:
			break;
	}
};
interface IBaseStakingCardProps {
	poolStakingConfig: PoolStakingConfig | RegenPoolStakingConfig;
	stakeInfo: IStakeInfo;
	notif?: ReactNode;
	stakedPositions?: LiquidityPosition[];
	unstakedPositions?: LiquidityPosition[];
	currentIncentive?: {
		key?: (string | number)[] | null | undefined;
	};
}

const BaseStakingCard: FC<IBaseStakingCardProps> = ({
	stakeInfo,
	poolStakingConfig,
	notif,
	stakedPositions,
	unstakedPositions,
	currentIncentive,
}) => {
	const [state, setState] = useState(StakeCardState.NORMAL);
	const [started, setStarted] = useState(true);
	const [showAPRModal, setShowAPRModal] = useState(false);
	const [showUniV3APRModal, setShowUniV3APRModal] = useState(false);
	const [showStakeModal, setShowStakeModal] = useState(false);
	const [isFirstStakeShown, setIsFirstStakeShown] = useState(false);
	const [showUnStakeModal, setShowUnStakeModal] = useState(false);
	const [showHarvestModal, setShowHarvestModal] = useState(false);
	const [showWhatIsGIVstreamModal, setShowWhatIsGIVstreamModal] =
		useState(false);
	const [rewardLiquidPart, setRewardLiquidPart] = useState(constants.Zero);
	const [rewardStream, setRewardStream] = useState<BigNumber.Value>(0);
	const [tokenDistroHelper, setTokenDistroHelper] =
		useState<TokenDistroHelper>();
	const [disableModal, setDisableModal] = useState<boolean>(true);
	const router = useRouter();
	const { setInfo } = useFarms();
	const { chainId, account, active: isWalletActive } = useWeb3React();
	const { mainnetValues, xDaiValues } = useAppSelector(
		state => state.subgraph,
	);

	const { regenStreamType } = poolStakingConfig as RegenPoolStakingConfig;

	const {
		type,
		platform,
		platformTitle,
		title,
		icon,
		description,
		provideLiquidityLink,
		BUY_LINK,
		unit,
		farmStartTimeMS,
		active,
		archived,
		discontinued,
		introCard,
		network: poolNetwork,
	} = poolStakingConfig;

	const currentValues =
		poolNetwork === config.XDAI_NETWORK_NUMBER ? xDaiValues : mainnetValues;
	const sdh = new SubgraphDataHelper(currentValues);

	const {
		apr,
		earned,
		stakedAmount: stakedLpAmount,
		notStakedAmount: userNotStakedAmount,
	} = stakeInfo;

	const regenStreamConfig = useMemo(() => {
		if (!regenStreamType) return undefined;
		const networkConfig =
			chainId === config.XDAI_NETWORK_NUMBER
				? config.XDAI_CONFIG
				: config.MAINNET_CONFIG;
		return networkConfig.regenStreams.find(s => s.type === regenStreamType);
	}, [chainId, regenStreamType]);

	useEffect(() => {
		if (isFirstStakeShown || !router) return;
		const { open, chain } = router.query;
		const _open = Array.isArray(open) ? open[0] : open;
		const _chain = Array.isArray(chain) ? chain[0] : chain;
		const _chainId =
			_chain === 'gnosis'
				? config.XDAI_NETWORK_NUMBER
				: config.MAINNET_NETWORK_NUMBER;
		const checkNetworkAndShowStakeModal = async () => {
			if (_chainId === chainId && _open === type) {
				if (account) {
					setShowStakeModal(true);
					setIsFirstStakeShown(true);
					router.replace(Routes.GIVfarm, undefined, {
						shallow: true,
					});
				}
			}
		};
		checkNetworkAndShowStakeModal();
	}, [router, account, isWalletActive]);

	useEffect(() => {
		if (regenStreamType) {
			setTokenDistroHelper(
				new TokenDistroHelper(
					sdh.getTokenDistro(
						regenStreamConfig?.tokenDistroAddress as string,
					),
				),
			);
		} else {
			setTokenDistroHelper(
				new TokenDistroHelper(sdh.getGIVTokenDistro()),
			);
		}
	}, [currentValues, poolStakingConfig, regenStreamConfig]);

	useEffect(() => {
		if (tokenDistroHelper) {
			setRewardLiquidPart(tokenDistroHelper.getLiquidPart(earned));
			setRewardStream(
				tokenDistroHelper.getStreamPartTokenPerWeek(earned),
			);
		}
	}, [earned, tokenDistroHelper]);
	useEffect(() => {
		if (!regenStreamConfig) setInfo(poolNetwork, type, earned);
	}, [poolNetwork, earned, type, regenStreamConfig, setInfo]);

	const rewardTokenSymbol = regenStreamConfig?.rewardTokenSymbol || 'GIV';

	useEffect(() => {
		setStarted(farmStartTimeMS ? getNowUnixMS() > farmStartTimeMS : true);
	}, [farmStartTimeMS]);

	return (
		<>
			<StakingPoolContainer>
				{poolNetwork !== chainId && (
					<WrongNetworkContainer>
						<IconAlertCricle size={32} />
						<Caption>
							You are currently connected to{' '}
							{chainName(chainId || 0)} switch to{' '}
							{chainName(poolNetwork || 0)} to interact with this
							farm.
						</Caption>
					</WrongNetworkContainer>
				)}
				{(!active || archived || discontinued) && disableModal && (
					<DisableModal>
						<DisableModalContent>
							<DisableModalImage>
								<IconInfo24 />
							</DisableModalImage>
							<Flex
								flexDirection='column'
								justifyContent='space-evenly'
							>
								<DisableModalText weight={700}>
									{discontinued
										? 'Attention Farmers!'
										: 'This pool is no longer available'}
								</DisableModalText>
								<DisableModalText>
									{discontinued
										? 'This farm has ended, move your funds to another farm to keep earning rewards.'
										: 'Please unstake your tokens and check out other available pools.'}
								</DisableModalText>
								<DisableModalCloseButton
									label='GOT IT'
									onClick={() => setDisableModal(false)}
								/>
							</Flex>
						</DisableModalContent>
					</DisableModal>
				)}
				{state === StakeCardState.NORMAL ? (
					<>
						<StakingPoolExchangeRow gap='4px' alignItems='center'>
							{getPoolIconWithName(platform, poolNetwork)}
							<StakingPoolExchange styleType='Small'>
								{type === StakingType.GIV_LM &&
									poolNetwork ===
										config.XDAI_NETWORK_NUMBER &&
									`GIVgarden `}
								{platformTitle || platform}
							</StakingPoolExchange>
							{poolNetwork === config.XDAI_NETWORK_NUMBER &&
								type === StakingType.GIV_LM && (
									<IconWithTooltip
										direction={'top'}
										icon={
											<IconHelp
												color={brandColors.deep[100]}
												size={12}
											/>
										}
									>
										<GIVgardenTooltip>
											While staking GIV in this pool you
											are also granted voting power (gGIV)
											in the GIVgarden.
										</GIVgardenTooltip>
									</IconWithTooltip>
								)}
							<div style={{ flex: 1 }}></div>
							{notif && notif}
							{introCard && (
								<IntroIcon
									onClick={() =>
										setState(StakeCardState.INTRO)
									}
								>
									<IconHelp size={16} />
								</IntroIcon>
							)}
						</StakingPoolExchangeRow>
						<SPTitle alignItems='center' gap='16px'>
							<StakingPoolImages title={title} icon={icon} />
							<div>
								<StakingPoolLabel weight={900}>
									{title}
								</StakingPoolLabel>
								<StakingPoolSubtitle>
									{description}
								</StakingPoolSubtitle>
							</div>
						</SPTitle>
						<StakePoolInfoContainer>
							{started ? (
								<Details>
									<FirstDetail justifyContent='space-between'>
										<FlexCenter gap='8px'>
											<DetailLabel>APR</DetailLabel>
											{type ===
												StakingType.ICHI_GIV_ONEGIV && (
												<IconWithTooltip
													direction='right'
													icon={
														<IconHelp size={16} />
													}
												>
													<AngelVaultTooltip>
														Your cumulative APR
														including both rewards
														earned as fees & added
														automatically to your
														position (
														{apr?.vaultIRR &&
															formatEthHelper(
																apr.vaultIRR,
																2,
															)}
														% IRR), and rewards
														earned in GIV from
														staking your LP (
														{apr &&
															formatEthHelper(
																apr.effectiveAPR,
																2,
															)}
														% APR).
													</AngelVaultTooltip>
												</IconWithTooltip>
											)}
										</FlexCenter>
										<Flex gap='8px' alignItems='center'>
											{active && !archived ? (
												<>
													<IconSpark
														size={24}
														color={
															brandColors
																.mustard[500]
														}
													/>

													<>
														<DetailValue>
															{apr &&
																formatEthHelper(
																	apr.effectiveAPR,
																	2,
																)}
															%
														</DetailValue>
														<IconContainer
															onClick={() =>
																setShowAPRModal(
																	true,
																)
															}
														>
															<IconHelp
																size={16}
															/>
														</IconContainer>
													</>
												</>
											) : (
												<div>N/A %</div>
											)}
										</Flex>
									</FirstDetail>
									<Detail justifyContent='space-between'>
										<DetailLabel>Claimable</DetailLabel>
										<DetailValue>
											{active ? (
												`${formatWeiHelper(
													rewardLiquidPart,
												)} ${rewardTokenSymbol}`
											) : (
												<div>N/A</div>
											)}
										</DetailValue>
									</Detail>
									<Detail justifyContent='space-between'>
										<Flex gap='8px' alignItems='center'>
											<DetailLabel>Streaming</DetailLabel>
											<IconHelpWraper
												onClick={() => {
													setShowWhatIsGIVstreamModal(
														true,
													);
												}}
											>
												<IconHelp size={16} />
											</IconHelpWraper>
										</Flex>
										<Flex gap='4px' alignItems='center'>
											<DetailValue>
												{active ? (
													formatWeiHelper(
														rewardStream,
													)
												) : (
													<div>N/A</div>
												)}
											</DetailValue>
											<DetailUnit>
												{rewardTokenSymbol}/week
											</DetailUnit>
										</Flex>
									</Detail>
								</Details>
							) : (
								<FarmCountDown
									startTime={farmStartTimeMS || 0}
									setStarted={setStarted}
								/>
							)}
							<ClaimButton
								disabled={!active || earned.isZero()}
								onClick={() => setShowHarvestModal(true)}
								label='HARVEST REWARDS'
								buttonType='primary'
							/>
							<StakeButtonsRow>
								<StakeContainer flexDirection='column'>
									<StakeButton
										label='STAKE'
										size='small'
										disabled={
											!active ||
											archived ||
											BN(userNotStakedAmount).isZero()
										}
										onClick={() => setShowStakeModal(true)}
									/>
									<StakeAmount>
										{type === StakingType.UNISWAPV3_ETH_GIV
											? `${userNotStakedAmount.toNumber()} ${unit}`
											: `${formatWeiHelper(
													userNotStakedAmount,
											  )} ${unit}`}
									</StakeAmount>
								</StakeContainer>
								<StakeContainer flexDirection='column'>
									<StakeButton
										label='UNSTAKE'
										size='small'
										disabled={stakedLpAmount.isZero()}
										onClick={() =>
											setShowUnStakeModal(true)
										}
									/>
									<StakeAmount>
										{type === StakingType.UNISWAPV3_ETH_GIV
											? `${stakedLpAmount.toNumber()} ${unit}`
											: `${formatWeiHelper(
													stakedLpAmount,
											  )} ${unit}`}
									</StakeAmount>
								</StakeContainer>
							</StakeButtonsRow>
							{active && (
								<LiquidityButton
									label={
										type === StakingType.GIV_LM
											? 'BUY GIV TOKENS'
											: 'PROVIDE LIQUIDITY'
									}
									onClick={() => {
										if (
											type ===
											StakingType.UNISWAPV3_ETH_GIV
										) {
											setShowUniV3APRModal(true);
										} else {
											window.open(
												type === StakingType.GIV_LM
													? BUY_LINK
													: provideLiquidityLink,
											);
										}
									}}
									buttonType='texty'
									icon={
										<IconExternalLink
											size={16}
											color={brandColors.deep[100]}
										/>
									}
								/>
							)}
						</StakePoolInfoContainer>
					</>
				) : (
					<StakingCardIntro
						poolStakingConfig={
							poolStakingConfig as SimplePoolStakingConfig
						}
						setState={setState}
					/>
				)}
			</StakingPoolContainer>
			{showAPRModal && (
				<APRModal
					setShowModal={setShowAPRModal}
					tokenDistroHelper={tokenDistroHelper}
					regenStreamConfig={regenStreamConfig}
				/>
			)}
			{showUniV3APRModal && (
				<UniV3APRModal
					setShowModal={setShowUniV3APRModal}
					poolStakingConfig={poolStakingConfig}
				/>
			)}
			{showStakeModal &&
				(type === StakingType.UNISWAPV3_ETH_GIV ? (
					<V3StakeModal
						setShowModal={setShowStakeModal}
						poolStakingConfig={poolStakingConfig}
						stakedPositions={stakedPositions || []}
						unstakedPositions={unstakedPositions || []}
						currentIncentive={
							currentIncentive || {
								key: undefined,
							}
						}
					/>
				) : (
					<StakeModal
						setShowModal={setShowStakeModal}
						poolStakingConfig={
							poolStakingConfig as SimplePoolStakingConfig
						}
						regenStreamConfig={regenStreamConfig}
						maxAmount={userNotStakedAmount}
					/>
				))}
			{showUnStakeModal &&
				(type === StakingType.UNISWAPV3_ETH_GIV ? (
					<V3StakeModal
						isUnstakingModal={true}
						setShowModal={setShowUnStakeModal}
						poolStakingConfig={poolStakingConfig}
						stakedPositions={stakedPositions || []}
						unstakedPositions={unstakedPositions || []}
						currentIncentive={
							currentIncentive || {
								key: undefined,
							}
						}
					/>
				) : (
					<UnStakeModal
						setShowModal={setShowUnStakeModal}
						poolStakingConfig={
							poolStakingConfig as SimplePoolStakingConfig
						}
						regenStreamConfig={regenStreamConfig}
						maxAmount={stakedLpAmount}
					/>
				))}
			{showHarvestModal && chainId && (
				<HarvestAllModal
					title='GIVfarm Rewards'
					setShowModal={setShowHarvestModal}
					poolStakingConfig={poolStakingConfig}
					earned={earned}
					network={chainId}
					tokenDistroHelper={tokenDistroHelper}
					regenStreamConfig={regenStreamConfig}
					stakedPositions={stakedPositions}
					currentIncentive={currentIncentive}
				/>
			)}
			{showWhatIsGIVstreamModal && (
				<WhatisStreamModal
					setShowModal={setShowWhatIsGIVstreamModal}
					tokenDistroHelper={tokenDistroHelper}
					regenStreamConfig={regenStreamConfig}
				/>
			)}
		</>
	);
};

export default BaseStakingCard;
