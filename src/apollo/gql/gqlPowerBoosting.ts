import { gql } from '@apollo/client';

export const SAVE_POWER_BOOSTING = gql`
	mutation setSinglePowerBoostingMutation(
		$projectId: Int!
		$percentage: Float!
	) {
		setSinglePowerBoosting(projectId: $projectId, percentage: $percentage) {
			id
			user {
				id
			}
			project {
				id
			}
			percentage
		}
	}
`;

export const SAVE_MULTIPLE_POWER_BOOSTING = gql`
	mutation setMultiplePowerBoostingMutation(
		$projectIds: [Int!]!
		$percentages: [Float!]!
	) {
		setMultiplePowerBoosting(
			projectIds: $projectIds
			percentages: $percentages
		) {
			id
			user {
				id
			}
			project {
				id
				title
			}
			percentage
		}
	}
`;

export const FETCH_POWER_BOOSTING_INFO = gql`
	query getPowerBoostingsQuery(
		$take: Int
		$skip: Int
		$orderBy: PowerBoostingOrderBy
		$projectId: Int
		$userId: Int
	) {
		getPowerBoosting(
			take: $take
			skip: $skip
			orderBy: $orderBy
			projectId: $projectId
			userId: $userId
		) {
			powerBoostings {
				id
				user {
					id
					email
				}
				project {
					id
					title
				}
				percentage
			}
		}
	}
`;
