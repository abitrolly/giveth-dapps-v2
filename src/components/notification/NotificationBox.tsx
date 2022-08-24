import styled from 'styled-components';
import {
	B,
	brandColors,
	IconHeartOutline24,
	neutralColors,
} from '@giveth/ui-design-system';
import { Flex } from '../styled-components/Flex';
import { convertRawDataToHTML, INotificationData } from '@/helpers/html';
import type { FC } from 'react';

interface INotificationBox {
	notification: INotificationData;
	short?: boolean;
}

export const NotificationBox: FC<INotificationBox> = ({
	notification,
	short = false,
}) => {
	return (
		<NotificationBoxContainer gap='16px'>
			{!notification.isRead && <UnreadCircle />}
			{!short && (
				<IconContainer>
					<IconHeartOutline24 />
				</IconContainer>
			)}
			<NotificationContent>
				<div>{convertRawDataToHTML(notification)}</div>
				{!short && notification.quote && (
					<NotificationQuote>{notification.quote}</NotificationQuote>
				)}
				<NotificationTime>
					{/* {new Date(notification.time)} */}
				</NotificationTime>
			</NotificationContent>
		</NotificationBoxContainer>
	);
};

const NotificationBoxContainer = styled(Flex)`
	position: relative;
	padding: 24px;
`;

const IconContainer = styled.div`
	padding-top: 4px;
`;

const UnreadCircle = styled.div`
	position: absolute;
	top: 10px;
	left: 10px;
	height: 8px;
	width: 8px;
	background-color: ${brandColors.pinky[500]};
	border: 1px solid ${brandColors.pinky[700]};
	border-radius: 4px;
`;

const NotificationContent = styled.div``;

const NotificationQuote = styled(B)`
	border-left: 4px solid ${neutralColors.gray[400]};
	font-weight: bold;
	padding-left: 16px;
	margin-top: 16px;
	white-space: pre-wrap;
	&::before {
		content: '"';
	}
	&::after {
		content: '"';
	}
`;

const NotificationTime = styled.div`
	margin-top: 16px;
`;
