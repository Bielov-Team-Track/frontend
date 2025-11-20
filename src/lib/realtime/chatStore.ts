import { create } from "zustand";
import { Chat, Message } from "@/lib/models/Messages";

type ChatState = {
	chats: Record<string, Chat>;
	connectionStatus:
		| "disconnected"
		| "connecting"
		| "connected"
		| "reconnecting";
	setChats: (chats: Chat[]) => void;
	setConnectionStatus: (
		status: "disconnected" | "connecting" | "connected" | "reconnecting",
	) => void;
	applyNewChat: (chat: Chat) => void;
	applyNewMessage: (chatId: string, message: Message) => void;
	applyMessageRead: (chatId: string, messageId: string) => void;
	applyChatUpdated: (chat: Chat) => void;
	upsert: (chat: Chat) => void;
	reset: () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
	chats: {},
	connectionStatus: "disconnected",

	setChats: (chats) =>
		set(() => ({
			chats: chats.reduce(
				(acc, c) => {
					acc[c.id] = c;
					return acc;
				},
				{} as Record<string, Chat>,
			),
		})),

	setConnectionStatus: (status) => set(() => ({ connectionStatus: status })),

	upsert: (chat) =>
		set((s) => ({ chats: { ...s.chats, [chat.id]: chat } })),

	applyNewChat: (chat) =>
		set((s) => ({
			chats: {
				[chat.id]: chat,
				...s.chats,
			},
		})),

	applyNewMessage: (chatId, message) =>
		set((s) => {
			const chat = s.chats[chatId];
			if (!chat) return {};

			return {
				chats: {
					...s.chats,
					[chatId]: {
						...chat,
						lastMessage: message,
						unreadCount: chat.unreadCount + 1,
					},
				},
			};
		}),

	applyMessageRead: (chatId, messageId) =>
		set((s) => {
			const chat = s.chats[chatId];
			if (!chat) return {};

			return {
				chats: {
					...s.chats,
					[chatId]: {
						...chat,
						unreadCount: Math.max(0, chat.unreadCount - 1),
					},
				},
			};
		}),

	applyChatUpdated: (chat) =>
		set((s) => {
			if (!s.chats[chat.id]) return {};

			return {
				chats: {
					...s.chats,
					[chat.id]: chat,
				},
			};
		}),

	reset: () => set(() => ({ chats: {}, connectionStatus: "disconnected" })),
}));
