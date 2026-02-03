"use client";

import { Avatar } from "@/components/ui";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getFormattedDate } from "@/lib/utils/date";
import { MoreHorizontal, Reply, Trash2 } from "lucide-react";
import { useState } from "react";

export interface CommentAuthor {
	id: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	surname?: string;
	avatarUrl?: string | null;
}

export interface CommentData {
	id: string;
	content: string;
	createdAt: Date | string;
	author?: CommentAuthor | null;
	userId: string;
	parentCommentId?: string | null;
	replies?: CommentData[];
}

export interface CommentItemProps {
	comment: CommentData;
	/** Current user's ID to determine if they own the comment */
	currentUserId?: string;
	/** Callback when reply button is clicked */
	onReply?: (commentId: string) => void;
	/** Callback when delete is confirmed */
	onDelete?: (commentId: string) => Promise<void>;
	/** Whether replies should be shown */
	showReplies?: boolean;
	/** Depth level for nested replies */
	depth?: number;
	/** Max depth for reply nesting */
	maxDepth?: number;
	/** Custom class name */
	className?: string;
}

export default function CommentItem({
	comment,
	currentUserId,
	onReply,
	onDelete,
	showReplies = true,
	depth = 0,
	maxDepth = 2,
	className,
}: CommentItemProps) {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	if (!comment) return null;

	const author = comment.author;
	const isOwner = currentUserId && comment.userId === currentUserId;
	const createdAt = typeof comment.createdAt === "string" ? new Date(comment.createdAt) : comment.createdAt;

	// Build author display name
	const authorName = author
		? author.firstName && author.lastName
			? `${author.firstName} ${author.lastName}`
			: author.name && author.surname
			? `${author.name} ${author.surname}`
			: "Unknown User"
		: "Unknown User";

	// Build avatar props
	const avatarSrc = author?.avatarUrl;
	const avatarName = author
		? `${author.firstName || author.name || ""} ${author.lastName || author.surname || ""}`.trim() || undefined
		: undefined;

	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const handleDelete = async () => {
		if (!onDelete) return;
		try {
			setIsDeleting(true);
			await onDelete(comment.id);
		} catch (error) {
			console.error("Failed to delete comment:", error);
		} finally {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
			setIsDropdownOpen(false);
		}
	};

	const handleCancelDelete = () => {
		setShowDeleteConfirm(false);
		setIsDropdownOpen(false);
	};

	const hasReplies = comment.replies && comment.replies.length > 0;
	const canShowReplies = showReplies && depth < maxDepth;

	return (
		<div id={`comment-${comment.id}`} className={cn("group", className)}>
			<div className="flex gap-3">
				{/* Avatar */}
				<div className="shrink-0">
					{author ? (
						<Avatar
							src={avatarSrc}
							name={avatarName}
							size="sm"
							className="border-2 border-transparent group-hover:border-white/10 transition-colors"
						/>
					) : (
						<div className="w-9 h-9 rounded-full bg-white/10 border border-white/10" />
					)}
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center justify-between mb-1">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-sm text-white">{authorName}</span>
							<span className="text-[10px] text-muted">
								{getFormattedDate(createdAt)}
							</span>
						</div>

						{/* Owner actions */}
						{isOwner && onDelete && (
							<DropdownMenu
								open={isDropdownOpen}
								onOpenChange={(open) => {
									setIsDropdownOpen(open);
									if (!open) setShowDeleteConfirm(false);
								}}
							>
								<DropdownMenuTrigger className="p-1 rounded-lg text-muted hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
									<MoreHorizontal size={14} />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-40">
									{!showDeleteConfirm ? (
										<DropdownMenuItem
											variant="destructive"
											onSelect={(e) => {
												e.preventDefault();
												setShowDeleteConfirm(true);
											}}
										>
											<Trash2 size={12} />
											Delete
										</DropdownMenuItem>
									) : (
										<>
											<div className="px-2 py-1.5 text-xs font-medium text-destructive">
												Delete comment?
											</div>
											<DropdownMenuItem
												variant="destructive"
												disabled={isDeleting}
												onSelect={handleDelete}
											>
												{isDeleting ? "Deleting..." : "Yes, delete"}
											</DropdownMenuItem>
											<DropdownMenuItem onSelect={handleCancelDelete}>
												Cancel
											</DropdownMenuItem>
										</>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>

					{/* Comment content */}
					<div className="text-sm text-gray-200 leading-relaxed bg-white/5 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-white/5">
						{comment.content}
					</div>

					{/* Actions */}
					{onReply && depth < maxDepth && (
						<div className="flex items-center gap-4 mt-2">
							<button
								onClick={() => onReply(comment.id)}
								className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-white transition-colors"
							>
								<Reply size={12} /> Reply
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Nested replies */}
			{canShowReplies && hasReplies && (
				<div className="ml-12 mt-4 space-y-4 pl-4 border-l border-white/5">
					{comment.replies!.map((reply) => (
						<CommentItem
							key={reply.id}
							comment={reply}
							currentUserId={currentUserId}
							onReply={onReply}
							onDelete={onDelete}
							showReplies={showReplies}
							depth={depth + 1}
							maxDepth={maxDepth}
						/>
					))}
				</div>
			)}
		</div>
	);
}
