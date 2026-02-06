import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getEventEvaluationPlan,
	createEventEvaluationPlan,
	updateEvaluationPlan,
	deleteEvaluationPlan,
	addPlanItem,
	removePlanItem,
	reorderPlanItems,
	getMyEvaluationPlans,
} from "@/lib/api/evaluations";
import {
	CreateEvaluationPlanRequest,
	UpdateEvaluationPlanRequest,
	AddPlanItemRequest,
	ReorderPlanItemsRequest,
} from "@/lib/models/Evaluation";

// Query keys
export const planKeys = {
	all: ["evaluation-plans"] as const,
	details: () => [...planKeys.all, "detail"] as const,
	detail: (planId: string) => [...planKeys.details(), planId] as const,
	eventPlan: (eventId: string) => [...planKeys.all, "event", eventId] as const,
	myPlans: () => [...planKeys.all, "my"] as const,
};

// =============================================================================
// PLAN QUERIES
// =============================================================================

export function useEventEvaluationPlan(eventId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: planKeys.eventPlan(eventId),
		queryFn: () => getEventEvaluationPlan(eventId),
		enabled: enabled && !!eventId,
		staleTime: 0,
		refetchOnMount: "always",
	});
}

export function useMyEvaluationPlans(enabled: boolean = true) {
	return useQuery({
		queryKey: planKeys.myPlans(),
		queryFn: () => getMyEvaluationPlans(),
		enabled,
		staleTime: 0,
		refetchOnMount: "always",
	});
}

// =============================================================================
// PLAN MUTATIONS
// =============================================================================

export function useCreateEvaluationPlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ eventId, data }: { eventId: string; data: CreateEvaluationPlanRequest }) =>
			createEventEvaluationPlan(eventId, data),
		onSuccess: (plan) => {
			queryClient.setQueryData(planKeys.eventPlan(plan.eventId), plan);
			queryClient.invalidateQueries({ queryKey: planKeys.details() });
		},
	});
}

export function useUpdateEvaluationPlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ planId, data }: { planId: string; data: UpdateEvaluationPlanRequest }) =>
			updateEvaluationPlan(planId, data),
		onSuccess: (updatedPlan) => {
			queryClient.setQueryData(planKeys.eventPlan(updatedPlan.eventId), updatedPlan);
			queryClient.invalidateQueries({ queryKey: planKeys.details() });
		},
	});
}

export function useDeleteEvaluationPlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (planId: string) => deleteEvaluationPlan(planId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: planKeys.all });
		},
	});
}

export function useAddPlanItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ planId, data }: { planId: string; data: AddPlanItemRequest }) =>
			addPlanItem(planId, data),
		onSuccess: (updatedPlan) => {
			queryClient.setQueryData(planKeys.eventPlan(updatedPlan.eventId), updatedPlan);
		},
	});
}

export function useRemovePlanItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ planId, itemId }: { planId: string; itemId: string }) =>
			removePlanItem(planId, itemId),
		onSuccess: (_, { planId }) => {
			queryClient.invalidateQueries({ queryKey: planKeys.details() });
		},
	});
}

export function useReorderPlanItems() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ planId, data }: { planId: string; data: ReorderPlanItemsRequest }) =>
			reorderPlanItems(planId, data),
		onSuccess: (updatedPlan) => {
			queryClient.setQueryData(planKeys.eventPlan(updatedPlan.eventId), updatedPlan);
		},
	});
}
