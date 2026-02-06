"use client";

import { Avatar } from "@/components/ui";
import { createComment, loadComments } from "@/lib/api/comments";
import { Comment } from "@/lib/models/Comment";
import { useAuth } from "@/providers";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import CommentItem from "./CommentItem";

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
				setCursor(data.length > 0 ? new Date(data[data.length - 1].updatedAt!).toISOString() : undefined);
			} catch (error) {
				console.error("Failed to load comments:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchComments();
	}, [eventId]); // removed cursor - it was causing infinite re-fetches

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
		return (
			<div className="flex flex-col items-center justify-center h-40 space-y-3">
				<div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
				<p className="text-sm text-muted-foreground">Loading discussion...</p>
			</div>
		);
	}

	return (
		<div className="bg-surface border border-border rounded-2xl overflow-hidden">
			{/* Header */}
			<div className="p-4 border-b border-border bg-surface flex items-center justify-between">
				<h3 className="text-sm font-bold text-foreground flex items-center gap-2">
					<MessageCircle size={16} className="text-accent" />
					Discussion ({comments.length})
				</h3>
			</div>

			{/* Content Area */}
			<div className="p-4 md:p-6 space-y-6">
				{/* Input Area */}
				<div className="flex gap-4 mb-8">
					<div className="shrink-0 hidden sm:block">
						{isAuthenticated && userProfile ? (
							<Avatar src={userProfile.imageUrl} name={`${userProfile.name} ${userProfile.surname}`} className="w-10 h-10" />
						) : (
							<div className="w-10 h-10 rounded-full bg-surface border border-border" />
						)}
					</div>

					<div className="flex-1">
						{isAuthenticated ? (
							<form onSubmit={handleSubmitComment} className="relative group">
								<div className="relative">
									<textarea
										value={commentText}
										onChange={(e) => setCommentText(e.target.value)}
										placeholder="Add to the discussion..."
										rows={3}
										maxLength={2000}
										className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-accent/50 focus:bg-hover transition-all resize-none pr-12"
										required
									/>
									<button
										type="submit"
										disabled={!commentText.trim() || submitting}
										className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
											commentText.trim() && !submitting
												? "bg-accent text-white hover:bg-accent/90"
												: "bg-foreground/10 text-muted-foreground cursor-not-allowed"
										}`}>
										<Send size={16} className={submitting ? "animate-pulse" : ""} />
									</button>
								</div>
								<div className="text-[10px] text-muted-foreground text-right mt-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
									{commentText.length}/2000
								</div>
							</form>
						) : (
							<div className="bg-surface border border-border border-dashed rounded-xl p-4 text-center">
								<p className="text-sm text-muted-foreground mb-2">Join the conversation</p>
								<button className="btn btn-sm bg-primary text-white border-none hover:bg-primary/90">Log in to Comment</button>
							</div>
						)}
					</div>
				</div>

				{/* Comments List */}
				{comments && comments.length > 0 ? (
					<div className="space-y-6">
						{comments.map((comment) => (
							<CommentItem key={comment.id} comment={comment} isAuthor={comment.user.id == userProfile?.id} />
						))}
					</div>
				) : (
					<div className="text-center py-12 px-4 rounded-xl border border-border border-dashed bg-surface">
						<MessageCircle size={32} className="mx-auto text-muted-foreground/30 mb-3" />
						<p className="text-muted-foreground text-sm font-medium">No comments yet.</p>
						<p className="text-xs text-muted-foreground/50 mt-1">Be the first to share your thoughts!</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default CommentsSection;
