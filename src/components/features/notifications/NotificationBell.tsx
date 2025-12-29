"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNotificationStore } from "@/lib/realtime/notificationStore";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { useCallback, useState } from "react";

import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
	const [open, setOpen] = useState(false);
	const unreadCount = useNotificationStore((s) => s.unreadCount);
	const setDropdownOpen = useNotificationStore((s) => s.setDropdownOpen);

	const handleOpenChange = useCallback(
		(isOpen: boolean) => {
			setOpen(isOpen);
			setDropdownOpen(isOpen);
		},
		[setDropdownOpen]
	);

	const handleClose = useCallback(() => {
		setOpen(false);
		setDropdownOpen(false);
	}, [setDropdownOpen]);

	return (
		<DropdownMenu open={open} onOpenChange={handleOpenChange}>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" size="icon" className="relative">
						<Bell className="size-5" />
						{unreadCount > 0 && (
							<span
								className={cn(
									"absolute -right-0.5 -top-0.5 flex items-center justify-center",
									"min-w-4 rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground",
									unreadCount > 99 && "min-w-5"
								)}>
								{unreadCount > 99 ? "99+" : unreadCount}
							</span>
						)}
						<span className="sr-only">{unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}</span>
					</Button>
				}
			/>
			<DropdownMenuContent align="end" sideOffset={8} className="w-80 p-0 overflow-hidden">
				<NotificationDropdown onClose={handleClose} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
