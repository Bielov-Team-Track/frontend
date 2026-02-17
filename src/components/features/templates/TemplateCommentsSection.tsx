"use client";

import RichCommentEditor from "@/components/features/comments/components/RichCommentEditor";
import { CommentData, CommentsList } from "@/components/ui/comments";
import { useCreatePlanComment, useDeletePlanComment, usePlanComments } from "@/hooks/useTemplates";
import { PlanComment } from "@/lib/models/Template";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers";
import { Loader2, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";

interface TemplateCommentsSectionProps {
	templateId: string;
	/** Custom class name */
	className?: string;
}

// Transform PlanComment to generic CommentData
function toCommentData(comment: PlanComment): CommentData {
	return {
		id: comment.id,
		content: comment.content,
		createdAt: comment.createdAt,
		userId: comment.userId,
		parentCommentId: comment.parentCommentId,
		author: comment.user
			? {
					id: comment.user.id,
					firstName: comment.user.firstName,
					lastName: comment.user.lastName,
					avatarUrl: comment.user.avatarUrl,
			  }
			: null,
		replies: comment.replies?.map(toCommentData) || [],
	};
}

interface ReplyingTo {
	id: string;
	authorName: string;
	contentPreview: string;
}

export default function TemplateCommentsSection({ templateId, className }: TemplateCommentsSectionProps) {
	const { isAuthenticated, userProfile } = useAuth();
	const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);

	// Fetch comments with infinite scroll
	const {
		data: commentsData,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	} = usePlanComments(templateId);

	// Mutations
	const createComment = useCreatePlanComment();
	const deleteComment = useDeletePlanComment();

	// Flatten paginated data
	const comments = useMemo(() => {
		if (!commentsData?.pages) return [];
		return commentsData.pages.flatMap((page) => page.items.map(toCommentData));
	}, [commentsData]);

	// Count total comments including replies
	const totalCount = useMemo(() => {
		const countReplies = (items: CommentData[]): number => {
			return items.reduce((acc, item) => {
				return acc + 1 + (item.replies ? countReplies(item.replies) : 0);
			}, 0);
		};
		return countReplies(comments);
	}, [comments]);

	const handleSubmitComment = async (content: string, _mediaIds: string[]) => {
		// Strip HTML tags for plain text content
		const plainContent = content.replace(/<[^>]*>/g, "").trim();
		if (!plainContent) return;

		await createComment.mutateAsync({
			planId: templateId,
			content: plainContent,
			parentCommentId: replyingTo?.id || undefined,
		});
		setReplyingTo(null);
	};

	const handleDeleteComment = async (commentId: string) => {
		await deleteComment.mutateAsync({ planId: templateId, commentId });
	};

	const handleReply = (commentId: string) => {
		// Find the comment to get author info for reply preview
		const findComment = (items: CommentData[]): CommentData | undefined => {
			for (const item of items) {
				if (item.id === commentId) return item;
				if (item.replies) {
					const found = findComment(item.replies);
					if (found) return found;
				}
			}
			return undefined;
		};

		const comment = findComment(comments);
		if (comment) {
			const authorName = comment.author
				? `${comment.author.firstName || ""} ${comment.author.lastName || ""}`.trim() || "User"
				: "User";

			setReplyingTo({
				id: commentId,
				authorName,
				contentPreview: comment.content.slice(0, 50) + (comment.content.length > 50 ? "..." : ""),
			});
		}

		// Scroll to input
		document.getElementById("template-comment-input")?.scrollIntoView({ behavior: "smooth", block: "center" });
	};

	const handleCancelReply = () => {
		setReplyingTo(null);
	};

	const handleScrollToReply = (commentId: string) => {
		const element = document.getElementById(`comment-${commentId}`);
		element?.scrollIntoView({ behavior: "smooth", block: "center" });
	};

	if (isLoading) {
		return (
			<div className={cn("flex flex-col items-center justify-center py-12 space-y-3", className)}>
				<Loader2 size={24} className="animate-spin text-accent" />
				<p className="text-sm text-muted">Loading comments...</p>
			</div>
		);
	}

	return (
		<div className={cn("bg-surface border border-border rounded-2xl overflow-hidden", className)}>
			{/* Header */}
			<div className="p-4 border-b border-border bg-surface flex items-center justify-between">
				<h3 className="text-sm font-bold text-foreground flex items-center gap-2">
					<MessageCircle size={16} className="text-accent" />
					Comments {totalCount > 0 && `(${totalCount})`}
				</h3>
			</div>

			{/* Content */}
			<div className="p-4 md:p-6 space-y-6">
				{/* Comment Input */}
				<div id="template-comment-input">
					<RichCommentEditor
						onSubmit={handleSubmitComment}
						placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
						isSubmitting={createComment.isPending}
						compact={true}
						draftKey={["template", templateId]}
						replyingTo={replyingTo}
						onCancelReply={handleCancelReply}
						onScrollToReply={handleScrollToReply}
						hideAttachments={true}
					/>
				</div>

				{/* Comments List */}
				<CommentsList
					comments={comments}
					currentUserId={userProfile?.id}
					hasMore={hasNextPage}
					isLoadingMore={isFetchingNextPage}
					onLoadMore={() => fetchNextPage()}
					onReply={handleReply}
					onDelete={handleDeleteComment}
					emptyMessage="No comments yet"
					emptyDescription="Be the first to share your thoughts about this training plan!"
				/>
			</div>
		</div>
	);
}
