"use client";

import { getNotificationLink, Notification } from "@/lib/models/Notification";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { getNotificationIconConfig, NotificationIcon } from "./NotificationIcon";

interface NotificationItemProps {
	notification: Notification;
	variant?: "compact" | "full";
	onRead?: () => void;
	onClick?: () => void;
}

function isHighPriority(notification: Notification): boolean {
	// High priority: payment required, registration denied
	if (notification.category === "payments") {
		const eventType = notification.eventType.toLowerCase();
		if (eventType.includes("reminder") || eventType.includes("required")) {
			return true;
		}
	}

	if (notification.category === "registrations") {
		const status = notification.payload?.status as string | undefined;
		if (status?.toLowerCase() === "denied" || status?.toLowerCase() === "rejected") {
			return true;
		}
	}

	return false;
}

export function NotificationItem({ notification, variant = "compact", onRead, onClick }: NotificationItemProps) {
	const router = useRouter();
	const highPriority = isHighPriority(notification);
	const link = getNotificationLink(notification);
	const iconConfig = getNotificationIconConfig(notification);

	const handleClick = useCallback(() => {
		if (!notification.isRead && onRead) {
			onRead();
		}

		if (onClick) {
			onClick();
		}

		if (link) {
			router.push(link);
		}
	}, [notification.isRead, onRead, onClick, link, router]);

	const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
		addSuffix: true,
	});

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn(
				"relative flex w-full gap-3 rounded-lg p-3 text-left transition-colors",
				"hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				!notification.isRead && "bg-surface/50",
				variant === "full" && "p-4"
			)}>
			{/* Priority indicator bar */}
			<div
				className={cn(
					"absolute left-0 top-2 bottom-2 w-0.5 rounded-full",
					highPriority ? "bg-primary" : !notification.isRead ? "bg-active" : "bg-transparent"
				)}
			/>

			{/* Icon */}
			<NotificationIcon notification={notification} />

			{/* Content */}
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-start justify-between gap-2">
					<p className={cn("text-sm font-medium leading-tight", variant === "compact" && "line-clamp-1")}>{notification.title}</p>
					<span className="shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
				</div>

				<p className={cn("text-sm text-muted-foreground", variant === "compact" ? "line-clamp-1" : "line-clamp-2")}>{notification.body}</p>
			</div>

			{/* Unread indicator dot */}
			{!notification.isRead && (
				<div className="absolute right-3 top-3">
					<div className="size-2 rounded-full bg-primary" />
				</div>
			)}
		</button>
	);
}
