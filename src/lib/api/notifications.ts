import { NotificationFilters, NotificationsPagedResult } from "../models/Notification";
import client from "./client";

const PREFIX = "notifications/v1";

export async function getNotifications(filters: NotificationFilters = {}): Promise<NotificationsPagedResult> {
	const params = new URLSearchParams();

	if (filters.category) params.set("category", filters.category);
	if (filters.unreadOnly) params.set("unreadOnly", "true");
	if (filters.limit) params.set("limit", filters.limit.toString());
	if (filters.cursor) params.set("cursor", filters.cursor);

	const query = params.toString();
	const endpoint = `/notifications${query ? `?${query}` : ""}`;

	return (await client.get(PREFIX + endpoint)).data;
}

export async function markAsRead(notificationIds: string[]): Promise<void> {
	const endpoint = `/notifications/mark-read`;
	await client.post(PREFIX + endpoint, { ids: notificationIds });
}

export async function markAllAsRead(): Promise<void> {
	const endpoint = `/notifications/mark-all-read`;
	await client.post(PREFIX + endpoint);
}

export async function getUnreadCount(): Promise<{ count: number }> {
	const endpoint = `/notifications/unread-count`;
	return (await client.get(PREFIX + endpoint)).data;
}

export async function deleteNotification(id: string): Promise<void> {
	await client.delete(`${PREFIX}/notifications/${id}`);
}

export async function deleteAllNotifications(): Promise<void> {
	await client.delete(`${PREFIX}/notifications`);
}
