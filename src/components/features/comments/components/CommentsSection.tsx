"use client";

import { loadComments, createComment } from "@/lib/requests/comments";
import { useState, useEffect } from "react";
import { Comment } from "@/lib/models/Comment";
import CommentItem from "./CommentItem";
import { TextArea, Button } from "@/components/ui";
import { useAuth } from "@/lib/auth/authContext";

type CommentsSectionProps = {
	eventId: string;
};

const CommentsSection = ({ eventId }: CommentsSectionProps) => {
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(true);
	const [commentText, setCommentText] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const { isAuthenticated, userProfile } = useAuth();

	useEffect(() => {
		const fetchComments = async () => {
			try {
				const data = await loadComments(eventId);
				setComments(data);
				setCursor(
					data.length > 0
						? new Date(data[data.length - 1].updatedAt!).toISOString()
						: undefined,
				);
			} catch (error) {
				console.error("Failed to load comments:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchComments();
	}, [cursor, eventId]);

	const handleSubmitComment = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!commentText.trim() || !isAuthenticated) return;

		setSubmitting(true);
		try {
			const newComment = await createComment(eventId, commentText.trim());
			setComments((prev) => [...prev, newComment]);
			setCommentText("");
		} catch (error) {
			console.error("Failed to create comment:", error);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return <div>Loading comments...</div>;
	}

	return (
		<div className="space-y-4 bg-background w-full p-4 lg:p-6 rounded-lg">
			<div className="rounded-lg">
				{comments && comments.length > 0 ? (
					<div className="space-y-3 mb-6">
						{comments.map((comment) => (
							<CommentItem
								key={comment.id}
								comment={comment}
								isAuthor={comment.user.userId == userProfile?.userId}
							/>
						))}
					</div>
				) : (
					<div className="text-muted text-center h-40 flex items-center justify-center">
						<span>No comments yet. Be the first to comment!</span>
					</div>
				)}

				{isAuthenticated ? (
					<form onSubmit={handleSubmitComment} className="space-y-3">
						<TextArea
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
							placeholder="Write a comment..."
							rows={3}
							maxLength={2000}
							className="placeholder:text-muted"
							required
						/>
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted">
								{commentText.length}/2000
							</span>
							<Button
								type="submit"
								disabled={!commentText.trim() || submitting}
								loading={submitting}
								size="sm"
							>
								Post Comment
							</Button>
						</div>
					</form>
				) : (
					<div className="text-center py-4 text-gray-500">
						Please log in to post a comment.
					</div>
				)}
			</div>
		</div>
	);
};

export default CommentsSection;
