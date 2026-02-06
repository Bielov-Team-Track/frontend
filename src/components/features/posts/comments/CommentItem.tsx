"use client";

import { Avatar } from "@/components/ui";
import { Comment } from "@/lib/models/PostComment";
import { useAuth } from "@/providers";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, MoreHorizontal, Pencil, RefreshCw, Reply, Trash2 } from "lucide-react";
import { useState } from "react";
import CommentReactions from "./CommentReactions";

interface CommentItemProps {
	comment: Comment;
	onReply?: (comment: Comment) => void;
	onEdit?: (comment: Comment) => void;
	onDelete?: (commentId: string) => void;
	onRetry?: (comment: Comment) => void;
	isReply?: boolean;
}

export default function CommentItem({ comment, onReply, onEdit, onDelete, onRetry, isReply = false }: CommentItemProps) {
	const { userProfile } = useAuth();
	const [showMenu, setShowMenu] = useState(false);

	const isAuthor = userProfile?.id === comment.authorId;
	const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

	// Sending state
	if (comment.status === "sending") {
		return (
			<div className={`flex gap-3 ${isReply ? "ml-11" : ""} opacity-60`}>
				<Avatar name={`${comment.author.name} ${comment.author.surname}`} src={comment.author.imageUrl} variant="user" className="w-8 h-8 shrink-0" />
				<div className="flex-1">
					<div className="bg-surface rounded-xl px-3 py-2">
						<p className="text-sm text-foreground">{comment.content}</p>
					</div>
					<p className="text-xs text-muted-foreground mt-1">Sending...</p>
				</div>
			</div>
		);
	}

	// Failed state
	if (comment.status === "failed") {
		return (
			<div className={`flex gap-3 ${isReply ? "ml-11" : ""}`}>
				<Avatar name={`${comment.author.name} ${comment.author.surname}`} src={comment.author.imageUrl} variant="user" className="w-8 h-8 shrink-0" />
				<div className="flex-1">
					<div className="bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2">
						<p className="text-sm text-foreground">{comment.content}</p>
					</div>
					<div className="flex items-center gap-2 mt-1">
						<AlertCircle size={12} className="text-destructive" />
						<span className="text-xs text-destructive">Failed to send</span>
						<button onClick={() => onRetry?.(comment)} className="text-xs text-primary hover:underline flex items-center gap-1">
							<RefreshCw size={12} />
							Retry
						</button>
						<button onClick={() => onDelete?.(comment.id)} className="text-xs text-muted-foreground hover:text-destructive">
							Delete
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Normal state
	return (
		<div className={`flex gap-3 ${isReply ? "ml-11" : ""}`}>
			<Avatar name={`${comment.author.name} ${comment.author.surname}`} src={comment.author.imageUrl} variant="user" className="w-8 h-8 shrink-0" />
			<div className="flex-1">
				<div className="bg-surface rounded-xl px-3 py-2 group relative">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-sm font-medium text-foreground">
							{comment.author.name} {comment.author.surname}
						</span>
						<span className="text-xs text-muted-foreground">{timeAgo}</span>
					</div>
					<p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>

					{/* Menu */}
					{isAuthor && (
						<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded hover:bg-active text-muted-foreground">
								<MoreHorizontal size={14} />
							</button>
							{showMenu && (
								<>
									<div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
									<div className="absolute right-0 top-full mt-1 z-20 w-32 bg-surface-elevated backdrop-blur-lg border border-border rounded-lg shadow-xl py-1">
										<button
											onClick={() => {
												onEdit?.(comment);
												setShowMenu(false);
											}}
											className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-active">
											<Pencil size={12} />
											Edit
										</button>
										<button
											onClick={() => {
												onDelete?.(comment.id);
												setShowMenu(false);
											}}
											className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-active">
											<Trash2 size={12} />
											Delete
										</button>
									</div>
								</>
							)}
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="flex items-center gap-3 mt-1 pl-1">
					<CommentReactions commentId={comment.id} reactions={comment.reactions} />
					{!isReply && (
						<button
							onClick={() => onReply?.(comment)}
							className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
							<Reply size={12} />
							Reply
						</button>
					)}
				</div>

				{/* Replies */}
				{comment.replies && comment.replies.length > 0 && (
					<div className="mt-3 space-y-3">
						{comment.replies.map((reply) => (
							<CommentItem key={reply.id} comment={reply} onEdit={onEdit} onDelete={onDelete} isReply />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
