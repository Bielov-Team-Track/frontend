import { CursorPagedResult } from "../models/Pagination";
import { Chat, Message, MessageReaction } from "../models/Messages";

export interface MessagesAroundResult {
	messages: Message[];
	hasOlderMessages: boolean;
	hasNewerMessages: boolean;
	anchorIndex: number;
}
import { UserProfile } from "../models/User";
import client from "./client";

const PREFIX = "messages/v1";

export async function getUnreadMessageCount(): Promise<number> {
	const { data } = await client.get(`${PREFIX}/chats/unread-count`);
	return data.count;
}

export async function loadConversationsForUser(params?: {
	search?: string;
	cursor?: string;
	limit?: number;
}): Promise<CursorPagedResult<Chat>> {
	const endpoint = `/chats/me`;
	const queryParams: Record<string, string | number> = {};
	if (params?.search?.trim()) queryParams.search = params.search.trim();
	if (params?.cursor) queryParams.cursor = params.cursor;
	if (params?.limit) queryParams.limit = params.limit;

	return (await client.get(PREFIX + endpoint, { params: queryParams })).data;
}

export async function createChat(users: UserProfile[]): Promise<Chat> {
	const endpoint = `/chats`;

	return (
		await client.post(PREFIX + endpoint, {
			participantIds: users.map((u) => u.id),
		})
	).data;
}

export interface UploadUrlResponse {
	mediaId: string;
	uploadUrl: string;
	finalUrl: string;
}

export interface CreateEmbedInput {
	url: string;
	title?: string | null;
	thumbnailUrl?: string | null;
	provider: string;
	embedUrl: string;
}

export async function sendMessage(
	chatId: string,
	content: string,
	mediaIds?: string[],
	embeds?: CreateEmbedInput[]
): Promise<Message> {
	const endpoint = `/chats/${chatId}/messages`;
	return (await client.post<Message>(PREFIX + endpoint, { content, mediaIds, embeds })).data;
}

export async function getMediaUploadUrl(
	contentType: string,
	fileName: string,
	fileSize: number,
	thumbHash?: string
): Promise<UploadUrlResponse> {
	const response = await client.post<UploadUrlResponse>(`${PREFIX}/media/upload-url`, {
		contentType,
		fileName,
		fileSize,
		thumbHash,
	});
	return response.data;
}

export async function uploadFileToS3(uploadUrl: string, file: File, contentType?: string): Promise<void> {
	const response = await fetch(uploadUrl, {
		method: "PUT",
		body: file,
		headers: {
			"Content-Type": contentType || file.type || "application/octet-stream",
		},
	});

	if (!response.ok) {
		throw new Error(`Upload failed with status ${response.status}`);
	}
}

export async function deleteMedia(mediaId: string): Promise<void> {
	await client.delete(`${PREFIX}/media/${mediaId}`);
}

export async function loadMessagesForChat(chatId: string, skip = 0, take = 50): Promise<Message[]> {
	const endpoint = `/chats/${chatId}/messages`;
	return (await client.get(PREFIX + endpoint, { params: { skip, take } })).data;
}

export async function loadMessagesAroundId(chatId: string, messageId: string): Promise<MessagesAroundResult> {
	const endpoint = `/chats/${chatId}/messages/around/${messageId}`;
	return (await client.get(PREFIX + endpoint)).data;
}

export async function markChatAsRead(chatId: string, lastReadMessageId?: string): Promise<Chat> {
	const endpoint = `/chats/${chatId}/read`;
	return (await client.post(PREFIX + endpoint, lastReadMessageId ? { lastReadMessageId } : undefined)).data;
}

export async function addParticipants(chatId: string, userIds: string[]): Promise<void> {
	const endpoint = `/chats/${chatId}/participants`;
	return await client.post(PREFIX + endpoint, userIds);
}

export async function removeParticipant(chatId: string, userId: string): Promise<void> {
	const endpoint = `/chats/${chatId}/participants/${userId}`;
	return await client.delete(PREFIX + endpoint);
}

export async function getChat(chatId: string): Promise<Chat> {
	const endpoint = `/chats/${chatId}`;
	return (await client.get(PREFIX + endpoint)).data;
}
export async function addReaction(messageId: string, emoji: string): Promise<MessageReaction> {
	const response = await client.post(`/messages/v1/messages/${messageId}/reactions`, { emoji });
	return response.data;
}

export async function removeReaction(messageId: string, emoji: string): Promise<void> {
	await client.delete(`/messages/v1/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
}

export async function forwardMessage(messageId: string, targetChatId: string): Promise<Message> {
	const response = await client.post(`/messages/v1/messages/${messageId}/forward`, { targetChatId });
	return response.data;
}

export async function createEventChat(eventId: string, title?: string, eventName?: string, participantIds?: string[]): Promise<Chat> {
	const params = new URLSearchParams();
	if (eventName) params.append("eventName", eventName);
	if (participantIds) participantIds.forEach((id) => params.append("participantIds", id));

	const response = await client.post(`/messages/v1/chats/event/${eventId}?${params.toString()}`, { title });
	return response.data;
}

export async function createTeamChat(teamId: string, title?: string, teamName?: string, participantIds?: string[]): Promise<Chat> {
	const params = new URLSearchParams();
	if (teamName) params.append("teamName", teamName);
	if (participantIds) participantIds.forEach((id) => params.append("participantIds", id));

	const response = await client.post(`/messages/v1/chats/team/${teamId}?${params.toString()}`, { title });
	return response.data;
}

export async function getWardChats(wardId: string): Promise<Chat[]> {
	const response = await client.get(`/messages/v1/chats/ward/${wardId}`);
	return response.data;
}

export async function editMessage(
	messageId: string,
	content: string,
	addMediaIds?: string[],
	removeAttachmentIds?: string[]
): Promise<Message> {
	const { data } = await client.put(`${PREFIX}/messages/${messageId}`, {
		content,
		addMediaIds,
		removeAttachmentIds,
	});
	return data;
}

export async function deleteMessage(messageId: string): Promise<void> {
	await client.delete(`${PREFIX}/messages/${messageId}`);
}

export async function restoreMessage(messageId: string): Promise<Message> {
	const { data } = await client.post(`${PREFIX}/messages/${messageId}/restore`);
	return data;
}
