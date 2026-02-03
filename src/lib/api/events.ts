import client from "./client";
import { CreateEvent, CreateEventSeries, Event, EventFilterRequest, EventSeries } from "../models/Event";
import { EventParticipant } from "../models/EventParticipant";
import { UploadUrlResponse } from "../models/shared/models";
import { getParamsFromObject } from "../utils/request";

const PREFIX = "/events";

export async function loadEvents(
	filter?: EventFilterRequest,
): Promise<Event[]> {
	const endpoint = "/v1/events";

	const params = getParamsFromObject(filter);

	return (await client.get<Event[]>(PREFIX + endpoint, { params })).data;
}

export async function loadEventsByFilter(
	filter?: EventFilterRequest,
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
	eventId: string,
): Promise<EventParticipant[]> {
	const endpoint = `/v1/events/${eventId}/participants`;
	return (await client.get<EventParticipant[]>(PREFIX + endpoint)).data;
}

export async function getMyParticipation(
	eventId: string,
): Promise<EventParticipant | null> {
	const endpoint = `/v1/events/${eventId}/participants/me`;
	try {
		return (await client.get<EventParticipant>(PREFIX + endpoint)).data;
	} catch {
		return null;
	}
}

export async function inviteUsers(
	eventId: string,
	userIds: string[],
): Promise<EventParticipant[]> {
	const endpoint = `/v1/events/${eventId}/participants/invite`;
	return (await client.post<EventParticipant[]>(PREFIX + endpoint, { userIds })).data;
}

export async function respondToInvitation(
	eventId: string,
	accept: boolean,
	declineNote?: string,
): Promise<EventParticipant> {
	const endpoint = `/v1/events/${eventId}/participants/respond`;
	return (await client.post<EventParticipant>(PREFIX + endpoint, { accept, declineNote })).data;
}

export async function removeParticipant(eventId: string, userId: string) {
	const endpoint = `/v1/events/${eventId}/participants/${userId}`;
	await client.delete(PREFIX + endpoint);
}

export async function updateParticipantPaymentStatus(
	participantId: string,
	status: "pending" | "completed",
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

// Event Series API

/**
 * Create a new recurring event series.
 * The backend will generate all individual events based on the recurrence pattern.
 */
export async function createEventSeries(series: CreateEventSeries): Promise<EventSeries> {
	const endpoint = "/v1/events/series";
	return (await client.post<EventSeries>(PREFIX + endpoint, series)).data;
}

/**
 * Load an event series by ID, including all its events.
 */
export async function loadEventSeries(seriesId: string): Promise<EventSeries> {
	const endpoint = `/v1/events/series/${seriesId}`;
	return (await client.get<EventSeries>(PREFIX + endpoint)).data;
}

/**
 * Load all events in a series.
 */
export async function loadSeriesEvents(seriesId: string): Promise<Event[]> {
	const endpoint = `/v1/events/series/${seriesId}/events`;
	return (await client.get<Event[]>(PREFIX + endpoint)).data;
}

/**
 * Load all series created by the current user.
 */
export async function loadMySeries(): Promise<EventSeries[]> {
	const endpoint = "/v1/me/events/series";
	return (await client.get<EventSeries[]>(PREFIX + endpoint)).data;
}

/**
 * Cancel an entire event series.
 */
export async function cancelEventSeries(seriesId: string): Promise<void> {
	const endpoint = `/v1/events/series/${seriesId}/cancel`;
	await client.post(PREFIX + endpoint);
}

/**
 * Update an event within a series with a specified scope.
 */
export type SeriesUpdateScope = "thisEventOnly" | "allFutureEvents" | "allEvents";

export interface UpdateSeriesEventRequest {
	eventUpdate: Partial<Event>;
	scope: SeriesUpdateScope;
}

export async function updateSeriesEvent(
	eventId: string,
	request: UpdateSeriesEventRequest
): Promise<Event> {
	const endpoint = `/v1/events/${eventId}/series`;
	return (await client.put<Event>(PREFIX + endpoint, request)).data;
}

/**
 * Detach an event from its series, allowing independent modification.
 */
export async function detachFromSeries(eventId: string): Promise<Event> {
	const endpoint = `/v1/events/${eventId}/detach`;
	return (await client.post<Event>(PREFIX + endpoint)).data;
}

// =============================================================================
// MEDIA UPLOAD
// =============================================================================

export async function getEventMediaUploadUrl(
	contentType: string,
	fileName: string,
	fileSize: number
): Promise<UploadUrlResponse> {
	const endpoint = "/v1/media/upload-url";
	const response = await client.post<UploadUrlResponse>(PREFIX + endpoint, {
		contentType,
		fileName,
		fileSize,
	});
	return response.data;
}

export async function uploadFileToStorage(
	uploadUrl: string,
	file: File,
	contentType?: string
): Promise<void> {
	await fetch(uploadUrl, {
		method: "PUT",
		body: file,
		headers: {
			"Content-Type": contentType || file.type || "application/octet-stream",
		},
	});
}
