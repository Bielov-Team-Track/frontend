"use client";

import { useComments, useCreateComment, useDeleteComment } from "@/hooks/usePosts";
import { Comment } from "@/lib/models/PostComment";
import { useAuth } from "@/providers";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import CommentEditor from "./CommentEditor";
import CommentItem from "./CommentItem";

interface CommentsListProps {
	postId: string;
	commentCount: number;
}

export default function CommentsList({ postId, commentCount }: CommentsListProps) {
	const { userProfile } = useAuth();
	const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useComments(postId);

	const createComment = useCreateComment();
	const deleteComment = useDeleteComment();

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
		[isFetchingNextPage, hasNextPage, fetchNextPage]
	);

	useEffect(() => {
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, []);

	const handleSubmitComment = async (content: string) => {
		await createComment.mutateAsync({
			postId,
			content,
			parentCommentId: replyingTo?.id,
		});
		setReplyingTo(null);
	};

	const handleDelete = useCallback(
		async (commentId: string) => {
			if (!confirm("Delete this comment?")) return;
			await deleteComment.mutateAsync({ commentId, postId });
		},
		[deleteComment, postId]
	);

	const comments = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<div className="border-t border-border pt-4 space-y-4">
			{/* Reply indicator */}
			{replyingTo && (
				<div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface px-3 py-2 rounded-lg">
					<span>Replying to {replyingTo.author.name}</span>
					<button onClick={() => setReplyingTo(null)} className="text-primary hover:underline">
						Cancel
					</button>
				</div>
			)}

			{/* Comment editor */}
			<CommentEditor
				onSubmit={handleSubmitComment}
				placeholder={replyingTo ? `Reply to ${replyingTo.author.name}...` : "Write a comment..."}
				isSubmitting={createComment.isPending}
			/>

			{/* Comments list */}
			{isLoading ? (
				<div className="flex justify-center py-4">
					<Loader2 className="animate-spin text-muted-foreground" size={20} />
				</div>
			) : comments.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
			) : (
				<div className="space-y-4">
					{comments.map((comment) => (
						<CommentItem key={comment.id} comment={comment} onReply={setReplyingTo} onDelete={handleDelete} />
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
		</div>
	);
}
