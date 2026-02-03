import {
	ContextType,
	Media,
	MediaType,
	ReactionSummary,
	UploadUrlResponse as BaseUploadUrlResponse,
} from "./shared/models";
import { UserProfile } from "./User";

// Re-export shared types for backwards compatibility
export type { ContextType, Media, MediaType, ReactionSummary };

// Alias for backwards compatibility
export type PostMedia = Media;

export const ContextTypeOptions = [
	{ value: "club", label: "Club" },
	{ value: "group", label: "Group" },
	{ value: "team", label: "Team" },
	{ value: "event", label: "Event" },
];
export type Visibility = "membersOnly" | "public";
export const VisibilityOptions = [
	{ value: "membersOnly", label: "Members Only" },
	{ value: "public", label: "Public" },
];

export interface Post {
	id: string;
	authorId: string;
	author: UserProfile;
	contextType: ContextType;
	contextId: string;
	content: string;
	visibility: Visibility;
	isPinned: boolean;
	pinOrder?: number;
	isHidden: boolean;
	hiddenReason?: "auto_reported" | "manual_moderation";
	media: PostMedia[];
	poll?: Poll;
	reactions: ReactionSummary[];
	commentCount: number;
	createdAt: string;
	updatedAt: string;
}


export interface PostsResponse {
	items: Post[];
	nextCursor?: string;
	hasMore: boolean;
}

export interface CreatePostRequest {
	contextType: ContextType;
	contextId: string;
	content: string;
	visibility: Visibility;
	mediaIds?: string[];
	poll?: CreatePollRequest;
	isPinned?: boolean;
}

export interface UpdatePostRequest {
	content?: string;
	visibility?: Visibility;
	mediaIds?: string[];
}

export interface UploadUrlResponse extends BaseUploadUrlResponse {
	expiresAt: string;
}

export interface PostFilters {
	authorId?: string;
	fromDate?: string;
	toDate?: string;
	hasMedia?: boolean;
	hasPoll?: boolean;
	isPinned?: boolean;
	visibility?: Visibility;
	search?: string;
	sort?: "newest" | "oldest" | "mostReactions" | "mostComments";
}

export type PollResultsVisibility = "always" | "afterVote" | "afterClose";

export interface Poll {
	id: string;
	question: string;
	allowMultipleChoices: boolean;
	isAnonymous: boolean;
	showResults: PollResultsVisibility;
	closesAt?: string;
	isClosed: boolean;
	options: PollOption[];
	totalVotes: number;
	myVotes: string[];
	canSeeResults: boolean;
}

export interface PollOption {
	id: string;
	content: string;
	imageUrl?: string;
	voteCount?: number; // undefined if user can't see results
}

export interface CreatePollRequest {
	question: string;
	allowMultipleChoices: boolean;
	isAnonymous: boolean;
	showResults: PollResultsVisibility;
	closesAt?: string;
	options: CreatePollOptionRequest[];
}

export interface CreatePollOptionRequest {
	content: string;
	imageUrl?: string;
}
