"use client";

import { Button } from "@/components/ui/button";
import { useMarkAllAsRead, useMarkAsRead, useNotificationsQuery } from "@/hooks/useNotifications";
import { useNotificationStore } from "@/lib/realtime/notificationStore";
import { cn } from "@/lib/utils";
import { Bell, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { NotificationItem } from "./NotificationItem";

interface NotificationDropdownProps {
	onClose?: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
	const { data, isLoading } = useNotificationsQuery({ limit: 10 });
	const { markRead } = useMarkAsRead();
	const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
	const unreadCount = useNotificationStore((s) => s.unreadCount);

	const notifications = data?.items || [];
	const hasNotifications = notifications.length > 0;

	return (
		<div className="flex w-80 flex-col">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border px-4 py-3">
				<h2 className="text-sm font-semibold">Notifications</h2>
				{unreadCount > 0 && (
					<Button variant="ghost" size="xs" onClick={() => markAllAsRead()} disabled={isMarkingAll}>
						{isMarkingAll ? <Loader2 className="size-3 animate-spin" /> : "Mark all read"}
					</Button>
				)}
			</div>

			{/* Content */}
			<div className="max-h-96 overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="size-5 animate-spin text-muted-foreground" />
					</div>
				) : !hasNotifications ? (
					<div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
						<div className="flex size-12 items-center justify-center rounded-full bg-muted/50">
							<Bell className="size-5 text-muted-foreground" />
						</div>
						<p className="text-sm text-muted-foreground">No notifications yet</p>
					</div>
				) : (
					<div className="flex flex-col py-1">
						{notifications.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								variant="compact"
								onRead={() => markRead(notification.id)}
								onClick={onClose}
							/>
						))}
					</div>
				)}
			</div>

			{/* Footer */}
			{hasNotifications && (
				<div className="border-t border-border p-2">
					<Link
						href="/hub/notifications"
						onClick={onClose}
						className={cn(
							"flex w-full items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium",
							"text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
						)}>
						View all notifications
						<ChevronRight className="size-4" />
					</Link>
				</div>
			)}
		</div>
	);
}
