"use client";

import { getUnreadMessageCount } from "@/lib/api/messages";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const QUERY_KEY = ["unread-message-count"];

/**
 * Hook to get total unread message count across all chats.
 * Fetches from backend on mount, and can be invalidated by real-time events.
 */
export function useUnreadMessageCount(): number {
	const { data } = useQuery({
		queryKey: QUERY_KEY,
		queryFn: getUnreadMessageCount,
		staleTime: 1000 * 60 * 2,
		refetchOnWindowFocus: true,
	});

	return data ?? 0;
}

/**
 * Returns helpers to optimistically update the unread count
 * without waiting for a server round-trip.
 */
export function useUnreadMessageCountUpdater() {
	const queryClient = useQueryClient();

	const increment = useCallback(
		(by = 1) => {
			queryClient.setQueryData<number>(QUERY_KEY, (old) => (old ?? 0) + by);
		},
		[queryClient]
	);

	const decrement = useCallback(
		(by: number) => {
			queryClient.setQueryData<number>(QUERY_KEY, (old) => Math.max(0, (old ?? 0) - by));
		},
		[queryClient]
	);

	const invalidate = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: QUERY_KEY });
	}, [queryClient]);

	return { increment, decrement, invalidate };
}
