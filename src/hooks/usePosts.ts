import {
	addCommentReaction,
	addPostReaction,
	closePoll,
	createComment,
	createPost,
	deleteComment,
	deletePost,
	deletePostAsAdmin,
	dismissReports,
	getComments,
	getModerationQueue,
	getPost,
	getPosts,
	getReportsSummary,
	getUploadUrl,
	hidePost,
	pinPost,
	removeCommentReaction,
	removePollVote,
	removePostReaction,
	reportPost,
	restorePost,
	unpinPost,
	updateComment,
	updatePost,
	uploadFileToS3,
	votePoll,
} from "@/lib/api/posts";
import { CreateReportRequest } from "@/lib/models/Moderation";
import { ContextType, PostFilters, PostsResponse, UpdatePostRequest } from "@/lib/models/Post";
import { Comment, CommentsResponse } from "@/lib/models/PostComment";
import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Query keys
export const postKeys = {
	all: ["posts"] as const,
	feeds: () => [...postKeys.all, "feed"] as const,
	feed: (contextType: ContextType, contextId: string, filters?: PostFilters) => [...postKeys.feeds(), contextType, contextId, filters] as const,
	details: () => [...postKeys.all, "detail"] as const,
	detail: (id: string) => [...postKeys.details(), id] as const,
	comments: () => [...postKeys.all, "comments"] as const,
	postComments: (postId: string) => [...postKeys.comments(), postId] as const,
	moderation: () => [...postKeys.all, "moderation"] as const,
	moderationQueue: (contextType: ContextType, contextId: string) => [...postKeys.moderation(), "queue", contextType, contextId] as const,
	moderationSummary: (contextType: ContextType, contextId: string) => [...postKeys.moderation(), "summary", contextType, contextId] as const,
};

// Hooks
export function usePostsFeed(contextType: ContextType, contextId: string, filters?: PostFilters, enabled: boolean = true) {
	return useInfiniteQuery({
		queryKey: postKeys.feed(contextType, contextId, filters),
		queryFn: ({ pageParam }) => getPosts(contextType, contextId, filters, pageParam),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
		enabled,
	});
}

export function usePost(postId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: postKeys.detail(postId),
		queryFn: () => getPost(postId),
		enabled,
	});
}

export function useCreatePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPost,
		onSuccess: (newPost) => {
			// Normalize contextType to lowercase to match query keys
			const normalizedContextType = newPost.contextType.toLowerCase() as ContextType;

			// Optimistically add the new post to the beginning of the feed
			queryClient.setQueriesData<InfiniteData<PostsResponse>>(
				{ queryKey: postKeys.feed(normalizedContextType, newPost.contextId) },
				(old) => {
					if (!old) return old;
					return {
						...old,
						pages: old.pages.map((page, index) =>
							index === 0
								? { ...page, items: [newPost, ...page.items] }
								: page
						),
					};
				}
			);

			// Also invalidate to ensure consistency with server
			queryClient.invalidateQueries({
				queryKey: postKeys.feed(normalizedContextType, newPost.contextId),
			});
		},
	});
}

export function useUpdatePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, data }: { postId: string; data: UpdatePostRequest }) => updatePost(postId, data),
		onSuccess: (updatedPost) => {
			// Update cache
			queryClient.setQueryData(postKeys.detail(updatedPost.id), updatedPost);
			queryClient.invalidateQueries({
				queryKey: postKeys.feed(updatedPost.contextType, updatedPost.contextId),
			});
		},
	});
}

export function useDeletePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deletePost,
		onSuccess: (_, deletedPostId) => {
			// Remove from cache instead of invalidating all
			queryClient.setQueriesData<InfiniteData<PostsResponse>>(
				{ queryKey: postKeys.feeds() },
				(old) => {
					if (!old) return old;
					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							items: page.items.filter((post) => post.id !== deletedPostId),
						})),
					};
				}
			);
		},
	});
}

// Media upload hook
// Helper to get MIME type from file extension when file.type is empty
function getMimeType(file: File): string {
	if (file.type) return file.type;

	const ext = file.name.split(".").pop()?.toLowerCase();
	const mimeTypes: Record<string, string> = {
		// Images
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
		svg: "image/svg+xml",
		// Videos
		mp4: "video/mp4",
		webm: "video/webm",
		mov: "video/quicktime",
		avi: "video/x-msvideo",
		// Documents
		pdf: "application/pdf",
		doc: "application/msword",
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		xls: "application/vnd.ms-excel",
		xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		ppt: "application/vnd.ms-powerpoint",
		pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		txt: "text/plain",
	};

	return mimeTypes[ext || ""] || "application/octet-stream";
}

export function useMediaUpload() {
	return useMutation({
		mutationFn: async (file: File) => {
			const fileType = getMimeType(file);

			// 1. Get presigned URL
			const { mediaId, uploadUrl } = await getUploadUrl(fileType, file.name, file.size);

			// 2. Upload to S3
			await uploadFileToS3(uploadUrl, file, fileType);

			// Note: No confirm call here - the backend confirms media internally
			// when creating a post with mediaIds

			return mediaId;
		},
	});
}

export function useAddPostReaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, emoji }: { postId: string; emoji: string }) => addPostReaction(postId, emoji),
		onMutate: async ({ postId, emoji }) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: postKeys.feeds() });

			// Optimistically update all feed caches
			queryClient.setQueriesData<InfiniteData<PostsResponse>>({ queryKey: postKeys.feeds() }, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						items: page.items.map((post) => {
							if (post.id !== postId) return post;
							const existingReaction = post.reactions.find((r) => r.emoji === emoji);
							if (existingReaction) {
								return {
									...post,
									reactions: post.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true } : r)),
								};
							}
							return {
								...post,
								reactions: [...post.reactions, { emoji, count: 1, hasReacted: true }],
							};
						}),
					})),
				};
			});
		},
		onError: () => {
			// Refetch on error to sync with server
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
		},
	});
}

export function useRemovePostReaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, emoji }: { postId: string; emoji: string }) => removePostReaction(postId, emoji),
		onMutate: async ({ postId, emoji }) => {
			await queryClient.cancelQueries({ queryKey: postKeys.feeds() });

			queryClient.setQueriesData<InfiniteData<PostsResponse>>({ queryKey: postKeys.feeds() }, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						items: page.items.map((post) => {
							if (post.id !== postId) return post;
							return {
								...post,
								reactions: post.reactions
									.map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, hasReacted: false } : r))
									.filter((r) => r.count > 0),
							};
						}),
					})),
				};
			});
		},
		onError: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
		},
	});
}
export function useComments(postId: string, enabled: boolean = true) {
	return useInfiniteQuery({
		queryKey: postKeys.postComments(postId),
		queryFn: ({ pageParam }) => getComments(postId, pageParam),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
		enabled,
	});
}

export function useCreateComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, content, parentCommentId }: { postId: string; content: string; parentCommentId?: string }) =>
			createComment(postId, content, parentCommentId),
		onSuccess: (_, { postId }) => {
			queryClient.invalidateQueries({ queryKey: postKeys.postComments(postId) });
			// Update comment count in feed
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
		},
	});
}

export function useUpdateComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ commentId, content }: { commentId: string; content: string }) => updateComment(commentId, content),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.comments() });
		},
	});
}

export function useDeleteComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ commentId }: { commentId: string; postId: string }) => deleteComment(commentId),
		onSuccess: (_, { postId }) => {
			// Only invalidate comments for this specific post
			queryClient.invalidateQueries({ queryKey: postKeys.postComments(postId) });
		},
	});
}

export function useAddCommentReaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) => addCommentReaction(commentId, emoji),
		onMutate: async ({ commentId, emoji }) => {
			await queryClient.cancelQueries({ queryKey: postKeys.comments() });

			// Optimistic update for comment reactions
			queryClient.setQueriesData<InfiniteData<CommentsResponse>>({ queryKey: postKeys.comments() }, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						items: updateCommentReactions(page.items, commentId, emoji, "add"),
					})),
				};
			});
		},
		onError: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.comments() });
		},
	});
}

export function useRemoveCommentReaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) => removeCommentReaction(commentId, emoji),
		onMutate: async ({ commentId, emoji }) => {
			await queryClient.cancelQueries({ queryKey: postKeys.comments() });

			queryClient.setQueriesData<InfiniteData<CommentsResponse>>({ queryKey: postKeys.comments() }, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						items: updateCommentReactions(page.items, commentId, emoji, "remove"),
					})),
				};
			});
		},
		onError: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.comments() });
		},
	});
}

// Helper function for nested comment reaction updates
function updateCommentReactions(comments: Comment[], commentId: string, emoji: string, action: "add" | "remove"): Comment[] {
	return comments.map((comment) => {
		if (comment.id === commentId) {
			if (action === "add") {
				const existing = comment.reactions.find((r) => r.emoji === emoji);
				if (existing) {
					return {
						...comment,
						reactions: comment.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true } : r)),
					};
				}
				return {
					...comment,
					reactions: [...comment.reactions, { emoji, count: 1, hasReacted: true }],
				};
			} else {
				return {
					...comment,
					reactions: comment.reactions
						.map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, hasReacted: false } : r))
						.filter((r) => r.count > 0),
				};
			}
		}
		// Recursively update replies
		if (comment.replies.length > 0) {
			return {
				...comment,
				replies: updateCommentReactions(comment.replies, commentId, emoji, action),
			};
		}
		return comment;
	});
}
export function usePinPost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: pinPost,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
		},
	});
}

export function useUnpinPost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: unpinPost,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
		},
	});
}
export function useVotePoll() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ pollId, optionIds }: { pollId: string; optionIds: string[] }) => votePoll(pollId, optionIds),
		onMutate: async ({ pollId, optionIds }) => {
			await queryClient.cancelQueries({ queryKey: postKeys.feeds() });

			// Optimistic update
			queryClient.setQueriesData<InfiniteData<PostsResponse>>({ queryKey: postKeys.feeds() }, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						items: page.items.map((post) => {
							if (!post.poll || post.poll.id !== pollId) return post;
							return {
								...post,
								poll: {
									...post.poll,
									myVotes: optionIds,
									totalVotes: post.poll.totalVotes + 1,
									options: post.poll.options.map((opt) => ({
										...opt,
										voteCount: optionIds.includes(opt.id) ? (opt.voteCount ?? 0) + 1 : opt.voteCount,
									})),
								},
							};
						}),
					})),
				};
			});
		},
		onError: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
		},
	});
}

export function useRemovePollVote() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: removePollVote,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
		},
	});
}

export function useClosePoll() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: closePoll,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
		},
	});
}

export function useReportPost() {
	return useMutation({
		mutationFn: ({ postId, data }: { postId: string; data: CreateReportRequest }) => reportPost(postId, data),
	});
}

export function useModerationQueue(contextType: ContextType, contextId: string, limit: number = 20, offset: number = 0, enabled: boolean = true) {
	return useQuery({
		queryKey: [...postKeys.moderationQueue(contextType, contextId), limit, offset],
		queryFn: () => getModerationQueue(contextType, contextId, limit, offset),
		enabled,
	});
}

export function useReportsSummary(contextType: ContextType, contextId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: postKeys.moderationSummary(contextType, contextId),
		queryFn: () => getReportsSummary(contextType, contextId),
		enabled,
	});
}

export function useHidePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: hidePost,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
			queryClient.invalidateQueries({ queryKey: postKeys.moderation() });
		},
	});
}

export function useRestorePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: restorePost,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
			queryClient.invalidateQueries({ queryKey: postKeys.moderation() });
		},
	});
}

export function useDeletePostAsAdmin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deletePostAsAdmin,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
			queryClient.invalidateQueries({ queryKey: postKeys.moderation() });
		},
	});
}

export function useDismissReports() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: dismissReports,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.moderation() });
		},
	});
}
