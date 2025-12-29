"use client";

import { Notification, NotificationCategory } from "@/lib/models/Notification";
import { cn } from "@/lib/utils";
import { Bell, Building2, Calendar, Clock, CreditCard, Hourglass, LucideIcon, Mail, MessageSquare, UserCheck, Users, UserX } from "lucide-react";

interface NotificationIconProps {
	notification: Notification;
	className?: string;
}

type IconConfig = {
	icon: LucideIcon;
	colorClass: string;
	bgClass: string;
};

function getRegistrationIcon(payload: Record<string, unknown>): IconConfig {
	const status = payload?.newStatus as string | undefined;

	switch (status?.toLowerCase()) {
		case "accepted":
		case "approved":
			return {
				icon: UserCheck,
				colorClass: "text-success",
				bgClass: "bg-success/10",
			};
		case "declined":
		case "rejected":
			return {
				icon: UserX,
				colorClass: "text-destructive",
				bgClass: "bg-destructive/10",
			};
		case "waitlist":
			return {
				icon: Clock,
				colorClass: "text-info",
				bgClass: "bg-info/10",
			};
		case "pending":
			return {
				icon: Hourglass,
				colorClass: "text-warning",
				bgClass: "bg-warning/10",
			};
		default:
			return {
				icon: UserCheck,
				colorClass: "text-muted-foreground",
				bgClass: "bg-muted/50",
			};
	}
}

function getCategoryIcon(category: NotificationCategory): IconConfig {
	const configs: Record<NotificationCategory, IconConfig> = {
		registrations: {
			icon: UserCheck,
			colorClass: "text-muted-foreground",
			bgClass: "bg-muted/50",
		},
		invitations: {
			icon: Mail,
			colorClass: "text-primary",
			bgClass: "bg-primary/10",
		},
		events: {
			icon: Calendar,
			colorClass: "text-secondary",
			bgClass: "bg-secondary/10",
		},
		payments: {
			icon: CreditCard,
			colorClass: "text-warning",
			bgClass: "bg-warning/10",
		},
		teamAssignments: {
			icon: Users,
			colorClass: "text-info",
			bgClass: "bg-info/50",
		},
		clubUpdates: {
			icon: Building2,
			colorClass: "text-secondary",
			bgClass: "bg-secondary/10",
		},
		messages: {
			icon: MessageSquare,
			colorClass: "text-primary",
			bgClass: "bg-primary/10",
		},
		posts: {
			icon: Bell,
			colorClass: "text-muted-foreground",
			bgClass: "bg-muted/50",
		},
	};

	return configs[category] || configs.posts;
}

export function getNotificationIconConfig(notification: Notification): IconConfig {
	if (notification.category.toLowerCase() === "registrations") {
		return getRegistrationIcon(notification.payload);
	}
	return getCategoryIcon(notification.category);
}

export function NotificationIcon({ notification, className }: NotificationIconProps) {
	const config = getNotificationIconConfig(notification);
	const Icon = config.icon;

	return (
		<div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", config.bgClass, className)}>
			<Icon className={cn("size-4", config.colorClass)} />
		</div>
	);
}
