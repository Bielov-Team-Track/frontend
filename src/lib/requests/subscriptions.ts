import client from "../client";

const PREFIX = "/events";

export async function createNotificationSubscription(
	userId: string,
	subscription: PushSubscription,
) {
	const endpoint = `/subscriptions/${userId}`;

	await client.post(PREFIX + endpoint, subscription);
}
