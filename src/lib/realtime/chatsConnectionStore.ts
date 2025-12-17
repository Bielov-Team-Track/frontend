import { HubConnection } from "@microsoft/signalr";
import { create } from "zustand";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

type ChatConnectionState = {
	// Connection state
	connection: HubConnection | null;
	connectionStatus: ConnectionStatus;

	// Ephemeral state (not persisted, real-time only)
	usersTyping: Record<string, string[]>; // chatId -> array of userIds typing
	onlineUsers: Set<string>; // set of online userIds
	currentChatId: string | null; // currently active chat for SignalR group

	// Connection actions
	setConnection: (connection: HubConnection | null) => void;
	setConnectionStatus: (status: ConnectionStatus) => void;

	// Ephemeral state actions
	setUserTyping: (chatId: string, userId: string, isTyping: boolean) => void;
	clearTypingForChat: (chatId: string) => void;
	setUserOnline: (userId: string, isOnline: boolean) => void;
	setCurrentChatId: (chatId: string | null) => void;
};

export const useChatConnectionStore = create<ChatConnectionState>((set) => ({
	// Initial state
	connection: null,
	connectionStatus: "disconnected",
	usersTyping: {},
	onlineUsers: new Set<string>(),
	currentChatId: null,

	// Connection actions
	setConnection: (connection) => set({ connection }),
	setConnectionStatus: (status) => set({ connectionStatus: status }),

	// Ephemeral state actions
	setUserTyping: (chatId, userId, isTyping) => {
		set((state) => {
			const currentTyping = state.usersTyping[chatId] || [];
			let updatedTyping: string[];

			if (isTyping) {
				updatedTyping = currentTyping.includes(userId) ? currentTyping : [...currentTyping, userId];
			} else {
				updatedTyping = currentTyping.filter((id) => id !== userId);
			}

			return {
				usersTyping: {
					...state.usersTyping,
					[chatId]: updatedTyping,
				},
			};
		});
	},

	clearTypingForChat: (chatId) => {
		set((state) => {
			const { [chatId]: _, ...rest } = state.usersTyping;
			return { usersTyping: rest };
		});
	},

	setUserOnline: (userId, isOnline) => {
		set((state) => {
			const updatedOnlineUsers = new Set(state.onlineUsers);
			if (isOnline) {
				updatedOnlineUsers.add(userId);
			} else {
				updatedOnlineUsers.delete(userId);
			}
			return { onlineUsers: updatedOnlineUsers };
		});
	},

	setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
}));

// Selector hooks for specific state slices
export const useConnectionStatus = () => useChatConnectionStore((state) => state.connectionStatus);
export const useTypingUsers = (chatId: string) => useChatConnectionStore((state) => state.usersTyping[chatId] || []);
export const useIsUserOnline = (userId: string) => useChatConnectionStore((state) => state.onlineUsers.has(userId));
export const useCurrentChatId = () => useChatConnectionStore((state) => state.currentChatId);
