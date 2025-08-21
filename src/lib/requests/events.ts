import client from "../client";
import { CreateEvent, Event, GetEventsRequest } from "../models/Event";
import { EventParticipant } from "../models/EventParticipant";
import { getParamsFromObject } from "../utils/request";

export async function loadEvents(
  request: GetEventsRequest | undefined = undefined
): Promise<Event[]> {
  const endpoint = "/v1/events";

  const params = getParamsFromObject(request);

  return (await client.get<Event[]>(endpoint, { params })).data;
}

export async function loadEventsByUser(userId: string): Promise<Event[]> {
  const endpoint = "/v1/users/" + userId + "/events";

  return (await client.get<Event[]>(endpoint)).data;
}

export async function loadEventsByAdmin(userId: string): Promise<Event[]> {
  const endpoint = "/v1/admins/" + userId + "/events";
  console.log(endpoint);
  return (await client.get<Event[]>(endpoint)).data;
}

export async function loadEvent(eventId: string): Promise<Event> {
  const endpoint = "/v1/events/" + eventId;

  return (await client.get<Event>(endpoint)).data;
}

export async function createEvent(event: CreateEvent) {
  const endpoint = "/v1/events/";

  await client.post(endpoint, event);
}

export async function saveEvent(event: Event) {
  const endpoint = "/v1/events/";

  await client.put(endpoint, event);
}

export async function deleteEvent(eventId: string) {
  const endpoint = "/v1/events/" + eventId;

  await client.delete(endpoint);
}

// Participants
export async function loadParticipants(
  eventId: string
): Promise<EventParticipant[]> {
  const endpoint = `/v1/events/${eventId}/participants`;
  return (await client.get<EventParticipant[]>(endpoint)).data;
}

export async function removeParticipant(eventId: string, userId: string) {
  const endpoint = `/v1/events/${eventId}/participants/${userId}`;
  await client.delete(endpoint);
}

export async function markParticipantPaid(eventId: string, userId: string) {
  const endpoint = `/v1/events/${eventId}/participants/${userId}/paid`;
  await client.post(endpoint);
}

export async function markParticipantAsPaid(participantId: string) {
  const endpoint = `/v1/payments?participantId=${participantId}`;
  await client.put(endpoint);
}

// Join/Leave
export async function joinEvent(eventId: string) {
  const endpoint = `/v1/events/${eventId}/join`;
  await client.post(endpoint);
}

export async function leaveEvent(eventId: string) {
  const endpoint = `/v1/events/${eventId}/leave`;
  await client.post(endpoint);
}

// Waitlist
export async function loadEventWaitlist(eventId: string) {
  const endpoint = `/v1/events/${eventId}/waitlist`;
  return (await client.get(endpoint)).data;
}

export async function joinEventWaitlist(eventId: string) {
  const endpoint = `/v1/events/${eventId}/waitlist`;
  await client.post(endpoint);
}

export async function leaveEventWaitlist(eventId: string) {
  const endpoint = `/v1/events/${eventId}/waitlist`;
  await client.delete(endpoint);
}

// Organizer actions
export async function cancelEvent(eventId: string) {
  const endpoint = `/v1/events/${eventId}/cancel`;
  await client.post(endpoint);
}
