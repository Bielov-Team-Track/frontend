import client from "../client";
import { Approval } from "../models/Approval";

const PREFIX = "/events";

export async function checkUserApproval(
	eventId: string,
	userId: string,
): Promise<Approval> {
	const endpoint = `/v1/approvals/${eventId}/${userId}`;

	return (await client.get<Approval>(PREFIX + endpoint)).data;
}

export async function requestApproval(userId: string, eventId: string) {
	const endpoint = `/v1/approvals/${eventId}/${userId}`;

	await client.post(PREFIX + endpoint);
}

export async function loadApprovalRequests(
	eventId: string,
): Promise<Approval[]> {
	const endpoint = `/v1/approvals/${eventId}/`;

	return (await client.get(PREFIX + endpoint)).data;
}

export async function approveUser(eventId: string, userId: string) {
	const endpoint = `/v1/approvals/${eventId}/${userId}`;

	await client.patch(PREFIX + endpoint, { approved: true });
}

export async function disapproveUser(eventId: string, userId: string) {
	const endpoint = `/v1/approvals/${eventId}/${userId}`;

	await client.patch(PREFIX + endpoint, { approved: false });
}

export async function resetApproval(eventId: string, userId: string) {
	const endpoint = `/v1/approvals/${eventId}/${userId}`;

	await client.patch(PREFIX + endpoint, { approved: null });
}
