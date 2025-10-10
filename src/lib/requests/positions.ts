import client from "../client";
import { Position } from "../models/Position";
import { PositionType } from "../models/PositionType";

const PREFIX = "/events/v1";

export async function loadPositionTypes() {
	const endpoint = `/position-types`;

	return (await client.get<PositionType[]>(PREFIX + endpoint)).data;
}

export async function getPosition(positionId: string) {
	const endpoint = `/positions/${positionId}`;

	return (await client.get<Position>(PREFIX + endpoint)).data;
}

export async function getUserPositions(userId: string) {
	const endpoint = `/positions?userId=${userId}`;

	return (await client.get<Position>(PREFIX + endpoint)).data;
}

export async function createPosition(name: string) {
	const endpoint = `/positions`;

	await client.post(PREFIX + endpoint, { name });
}

export async function createPositionType(name: string) {
	const endpoint = `/position-types`;

	await client.post(PREFIX + endpoint, { name });
}

export async function deletePosition(positionId: string) {
	const endpoint = `/positions/${positionId}`;

	await client.delete(PREFIX + endpoint);
}

export async function addPosition(
	teamId: string,
	positionName: string,
): Promise<Position> {
	const endpoint = `/teams/${teamId}/positions`;

	return (
		await client.post<Position>(PREFIX + endpoint, { Name: positionName })
	).data;
}

export async function takePositionWithUser(positionId: string, userId: string) {
	const endpoint = `/positions/${positionId}/assign/${userId}`;
	return (await client.post(PREFIX + endpoint)).data;
}

export async function claimPosition(positionId: string) {
	const endpoint = `/positions/${positionId}/claim`;
	return (await client.post(PREFIX + endpoint)).data;
}

export async function releasePosition(positionId: string): Promise<Position> {
	const endpoint = `/positions/${positionId}/release`;
	return (await client.post<Position>(PREFIX + endpoint)).data;
}

export async function takePositionWithName(
	eventId: string,
	teamId: string,
	positionId: string,
	userName: string,
) {
	const endpoint = `events/${eventId}/teams/${teamId}`;

	client.put(PREFIX + endpoint, {
		positionId: positionId,
		userName: userName,
	});
}

export async function markPositionPaid(positionId: string) {
	const endpoint = `/positions/${positionId}/paid`;

	return await client.put(PREFIX + endpoint);
}
