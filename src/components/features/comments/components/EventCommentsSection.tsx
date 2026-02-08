"use client";

import { Avatar, Modal } from "@/components/ui";
import { useCreateEventComment, useDeleteEventComment, useEventComments, useUpdateEventComment } from "@/hooks/useEventComments";
import { EventComment } from "@/lib/models/EventComment";
import { useAuth } from "@/providers";
import { Loader2, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import EventCommentItem from "./EventCommentItem";
import RichCommentEditor from "./RichCommentEditor";

interface EventCommentsSectionProps {
	eventId: string;
}

// Helper to strip HTML and truncate for preview
function getContentPreview(htmlContent: string, maxLength: number = 50): string {
	const text = htmlContent.replace(/<[^>]*>/g, "").trim();
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength).trim() + "...";
}

export default function EventCommentsSection({ eventId }: EventCommentsSectionProps) {
	const { userProfile } = useAuth();
	const [replyingTo, setReplyingTo] = useState<EventComment | null>(null);
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
	const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useEventComments(eventId);

	const createComment = useCreateEventComment(eventId);
	const updateComment = useUpdateEventComment(eventId);
	const deleteComment = useDeleteEventComment(eventId);

	// Infinite scroll observer
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadMoreRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (isFetchingNextPage) return;

			if (observerRef.current) {
				observerRef.current.disconnect();
			}

			observerRef.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasNextPage) {
					fetchNextPage();
				}
			});

			if (node) {
				observerRef.current.observe(node);
			}
		},
		[isFetchingNextPage, hasNextPage, fetchNextPage],
	);

	useEffect(() => {
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, []);

	const handleSubmitComment = async (content: string, mediaIds: string[]) => {
		await createComment.mutateAsync({
			content,
			mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
			parentCommentId: replyingTo?.id,
		});
		setReplyingTo(null);
	};

	const handleStartEdit = useCallback((comment: EventComment) => {
		setEditingCommentId(comment.id);
	}, []);

	const handleEditComment = async (content: string, mediaIds: string[]) => {
		if (!editingCommentId) return;
		await updateComment.mutateAsync({
			commentId: editingCommentId,
			data: {
				content,
				mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
			},
		});
		setEditingCommentId(null);
	};

	const handleCancelEdit = useCallback(() => {
		setEditingCommentId(null);
	}, []);

	const handleDelete = useCallback(async (commentId: string) => {
		setDeleteConfirmId(commentId);
	}, []);

	const handleScrollToComment = useCallback((commentId: string) => {
		const element = document.getElementById(`comment-${commentId}`);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
			setHighlightedCommentId(commentId);
		}
	}, []);

	const handleHighlightComplete = useCallback(() => {
		setHighlightedCommentId(null);
	}, []);

	const confirmDelete = async () => {
		if (!deleteConfirmId) return;
		await deleteComment.mutateAsync(deleteConfirmId);
		setDeleteConfirmId(null);
	};

	const comments = data?.pages.flatMap((page) => page.items).filter(Boolean) ?? [];
	const commentCount = comments.length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bold text-foreground flex items-center gap-2">
					<MessageCircle size={16} className="text-accent" />
					Discussion ({commentCount})
				</h3>
			</div>

			{/* Comment editor with integrated reply indicator */}
			<div className="flex gap-3">
				{userProfile && (
					<Avatar
						name={`${userProfile.name} ${userProfile.surname}`}
						src={userProfile.imageUrl}
						variant="user"
						className="w-8 h-8 shrink-0"
					/>
				)}
				<RichCommentEditor
					onSubmit={handleSubmitComment}
					placeholder="Share your thoughts about this event..."
					isSubmitting={createComment.isPending}
					eventId={eventId}
					draftKey={["event", eventId]}
					compact
					replyingTo={
						replyingTo
							? {
									id: replyingTo.id,
									authorName: `${replyingTo.author.name} ${replyingTo.author.surname}`,
									contentPreview: getContentPreview(replyingTo.content),
							  }
							: null
					}
					onCancelReply={() => setReplyingTo(null)}
					onScrollToReply={handleScrollToComment}
				/>
			</div>

			{/* Comments list */}
			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-12 space-y-3">
					<Loader2 className="w-8 h-8 animate-spin text-accent/50" />
					<p className="text-sm text-muted-foreground">Loading discussion...</p>
				</div>
			) : comments.length === 0 ? (
				<div className="text-center py-12 px-4 rounded-xl border border-border border-dashed bg-surface">
					<MessageCircle size={32} className="mx-auto text-muted-foreground/30 mb-3" />
					<p className="text-muted-foreground text-sm font-medium">No comments yet</p>
					<p className="text-xs text-muted-foreground/50 mt-1">Be the first to share your thoughts!</p>
				</div>
			) : (
				<div className="space-y-4">
					{comments.map((comment) => (
						<EventCommentItem
							key={comment?.id}
							comment={comment}
							eventId={eventId}
							onReply={setReplyingTo}
							onEdit={handleStartEdit}
							onDelete={handleDelete}
							highlightedId={highlightedCommentId}
							onHighlightComplete={handleHighlightComplete}
							editingCommentId={editingCommentId}
							onEditSubmit={handleEditComment}
							onEditCancel={handleCancelEdit}
							isEditSubmitting={updateComment.isPending}
						/>
					))}

					{/* Load more */}
					<div ref={loadMoreRef} className="py-2 flex justify-center">
						{isFetchingNextPage && <Loader2 className="animate-spin text-muted-foreground" size={16} />}
						{hasNextPage && !isFetchingNextPage && (
							<button onClick={() => fetchNextPage()} className="text-xs text-muted-foreground hover:text-foreground">
								Load more comments
							</button>
						)}
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Delete Comment" size="sm">
				<p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this comment? This action cannot be undone.</p>
				<div className="flex justify-end gap-3">
					<button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm text-foreground hover:bg-hover rounded-lg transition-colors">
						Cancel
					</button>
					<button
						onClick={confirmDelete}
						disabled={deleteComment.isPending}
						className="px-4 py-2 text-sm bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50">
						{deleteComment.isPending ? "Deleting..." : "Delete"}
					</button>
				</div>
			</Modal>
		</div>
	);
}
