import { H5, mediaQueries } from '@giveth/ui-design-system';
import styled from 'styled-components';
import { FC, useCallback, useEffect, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import {
	ContributeCard,
	ContributeCardTitles,
	UserProfileTab,
} from '../common.sc';
import { IUserProfileView } from '../UserProfile.view';
import { formatWeiHelper } from '@/helpers/number';
import { EDirection } from '@/apollo/types/gqlEnums';
import BoostsTable from './BoostsTable';
import { IPowerBoosting } from '@/apollo/types/types';
import { client } from '@/apollo/apolloClient';
import {
	FETCH_POWER_BOOSTING_INFO,
	SAVE_MULTIPLE_POWER_BOOSTING,
	SAVE_POWER_BOOSTING,
} from '@/apollo/gql/gqlPowerBoosting';
import { Loading } from '../projectsTab/ProfileProjectsTab';
import { EmptyPowerBoosting } from './EmptyPowerBoosting';
import GetMoreGIVpowerBanner from './GetMoreGIVpowerBanner';
import { useAppSelector } from '@/features/hooks';
import { SubgraphDataHelper } from '@/lib/subgraph/subgraphDataHelper';

export enum EPowerBoostingOrder {
	CreationAt = 'createdAt',
	UpdatedAt = 'updatedAt',
	Percentage = 'Percentage',
}

export interface IBoostedOrder {
	by: EPowerBoostingOrder;
	direction: EDirection;
}

export const ProfileBoostedTab: FC<IUserProfileView> = ({ user }) => {
	const [loading, setLoading] = useState(false);
	const [boosts, setBoosts] = useState<IPowerBoosting[]>([]);
	const [order, setOrder] = useState<IBoostedOrder>({
		by: EPowerBoostingOrder.Percentage,
		direction: EDirection.DESC,
	});

	const sdh = new SubgraphDataHelper(
		useAppSelector(state => state.subgraph.xDaiValues),
	);
	const givPower = sdh.getUserGIVPowerBalance();

	useEffect(() => {
		if (!user) return;

		const fetchUserBoosts = async () => {
			setLoading(true);
			const { data } = await client.query({
				query: FETCH_POWER_BOOSTING_INFO,
				variables: {
					take: 50,
					skip: 0,
					orderBy: { field: order.by, direction: order.direction },
					userId: parseFloat(user.id || '') || -1,
				},
			});
			setLoading(false);
			if (data?.getPowerBoosting) {
				const powerBoostings: IPowerBoosting[] =
					data.getPowerBoosting.powerBoostings;
				setBoosts(powerBoostings);
			}
		};
		fetchUserBoosts();
	}, [user, order.by, order.direction]);

	const changeOrder = useCallback(
		(orderBy: EPowerBoostingOrder) => {
			if (orderBy === order.by) {
				setOrder({
					by: orderBy,
					direction:
						order.direction === EDirection.ASC
							? EDirection.DESC
							: EDirection.ASC,
				});
			} else {
				setOrder({
					by: orderBy,
					direction: EDirection.DESC,
				});
			}
		},
		[order.by, order.direction],
	);

	const saveBoosts = useCallback(async (newBoosts: IPowerBoosting[]) => {
		setLoading(true);
		const percentages = newBoosts.map(boost => Number(boost.percentage));
		const projectIds = newBoosts.map(boost => Number(boost.project.id));
		try {
			const res = await client.mutate({
				mutation: SAVE_MULTIPLE_POWER_BOOSTING,
				variables: {
					percentages,
					projectIds,
				},
			});
			if (res.data) {
				const setMultiplePowerBoosting: IPowerBoosting[] =
					res.data.setMultiplePowerBoosting;
				setBoosts(setMultiplePowerBoosting);
				setLoading(false);
				return true;
			}
			setLoading(false);
			return false;
		} catch (error) {
			console.log({ error });
			captureException(error, {
				tags: {
					section: 'Save manage power boosting',
				},
			});
			setLoading(false);
			return false;
		}
	}, []);

	const deleteBoost = useCallback(
		async (id: string) => {
			setLoading(true);
			const tempBoosts = [...boosts];
			let deletedBoost = tempBoosts.find(boost => boost.id === id);

			try {
				const res = await client.mutate({
					mutation: SAVE_POWER_BOOSTING,
					variables: {
						percentage: 0,
						projectId: Number(deletedBoost?.project.id),
					},
				});
				if (res.data) {
					const newBoosts: IPowerBoosting[] =
						res.data.setSinglePowerBoosting;
					setBoosts(newBoosts);
					setLoading(false);
					return true;
				}
				setLoading(false);
				return false;
			} catch (error) {
				console.log({ error });
				captureException(error, {
					tags: {
						section: 'Save manage power boosting',
					},
				});
				setLoading(false);
				return false;
			}
		},
		[boosts],
	);

	return (
		<UserProfileTab>
			<CustomContributeCard>
				<ContributeCardTitles>
					Total Amount of GIVpower
				</ContributeCardTitles>
				<ContributeCardTitles>Projects Boosted</ContributeCardTitles>
				<H5>~{formatWeiHelper(givPower.balance)}</H5>
				<H5>{boosts.length}</H5>
			</CustomContributeCard>
			<PowerBoostingContainer>
				{loading && <Loading />}
				{boosts.length > 0 ? (
					<BoostsTable
						boosts={boosts}
						totalAmountOfGIVpower={givPower.balance}
						order={order}
						changeOrder={changeOrder}
						saveBoosts={saveBoosts}
						deleteBoost={deleteBoost}
					/>
				) : (
					<EmptyPowerBoosting />
				)}
			</PowerBoostingContainer>
			<GetMoreGIVpowerBanner />
		</UserProfileTab>
	);
};

const CustomContributeCard = styled(ContributeCard)`
	width: 100%;
	${mediaQueries.tablet} {
		width: 614px;
	}
`;

export const PowerBoostingContainer = styled.div`
	position: relative;
	margin-bottom: 40px;
	overflow-x: auto;
`;
