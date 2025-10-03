import client from "../client";
import { CreateEvent, Event, EventFilterRequest } from "../models/Event";
import { EventParticipant } from "../models/EventParticipant";
import { getParamsFromObject } from "../utils/request";

const PREFIX = "/events";

export async function loadEvents(
  filter?: EventFilterRequest
): Promise<Event[]> {
  const endpoint = "/v1/events";

  const params = getParamsFromObject(filter);

  return (await client.get<Event[]>(PREFIX + endpoint, { params })).data;
}

export async function loadEventsByFilter(
  filter?: EventFilterRequest
): Promise<Event[]> {
  const endpoint = "/v1/events";

  const params = getParamsFromObject(filter);

  return (await client.get<Event[]>(PREFIX + endpoint, { params })).data;
}

export async function loadEvent(eventId: string): Promise<Event> {
  const endpoint = "/v1/events/" + eventId;

  return (await client.get<Event>(PREFIX + endpoint)).data;
}

export async function createEvent(event: CreateEvent) {
  const endpoint = "/v1/events/";

  await client.post(PREFIX + endpoint, event);
}

export async function saveEvent(event: Event) {
  const endpoint = "/v1/events/";

  await client.put(PREFIX + endpoint, event);
}

export async function deleteEvent(eventId: string) {
  const endpoint = "/v1/events/" + eventId;

  await client.delete(PREFIX + endpoint);
}

// Participants
export async function loadParticipants(
  eventId: string
): Promise<EventParticipant[]> {
  const endpoint = `/v1/events/${eventId}/participants`;
  return (await client.get<EventParticipant[]>(PREFIX + endpoint)).data;
}

export async function removeParticipant(eventId: string, userId: string) {
  const endpoint = `/v1/events/${eventId}/participants/${userId}`;
  await client.delete(PREFIX + endpoint);
}

export async function updateParticipantPaymentStatus(
  participantId: string,
  status: "pending" | "completed"
): Promise<EventParticipant> {
  const endpoint = `/v1/participants/${participantId}/payments`;

  return (await client.patch(PREFIX + endpoint, { status })).data;
}

// Join/Leave
export async function joinEvent(eventId: string) {
  const endpoint = `/v1/events/${eventId}/join`;
  await client.post(PREFIX + endpoint);
}

export async function leaveEvent(eventId: string) {
  const endpoint = `/v1/events/${eventId}/leave`;
  await client.post(PREFIX + endpoint);
}

// Waitlist
export async function loadEventWaitlist(eventId: string) {
  const endpoint = `/v1/events/${eventId}/waitlist`;
  return (await client.get(PREFIX + endpoint)).data;
}

export async function joinEventWaitlist(eventId: string) {
  const endpoint = `/v1/events/${eventId}/waitlist`;
  await client.post(PREFIX + endpoint);
}

export async function leaveEventWaitlist(eventId: string) {
  const endpoint = `/v1/events/${eventId}/waitlist`;
  await client.delete(PREFIX + endpoint);
}

// Organizer actions
export async function cancelEvent(eventId: string) {
  const endpoint = `/v1/events/${eventId}/cancel`;
  await client.post(PREFIX + endpoint);
}
