import { UserProfile } from "./User";

export type ContextType = "club" | "group" | "team";
export const ContextTypeOptions = [
	{ value: "club", label: "Club" },
	{ value: "group", label: "Group" },
	{ value: "team", label: "Team" },
];
export type Visibility = "membersOnly" | "public";
export const VisibilityOptions = [
	{ value: "membersOnly", label: "Members Only" },
	{ value: "public", label: "Public" },
];
export type MediaType = "image" | "video" | "document" | "videoEmbed";

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

export interface PostMedia {
	id: string;
	type: MediaType;
	url: string;
	thumbnailUrl?: string;
	fileName?: string;
	fileSize?: number;
	mimeType?: string;
	embedProvider?: "youtube" | "vimeo";
	embedId?: string;
	displayOrder: number;
}

export interface ReactionSummary {
	emoji: string;
	count: number;
	hasReacted: boolean;
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
}

export interface UpdatePostRequest {
	content?: string;
	visibility?: Visibility;
	mediaIds?: string[];
}

export interface UploadUrlResponse {
	mediaId: string;
	uploadUrl: string;
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
