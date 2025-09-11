import client from "../client";
import { Group, GroupSearchResult } from "../models/Group";

const PREFIX = "/events"

export async function loadGroups(): Promise<Group[]> {
  const endpoint = "/groups";

  return (await client.get<Group[]>(PREFIX + endpoint)).data;
}

export async function loadGroupsByUser(userId: string): Promise<Group[]> {
  const endpoint = `/users/${userId}/groups`;

  return (await client.get<Group[]>(PREFIX + endpoint)).data;
}

export async function searchGroups(
  query: string
): Promise<GroupSearchResult[]> {
  const endpoint = `/groups/search?q=${query}`;

  return (await client.get<GroupSearchResult[]>(PREFIX + endpoint)).data;
}

export async function createGroup(group: Group) {
  const endpoint = "/groups/";

  await client.post(PREFIX + endpoint, group);
}
