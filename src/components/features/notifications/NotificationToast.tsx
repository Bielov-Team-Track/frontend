"use client";

import { Notification, getNotificationLink } from "@/lib/models/Notification";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { NotificationIcon } from "./NotificationIcon";

interface NotificationToastContentProps {
	notification: Notification;
	toastId: string | number;
}

export function NotificationToastContent({ notification, toastId }: NotificationToastContentProps) {
	const router = useRouter();
	const link = getNotificationLink(notification);

	const handleClick = useCallback(() => {
		toast.dismiss(toastId);
		if (link) {
			router.push(link);
		}
	}, [toastId, link, router]);

	const handleDismissClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			toast.dismiss(toastId);
		},
		[toastId]
	);

	return (
		<div
			role="alert"
			onClick={handleClick}
			className={cn(
				"pointer-events-auto w-80 cursor-pointer overflow-hidden rounded-lg",
				"bg-popover text-popover-foreground ring-1 ring-foreground/10",
				"shadow-xl"
			)}>
			<div className="flex items-center gap-3 p-3">
				<NotificationIcon notification={notification} />

				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<p className="line-clamp-1 text-sm font-medium">{notification.title}</p>
					<p className="line-clamp-1 text-sm text-muted-foreground">{notification.body}</p>
				</div>

				<button
					type="button"
					onClick={handleDismissClick}
					className={cn("shrink-0 rounded-md p-1 text-muted-foreground transition-colors", "hover:bg-surface-elevated hover:text-foreground")}>
					<X className="size-4" />
					<span className="sr-only">Dismiss</span>
				</button>
			</div>
		</div>
	);
}
