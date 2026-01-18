"use client";

import { cn } from "@/lib/utils";

interface MentionBadgeProps {
	userId?: string;
	displayName: string;
	isEveryone?: boolean;
	onClick?: () => void;
}

export default function MentionBadge({ userId, displayName, isEveryone, onClick }: MentionBadgeProps) {
	return (
		<span
			onClick={onClick}
			className={cn(
				"inline-flex items-center px-1.5 py-0.5 rounded bg-primary/20 text-primary text-sm font-medium",
				onClick && "cursor-pointer hover:bg-primary/30 transition-colors"
			)}
			data-user-id={userId}
			data-everyone={isEveryone}>
			@{displayName}
		</span>
	);
}
