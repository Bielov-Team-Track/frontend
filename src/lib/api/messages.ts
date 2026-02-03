import { Chat, Message, MessageReaction } from "../models/Messages";
import { UserProfile } from "../models/User";
import client from "./client";

const PREFIX = "messages/v1";

export async function loadConversationsForUser(): Promise<Chat[]> {
	const endpoint = `/chats/me`;

	return (await client.get(PREFIX + endpoint)).data;
}

export async function createChat(users: UserProfile[]): Promise<Chat> {
	const endpoint = `/chats`;

	return (
		await client.post(PREFIX + endpoint, {
			participantIds: users.map((u) => u.id),
		})
	).data;
}

export async function sendMessage(chatId: string, content: string): Promise<void> {
	const endpoint = `/chats/${chatId}/messages`;
	return await client.post(PREFIX + endpoint, { content });
}

export async function loadMessagesForChat(chatId: string): Promise<Message[]> {
	const endpoint = `/chats/${chatId}/messages`;
	return (await client.get(PREFIX + endpoint)).data;
}

export async function markChatAsRead(chatId: string): Promise<Chat> {
	const endpoint = `/chats/${chatId}/read`;
	return (await client.post(PREFIX + endpoint)).data;
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
