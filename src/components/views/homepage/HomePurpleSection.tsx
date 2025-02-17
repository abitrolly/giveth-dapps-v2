import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { TwitterShareButton } from 'react-share';
import styled from 'styled-components';
import {
	Button,
	brandColors,
	Lead,
	GLink,
	H2,
	H3,
} from '@giveth/ui-design-system';

import { useIntl } from 'react-intl';
import TwitterIcon from '/public/images/twitter.svg';
import { isSSRMode, isUserRegistered } from '@/lib/helpers';
import Routes from '@/lib/constants/Routes';
import { Col, Row } from '@/components/Grid';
import { Arc } from '@/components/styled-components/Arc';
import { HomeContainer } from '@/components/views/homepage/Home.sc';
import { deviceSize, mediaQueries } from '@/lib/constants/constants';
import { useAppDispatch, useAppSelector } from '@/features/hooks';
import { setShowCompleteProfile } from '@/features/modal/modal.slice';

const HomePurpleSection = () => {
	const { formatMessage } = useIntl();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const user = useAppSelector(state => state.user.userData);

	const handleCreateButton = () => {
		if (isUserRegistered(user)) {
			router.push(Routes.CreateProject);
		} else {
			dispatch(setShowCompleteProfile(true));
		}
	};

	const url = !isSSRMode ? window?.location?.href : null;
	const shareTitle = `Imagine a future where...
Giving is effortless and people all around the world are rewarded for creating positive change.
	
Explore @givethio to support this vision for the Future of Giving. 💜`;

	return (
		<Wrapper>
			<ArcSmall />
			<ArcBig />
			<MustardThing>
				<ArcMustard />
				<DotMustard />
			</MustardThing>
			<Container>
				<GivingEffortless weight={700}>
					{formatMessage({
						id: 'page.home.section.giving_is_effortless',
					})}
				</GivingEffortless>
				<GivingButtons>
					<StartGiving
						size='large'
						label={formatMessage({
							id: 'component.button.start_giving',
						})}
						onClick={() => router.push(Routes.Projects)}
					/>
					<TwitterShareButton
						title={shareTitle}
						url={url || ''}
						hashtags={['Giveth']}
					>
						<TwitterButton>
							<Image
								src={TwitterIcon}
								alt='twitter icon'
								width={24}
								height={24}
							/>
							<TwitterButtonText size='Big'>
								{formatMessage({
									id: 'component.button.tweet_this',
								})}
							</TwitterButtonText>
						</TwitterButton>
					</TwitterShareButton>
				</GivingButtons>
				<GIVeconomy>
					<H3 weight={700}>
						{formatMessage({
							id: 'page.home.section.the_giveconomy',
						})}
					</H3>
					<br />
					<Lead>
						{formatMessage({
							id: 'page.home.section.the_giveconomy_desc',
						})}
					</Lead>
					<br />
					<Link href={Routes.GIVECONOMY} passHref>
						<GIVeconomyUrl>
							{formatMessage({
								id: 'component.button.learn_more_giveconomy',
							})}
						</GIVeconomyUrl>
					</Link>
				</GIVeconomy>
				<ForMakersGivers>
					<ForMakersContainers md={6}>
						<H3 weight={700}>
							{formatMessage({
								id: 'page.home.section.for_projects',
							})}
						</H3>
						<br />
						<Lead>
							{formatMessage({
								id: 'page.home.section.for_projects_desc',
							})}
						</Lead>
						<br />
						<ForMakersButton
							buttonType='primary'
							size='large'
							label={formatMessage({
								id: 'component.button.create_project',
							})}
							onClick={handleCreateButton}
						/>
					</ForMakersContainers>
					<ForMakersContainers md={6}>
						<H3 weight={700}>
							{formatMessage({
								id: 'page.home.section.for_givers',
							})}
						</H3>
						<br />
						<Lead>
							{formatMessage({
								id: 'page.home.section.for_givers_desc',
							})}
						</Lead>
						<br />
						<ForMakersButton
							buttonType='primary'
							size='large'
							label={formatMessage({
								id: 'component.button.donate_project',
							})}
							onClick={() => router.push(Routes.Projects)}
						/>
					</ForMakersContainers>
				</ForMakersGivers>
			</Container>
		</Wrapper>
	);
};

const ArcMustard = styled(Arc)`
	border-width: 132px;
	border-color: transparent transparent ${brandColors.mustard[500]}
		transparent;
	top: -50px;
	right: -300px;
	width: 675px;
	height: 675px;
	transform: rotate(31deg);
`;

const DotMustard = styled(Arc)`
	border-width: 71px;
	border-color: ${brandColors.mustard[500]};
	top: 140px;
	right: 290px;
	width: 142px;
	height: 142px;
`;

const MustardThing = styled.div`
	display: none;

	${mediaQueries.laptopS} {
		display: unset;
	}
`;

const ArcBig = styled(Arc)`
	border-width: 150px;
	border-color: ${brandColors.giv[600]};
	top: -700px;
	left: -700px;
	width: 1740px;
	height: 1740px;
	opacity: 60%;
`;

const ArcSmall = styled(Arc)`
	border-width: 50px;
	border-color: ${brandColors.giv[600]};
	top: -200px;
	left: -550px;
	width: 700px;
	height: 700px;
`;

const ForMakersGivers = styled(Row)`
	margin-top: 107px;
	margin-bottom: 50px;
	justify-content: space-between;
	max-width: 1200px;
`;

const ForMakersContainers = styled(Col)`
	min-width: 350px;
	max-width: 445px;
	display: flex;
	flex-direction: column;
	margin-bottom: 100px;
	padding-right: 30px;
`;

const ForMakersButton = styled(Button)`
	width: 300px;
	margin-top: 24px;
	align-self: start;
`;

const GIVeconomy = styled.div`
	max-width: 800px;
	margin-top: 72px;

	${mediaQueries.tablet} {
		margin-top: 235px;
	}
`;

const GIVeconomyUrl = styled.a`
	color: ${brandColors.mustard[500]} !important;
	font-size: 16px;
`;

const GivingButtons = styled.div`
	display: flex;
	margin-top: 70px;
	flex-wrap: wrap;
`;

const StartGiving = styled(Button)`
	background-color: ${brandColors.mustard[500]};
	color: ${brandColors.giv[500]};
	height: 66px;
	padding: 0 80px;
	text-transform: uppercase;
	&:hover {
		background-color: ${brandColors.mustard[500]};
		color: ${brandColors.giv[500]};
	}
`;

const TwitterButton = styled.div`
	color: white;
	height: 66px;
	padding: 0 80px;
	display: flex;
	gap: 8px;
	justify-content: center;
	align-items: center;
`;

const TwitterButtonText = styled(GLink)`
	font-weight: 700;
`;

const GivingEffortless = styled(H2)`
	color: ${brandColors.mustard[500]};
	max-width: 654px;
`;

const Wrapper = styled(HomeContainer)`
	background: ${brandColors.giv[500]};
	padding-top: 90px;
	color: white;
	position: relative;
	z-index: 2;
	overflow: hidden;
`;

const Container = styled.div`
	margin: 0 auto;
	${mediaQueries.desktop} {
		width: ${deviceSize.desktop + 'px'};
	}
`;

export default HomePurpleSection;
