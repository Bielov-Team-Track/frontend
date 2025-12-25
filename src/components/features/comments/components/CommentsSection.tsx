"use client";

import { loadComments, createComment } from "@/lib/api/comments";
import { useState, useEffect } from "react";
import { Comment } from "@/lib/models/Comment";
import CommentItem from "./CommentItem";
import { useAuth } from "@/providers";
import { Send, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui";

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
		return (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
                <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
                <p className="text-sm text-muted">Loading discussion...</p>
            </div>
        );
	}

	return (
		<div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
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
                            <Avatar profile={userProfile} className="w-10 h-10" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
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
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-muted focus:outline-hidden focus:border-accent/50 focus:bg-white/10 transition-all resize-none pr-12"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim() || submitting}
                                        className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                                            commentText.trim() && !submitting 
                                                ? "bg-accent text-white hover:bg-accent/90" 
                                                : "bg-white/10 text-muted cursor-not-allowed"
                                        }`}
                                    >
                                        <Send size={16} className={submitting ? "animate-pulse" : ""} />
                                    </button>
                                </div>
                                <div className="text-[10px] text-muted text-right mt-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                    {commentText.length}/2000
                                </div>
                            </form>
                        ) : (
                            <div className="bg-white/5 border border-white/5 border-dashed rounded-xl p-4 text-center">
                                <p className="text-sm text-muted mb-2">Join the conversation</p>
                                <button className="btn btn-sm bg-primary text-white border-none hover:bg-primary/90">
                                    Log in to Comment
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comments List */}
				{comments && comments.length > 0 ? (
					<div className="space-y-6">
						{comments.map((comment) => (
							<CommentItem
								key={comment.id}
								comment={comment}
								isAuthor={comment.user.userId == userProfile?.userId}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-12 px-4 rounded-xl border border-white/5 border-dashed bg-white/2">
                        <MessageCircle size={32} className="mx-auto text-muted/30 mb-3" />
						<p className="text-muted text-sm font-medium">No comments yet.</p>
                        <p className="text-xs text-muted/50 mt-1">Be the first to share your thoughts!</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default CommentsSection;