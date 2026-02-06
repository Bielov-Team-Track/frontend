"use client";

import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import TemplateLikeButton from "./TemplateLikeButton";
import TemplateBookmarkButton from "./TemplateBookmarkButton";

interface TemplateInteractionBarProps {
	templateId: string;
	/** Initial like count from template data */
	likeCount?: number;
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

export default function TemplateInteractionBar({
	templateId,
	likeCount = 0,
	commentCount,
	showComments = true,
	onCommentsClick,
	variant = "default",
	className,
}: TemplateInteractionBarProps) {
	if (variant === "compact") {
		return (
			<div className={cn("flex items-center gap-4", className)}>
				<TemplateLikeButton templateId={templateId} initialLikeCount={likeCount} variant="compact" />
				<TemplateBookmarkButton templateId={templateId} variant="compact" />
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
			<TemplateLikeButton templateId={templateId} initialLikeCount={likeCount} />
			<TemplateBookmarkButton templateId={templateId} />
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
