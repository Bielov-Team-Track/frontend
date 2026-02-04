"use client";

import { Avatar } from "@/components/ui";
import { MediaGallery, type MediaItem } from "@/components/ui/media-preview";
import { EventComment } from "@/lib/models/EventComment";
import { cn } from "@/lib/utils";
import { sanitizeHtmlWithSafeLinks } from "@/lib/utils/sanitize";
import { useAuth } from "@/providers";
import { formatDistanceToNow } from "date-fns";
import {
	AlertCircle,
	MoreHorizontal,
	Pencil,
	RefreshCw,
	Reply,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import EventCommentReactions from "./EventCommentReactions";
import RichCommentEditor from "./RichCommentEditor";

interface EventCommentItemProps {
	comment: EventComment;
	eventId: string;
	onReply?: (comment: EventComment) => void;
	onEdit?: (comment: EventComment) => void;
	onDelete?: (commentId: string) => void;
	onRetry?: (comment: EventComment) => void;
	isReply?: boolean;
	/** ID of comment to highlight (for scroll-to-reply feature) */
	highlightedId?: string | null;
	/** Called when highlight animation completes */
	onHighlightComplete?: () => void;
	/** ID of comment currently being edited (for inline editing) */
	editingCommentId?: string | null;
	/** Called when edit is submitted */
	onEditSubmit?: (content: string, mediaIds: string[]) => Promise<void>;
	/** Called when edit is cancelled */
	onEditCancel?: () => void;
	/** Whether edit is being submitted */
	isEditSubmitting?: boolean;
}

export default function EventCommentItem({
	comment,
	eventId,
	onReply,
	onEdit,
	onDelete,
	onRetry,
	isReply = false,
	highlightedId,
	onHighlightComplete,
	editingCommentId,
	onEditSubmit,
	onEditCancel,
	isEditSubmitting,
}: EventCommentItemProps) {
	const { userProfile } = useAuth();
	const [showMenu, setShowMenu] = useState(false);
	const [isHighlighted, setIsHighlighted] = useState(false);

	const isThisHighlighted = comment ? highlightedId === comment.id : false;

	// Handle highlight animation
	useEffect(() => {
		if (isThisHighlighted) {
			setIsHighlighted(true);
			const timer = setTimeout(() => {
				setIsHighlighted(false);
				onHighlightComplete?.();
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isThisHighlighted, onHighlightComplete]);

	// Guard against undefined comment (after hooks)
	if (!comment) return null;

	const isAuthor = userProfile?.id === comment.authorId;
	const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
	const isEdited =
		comment.updatedAt &&
		new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000;

	// Sending state
	if (comment.status === "sending") {
		return (
			<div className={`flex gap-3 ${isReply ? "ml-11" : ""} opacity-60`}>
				<Avatar
					name={`${comment.author.name} ${comment.author.surname}`}
					src={comment.author.imageUrl}
					variant="user"
					className="w-8 h-8 shrink-0"
				/>
				<div className="flex-1">
					<div className="bg-surface rounded-xl px-3 py-2">
						<div
							className="text-sm text-white prose prose-invert prose-sm max-w-none"
							dangerouslySetInnerHTML={{ __html: sanitizeHtmlWithSafeLinks(comment.content) }}
						/>
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
				<Avatar
					name={`${comment.author.name} ${comment.author.surname}`}
					src={comment.author.imageUrl}
					variant="user"
					className="w-8 h-8 shrink-0"
				/>
				<div className="flex-1">
					<div className="bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2">
						<div
							className="text-sm text-white prose prose-invert prose-sm max-w-none"
							dangerouslySetInnerHTML={{ __html: sanitizeHtmlWithSafeLinks(comment.content) }}
						/>
					</div>
					<div className="flex items-center gap-2 mt-1">
						<AlertCircle size={12} className="text-destructive" />
						<span className="text-xs text-destructive">Failed to send</span>
						<button
							onClick={() => onRetry?.(comment)}
							className="text-xs text-primary hover:underline flex items-center gap-1">
							<RefreshCw size={12} />
							Retry
						</button>
						<button
							onClick={() => onDelete?.(comment.id)}
							className="text-xs text-muted-foreground hover:text-destructive">
							Delete
						</button>
					</div>
				</div>
			</div>
		);
	}

	const isEditing = editingCommentId === comment.id;

	// Editing state - show inline editor
	if (isEditing && onEditSubmit) {
		return (
			<div id={`comment-${comment.id}`} className={cn("flex gap-3", isReply && "ml-11")}>
				<Avatar
					name={`${comment.author.name} ${comment.author.surname}`}
					src={comment.author.imageUrl}
					variant="user"
					className="w-8 h-8 shrink-0"
				/>
				<div className="flex-1 min-w-0">
					<RichCommentEditor
						onSubmit={onEditSubmit}
						initialContent={comment.content}
						initialMedia={comment.media}
						isSubmitting={isEditSubmitting}
						eventId={eventId}
						onCancel={onEditCancel}
						showCancel
						autoFocus
					/>
				</div>
			</div>
		);
	}

	// Normal state
	return (
		<div id={`comment-${comment.id}`} className={cn("flex gap-3", isReply && "ml-11")}>
			<Avatar
				name={`${comment.author.name} ${comment.author.surname}`}
				src={comment.author.imageUrl}
				variant="user"
				className="w-8 h-8 shrink-0"
			/>
			<div className="flex-1 min-w-0">
				<div
					className={cn(
						"bg-surface rounded-xl px-3 py-2 group relative transition-all duration-500",
						isHighlighted && "ring-2 ring-primary/50 bg-primary/10"
					)}>
					{/* Header */}
					<div className="flex items-center gap-2 mb-1">
						<span className="text-sm font-medium text-white">
							{comment.author.name} {comment.author.surname}
						</span>
						<span className="text-xs text-muted-foreground">{timeAgo}</span>
						{isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
					</div>

					{/* Content - rich HTML */}
					<div
						className="text-sm text-white prose prose-invert prose-sm max-w-none [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline [&_.mention]:bg-primary/20 [&_.mention]:text-primary [&_.mention]:px-1 [&_.mention]:rounded"
						dangerouslySetInnerHTML={{ __html: sanitizeHtmlWithSafeLinks(comment.content) }}
					/>

					{/* Media Gallery */}
					{comment.media && comment.media.length > 0 && (
						<CommentMediaGallery media={comment.media} />
					)}

					{/* Menu */}
					{isAuthor && (
						<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								onClick={() => setShowMenu(!showMenu)}
								className="p-1 rounded hover:bg-active text-muted-foreground">
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
											className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white hover:bg-active">
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
					<EventCommentReactions
						eventId={eventId}
						commentId={comment.id}
						reactions={comment.reactions}
					/>
					{!isReply && (
						<button
							onClick={() => onReply?.(comment)}
							className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
							<Reply size={12} />
							Reply
						</button>
					)}
				</div>

				{/* Replies */}
				{comment.replies && comment.replies.length > 0 && (
					<div className="mt-3 space-y-3">
						{comment.replies.map((reply) => (
							<EventCommentItem
								key={reply.id}
								comment={reply}
								eventId={eventId}
								onEdit={onEdit}
								onDelete={onDelete}
								isReply
								highlightedId={highlightedId}
								onHighlightComplete={onHighlightComplete}
								editingCommentId={editingCommentId}
								onEditSubmit={onEditSubmit}
								onEditCancel={onEditCancel}
								isEditSubmitting={isEditSubmitting}
							/>
						))}
					</div>
				)}
			</div>

		</div>
	);
}

// =============================================================================
// COMMENT MEDIA GALLERY HELPER
// =============================================================================

interface CommentMediaGalleryProps {
	media: EventComment["media"];
}

function CommentMediaGallery({ media }: CommentMediaGalleryProps) {
	const mediaItems: MediaItem[] = useMemo(
		() =>
			media
				.filter((m) => {
					const type = m.type.toLowerCase();
					return type === "image" || type === "document" || type === "video";
				})
				.map((m) => ({
					id: m.id,
					type: m.type.toLowerCase() as "image" | "video" | "document",
					url: m.url,
					thumbnailUrl: m.thumbnailUrl,
					fileName: m.fileName,
					mimeType: m.mimeType,
					fileSize: m.fileSize,
				})),
		[media]
	);

	if (mediaItems.length === 0) return null;

	return (
		<div className="mt-2">
			<MediaGallery
				items={mediaItems}
				maxVisible={10}
				thumbnailSize="sm"
			/>
		</div>
	);
}
