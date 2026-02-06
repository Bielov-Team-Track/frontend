import { CursorPagedResult, CursorPaginationFilters } from "./Pagination";

export type NotificationCategory = "invitations" | "registrations" | "events" | "messages" | "clubUpdates" | "payments" | "posts" | "teamAssignments";

export interface Notification {
	id: string;
	userId: string;
	eventType: string;
	category: NotificationCategory;
	title: string;
	body: string;
	payload: Record<string, unknown>;
	isRead: boolean;
	createdAt: string;
	readAt: string | null;
	aggregatedCount: number;
	aggregatedActors?: string[];
}

export function getNotificationLink(notification: Notification): string | null {
	const { category, payload } = notification;

	switch (category.toLowerCase()) {
		case "registrations":
			if (payload?.clubId) {
				return `/clubs/${payload.clubId}/register`;
			}
			break;
		case "clubUpdates":
			if (payload?.clubId) {
				return `/dashboard/clubs/${payload.clubId}`;
			}
			break;
		case "invitations":
			if (payload?.clubId) {
				return `/dashboard/clubs/${payload.clubId}`;
			}
			if (payload?.eventId) {
				return `/dashboard/events/${payload.eventId}`;
			}
			break;
		case "events":
			if (payload?.eventId) {
				return `/dashboard/events/${payload.eventId}`;
			}
			break;
		case "teamAssignments":
			if (payload?.teamId) {
				return `/dashboard/teams/${payload.teamId}`;
			}
			break;
		case "messages":
			if (payload?.chatId) {
				return `/dashboard/messages?chat=${payload.chatId}`;
			}
			break;
		case "payments":
			if (payload?.eventId) {
				return `/dashboard/events/${payload.eventId}`;
			}
			break;
	}

	return null;
}

/**
 * Extends generic pagination result with notification-specific unreadCount.
 */
export interface NotificationsPagedResult extends CursorPagedResult<Notification> {
	unreadCount: number;
}

/**
 * Extends generic pagination filters with notification-specific filters.
 */
export interface NotificationFilters extends CursorPaginationFilters {
	category?: NotificationCategory;
	unreadOnly?: boolean;
}
