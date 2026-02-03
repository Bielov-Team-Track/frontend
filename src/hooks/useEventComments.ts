"use client";

import {
	addEventCommentReaction,
	createEventComment,
	deleteEventComment,
	getEventComments,
	removeEventCommentReaction,
	updateEventComment,
} from "@/lib/api/comments";
import {
	getEventMediaUploadUrl,
	uploadFileToStorage,
} from "@/lib/api/events";
import {
	CreateEventCommentRequest,
	EventComment,
	EventCommentsResponse,
	UpdateEventCommentRequest,
} from "@/lib/models/EventComment";
import { AxiosError } from "axios";

// Helper to extract error message from API errors
function getErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof AxiosError) {
		return error.response?.data?.message || fallback;
	}
	if (error instanceof Error) {
		return error.message || fallback;
	}
	return fallback;
}
import { useAuth } from "@/providers";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// =============================================================================
// HELPERS
// =============================================================================

function getMimeType(file: File): string {
	if (file.type) return file.type;
	const ext = file.name.split(".").pop()?.toLowerCase();
	const mimeTypes: Record<string, string> = {
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
		mp4: "video/mp4",
		webm: "video/webm",
		pdf: "application/pdf",
	};
	return mimeTypes[ext || ""] || "application/octet-stream";
}

// =============================================================================
// QUERY KEYS
// =============================================================================

export const eventCommentKeys = {
	all: ["eventComments"] as const,
	lists: () => [...eventCommentKeys.all, "list"] as const,
	list: (eventId: string) => [...eventCommentKeys.lists(), eventId] as const,
};

// =============================================================================
// QUERIES
// =============================================================================

export function useEventComments(eventId: string) {
	return useInfiniteQuery({
		queryKey: eventCommentKeys.list(eventId),
		queryFn: ({ pageParam }) => getEventComments(eventId, pageParam),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage: EventCommentsResponse) =>
			lastPage.hasMore ? lastPage.nextCursor : undefined,
	});
}

// =============================================================================
// MUTATIONS
// =============================================================================

export function useCreateEventComment(eventId: string) {
	const queryClient = useQueryClient();
	const { userProfile } = useAuth();

	return useMutation({
		mutationFn: (data: CreateEventCommentRequest) => createEventComment(eventId, data),
		onMutate: async (newComment) => {
			await queryClient.cancelQueries({ queryKey: eventCommentKeys.list(eventId) });

			const previousData = queryClient.getQueryData(eventCommentKeys.list(eventId));

			// Optimistic update
			if (userProfile) {
				const optimisticComment: EventComment = {
					id: `temp-${Date.now()}`,
					eventId,
					authorId: userProfile.id,
					author: userProfile,
					parentCommentId: newComment.parentCommentId,
					content: newComment.content,
					media: [],
					replies: [],
					reactions: [],
					status: "sending",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				queryClient.setQueryData(
					eventCommentKeys.list(eventId),
					(old: { pages: EventCommentsResponse[]; pageParams: unknown[] } | undefined) => {
						if (!old) return old;

						if (newComment.parentCommentId) {
							// Add as reply
							return {
								...old,
								pages: old.pages.map((page) => ({
									...page,
									items: page.items.map((comment) =>
										comment.id === newComment.parentCommentId
											? { ...comment, replies: [...comment.replies, optimisticComment] }
											: comment
									),
								})),
							};
						}

						// Add to top of first page
						return {
							...old,
							pages: old.pages.map((page, index) =>
								index === 0 ? { ...page, items: [optimisticComment, ...page.items] } : page
							),
						};
					}
				);
			}

			return { previousData };
		},
		onError: (err: Error, _newComment, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(eventCommentKeys.list(eventId), context.previousData);
			}
			toast.error(getErrorMessage(err, "Failed to post comment"));
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: eventCommentKeys.list(eventId) });
		},
	});
}

export function useUpdateEventComment(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ commentId, data }: { commentId: string; data: UpdateEventCommentRequest }) =>
			updateEventComment(eventId, commentId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: eventCommentKeys.list(eventId) });
		},
		onError: (err: Error) => {
			toast.error(getErrorMessage(err, "Failed to update comment"));
		},
	});
}

export function useDeleteEventComment(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (commentId: string) => deleteEventComment(eventId, commentId),
		onMutate: async (commentId) => {
			await queryClient.cancelQueries({ queryKey: eventCommentKeys.list(eventId) });

			const previousData = queryClient.getQueryData(eventCommentKeys.list(eventId));

			// Optimistic delete
			queryClient.setQueryData(
				eventCommentKeys.list(eventId),
				(old: { pages: EventCommentsResponse[]; pageParams: unknown[] } | undefined) => {
					if (!old) return old;
					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							items: page.items
								.filter((comment) => comment.id !== commentId)
								.map((comment) => ({
									...comment,
									replies: comment.replies.filter((reply) => reply.id !== commentId),
								})),
						})),
					};
				}
			);

			return { previousData };
		},
		onError: (err: Error, _commentId, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(eventCommentKeys.list(eventId), context.previousData);
			}
			toast.error(getErrorMessage(err, "Failed to delete comment"));
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: eventCommentKeys.list(eventId) });
		},
	});
}

// =============================================================================
// MEDIA UPLOAD
// =============================================================================

export function useEventMediaUpload() {
	return useMutation({
		mutationFn: async (file: File) => {
			const fileType = getMimeType(file);

			// 1. Get presigned URL from events service
			const { mediaId, uploadUrl } = await getEventMediaUploadUrl(
				fileType,
				file.name,
				file.size
			);

			// 2. Upload to storage
			await uploadFileToStorage(uploadUrl, file, fileType);

			// Note: No confirm call here - the backend confirms media internally
			// when creating/updating a comment with mediaIds

			return mediaId;
		},
	});
}

// =============================================================================
// REACTIONS
// =============================================================================

export function useAddEventCommentReaction(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
			addEventCommentReaction(eventId, commentId, emoji),
		onMutate: async ({ commentId, emoji }) => {
			await queryClient.cancelQueries({ queryKey: eventCommentKeys.list(eventId) });

			const previousData = queryClient.getQueryData(eventCommentKeys.list(eventId));

			// Optimistic update
			queryClient.setQueryData(
				eventCommentKeys.list(eventId),
				(old: { pages: EventCommentsResponse[]; pageParams: unknown[] } | undefined) => {
					if (!old) return old;

					const updateReactions = (comment: EventComment): EventComment => {
						if (comment.id === commentId) {
							const existingReaction = comment.reactions.find((r) => r.emoji === emoji);
							return {
								...comment,
								reactions: existingReaction
									? comment.reactions.map((r) =>
											r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true } : r
										)
									: [...comment.reactions, { emoji, count: 1, hasReacted: true }],
							};
						}
						return {
							...comment,
							replies: comment.replies.map(updateReactions),
						};
					};

					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							items: page.items.map(updateReactions),
						})),
					};
				}
			);

			return { previousData };
		},
		onError: (err: Error, _vars, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(eventCommentKeys.list(eventId), context.previousData);
			}
			toast.error(getErrorMessage(err, "Failed to add reaction"));
		},
	});
}

export function useRemoveEventCommentReaction(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
			removeEventCommentReaction(eventId, commentId, emoji),
		onMutate: async ({ commentId, emoji }) => {
			await queryClient.cancelQueries({ queryKey: eventCommentKeys.list(eventId) });

			const previousData = queryClient.getQueryData(eventCommentKeys.list(eventId));

			// Optimistic update
			queryClient.setQueryData(
				eventCommentKeys.list(eventId),
				(old: { pages: EventCommentsResponse[]; pageParams: unknown[] } | undefined) => {
					if (!old) return old;

					const updateReactions = (comment: EventComment): EventComment => {
						if (comment.id === commentId) {
							return {
								...comment,
								reactions: comment.reactions
									.map((r) =>
										r.emoji === emoji ? { ...r, count: r.count - 1, hasReacted: false } : r
									)
									.filter((r) => r.count > 0),
							};
						}
						return {
							...comment,
							replies: comment.replies.map(updateReactions),
						};
					};

					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							items: page.items.map(updateReactions),
						})),
					};
				}
			);

			return { previousData };
		},
		onError: (err: Error, _vars, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(eventCommentKeys.list(eventId), context.previousData);
			}
			toast.error(getErrorMessage(err, "Failed to remove reaction"));
		},
	});
}
