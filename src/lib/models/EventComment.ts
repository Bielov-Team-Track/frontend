import { Media, ReactionSummary } from "./shared/models";
import { UserProfile } from "./User";

export type EventCommentStatus = "sending" | "sent" | "failed";

export interface EventComment {
	id: string;
	eventId: string;
	authorId: string;
	author: UserProfile;
	parentCommentId?: string;
	content: string;
	media: Media[];
	replies: EventComment[];
	reactions: ReactionSummary[];
	status?: EventCommentStatus;
	createdAt: string;
	updatedAt: string;
}

export interface EventCommentsResponse {
	items: EventComment[];
	nextCursor?: string;
	hasMore: boolean;
}

export interface CreateEventCommentRequest {
	content: string;
	mediaIds?: string[];
	parentCommentId?: string;
}

export interface UpdateEventCommentRequest {
	content: string;
	mediaIds?: string[];
}
