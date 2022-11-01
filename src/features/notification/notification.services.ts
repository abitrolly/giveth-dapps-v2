import { captureException } from '@sentry/nextjs';
import { getRequest, putRequest } from '@/helpers/requests';
import { defaultNotificationValues } from './notification.slice';
import config from '@/configuration';
import { showToastError } from '@/lib/helpers';
import {
	INotificationSetting,
	INotificationSettings,
	INotificationsState,
} from './notification.types';
import type { INotificationCountState } from './notification.types';

export const fetchNotificationCount =
	async (): Promise<INotificationCountState> => {
		try {
			return await getRequest(
				`${config.MICROSERVICES.notification}/countUnread`,
				true,
			);
		} catch (e) {
			console.error('Error on fetchNotificationCount:', e);
			captureException(e, {
				tags: {
					section: 'fetchNotificationCount',
				},
			});
			return defaultNotificationValues;
		}
	};

export const fetchNotificationSettings =
	async (): Promise<INotificationSettings | null> => {
		try {
			return await getRequest(
				`${config.MICROSERVICES.notificationSettings}/?limit=100`,
				true,
			);
		} catch (e) {
			showToastError(e);
			captureException(e, {
				tags: {
					section: 'fetchNotificationSettings',
				},
			});
			return null;
		}
	};

export interface INotificationSettingsPostInput {
	notificationTypeId: number;
	allowEmailNotification?: boolean;
	allowDappPushNotification?: boolean;
}

type TPostNotificationSettings = (
	i: INotificationSettingsPostInput,
) => Promise<INotificationSetting | null>;

interface IPutNotificationSettingsBody {
	id: number;
	allowEmailNotification?: string;
	allowDappPushNotification?: string;
}

export const putNotificationSettings: TPostNotificationSettings = async i => {
	const {
		notificationTypeId,
		allowEmailNotification,
		allowDappPushNotification,
	} = i;

	const body: IPutNotificationSettingsBody = { id: notificationTypeId };
	if (allowEmailNotification !== undefined) {
		body.allowEmailNotification = String(allowEmailNotification);
	}
	if (allowDappPushNotification !== undefined) {
		body.allowDappPushNotification = String(allowDappPushNotification);
	}

	try {
		return await putRequest(
			`${config.MICROSERVICES.notificationSettings}/${notificationTypeId}`,
			true,
			body,
		);
	} catch (e) {
		showToastError(e);
		captureException(e, {
			tags: {
				section: 'postNotificationSettings',
			},
		});
		return null;
	}
};

export const fetchNotificationsData = async (query: any = {}) => {
	const data: Promise<INotificationsState> = await getRequest(
		`${config.MICROSERVICES.notification}`,
		true,
		query,
	);
	return data;
};
