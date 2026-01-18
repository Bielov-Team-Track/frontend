import { Post } from "./Post";

export type ReportReason = "spam" | "harassment" | "inappropriate" | "misinformation" | "other";

export const ReportReasonOptions = [
	{ value: "spam", label: "Spam", description: "Unwanted commercial content or repetitive posts" },
	{ value: "harassment", label: "Harassment", description: "Bullying, threats, or targeted abuse" },
	{ value: "inappropriate", label: "Inappropriate Content", description: "Content that violates community guidelines" },
	{ value: "misinformation", label: "Misinformation", description: "False or misleading information" },
	{ value: "other", label: "Other", description: "Other issue not listed above" },
];

export interface PostReport {
	id: string;
	postId: string;
	reporterUserId: string;
	reporterName: string;
	reason: ReportReason;
	description?: string;
	createdAt: string;
}

export interface ReportSummary {
	reason: ReportReason;
	count: number;
}

export interface ModerationQueueItem {
	post: Post;
	reportCount: number;
	reportSummary: ReportSummary[];
	firstReportedAt: string;
	lastReportedAt: string;
}

export interface ModerationQueueResponse {
	items: ModerationQueueItem[];
	totalCount: number;
}

export interface ReportsSummary {
	totalReportedPosts: number;
	hiddenPosts: number;
	pendingReview: number;
}

export interface ModerationActionResult {
	success: boolean;
	message: string;
	post?: Post;
}

export interface CreateReportRequest {
	reason: ReportReason;
	description?: string;
}
