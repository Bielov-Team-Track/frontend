import client from "../client";
import { UserProfile } from "../models/User";

const PREFIX = "/events"


export async function loadWaitlist(positionId: string): Promise<UserProfile[]> {
  const endpoint = `/waitlist/${positionId}`;

  return (await client.get<UserProfile[]>(PREFIX + endpoint)).data;
}

export async function joinWaitlist(positionId: string, userId: string) {
  const endpoint = `/waitlist/${positionId}/${userId}`;

  await client.post(PREFIX + endpoint);
}

export async function leaveWaitlist(positionId: string, userId: string) {
  const endpoint = `/waitlist/${positionId}/${userId}`;

  await client.delete(PREFIX + endpoint);
}
