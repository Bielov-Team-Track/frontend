import { ReactionSummary } from "./Post";
import { UserProfile } from "./User";

export type CommentStatus = "sending" | "sent" | "failed";

export interface Comment {
	id: string;
	postId: string;
	authorId: string;
	author: UserProfile;
	parentCommentId?: string;
	content: string;
	replies: Comment[];
	reactions: ReactionSummary[];
	status?: CommentStatus; // For optimistic UI
	createdAt: string;
	updatedAt: string;
}

export interface CommentsResponse {
	items: Comment[];
	nextCursor?: string;
	hasMore: boolean;
}

export interface CreateCommentRequest {
	postId: string;
	content: string;
	parentCommentId?: string;
}

export interface UpdateCommentRequest {
	content: string;
}
