import client from "../client";
import { Group, GroupCreate } from "../models/Group";


export async function loadGroupsByAdmin(adminId: string): Promise<Group[]> {
  const endpoint = `/groups/${adminId}`

  return (await client.get<Group[]>(endpoint)).data
}

export async function loadGroup(groupId: string): Promise<Group> {
  const endpoint = "/groups/" + groupId;

  return (await client.get<Group>(endpoint)).data
}

export async function createGroup(group: GroupCreate) {
  const endpoint = "/groups/";

  await client.put(endpoint, group)
}
