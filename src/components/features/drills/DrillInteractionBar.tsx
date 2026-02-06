"use client";

import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import DrillBookmarkButton from "./DrillBookmarkButton";
import DrillLikeButton from "./DrillLikeButton";

interface DrillInteractionBarProps {
	drillId: string;
	/** Initial like count from drill data */
	likeCount?: number;
	/** Initial bookmark state from drill data */
	isBookmarked?: boolean;
	/** Comment count to display */
	commentCount?: number;
	/** Whether to show the comment count/link */
	showComments?: boolean;
	/** Callback when comments button is clicked */
	onCommentsClick?: () => void;
	/** Variant style */
	variant?: "default" | "compact";
	/** Custom class name */
	className?: string;
}

export default function DrillInteractionBar({
	drillId,
	likeCount = 0,
	isBookmarked,
	commentCount,
	showComments = true,
	onCommentsClick,
	variant = "default",
	className,
}: DrillInteractionBarProps) {
	if (variant === "compact") {
		return (
			<div className={cn("flex items-center gap-4", className)}>
				<DrillLikeButton drillId={drillId} initialLikeCount={likeCount} variant="compact" />
				<DrillBookmarkButton drillId={drillId} initialIsBookmarked={isBookmarked} variant="compact" />
				{showComments && (
					<button
						onClick={onCommentsClick}
						className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-white transition-colors"
					>
						<MessageCircle size={14} />
						{commentCount !== undefined && commentCount > 0 && <span>{commentCount}</span>}
						<span className="hidden sm:inline">Comments</span>
					</button>
				)}
			</div>
		);
	}

	return (
		<div className={cn("flex items-center gap-3", className)}>
			<DrillLikeButton drillId={drillId} initialLikeCount={likeCount} />
			<DrillBookmarkButton drillId={drillId} initialIsBookmarked={isBookmarked} />
			{showComments && (
				<button
					onClick={onCommentsClick}
					className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-surface text-muted hover:text-white hover:bg-hover transition-all"
				>
					<MessageCircle size={16} />
					{commentCount !== undefined && commentCount > 0 && <span>{commentCount}</span>}
					<span className="hidden sm:inline">Comments</span>
				</button>
			)}
		</div>
	);
}
