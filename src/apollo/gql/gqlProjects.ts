import { gql } from '@apollo/client';

export const FETCH_HOME_PROJECTS = gql`
	query FetchAllProjects(
		$limit: Int
		$orderBy: OrderBy
		$connectedWalletUserId: Int
	) {
		projects(
			take: $limit
			orderBy: $orderBy
			connectedWalletUserId: $connectedWalletUserId
		) {
			projects {
				id
				title
				image
				slug
				description
				verified
				totalDonations
				traceCampaignId
				reaction {
					id
					userId
				}
				totalReactions
				adminUser {
					name
					walletAddress
				}
			}
			totalCount
		}
	}
`;

export const FETCH_ALL_PROJECTS = gql`
	query FetchAllProjects(
		$limit: Int
		$skip: Int
		$orderBy: OrderBy
		$filterBy: FilterBy
		$searchTerm: String
		$category: String
		$connectedWalletUserId: Int
	) {
		projects(
			take: $limit
			skip: $skip
			orderBy: $orderBy
			filterBy: $filterBy
			searchTerm: $searchTerm
			category: $category
			connectedWalletUserId: $connectedWalletUserId
		) {
			projects {
				id
				title
				image
				slug
				description
				verified
				totalDonations
				traceCampaignId
				reaction {
					id
					userId
				}
				totalReactions
				adminUser {
					name
					walletAddress
				}
			}
			totalCount
			categories {
				name
			}
		}
	}
`;

export const FETCH_PROJECT_BY_SLUG = gql`
	query ProjectBySlug($slug: String!, $connectedWalletUserId: Int) {
		projectBySlug(
			slug: $slug
			connectedWalletUserId: $connectedWalletUserId
		) {
			id
			title
			image
			slug
			description
			verified
			traceCampaignId
			walletAddress
			totalProjectUpdates
			totalDonations
			creationDate
			givingBlocksId
			reaction {
				id
				userId
			}
			totalReactions
			traceCampaignId
			categories {
				name
			}
			adminUser {
				name
				walletAddress
			}
			status {
				id
				name
			}
		}
	}
`;

export const FETCH_PROJECT_BY_ID = gql`
	query ProjectById($id: Float!) {
		projectById(id: $id) {
			id
			title
			image
			description
			walletAddress
			impactLocation
			categories {
				name
			}
			adminUser {
				walletAddress
			}
			status {
				name
			}
		}
	}
`;

export const FETCH_PROJECT_REACTION_BY_ID = gql`
	query ProjectById($id: Float!, $connectedWalletUserId: Int) {
		projectById(id: $id, connectedWalletUserId: $connectedWalletUserId) {
			id
			reaction {
				id
				userId
			}
			totalReactions
		}
	}
`;

export const FETCH_PROJECT_UPDATES = gql`
	query GetProjectUpdates(
		$projectId: Int!
		$take: Int!
		$skip: Int!
		$connectedWalletUserId: Int
	) {
		getProjectUpdates(
			projectId: $projectId
			take: $take
			skip: $skip
			connectedWalletUserId: $connectedWalletUserId
		) {
			id
			title
			projectId
			createdAt
			userId
			content
			isMain
			totalReactions
			reaction {
				projectUpdateId
				userId
			}
		}
	}
`;

export const FETCH_USER_LIKED_PROJECTS = gql`
	query FetchUesrLikedProjects($take: Int, $skip: Int, $userId: Int!) {
		likedProjectsByUserId(take: $take, skip: $skip, userId: $userId) {
			projects {
				id
				title
				balance
				description
				image
				slug
				creationDate
				admin
				walletAddress
				impactLocation
				listed
				givingBlocksId
				totalDonations
				categories {
					name
				}
				qualityScore
			}
			totalCount
		}
	}
`;
export const UPLOAD_IMAGE = gql`
	mutation ($imageUpload: ImageUpload!) {
		uploadImage(imageUpload: $imageUpload) {
			url
			projectId
			projectImageId
		}
	}
`;

export const WALLET_ADDRESS_IS_VALID = gql`
	query WalletAddressIsValid($address: String!) {
		walletAddressIsValid(address: $address)
	}
`;

export const ADD_PROJECT = gql`
	mutation ($project: ProjectInput!) {
		addProject(project: $project) {
			id
			title
			description
			admin
			image
			impactLocation
			slug
			walletAddress
			categories {
				name
			}
		}
	}
`;

export const LIKE_PROJECT_MUTATION = gql`
	mutation ($projectId: Int!) {
		likeProject(projectId: $projectId) {
			id
			projectId
			reaction
			userId
		}
	}
`;

export const UNLIKE_PROJECT_MUTATION = gql`
	mutation ($reactionId: Int!) {
		unlikeProject(reactionId: $reactionId)
	}
`;

export const LIKE_PROJECT_UPDATE_MUTATION = gql`
	mutation ($projectUpdateId: Int!) {
		likeProjectUpdate(projectUpdateId: $projectUpdateId) {
			id
			projectUpdateId
			reaction
		}
	}
`;

export const UNLIKE_PROJECT_UPDATE_MUTATION = gql`
	mutation ($reactionId: Int!) {
		unlikeProjectUpdate(reactionId: $reactionId)
	}
`;

export const GET_STATUS_REASONS = gql`
	query {
		getStatusReasons(statusId: 6) {
			id
			description
			status {
				id
				name
			}
		}
	}
`;

export const DEACTIVATE_PROJECT = gql`
	mutation ($projectId: Float!, $reasonId: Float) {
		deactivateProject(projectId: $projectId, reasonId: $reasonId)
	}
`;

export const ACTIVATE_PROJECT = gql`
	mutation ($projectId: Float!) {
		activateProject(projectId: $projectId)
	}
`;

export const TITLE_IS_VALID = gql`
	query IsValidTitleForProject($title: String!, $projectId: Float) {
		isValidTitleForProject(title: $title, projectId: $projectId)
	}
`;

export const EDIT_PROJECT = gql`
	mutation editProject($projectId: Float!, $newProjectData: ProjectInput!) {
		editProject(projectId: $projectId, newProjectData: $newProjectData) {
			id
			title
			description
			image
			slug
			creationDate
			admin
			walletAddress
			impactLocation
			categories {
				name
			}
		}
	}
`;
