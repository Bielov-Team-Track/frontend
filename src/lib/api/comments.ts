import { Comment } from "../models/Comment";
import {
	CreateEventCommentRequest,
	EventComment,
	EventCommentsResponse,
	UpdateEventCommentRequest,
} from "../models/EventComment";
import client from "./client";

const PREFIX = "/social/v1";

// =============================================================================
// LEGACY API (Simple comments - keeping for backwards compatibility)
// =============================================================================

export async function loadComments(
	eventId: string,
	cursor?: string,
	limit?: number
): Promise<Comment[]> {
	const endpoint = "/events/" + eventId + "/comments";
	try {
		return (
			await client.get<Comment[]>(PREFIX + endpoint, {
				params: { cursor, limit },
			})
		).data;
	} catch (error: any) {
		console.error("Error loading comments:", error.response);
		return [];
	}
}

export async function createComment(eventId: string, content: string): Promise<Comment> {
	const endpoint = "/events/" + eventId + "/comments";
	return (await client.post<Comment>(PREFIX + endpoint, { content })).data;
}

// =============================================================================
// ENHANCED API (Rich comments with media, reactions, replies)
// =============================================================================

export async function getEventComments(
	eventId: string,
	cursor?: string,
	limit: number = 20
): Promise<EventCommentsResponse> {
	const endpoint = `/events/${eventId}/comments`;
	const response = await client.get<EventCommentsResponse>(PREFIX + endpoint, {
		params: { cursor, limit },
	});
	return response.data;
}

export async function getEventComment(eventId: string, commentId: string): Promise<EventComment> {
	const endpoint = `/events/${eventId}/comments/${commentId}`;
	const response = await client.get<EventComment>(PREFIX + endpoint);
	return response.data;
}

export async function createEventComment(
	eventId: string,
	data: CreateEventCommentRequest
): Promise<EventComment> {
	const endpoint = `/events/${eventId}/comments`;
	const response = await client.post<EventComment>(PREFIX + endpoint, data);
	return response.data;
}

export async function updateEventComment(
	eventId: string,
	commentId: string,
	data: UpdateEventCommentRequest
): Promise<EventComment> {
	const endpoint = `/events/${eventId}/comments/${commentId}`;
	const response = await client.put<EventComment>(PREFIX + endpoint, data);
	return response.data;
}

export async function deleteEventComment(eventId: string, commentId: string): Promise<void> {
	const endpoint = `/events/${eventId}/comments/${commentId}`;
	await client.delete(PREFIX + endpoint);
}

// =============================================================================
// REACTIONS
// =============================================================================

export async function addEventCommentReaction(
	eventId: string,
	commentId: string,
	emoji: string
): Promise<void> {
	const endpoint = `/events/${eventId}/comments/${commentId}/reactions`;
	await client.post(PREFIX + endpoint, { emoji });
}

export async function removeEventCommentReaction(
	eventId: string,
	commentId: string,
	emoji: string
): Promise<void> {
	const endpoint = `/events/${eventId}/comments/${commentId}/reactions/${encodeURIComponent(emoji)}`;
	await client.delete(PREFIX + endpoint);
}

// =============================================================================
// MENTIONS
// =============================================================================

export async function getEventMentionSuggestions(
	eventId: string,
	query: string
): Promise<{ userId: string; displayName: string; avatarUrl?: string }[]> {
	const endpoint = `/events/${eventId}/mentions/suggestions`;
	const response = await client.get(PREFIX + endpoint, { params: { query } });
	return response.data;
}
