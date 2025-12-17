"use client";

import { Chat } from "@/lib/models/Messages";
import { useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

/**
 * Hook to calculate total unread message count across all chats
 * Uses React Query cache as the source of truth
 * @returns Total number of unread messages
 */
export function useUnreadMessageCount(): number {
	const queryClient = useQueryClient();

	return useSyncExternalStore(
		(callback) => {
			// Subscribe to changes in the chats query
			const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
				if (event.query.queryKey[0] === "chats") {
					callback();
				}
			});
			return unsubscribe;
		},
		() => {
			// Get current snapshot of unread count
			const chats = queryClient.getQueryData<Chat[]>(["chats"]);
			if (!chats) return 0;
			return chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
		},
		() => 0 // Server snapshot
	);
}
