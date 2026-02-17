"use client";

import { Checkbox, Select } from "@/components";
import { NotificationItem } from "@/components/features/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { useDeleteAllNotifications, useDeleteNotification, useInfiniteNotifications, useMarkAllAsRead, useMarkAsRead } from "@/hooks/useNotifications";
import { NotificationCategory } from "@/lib/models/Notification";
import { useNotificationStore } from "@/lib/realtime/notificationStore";
import { Bell, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const CATEGORY_OPTIONS: { value: NotificationCategory | "all"; label: string }[] = [
	{ value: "all", label: "All notifications" },
	{ value: "registrations", label: "Registrations" },
	{ value: "invitations", label: "Invitations" },
	{ value: "events", label: "Events" },
	{ value: "payments", label: "Payments" },
	{ value: "teamAssignments", label: "Team Assignments" },
	{ value: "clubUpdates", label: "Club Updates" },
	{ value: "messages", label: "Messages" },
];

export default function NotificationsClient() {
	const [category, setCategory] = useState<NotificationCategory | "all">("all");
	const [unreadOnly, setUnreadOnly] = useState(false);

	const filters = {
		category: category === "all" ? undefined : category,
		unreadOnly: unreadOnly || undefined,
		limit: 20,
	};

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteNotifications(filters);

	const { markRead } = useMarkAsRead();
	const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
	const { mutate: deleteOne } = useDeleteNotification();
	const { mutate: deleteAll, isPending: isDeletingAll } = useDeleteAllNotifications();
	const unreadCount = useNotificationStore((s) => s.unreadCount);

	// Flatten pages into single notifications array
	const notifications = data?.pages.flatMap((page) => page.items) || [];
	const hasNotifications = notifications.length > 0;

	// Infinite scroll observer
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadMoreRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (isFetchingNextPage) return;

			if (observerRef.current) {
				observerRef.current.disconnect();
			}

			observerRef.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasNextPage) {
					fetchNextPage();
				}
			});

			if (node) {
				observerRef.current.observe(node);
			}
		},
		[isFetchingNextPage, hasNextPage, fetchNextPage]
	);

	// Cleanup observer on unmount
	useEffect(() => {
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, []);

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-h1 font-bold">Notifications</h1>
					<p className="text-muted-foreground">
						{unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
					</p>
				</div>

				<div className="flex gap-2">
					{unreadCount > 0 && (
						<Button variant="outline" onClick={() => markAllAsRead()} disabled={isMarkingAll}>
							{isMarkingAll ? (
								<>
									<Loader2 className="size-4 animate-spin" />
									Marking...
								</>
							) : (
								"Mark all as read"
							)}
						</Button>
					)}

					{hasNotifications && (
						<Button variant="outline" onClick={() => deleteAll()} disabled={isDeletingAll} data-testid="delete-all-notifications">
							{isDeletingAll ? (
								<>
									<Loader2 className="size-4 animate-spin" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="size-4" />
									Delete all
								</>
							)}
						</Button>
					)}
				</div>
			</div>

			{/* Filters */}
			<div className="flex items-center gap-4">
				<Select
					value={category}
					onChange={(value) => setCategory((value as NotificationCategory) ?? "all")}
					className="w-fit"
					options={CATEGORY_OPTIONS}
					inlineLabel="Category"
				/>

				<Checkbox checked={unreadOnly} onChange={(checked) => setUnreadOnly(checked === true)} label="Unread only" />
			</div>

			{/* Notification list */}
			<div className="flex flex-col rounded-lg border border-border bg-surface/50">
				{isLoading ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : !hasNotifications ? (
					<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
						<div className="flex size-16 items-center justify-center rounded-full bg-muted/50">
							<Bell className="size-7 text-muted-foreground" />
						</div>
						<div>
							<p className="font-medium">No notifications</p>
							<p className="text-sm text-muted-foreground">
								{unreadOnly
									? "You have no unread notifications"
									: category !== "all"
									? `No notifications in this category`
									: "You don't have any notifications yet"}
							</p>
						</div>
					</div>
				) : (
					<>
						<div className="divide-y divide-border">
							{notifications.map((notification) => (
								<NotificationItem
									key={notification.id}
									notification={notification}
									variant="full"
									onRead={() => markRead(notification.id)}
									onDelete={() => deleteOne({ id: notification.id, wasUnread: !notification.isRead })}
								/>
							))}
						</div>

						{/* Load more trigger */}
						{hasNextPage && (
							<div ref={loadMoreRef} className="flex items-center justify-center py-4">
								{isFetchingNextPage && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
