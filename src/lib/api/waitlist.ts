import client from "./client";
import { WaitlistEntry } from "../models/Position";

const PREFIX = "/events/v1";

export async function loadWaitlist(
	positionId: string,
): Promise<WaitlistEntry[]> {
	const endpoint = `/positions/${positionId}/waitlist`;

	return (await client.get<WaitlistEntry[]>(PREFIX + endpoint)).data;
}

export async function joinWaitlist(positionId: string) {
	const endpoint = `/positions/${positionId}/waitlist/`;

	await client.post(PREFIX + endpoint);
}

export async function leaveWaitlist(positionId: string) {
	const endpoint = `/positions/${positionId}/waitlist`;

	await (await client.delete(PREFIX + endpoint)).data;
}
