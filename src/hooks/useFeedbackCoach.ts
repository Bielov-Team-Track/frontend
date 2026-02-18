import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { feedbackCoachApi } from "@/lib/api/feedback-coach";
import { feedbackKeys } from "@/hooks/useFeedback";
import type { CreateFeedbackRequest, UpdateFeedbackRequest } from "@/lib/models/Feedback";

// Coach-specific key namespace. Uses "feedback-coach" prefix to avoid collisions
// with player-side feedbackKeys (which use ["feedback", ...]).
export const coachFeedbackKeys = {
	all: ["feedback-coach"] as const,
	givenFeedback: (page: number, pageSize: number) =>
		[...coachFeedbackKeys.all, "given", page, pageSize] as const,
	canCreate: (recipientUserId: string, eventId?: string, clubId?: string) =>
		[...coachFeedbackKeys.all, "canCreate", recipientUserId, eventId, clubId] as const,
};

export function useMyGivenFeedback(page = 1, pageSize = 20, enabled = true) {
	return useQuery({
		queryKey: coachFeedbackKeys.givenFeedback(page, pageSize),
		queryFn: () => feedbackCoachApi.getMyGivenFeedback(page, pageSize),
		staleTime: 2 * 60 * 1000,
		enabled,
	});
}

export function useCanGiveFeedback(
	recipientUserId?: string,
	eventId?: string,
	clubId?: string
) {
	return useQuery({
		queryKey: coachFeedbackKeys.canCreate(recipientUserId ?? "", eventId, clubId),
		queryFn: () =>
			feedbackCoachApi.canCreateFeedback({
				recipientUserId: recipientUserId!,
				eventId,
				clubId,
			}),
		enabled: !!recipientUserId,
		staleTime: 2 * 60 * 1000,
	});
}

export function useCreateFeedback() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (dto: CreateFeedbackRequest) => feedbackCoachApi.createFeedback(dto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: coachFeedbackKeys.all });
			queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
		},
	});
}

export function useUpdateFeedback() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, dto }: { id: string; dto: UpdateFeedbackRequest }) =>
			feedbackCoachApi.updateFeedback(id, dto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: coachFeedbackKeys.all });
			queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
		},
	});
}

export function useDeleteFeedback() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => feedbackCoachApi.deleteFeedback(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: coachFeedbackKeys.all });
			queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
		},
	});
}

export function useShareFeedback() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, share }: { id: string; share: boolean }) =>
			feedbackCoachApi.shareFeedback(id, share),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: coachFeedbackKeys.all });
			queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
		},
	});
}
