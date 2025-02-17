import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { brandColors, neutralColors, P } from '@giveth/ui-design-system';
import Link from 'next/link';

import { useIntl } from 'react-intl';
import { Flex } from '@/components/styled-components/Flex';
import ProfileDonationsTab from './donationsTab/ProfileDonationsTab';
import ProfileLikedTab from './ProfileLikedTab';
import ProfileProjectsTab from './projectsTab/ProfileProjectsTab';
import ProfileOverviewTab from './ProfileOverviewTab';
import { IUserProfileView } from './UserProfile.view';
import { Container } from '@/components/Grid';
import ContributeCard from '@/components/views/userProfile/ProfileContributeCard';
import { ProfileBoostedTab } from './boostedTab/ProfileBoostedTab';
import Routes, { profileTabs } from '@/lib/constants/Routes';
import { IS_BOOSTING_ENABLED } from '@/configuration';
import { isSSRMode } from '@/lib/helpers';

enum EProfile {
	OVERVIEW,
	BOOSTED,
	PROJECTS,
	DONATIONS,
	LIKED,
}

interface ITab {
	active: boolean;
}

const ProfileContributes: FC<IUserProfileView> = ({ user, myAccount }) => {
	const router = useRouter();
	const { formatMessage } = useIntl();
	const [tab, setTab] = useState(
		myAccount ? EProfile.OVERVIEW : EProfile.PROJECTS,
	);

	useEffect(() => {
		const tab = router?.query?.tab;
		switch (tab) {
			case 'projects':
				setTab(EProfile.PROJECTS);
				break;
			case 'boosted':
				setTab(EProfile.BOOSTED);
				break;
			case 'donations':
				setTab(EProfile.DONATIONS);
				break;
			case 'liked':
				setTab(EProfile.LIKED);
				break;
			default:
				setTab(myAccount ? EProfile.OVERVIEW : EProfile.PROJECTS);
		}
	}, [router?.query?.tab]);

	const userName = user?.name || 'Unknown';
	const { pathname = '' } = isSSRMode ? {} : window.location;

	return (
		<ProfileContainer>
			{!myAccount && tab === EProfile.PROJECTS && (
				<ContributeCard user={user} />
			)}
			<ProfileTabsContainer>
				{myAccount && (
					<Link href={Routes.MyAccount}>
						<a>
							<ProfileTab active={tab === EProfile.OVERVIEW}>
								{formatMessage({ id: 'label.overview' })}
							</ProfileTab>
						</a>
					</Link>
				)}
				{/* // TODO: Boosting - remove this for boosting launch */}
				{myAccount && IS_BOOSTING_ENABLED && (
					<Link href={Routes.MyBoostedProjects}>
						<a>
							<ProfileTab active={tab === EProfile.BOOSTED}>
								{formatMessage({
									id: 'label.boosted_projects',
								})}
							</ProfileTab>
						</a>
					</Link>
				)}
				<Link href={pathname + profileTabs.projects}>
					<a>
						<ProfileTab active={tab === EProfile.PROJECTS}>
							{`${
								myAccount
									? formatMessage({ id: 'label.my_projects' })
									: formatMessage({ id: 'label.projects' })
							}`}
							{myAccount && user?.projectsCount != 0 && (
								<Count active={tab === EProfile.PROJECTS}>
									{user?.projectsCount}
								</Count>
							)}
						</ProfileTab>
					</a>
				</Link>
				<Link href={pathname + profileTabs.donations}>
					<a>
						<ProfileTab active={tab === EProfile.DONATIONS}>
							{`${
								myAccount
									? formatMessage({
											id: 'label.my_donations',
									  })
									: formatMessage({ id: 'label.donations' })
							}`}
							{myAccount && user?.donationsCount != 0 && (
								<Count active={tab === EProfile.DONATIONS}>
									{user?.donationsCount}
								</Count>
							)}
						</ProfileTab>
					</a>
				</Link>
				<Link href={pathname + profileTabs.likedProjects}>
					<a>
						<ProfileTab
							active={tab === EProfile.LIKED}
							onClick={() => setTab(EProfile.LIKED)}
						>
							{formatMessage({ id: 'label.liked_projects' })}
							{myAccount && !!user.likedProjectsCount && (
								<Count active={tab === EProfile.LIKED}>
									{user?.likedProjectsCount}
								</Count>
							)}
						</ProfileTab>
					</a>
				</Link>
			</ProfileTabsContainer>
			{tab === EProfile.OVERVIEW && <ProfileOverviewTab user={user} />}
			{tab === EProfile.BOOSTED && <ProfileBoostedTab user={user} />}
			{tab === EProfile.PROJECTS && (
				<ProfileProjectsTab user={user} myAccount={myAccount} />
			)}
			{tab === EProfile.DONATIONS && (
				<ProfileDonationsTab user={user} myAccount={myAccount} />
			)}
			{tab === EProfile.LIKED && (
				<ProfileLikedTab user={user} myAccount={myAccount} />
			)}
		</ProfileContainer>
	);
};

const ProfileContainer = styled(Container)`
	padding: 0 10px !important;
`;

const ProfileTabsContainer = styled(Flex)`
	padding: 37px 0;
	gap: 16px;
	overflow: auto;
`;

const ProfileTab = styled(P)<ITab>`
	display: flex;
	align-items: center;
	padding: 9px 10px;
	word-break: break-word;
	white-space: nowrap;
	cursor: pointer;
	color: ${(props: ITab) =>
		props.active ? brandColors.deep[600] : brandColors.pinky[500]};
	${props =>
		props.active &&
		`
		background: ${neutralColors.gray[100]};
		box-shadow: 0 3px 20px rgba(212, 218, 238, 0.4);
		border-radius: 50px;
	`}
`;

const Count = styled.div`
	background-color: ${(props: ITab) =>
		props.active ? neutralColors.gray[500] : brandColors.pinky[500]};
	color: white;
	width: 24px;
	height: 24px;
	text-align: center;
	border-radius: 50%;
	font-size: 12px;
	margin-left: 4px;
`;

export default ProfileContributes;
