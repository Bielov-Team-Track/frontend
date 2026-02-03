"use client";

import { cn } from "@/lib/utils";
import { Loader2, MessageCircle } from "lucide-react";
import CommentItem, { CommentData } from "./CommentItem";

export interface CommentsListProps {
	/** Array of comments to display */
	comments: CommentData[];
	/** Current user's ID to determine ownership */
	currentUserId?: string;
	/** Whether more comments are available */
	hasMore?: boolean;
	/** Whether loading more comments */
	isLoadingMore?: boolean;
	/** Callback to load more comments */
	onLoadMore?: () => void;
	/** Callback when reply is clicked */
	onReply?: (commentId: string) => void;
	/** Callback when delete is confirmed */
	onDelete?: (commentId: string) => Promise<void>;
	/** Custom empty state message */
	emptyMessage?: string;
	/** Custom empty state description */
	emptyDescription?: string;
	/** Custom class name */
	className?: string;
}

export default function CommentsList({
	comments,
	currentUserId,
	hasMore = false,
	isLoadingMore = false,
	onLoadMore,
	onReply,
	onDelete,
	emptyMessage = "No comments yet",
	emptyDescription = "Be the first to share your thoughts!",
	className,
}: CommentsListProps) {
	if (!comments || comments.length === 0) {
		return (
			<div className={cn("text-center py-10 px-4 rounded-xl border border-white/5 border-dashed bg-white/2", className)}>
				<MessageCircle size={28} className="mx-auto text-muted/30 mb-3" />
				<p className="text-muted text-sm font-medium">{emptyMessage}</p>
				<p className="text-xs text-muted/50 mt-1">{emptyDescription}</p>
			</div>
		);
	}

	return (
		<div className={cn("space-y-5", className)}>
			{comments.map((comment) => (
				<CommentItem
					key={comment.id}
					comment={comment}
					currentUserId={currentUserId}
					onReply={onReply}
					onDelete={onDelete}
				/>
			))}

			{/* Load more */}
			{hasMore && onLoadMore && (
				<div className="flex justify-center pt-4">
					<button
						onClick={onLoadMore}
						disabled={isLoadingMore}
						className={cn(
							"flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
							isLoadingMore
								? "bg-white/5 text-muted cursor-not-allowed"
								: "bg-white/5 text-white hover:bg-white/10"
						)}
					>
						{isLoadingMore ? (
							<>
								<Loader2 size={14} className="animate-spin" />
								Loading...
							</>
						) : (
							"Load more comments"
						)}
					</button>
				</div>
			)}
		</div>
	);
}
