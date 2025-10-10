import client from "../client";
import { Position } from "../models/Position";
import { Team } from "../models/Team";
import { API_BASE_URL } from "../constants";

const PREFIX = "events";

export async function loadTeams(
	eventId: string,
	includePayments: boolean = false,
): Promise<Team[]> {
	const endpoint = `/v1/events/${eventId}/teams?includePayments=${includePayments}`;

	return (await client.get<Team[]>(PREFIX + endpoint)).data;
}

export async function createTeam(team: { eventId: string }) {
	const endpoint = `/v1/teams`;

	return await client.post(PREFIX + endpoint, team);
}

export async function deleteTeam(teamId: string) {
	const endpoint = `/v1/teams/${teamId}`;

	return await client.delete(PREFIX + endpoint);
}

export async function loadTeamPositions(teamId: string) {
	const endpoint = `/v1/teams/${teamId}/positions`;

	return (await client.get<Position[]>(PREFIX + endpoint)).data;
}

export async function deleteTeamPosition(teamId: string, positionId: string) {
	const endpoint = `/v1/teams/${teamId}/positions/${positionId}`;

	await client.delete(PREFIX + endpoint);
}

export async function assignCaptain(teamId: string, userId: string) {
	const endpoint = `/v1/teams/${teamId}/captain`;

	return await client.post(PREFIX + endpoint, { userId: userId });
}

export async function removeCaptain(teamId: string) {
	const endpoint = `/v1/teams/${teamId}/captain`;

	return await client.delete(PREFIX + endpoint);
}
