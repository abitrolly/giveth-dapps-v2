import {
	B,
	brandColors,
	Button,
	H5,
	IconLock16,
	IconTrash,
	IconUnlock16,
	IconUnLockable16,
	neutralColors,
	OutlineButton,
	semanticColors,
} from '@giveth/ui-design-system';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import BigNumber from 'bignumber.js';
import Link from 'next/link';

import {
	RowWrapper,
	TableCell,
	TableFooter,
	TableHeader,
} from '@/components/styled-components/Table';
import { EPowerBoostingOrder, IBoostedOrder } from './ProfileBoostedTab';
import { formatWeiHelper } from '@/helpers/number';
import { Flex } from '@/components/styled-components/Flex';
import Input, { InputSize } from '@/components/Input';
import SortIcon from '@/components/SortIcon';
import { IPowerBoosting } from '@/apollo/types/types';
import { InputSuffix } from '@/components/styled-components/Input';
import { DeletePowerBoostModal } from '@/components/modals/Boost/DeletePowerBoostModal';
import { slugToProjectView } from '@/lib/routeCreators';
import { ApprovePowerBoostModal } from '@/components/modals/Boost/ApprovePowerBoostModal';

interface IBoostsTable {
	boosts: IPowerBoosting[];
	totalAmountOfGIVpower: string;
	order: IBoostedOrder;
	changeOrder: (orderBy: EPowerBoostingOrder) => void;
	saveBoosts: (newBoosts: IPowerBoosting[]) => Promise<boolean>;
	deleteBoost: (id: string) => Promise<boolean>;
}

interface IEnhancedPowerBoosting extends IPowerBoosting {
	displayValue?: string;
	isLocked?: boolean;
	isLockable?: boolean;
	hasError?: boolean;
}

enum ETableNode {
	VIEWING,
	EDITING,
}

const BoostsTable: FC<IBoostsTable> = ({
	boosts,
	totalAmountOfGIVpower,
	order,
	changeOrder,
	saveBoosts,
	deleteBoost,
}) => {
	const [mode, setMode] = useState(ETableNode.VIEWING);
	const [editBoosts, setEditBoosts] = useState<IEnhancedPowerBoosting[]>([]);
	const [sum, setSum] = useState(100);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showApproveModal, setShowApproveModal] = useState(false);
	const [selectedBoost, setSelectedBoost] = useState('');

	const _totalAmountOfGIVpower = new BigNumber(totalAmountOfGIVpower);

	useEffect(() => {
		if (mode === ETableNode.VIEWING) setEditBoosts(structuredClone(boosts));
	}, [boosts]);

	useEffect(() => {
		if (editBoosts.length < 3) {
			for (let i = 0; i < editBoosts.length; i++) {
				const editboost = editBoosts[i];
				editboost.isLockable = false;
			}
		}
	}, [editBoosts]);

	const toggleLockPower = (id: string) => {
		const tempBoosts = [...editBoosts];
		let changedBoost: IEnhancedPowerBoosting | undefined = undefined;
		let locksCount = 0;
		const otherNonLockedBoosts: IEnhancedPowerBoosting[] = [];

		//generate info
		for (let i = 0; i < tempBoosts.length; i++) {
			const boost = tempBoosts[i];
			if (boost.id === id) {
				changedBoost = boost;
				if (changedBoost.isLockable === false) return;
				changedBoost.isLocked = !changedBoost.isLocked;
			}
			if (boost.isLocked) {
				locksCount++;
			} else {
				otherNonLockedBoosts.push(boost);
			}
		}

		let isLockable = true;
		if (locksCount === tempBoosts.length - 2) isLockable = false;

		for (let i = 0; i < otherNonLockedBoosts.length; i++) {
			const boost = otherNonLockedBoosts[i];
			boost.isLockable = isLockable;
		}
		setEditBoosts(tempBoosts);
	};

	const onPercentageChange = (
		id: string,
		e: ChangeEvent<HTMLInputElement>,
		isOnBlur?: boolean,
	) => {
		if (isOnBlur && e.target.value == '') {
			e.target.value = '0.1';
		}
		const newPercentage = +e.target.value;
		if (isNaN(newPercentage) || newPercentage < 0 || newPercentage > 100)
			return;
		const tempBoosts = [...editBoosts];
		let changedBoost: IEnhancedPowerBoosting | undefined = undefined;
		const otherNonLockedBoosts: IEnhancedPowerBoosting[] = [];
		let sumOfUnlocks = 0;
		let sumOfLocks = 0;

		//generate info
		for (let i = 0; i < tempBoosts.length; i++) {
			const boost = tempBoosts[i];
			boost.hasError = false;
			boost.displayValue = undefined;
			if (boost.id === id) {
				changedBoost = boost;
				// to handle float numbers
				changedBoost.percentage = newPercentage;
				changedBoost.displayValue = e.target.value;
				sumOfUnlocks += newPercentage;
			} else if (!boost.isLocked) {
				otherNonLockedBoosts.push(boost);
				sumOfUnlocks += Number(boost.percentage);
			} else {
				sumOfLocks += Number(boost.percentage);
			}
		}
		if (!changedBoost) return;
		const _tempSum = sumOfLocks + sumOfUnlocks;
		const free = 100 - sumOfLocks;

		// exceed 100%
		if (newPercentage >= free) {
			changedBoost.hasError = true;
			setSum(_tempSum);
			setEditBoosts(tempBoosts);
			return;
		}

		const diff = 100 - _tempSum;
		for (let i = 0; i < otherNonLockedBoosts.length; i++) {
			const boost = otherNonLockedBoosts[i];
			const value = sumOfUnlocks - newPercentage;
			let rate;
			if (value !== 0) {
				rate = boost.percentage / value;
			} else {
				rate = 0.1;
			}
			boost.percentage += rate * diff;
			boost.percentage = +boost.percentage.toFixed(2);
		}
		setSum(100); //Should show real number
		setEditBoosts(tempBoosts);
	};

	const onSaveBoosts = async () => {
		const isSaved = await saveBoosts(editBoosts);
		if (isSaved) {
			setMode(ETableNode.VIEWING);
			return true;
		}
		return false;
	};
	const isExceed = Math.round(sum) !== 100;

	return (
		<>
			<Header justifyContent='space-between' wrap={1} gap='16px'>
				<H5 weight={700}>GIVpower Summary</H5>
				<Actions gap='8px'>
					{mode === ETableNode.VIEWING ? (
						<Button
							buttonType='primary'
							label='edit boosting'
							size='small'
							onClick={() => setMode(ETableNode.EDITING)}
						/>
					) : (
						<>
							<OutlineButton
								buttonType='primary'
								label='reset all'
								size='small'
								onClick={() =>
									setEditBoosts(structuredClone(boosts))
								}
							/>
							<Button
								buttonType='primary'
								label='Apply changes'
								size='small'
								disabled={isExceed}
								onClick={() => {
									setShowApproveModal(true);
								}}
							/>
							<OutlineButton
								buttonType='primary'
								label='cancel'
								size='small'
								onClick={() => {
									setEditBoosts(structuredClone(boosts));
									setMode(ETableNode.VIEWING);
								}}
							/>
						</>
					)}
				</Actions>
			</Header>
			<Table>
				<TableHeader>Projects</TableHeader>
				<TableHeader
					onClick={() => {
						if (mode === ETableNode.VIEWING)
							changeOrder(EPowerBoostingOrder.Percentage);
					}}
				>
					GIVpower Amount
					<SortIcon
						order={order}
						title={EPowerBoostingOrder.Percentage}
					/>
				</TableHeader>
				<TableHeader>% of Total</TableHeader>
				<TableHeader></TableHeader>
				{editBoosts?.map(boost => {
					return (
						<BoostsRowWrapper key={boost.project.id}>
							<BoostsTableCell bold>
								<Link
									href={slugToProjectView(boost.project.slug)}
								>
									{boost.project.title}
								</Link>
							</BoostsTableCell>
							<BoostsTableCell>
								{formatWeiHelper(
									_totalAmountOfGIVpower
										.multipliedBy(boost.percentage || 0)
										.dividedBy(100),
								)}
							</BoostsTableCell>
							<BoostsTableCell bold>
								{mode === ETableNode.VIEWING ? (
									`${boost.percentage}%`
								) : (
									<StyledInput
										value={
											boost.displayValue !== undefined
												? boost.displayValue
												: boost.percentage
										}
										onChange={e => {
											onPercentageChange(
												boost.id,
												e,
												false,
											);
										}}
										onBlur={e =>
											onPercentageChange(
												boost.id,
												e,
												true,
											)
										}
										size={InputSize.SMALL}
										disabled={boost.isLocked}
										LeftIcon={
											<IconWrapper
												onClick={() =>
													toggleLockPower(boost.id)
												}
											>
												{boost.isLocked ? (
													<IconLock16
														color={
															neutralColors
																.gray[900]
														}
													/>
												) : boost.isLockable ===
														undefined ||
												  boost.isLockable === true ? (
													<IconUnlock16
														size={16}
														color={
															neutralColors
																.gray[600]
														}
													/>
												) : (
													<IconUnLockable16
														size={16}
														color={
															neutralColors
																.gray[400]
														}
													/>
												)}
											</IconWrapper>
										}
										suffix={
											<Percentage
												inputSize={InputSize.SMALL}
											>
												%
											</Percentage>
										}
										error={boost.hasError ? {} : undefined}
									/>
								)}
							</BoostsTableCell>
							<BoostsTableCell>
								{mode === ETableNode.VIEWING && (
									<>
										<IconWrapper
											onClick={() => {
												setSelectedBoost(boost.id);
												setShowDeleteModal(true);
											}}
										>
											<IconTrash size={24} />
										</IconWrapper>
									</>
								)}
							</BoostsTableCell>
						</BoostsRowWrapper>
					);
				})}
				<TableFooter>Total GIVpower</TableFooter>
				<TableFooter></TableFooter>
				<CustomTableFooter isExceed={isExceed}>
					{sum}%
					{isExceed && (
						<ExceedError>You can’t exceed 100%</ExceedError>
					)}
				</CustomTableFooter>
				<TableFooter></TableFooter>
			</Table>
			{showDeleteModal && (
				<DeletePowerBoostModal
					boostId={selectedBoost}
					canDelete={boosts.length > 1}
					deleteBoost={deleteBoost}
					setShowModal={setShowDeleteModal}
				/>
			)}
			{showApproveModal && (
				<ApprovePowerBoostModal
					setShowModal={setShowApproveModal}
					onSaveBoosts={onSaveBoosts}
				/>
			)}
		</>
	);
};

const Header = styled(Flex)`
	margin: 68px 0 48px;
`;

const Actions = styled(Flex)`
	overflow: auto;
	padding-bottom: 16px;
`;

const Table = styled.div`
	display: grid;
	grid-template-columns: 4fr 1.2fr 1fr 0.3fr;
	min-width: 700px;
`;

const BoostsTableCell = styled(TableCell)<{ bold?: boolean }>`
	width: 100%;
	min-height: 60px;
	border-bottom: 1px solid ${neutralColors.gray[300]};
	font-weight: ${props => (props.bold ? 500 : 400)};
	line-height: unset;
`;

const BoostsRowWrapper = styled(RowWrapper)`
	&:hover > div {
		background-color: ${neutralColors.gray[300]};
		color: ${brandColors.pinky[500]};
	}
	overflow-y: hidden;
`;

const StyledInput = styled(Input)`
	margin-top: 10px;
	width: 100px;
	overflow-x: hidden;
	flex: none;
`;

const IconWrapper = styled.div`
	cursor: pointer;
`;

interface ICustomTableFooter {
	isExceed: boolean;
}

const CustomTableFooter = styled(TableFooter)<ICustomTableFooter>`
	/* grid-column-start: 3; */
	/* grid-column-end: 5; */
	${props =>
		props.isExceed
			? css`
					color: ${semanticColors.punch[500]};
			  `
			: ''}
`;

const ExceedError = styled(B)`
	color: ${semanticColors.punch[700]};
	background-color: ${semanticColors.punch[100]};
	border-radius: 8px;
	padding: 2px 8px;
	margin-left: 8px;
`;

const Percentage = styled(InputSuffix)`
	color: ${neutralColors.gray[800]};
	user-select: none;
`;

export default BoostsTable;
