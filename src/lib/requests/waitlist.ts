import { User } from "next-auth";
import client from "../client";


export async function loadWaitlist(positionId: string): Promise<User[]> {
  const endpoint = `/waitlist/${positionId}`

  return (await client.get<User[]>(endpoint)).data
}

export async function joinWaitlist(positionId: string, userId: string) {
  const endpoint = `/waitlist/${positionId}/${userId}`

  await client.post(endpoint)
}

export async function leaveWaitlist(positionId: string, userId: string) {
  const endpoint = `/waitlist/${positionId}/${userId}`

  await client.delete(endpoint)
}
