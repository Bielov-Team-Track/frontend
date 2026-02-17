"use client";

import { deleteAllNotifications, deleteNotification, getNotifications, getUnreadCount, markAllAsRead, markAsRead } from "@/lib/api/notifications";
import { NotificationFilters } from "@/lib/models/Notification";
import { useNotificationStore } from "@/lib/realtime/notificationStore";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

export const NOTIFICATIONS_QUERY_KEY = "notifications";

export function useNotificationsQuery(filters: NotificationFilters = {}) {
	const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

	return useQuery({
		queryKey: [NOTIFICATIONS_QUERY_KEY, filters],
		queryFn: async () => {
			const response = await getNotifications(filters);
			setUnreadCount(response.unreadCount);
			return response;
		},
	});
}

export function useInfiniteNotifications(filters: Omit<NotificationFilters, "cursor"> = {}) {
	const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

	return useInfiniteQuery({
		queryKey: [NOTIFICATIONS_QUERY_KEY, "infinite", filters],
		queryFn: async ({ pageParam }) => {
			const response = await getNotifications({
				...filters,
				cursor: pageParam,
				limit: filters.limit ?? 20,
			});
			if (!pageParam) setUnreadCount(response.unreadCount);
			return response;
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
	});
}

export function useMarkAsRead() {
	const queryClient = useQueryClient();
	const decrementUnread = useNotificationStore((s) => s.decrementUnread);
	const pendingIds = useRef<Set<string>>(new Set());
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const mutation = useMutation({
		mutationFn: markAsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
		},
	});

	const markRead = useCallback(
		(notificationId: string) => {
			pendingIds.current.add(notificationId);
			decrementUnread(1);

			if (timeoutRef.current) clearTimeout(timeoutRef.current);

			timeoutRef.current = setTimeout(() => {
				const ids = Array.from(pendingIds.current);
				pendingIds.current.clear();
				if (ids.length > 0) mutation.mutate(ids);
			}, 300);
		},
		[decrementUnread, mutation]
	);

	return { markRead, isLoading: mutation.isPending };
}

export function useMarkAllAsRead() {
	const queryClient = useQueryClient();
	const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

	return useMutation({
		mutationFn: markAllAsRead,
		onMutate: () => setUnreadCount(0),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
		},
		onError: () => {
			queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
		},
	});
}

export function useDeleteNotification() {
	const queryClient = useQueryClient();
	const decrementUnread = useNotificationStore((s) => s.decrementUnread);

	return useMutation({
		mutationFn: ({ id, wasUnread }: { id: string; wasUnread: boolean }) => deleteNotification(id),
		onMutate: ({ wasUnread }) => {
			if (wasUnread) decrementUnread(1);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
		},
		onError: (_, { wasUnread }) => {
			if (wasUnread) queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
		},
	});
}

export function useDeleteAllNotifications() {
	const queryClient = useQueryClient();
	const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

	return useMutation({
		mutationFn: deleteAllNotifications,
		onMutate: () => setUnreadCount(0),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
		},
		onError: () => {
			queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
		},
	});
}

export function useUnreadCount() {
	const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

	return useQuery({
		queryKey: [NOTIFICATIONS_QUERY_KEY, "unreadCount"],
		queryFn: async () => {
			const response = await getUnreadCount();
			setUnreadCount(response.count);
			return response.count;
		},
		staleTime: 30000,
	});
}
