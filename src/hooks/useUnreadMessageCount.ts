"use client";

import { useChatStore } from "@/lib/realtime/chatStore";

/**
 * Hook to calculate total unread message count across all chats
 * @returns Total number of unread messages
 */
export function useUnreadMessageCount(): number {
	return useChatStore((state) => {
		const chats = Object.values(state.chats);
		return chats.reduce(
			(total, chat) => total + (chat.unreadCount ? 1 : 0),
			0
		);
	});
}
