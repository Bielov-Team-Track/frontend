import { useQuery } from "@tanstack/react-query";
import {
	getMyReceivedFeedback,
	getFeedbackById,
} from "@/lib/api/feedback-player";

// Query keys
export const feedbackKeys = {
	all: ["feedback"] as const,
	myFeedback: (page?: number, pageSize?: number) =>
		[...feedbackKeys.all, "my", page, pageSize] as const,
	detail: (id?: string) => [...feedbackKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch current user's received feedback with pagination
 */
export function useMyFeedback(page: number = 1, pageSize: number = 20, enabled: boolean = true) {
	return useQuery({
		queryKey: feedbackKeys.myFeedback(page, pageSize),
		queryFn: () => getMyReceivedFeedback(page, pageSize),
		enabled,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Hook to fetch feedback by ID
 */
export function useFeedbackById(id?: string) {
	return useQuery({
		queryKey: feedbackKeys.detail(id),
		queryFn: () => getFeedbackById(id!),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}
