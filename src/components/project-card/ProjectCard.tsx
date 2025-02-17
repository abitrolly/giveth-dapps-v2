import { useState } from 'react';
import styled from 'styled-components';
import {
	GLink,
	P,
	H6,
	brandColors,
	neutralColors,
	ButtonLink,
	B,
	Subline,
	semanticColors,
	IconGIVBack,
	IconRocketInSpace16,
	IconVerifiedBadge16,
} from '@giveth/ui-design-system';
import Link from 'next/link';

import { useIntl } from 'react-intl';
import { Shadow } from '@/components/styled-components/Shadow';
import ProjectCardBadges from './ProjectCardLikeAndShareButtons';
import ProjectCardOrgBadge from './ProjectCardOrgBadge';
import { IProject } from '@/apollo/types/types';
import { timeFromNow, htmlToText } from '@/lib/helpers';
import ProjectCardImage from './ProjectCardImage';
import {
	addressToUserView,
	slugToProjectDonate,
	slugToProjectView,
} from '@/lib/routeCreators';
import { Row } from '@/components/Grid';
import { ORGANIZATION } from '@/lib/constants/organizations';
import { mediaQueries } from '@/lib/constants/constants';
import { Flex } from '../styled-components/Flex';
import { IS_BOOSTING_ENABLED } from '@/configuration';
import InternalLink from '@/components/InternalLink';

const cardRadius = '12px';
const imgHeight = '226px';

interface IProjectCard {
	project: IProject;
}

const ProjectCard = (props: IProjectCard) => {
	const { project } = props;
	const {
		title,
		description,
		image,
		slug,
		adminUser,
		totalDonations,
		updatedAt,
		organization,
		verified,
		projectPower,
	} = project;

	const [isHover, setIsHover] = useState(false);

	const orgLabel = organization?.label;
	const isForeignOrg =
		orgLabel !== ORGANIZATION.trace && orgLabel !== ORGANIZATION.giveth;
	const name = adminUser?.name;
	const { formatMessage, formatRelativeTime } = useIntl();

	return (
		<Link href={slugToProjectView(slug)} passHref>
			<Wrapper
				onMouseEnter={() => setIsHover(true)}
				onMouseLeave={() => setIsHover(false)}
			>
				<ImagePlaceholder>
					<ProjectCardBadges project={project} />
					<ProjectCardOrgBadge
						organization={orgLabel}
						isHover={isHover}
					/>
					<ProjectCardImage image={image} />
				</ImagePlaceholder>
				<CardBody
					isHover={isHover}
					isOtherOrganization={
						orgLabel && orgLabel !== ORGANIZATION.giveth
					}
				>
					<div style={{ position: 'relative' }}>
						<LastUpdatedContainer isHover={isHover}>
							{formatMessage({ id: 'label.last_updated' })}:
							{timeFromNow(
								updatedAt,
								formatRelativeTime,
								formatMessage({ id: 'label.just_now' }),
							)}
						</LastUpdatedContainer>

						<InternalLink href={slugToProjectView(slug)}>
							<Title weight={700} isHover={isHover}>
								{title}
							</Title>
						</InternalLink>
					</div>
					{adminUser && !isForeignOrg ? (
						<Link
							href={addressToUserView(adminUser?.walletAddress)}
							passHref
						>
							<Author size='Big'>{name || '\u200C'}</Author>
						</Link>
					) : (
						<Author size='Big'>
							<br />
						</Author>
					)}
					<Description>{htmlToText(description)}</Description>
					<Flex alignItems='center' gap='4px'>
						<PriceText>
							${Math.ceil(totalDonations as number)}
						</PriceText>
						<LightSubline>
							{' '}
							{formatMessage({ id: 'label.raised_two' })}
						</LightSubline>
					</Flex>
					<>
						<Hr />
						<Flex justifyContent='space-between'>
							{verified && (
								<Flex gap='16px'>
									<Flex alignItems='center' gap='4px'>
										<IconVerifiedBadge16
											color={semanticColors.jade[500]}
										/>
										<VerifiedText>
											{formatMessage({
												id: 'label.verified',
											})}
										</VerifiedText>
									</Flex>
									<Flex alignItems='center' gap='2px'>
										<GivBackIconContainer>
											<IconGIVBack
												size={24}
												color={brandColors.giv[500]}
											/>
										</GivBackIconContainer>
										<GivBackText>
											{formatMessage({
												id: 'label.givback_eligible',
											})}
										</GivBackText>
									</Flex>
								</Flex>
							)}
							{/* // TODO: Boosting - remove this for boosting launch */}
							{IS_BOOSTING_ENABLED && projectPower?.powerRank && (
								<GivpowerRankContainer
									gap='8px'
									alignItems='center'
								>
									<IconRocketInSpace16
										color={neutralColors.gray[700]}
									/>
									<B>#{projectPower?.powerRank || '--'}</B>
								</GivpowerRankContainer>
							)}
						</Flex>
					</>
					<ActionButtons>
						<Link href={slugToProjectDonate(slug)} passHref>
							<CustomizedDonateButton
								linkType='primary'
								size='small'
								label={formatMessage({ id: 'label.donate' })}
								isHover={isHover}
							/>
						</Link>
					</ActionButtons>
				</CardBody>
			</Wrapper>
		</Link>
	);
};

const DonateButton = styled(ButtonLink)`
	flex: 1;
`;

const CustomizedDonateButton = styled(DonateButton)<{ isHover: boolean }>`
	margin: 25px 0;
	${mediaQueries.laptopS} {
		margin: 25px 12px;
		opacity: ${props => (props.isHover ? '1' : '0')};
		transition: opacity 0.3s ease-in-out;
	}
`;

const PriceText = styled(B)`
	display: inline;
	color: ${neutralColors.gray[800]};
`;

const LightSubline = styled(Subline)`
	display: inline;
	color: ${neutralColors.gray[700]};
`;

const VerifiedText = styled(Subline)`
	text-transform: uppercase;
	color: ${semanticColors.jade[500]};
`;

const GivBackText = styled(Subline)`
	text-transform: uppercase;
	color: ${brandColors.giv[500]};
`;

const GivBackIconContainer = styled.div`
	display: flex;
	align-items: center;
	transform: scale(0.8);
`;

const LastUpdatedContainer = styled(Subline)<{ isHover?: boolean }>`
	position: absolute;
	bottom: 30px;
	background-color: ${neutralColors.gray[300]};
	color: ${neutralColors.gray[700]};
	padding: 2px 8px;
	border-radius: 4px;
	${mediaQueries.laptopS} {
		transition: opacity 0.3s ease-in-out;
		display: inline;
		opacity: ${props => (props.isHover ? 1 : 0)};
	}
`;

const ActionButtons = styled(Row)`
	gap: 16px;
`;

const Hr = styled.hr`
	border: 1px solid ${neutralColors.gray[300]};
`;

const Description = styled(P)`
	height: 75px;
	overflow: hidden;
	color: ${neutralColors.gray[800]};
	margin-bottom: 16px;
`;

const CardBody = styled.div<{
	isOtherOrganization?: boolean | '';
	isHover?: boolean;
}>`
	padding: 32px 26px 26px;
	position: absolute;
	left: 0;
	right: 0;
	top: 192px;
	background-color: ${neutralColors.gray[100]};
	transition: top 0.3s ease;
	border-radius: ${props =>
		props.isOtherOrganization ? '0 12px 12px 12px' : '12px'};
	${mediaQueries.laptopS} {
		top: ${props => {
			if (props.isHover) {
				return '109px';
			} else {
				return '186px';
			}
		}};
	}
`;

const Author = styled(GLink)`
	color: ${brandColors.pinky[500]};
	margin-bottom: 16px;
	display: block;
`;

const Title = styled(H6)<{ isHover?: boolean }>`
	color: ${props =>
		props.isHover ? brandColors.pinky[500] : brandColors.deep[700]};
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	margin-bottom: 2px;
`;

const ImagePlaceholder = styled.div`
	height: ${imgHeight};
	width: 100%;
	position: relative;
	overflow: hidden;
`;

const Wrapper = styled.div`
	position: relative;
	width: 100%;
	border-radius: ${cardRadius};
	margin: 0 auto;
	background: white;
	overflow: hidden;
	box-shadow: ${Shadow.Neutral[400]};
	height: 536px;
	cursor: pointer;
	${mediaQueries.laptopS} {
		height: 472px;
	}
`;

const GivpowerRankContainer = styled(Flex)`
	padding: 2px 8px;
	background-color: ${neutralColors.gray[300]};
	color: ${neutralColors.gray[800]};
	border-radius: 8px;
	margin-left: auto;
`;

export default ProjectCard;
