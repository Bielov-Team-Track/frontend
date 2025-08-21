import client from "../client";
import { Approval } from "../models/Approval";

export async function checkUserApproval(eventId: string, userId: string): Promise<Approval> {
  const endpoint = `/v1/approvals/${eventId}/${userId}`;

  return (await client.get<Approval>(endpoint)).data
}

export async function requestApproval(userId: string, eventId: string) {
  const endpoint = `/v1/approvals/${eventId}/${userId}`;

  await client.post(endpoint)
}

export async function loadApprovalRequests(eventId: string): Promise<Approval[]> {
  const endpoint = `/v1/approvals/${eventId}/`;

  return (await client.get(endpoint)).data
}

export async function approveUser(eventId: string, userId: string) {
  const endpoint = `/v1/approvals/${eventId}/${userId}`;

  await client.patch(endpoint, { approved: true })
}

export async function disapproveUser(eventId: string, userId: string) {
  const endpoint = `/v1/approvals/${eventId}/${userId}`;

  await client.patch(endpoint, { approved: false })
}

export async function resetApproval(eventId: string, userId: string) {
  const endpoint = `/v1/approvals/${eventId}/${userId}`;

  await client.patch(endpoint, { approved: null })
} 