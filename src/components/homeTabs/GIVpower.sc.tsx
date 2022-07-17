import styled from 'styled-components';
import {
	brandColors,
	ButtonLink,
	ButtonText,
	Container,
	D1,
	H1,
	H2,
	H3,
	OutlineLinkButton,
	QuoteText,
} from '@giveth/ui-design-system';
import { BottomContainer, TopContainer } from './commons';
import { mediaQueries } from '@/lib/constants/constants';
import { Arc } from '../styled-components/Arc';

export const GIVpowerContainer = styled(Container)`
	padding: 16px;
	${mediaQueries.laptop} {
		padding: 16px 32px;
	}
`;

export const GIVpowerTopContainer = styled(TopContainer)`
	overflow: hidden;
	position: relative;
`;
export const GIVpowerBottomContainer = styled(BottomContainer)``;

export const Title = styled(D1)`
	margin-top: 60px;
	margin-bottom: 24px;
`;

export const Subtitle = styled(QuoteText)`
	margin-bottom: 54px;
	${mediaQueries.tablet} {
		margin-bottom: 89px;
	}
`;

export const LearnMoreButton = styled(ButtonLink)`
	width: 250px;
`;

export const HeadingSectionContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;

	${mediaQueries.desktop} {
		flex-direction: row;
	}
`;

export const HeadingTextContainer = styled.div`
	${mediaQueries.desktop} {
		width: 66%;
		margin-right: auto;
	}
`;

export const FeaturesCardContainer = styled.div`
	background-color: #3c14c5;
	background-image: url('/images/backgrounds/giv-outline.svg');
	border-radius: 8px;
	min-height: 480px;
	margin: 80px 0 45px;
	padding: 32px 20px;
	position: relative;
	text-align: center;
	z-index: 1;
	${mediaQueries.tablet} {
		padding: 50px 5px;
	}
	${mediaQueries.laptop} {
		padding: 76px 30px;
	}
`;
export const FeaturesCardHeading = styled(H1)`
	text-align: center;
`;

export const FeaturesCardSubheading = styled(QuoteText)`
	max-width: 750px;
	margin: auto;
	margin-top: 8px;
`;

export const FeaturesCardItemsContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin-top: 60px;
	gap: 40px;
	${mediaQueries.tablet} {
		flex-direction: row;
		justify-content: space-between;
		gap: 0;
		margin-top: 106px;
	}
	${mediaQueries.laptop} {
		gap: 20px;
	}
`;

export const FeaturesCardItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	max-width: 300px;
	margin: auto;
`;

export const CardBottomText = styled(ButtonText)`
	color: ${brandColors.mustard[500]};
	margin-top: 3px;
	margin: 0 auto;
`;

export const CenteredHeader = styled(H2)`
	text-align: center;
`;

export const BenefitsCardsContainer = styled.div`
	display: flex;

	flex-direction: column;

	padding-bottom: 60px;
	${mediaQueries.laptop} {
		gap: 20px;
		flex-direction: row;
	}
`;

export const BenefitsCard = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	padding: 30px;
	text-align: center;
	background-color: #4c32e3;
	border-radius: 8px;
	position: relative;
	margin-top: 30px;
	overflow: hidden;
	background-image: url('/images/backgrounds/giv-outlined-bright-opacity.png');
	${mediaQueries.tablet} {
		padding: 60px;
	}
	${mediaQueries.desktop} {
		display: row;
		width: 50%;
	}
`;

export const BenefitsCardTextContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	margin: auto;
	${mediaQueries.desktop} {
		display: row;
		width: 50%;
		width: 360px;
	}
`;

export const HeaderAndCirclesContainer = styled.div`
	position: relative;
`;

export const BenefitsCardHeading = styled(H3)`
	margin-bottom: 40px;
`;

export const ArcMustardTop = styled(Arc)`
	border-color: ${brandColors.mustard[500]} ${brandColors.mustard[500]}
		transparent transparent;
	width: 600px;
	height: 600px;
	border-width: 50px;
	transform: rotate(-45deg);
	top: -100px;
	right: -300px;
	display: none;
	${mediaQueries.laptop} {
		top: 0px;
		display: unset;
	}
	z-index: 0;
`;
export const ArcMustardBottom = styled(Arc)`
	border-color: ${brandColors.cyan[500]} ${brandColors.cyan[500]} transparent
		transparent;
	width: 600px;
	height: 600px;
	border-width: 50px;
	transform: rotate(-224deg);
	left: -300px;
	display: none;
	${mediaQueries.laptop} {
		bottom: 30px;
		display: unset;
	}
	z-index: 0;
`;
export const Circle = styled.div<{ size: number }>`
	position: absolute;
	border-radius: 50%;
	border-style: solid;
	border-width: 2px;
	width: ${props => props.size / 4}px;
	height: ${props => props.size / 4}px;
	border-color: ${brandColors.giv[200]};
	opacity: 0.1;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 0;
	overflow: hidden;
	${mediaQueries.mobileL} {
		width: ${props => props.size / 3.2}px;
		height: ${props => props.size / 3.2}px;
	}
	${mediaQueries.tablet} {
		width: ${props => props.size / 2}px;
		height: ${props => props.size / 2}px;
	}
	${mediaQueries.laptop} {
		width: ${props => props.size / 1.3}px;
		height: ${props => props.size / 1.3}px;
	}
	${mediaQueries.desktop} {
		width: ${props => props.size}px;
		height: ${props => props.size}px;
	}
`;

export const GivpowerCTAContainer = styled.div`
	background-image: url('/images/backgrounds/giv-outline.svg');
	width: 100%;
	padding: 20px 0;
	text-align: center;
	${mediaQueries.tablet} {
		padding: 40px 0;
	}
`;

export const GivpowerCTASubheading = styled(QuoteText)`
	color: ${brandColors.giv[200]};
	margin-top: 8px;
	margin-bottom: 16px;
`;

export const GivpowerCTAButtonContainer = styled.div`
	display: flex;
	justify-content: center;
	gap: 16px;
	margin-top: 40px;
	flex-direction: column;
	${mediaQueries.mobileM} {
		flex-direction: row;
	}
`;
export const GivpowerCTAButton = styled(ButtonLink)`
	width: 250px;
	margin: 0 auto;
	${mediaQueries.tablet} {
		margin: 0;
	}
`;

export const GivpowerCTAButtonOutlined = styled(OutlineLinkButton)`
	width: 250px;
	margin: 0 auto;
	${mediaQueries.tablet} {
		margin: 0;
	}
`;

export const BoostProjectButton = styled(ButtonLink)`
	margin: 0 auto;
	min-width: 250px;
	${mediaQueries.tablet} {
		margin: 0;
	}
`;

export const GivPowerCardContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 30px;
	background: ${brandColors.giv[700]};
	padding: 24px;
	margin-bottom: 8px;
	border-top-left-radius: 8px;
	border-top-right-radius: 8px;
	${mediaQueries.tablet} {
		margin-bottom: 0;
	}
`;
