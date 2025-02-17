import { useEffect, useState } from 'react';

import HomeIndex from '@/components/views/homepage/HomeIndex';
import { client } from '@/apollo/apolloClient';
import { FETCH_HOME_PROJECTS } from '@/apollo/gql/gqlProjects';
import { EDirection, ESortby } from '@/apollo/types/gqlEnums';
import { IProject } from '@/apollo/types/types';
import { useAppSelector } from '@/features/hooks';
import { homeMetatags } from '@/content/metatags';
import { GeneralMetatags } from '@/components/Metatag';
import { transformGraphQLErrorsToStatusCode } from '@/helpers/requests';
import { IS_BOOSTING_ENABLED } from '@/configuration';

const projectsToFetch = 12;

interface IHomeRoute {
	projects: IProject[];
	totalCount: number;
}

const fetchProjects = async (userId: string | undefined = undefined) => {
	const variables: any = {
		limit: projectsToFetch,
		orderBy: {
			field: IS_BOOSTING_ENABLED
				? ESortby.GIVPOWER
				: ESortby.QUALITYSCORE,
			direction: EDirection.DESC,
		},
	};

	if (userId) {
		variables.connectedWalletUserId = Number(userId);
	}
	const { data } = await client.query({
		query: FETCH_HOME_PROJECTS,
		variables,
		fetchPolicy: 'network-only',
	});

	return data.projects;
};

const HomeRoute = (props: IHomeRoute) => {
	const user = useAppSelector(state => state.user.userData);
	const [projects, setProjects] = useState(props.projects);
	const [totalCount, setTotalCount] = useState(props.totalCount);

	useEffect(() => {
		fetchProjects(user?.id).then(({ projects, totalCount }) => {
			setProjects(projects);
			setTotalCount(totalCount);
		});
	}, [user]);

	return (
		<>
			<GeneralMetatags info={homeMetatags} />
			<HomeIndex projects={projects} totalCount={totalCount} />
		</>
	);
};

export async function getServerSideProps({ res }: any) {
	res.setHeader(
		'Cache-Control',
		'public, s-maxage=10, stale-while-revalidate=59',
	);
	try {
		const { projects, totalCount } = await fetchProjects();
		return {
			props: {
				projects,
				totalCount,
			},
		};
	} catch (error: any) {
		const statusCode = transformGraphQLErrorsToStatusCode(
			error?.graphQLErrors,
		);
		return {
			props: {
				errorStatus: statusCode,
			},
		};
	}
}

export default HomeRoute;
