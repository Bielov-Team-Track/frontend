import client from "../client";
import { Chat, Message } from "../models/Messages";
import { UserProfile } from "../models/User";

const PREFIX = "messages/v1";

export async function loadConversationsForUser(): Promise<Chat[]> {
	const endpoint = `/chats/me`;

	return (await client.get(PREFIX + endpoint)).data;
}

export async function createChat(users: UserProfile[]): Promise<Chat> {
	const endpoint = `/chats`;

	return (
		await client.post(PREFIX + endpoint, {
			participantIds: users.map((u) => u.userId),
		})
	).data;
}

export async function sendMessage(
	chatId: string,
	content: string
): Promise<void> {
	const endpoint = `/chats/${chatId}/messages`;
	return await client.post(PREFIX + endpoint, { content });
}

export async function loadMessagesForChat(chatId: string): Promise<Message[]> {
	const endpoint = `/chats/${chatId}/messages`;
	return (await client.get(PREFIX + endpoint)).data;
}

export async function addParticipants(
	chatId: string,
	userIds: string[]
): Promise<void> {
	const endpoint = `/chats/${chatId}/participants`;
	return await client.post(PREFIX + endpoint, userIds);
}

export async function removeParticipant(
	chatId: string,
	userId: string
): Promise<void> {
	const endpoint = `/chats/${chatId}/participants/${userId}`;
	return await client.delete(PREFIX + endpoint);
}

export async function getChat(chatId: string): Promise<Chat> {
	const endpoint = `/chats/${chatId}`;
	return (await client.get(PREFIX + endpoint)).data;
}
