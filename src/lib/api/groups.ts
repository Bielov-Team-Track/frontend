import client from "./client";
import { Group, GroupSearchResult } from "../models/Group";

const PREFIX = "/events";

export async function loadGroups(): Promise<Group[]> {
	const endpoint = "/v1/groups";

	return (await client.get<Group[]>(PREFIX + endpoint)).data;
}

export async function loadGroupsByUser(userId: string): Promise<Group[]> {
	const endpoint = `/v1/users/${userId}/groups`;

	return (await client.get<Group[]>(PREFIX + endpoint)).data;
}

export async function searchGroups(
	query: string,
): Promise<GroupSearchResult[]> {
	const endpoint = `/v1/groups/search?q=${query}`;

	return (await client.get<GroupSearchResult[]>(PREFIX + endpoint)).data;
}

export async function createGroup(group: Group) {
	const endpoint = "/v1/groups/";

	await client.post(PREFIX + endpoint, group);
}
