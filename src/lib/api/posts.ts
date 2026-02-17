import { Comment } from "../models/Comment";
import { MentionSuggestion } from "../models/Mention";
import { CreateReportRequest, ModerationActionResult, ModerationQueueResponse, PostReport, ReportsSummary } from "../models/Moderation";
import { ContextType, CreatePostRequest, Poll, Post, PostFilters, PostsResponse, ReactionSummary, UpdatePostRequest, UploadUrlResponse } from "../models/Post";
import { CommentsResponse } from "../models/PostComment";
import client from "./client";

const PREFIX = "/social/v1";

// Posts CRUD
export async function getPosts(
	contextType: ContextType,
	contextId: string,
	filters?: PostFilters,
	cursor?: string,
	limit: number = 20
): Promise<PostsResponse> {
	const params = {
		contextType,
		contextId,
		cursor,
		limit,
		...filters,
	};
	const response = await client.get<PostsResponse>(`${PREFIX}/posts`, { params });
	return response.data;
}

export async function getPost(postId: string): Promise<Post> {
	const response = await client.get<Post>(`${PREFIX}/posts/${postId}`);
	return response.data;
}

export async function createPost(data: CreatePostRequest): Promise<Post> {
	const response = await client.post<Post>(`${PREFIX}/posts`, data);
	return response.data;
}

export async function updatePost(postId: string, data: UpdatePostRequest): Promise<Post> {
	const response = await client.patch<Post>(`${PREFIX}/posts/${postId}`, data);
	return response.data;
}

export async function deletePost(postId: string): Promise<void> {
	await client.delete(`${PREFIX}/posts/${postId}`);
}

// Media
export async function getUploadUrl(contentType: string, fileName: string, fileSize: number, thumbHash?: string): Promise<UploadUrlResponse> {
	const response = await client.post<UploadUrlResponse>(`${PREFIX}/media/upload-url`, {
		contentType,
		fileName,
		fileSize,
		thumbHash,
	});
	return response.data;
}

// Note: No confirmUpload function - media is confirmed internally when creating a post

export async function uploadFileToS3(uploadUrl: string, file: File, contentType?: string): Promise<void> {
	await fetch(uploadUrl, {
		method: "PUT",
		body: file,
		headers: {
			"Content-Type": contentType || file.type || "application/octet-stream",
		},
	});
}

export async function addPostReaction(postId: string, emoji: string): Promise<ReactionSummary[]> {
	const response = await client.post<{ reactions: ReactionSummary[] }>(`${PREFIX}/posts/${postId}/reactions`, { emoji });
	return response.data.reactions;
}

export async function removePostReaction(postId: string, emoji: string): Promise<ReactionSummary[]> {
	const response = await client.delete<{ reactions: ReactionSummary[] }>(`${PREFIX}/posts/${postId}/reactions/${encodeURIComponent(emoji)}`);
	return response.data.reactions;
}

// Comments
export async function getComments(postId: string, cursor?: string, limit: number = 20): Promise<CommentsResponse> {
	const params = { cursor, limit };
	const response = await client.get<CommentsResponse>(`${PREFIX}/posts/${postId}/comments`, { params });
	return response.data;
}

export async function createComment(postId: string, content: string, parentCommentId?: string): Promise<Comment> {
	const response = await client.post<Comment>(`${PREFIX}/posts/${postId}/comments`, { postId, content, parentCommentId });
	return response.data;
}

export async function updateComment(commentId: string, content: string): Promise<Comment> {
	const response = await client.patch<Comment>(`${PREFIX}/comments/${commentId}`, { content });
	return response.data;
}

export async function deleteComment(commentId: string): Promise<void> {
	await client.delete(`${PREFIX}/comments/${commentId}`);
}

// Comment Reactions
export async function addCommentReaction(commentId: string, emoji: string): Promise<ReactionSummary[]> {
	const response = await client.post<{ reactions: ReactionSummary[] }>(`${PREFIX}/comments/${commentId}/reactions`, { emoji });
	return response.data.reactions;
}

export async function removeCommentReaction(commentId: string, emoji: string): Promise<ReactionSummary[]> {
	const response = await client.delete<{ reactions: ReactionSummary[] }>(`${PREFIX}/comments/${commentId}/reactions/${encodeURIComponent(emoji)}`);
	return response.data.reactions;
}

export async function pinPost(postId: string): Promise<Post> {
	const response = await client.post<Post>(`${PREFIX}/posts/${postId}/pin`);
	return response.data;
}

export async function unpinPost(postId: string): Promise<Post> {
	const response = await client.delete<Post>(`${PREFIX}/posts/${postId}/pin`);
	return response.data;
}

export async function reorderPins(contextType: ContextType, contextId: string, postIds: string[]): Promise<void> {
	await client.post(`${PREFIX}/posts/reorder-pins`, {
		contextType,
		contextId,
		postIds,
	});
}

// Mentions
export async function getMentionSuggestions(contextType: ContextType, contextId: string, query: string, limit: number = 10): Promise<MentionSuggestion[]> {
	const params = { contextType, contextId, query, limit };
	const response = await client.get<MentionSuggestion[]>(`${PREFIX}/mentions/suggestions`, { params });
	return response.data;
}

// Polls
export async function votePoll(pollId: string, optionIds: string[]): Promise<Poll> {
	const response = await client.post<Poll>(`${PREFIX}/polls/${pollId}/vote`, { optionIds });
	return response.data;
}

export async function removePollVote(pollId: string): Promise<Poll> {
	const response = await client.delete<Poll>(`${PREFIX}/polls/${pollId}/vote`);
	return response.data;
}

export async function closePoll(pollId: string): Promise<Poll> {
	const response = await client.patch<Poll>(`${PREFIX}/polls/${pollId}/close`);
	return response.data;
}

// Reports
export async function reportPost(postId: string, data: CreateReportRequest): Promise<PostReport> {
	const response = await client.post<PostReport>(`${PREFIX}/posts/${postId}/report`, data);
	return response.data;
}

export async function hasUserReported(postId: string): Promise<boolean> {
	const response = await client.get<{ hasReported: boolean }>(`${PREFIX}/posts/${postId}/reported`);
	return response.data.hasReported;
}
// Moderation
export async function getModerationQueue(
	contextType: ContextType,
	contextId: string,
	limit: number = 20,
	offset: number = 0
): Promise<ModerationQueueResponse> {
	const params = { contextType, contextId, limit, offset };
	const response = await client.get<ModerationQueueResponse>(`${PREFIX}/moderation/queue`, { params });
	return response.data;
}

export async function getReportsSummary(contextType: ContextType, contextId: string): Promise<ReportsSummary> {
	const params = { contextType, contextId };
	const response = await client.get<ReportsSummary>(`${PREFIX}/moderation/summary`, { params });
	return response.data;
}

export async function hidePost(postId: string): Promise<ModerationActionResult> {
	const response = await client.post<ModerationActionResult>(`${PREFIX}/moderation/posts/${postId}/hide`);
	return response.data;
}

export async function restorePost(postId: string): Promise<ModerationActionResult> {
	const response = await client.post<ModerationActionResult>(`${PREFIX}/moderation/posts/${postId}/restore`);
	return response.data;
}

export async function deletePostAsAdmin(postId: string): Promise<ModerationActionResult> {
	const response = await client.delete<ModerationActionResult>(`${PREFIX}/moderation/posts/${postId}`);
	return response.data;
}

export async function dismissReports(postId: string): Promise<ModerationActionResult> {
	const response = await client.post<ModerationActionResult>(`${PREFIX}/moderation/posts/${postId}/dismiss-reports`);
	return response.data;
}
