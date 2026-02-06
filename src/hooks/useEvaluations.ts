import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getEvaluationExercises,
	getEvaluationExercise,
	createEvaluationExercise,
	getEventEvaluationPlan,
	createEventEvaluationPlan,
	getEventPlayerEvaluations,
	createPlayerEvaluation,
	getMyEvaluations,
} from "@/lib/api/evaluations";
import {
	CreateEvaluationExerciseRequest,
	CreateEvaluationPlanRequest,
	CreatePlayerEvaluationRequest,
} from "@/lib/models/Evaluation";

// Type alias for backward compatibility
type CreateEventEvaluationPlanRequest = CreateEvaluationPlanRequest;

// Query keys
export const evaluationKeys = {
	all: ["evaluations"] as const,
	exercises: (page?: number, pageSize?: number) =>
		[...evaluationKeys.all, "exercises", page, pageSize] as const,
	exercise: (id: string) => [...evaluationKeys.all, "exercise", id] as const,
	eventPlan: (eventId: string) => [...evaluationKeys.all, "event-plan", eventId] as const,
	eventEvaluations: (eventId: string) =>
		[...evaluationKeys.all, "event-evaluations", eventId] as const,
	myEvaluations: (page?: number, pageSize?: number) =>
		[...evaluationKeys.all, "my", page, pageSize] as const,
};

// =============================================================================
// EVALUATION EXERCISES QUERIES
// =============================================================================

/**
 * Hook to fetch all evaluation exercises with pagination
 */
export function useEvaluationExercises(
	page: number = 1,
	pageSize: number = 20,
	enabled: boolean = true
) {
	return useQuery({
		queryKey: evaluationKeys.exercises(page, pageSize),
		queryFn: () => getEvaluationExercises(page, pageSize),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch a specific evaluation exercise
 */
export function useEvaluationExercise(id: string, enabled: boolean = true) {
	return useQuery({
		queryKey: evaluationKeys.exercise(id),
		queryFn: () => getEvaluationExercise(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to create a new evaluation exercise
 */
export function useCreateExercise() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: CreateEvaluationExerciseRequest) => createEvaluationExercise(request),
		onSuccess: (newExercise) => {
			// Update cache
			queryClient.setQueryData(evaluationKeys.exercise(newExercise.id), newExercise);
			// Invalidate exercises list
			queryClient.invalidateQueries({ queryKey: evaluationKeys.exercises() });
		},
	});
}

// =============================================================================
// EVENT EVALUATION PLAN QUERIES
// =============================================================================

/**
 * Hook to fetch evaluation plan for an event
 */
export function useEventEvaluationPlan(eventId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: evaluationKeys.eventPlan(eventId),
		queryFn: () => getEventEvaluationPlan(eventId),
		enabled: enabled && !!eventId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to create evaluation plan for an event
 */
export function useCreateEvaluationPlan(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: CreateEventEvaluationPlanRequest) =>
			createEventEvaluationPlan(eventId, request),
		onSuccess: (plan) => {
			// Update cache
			queryClient.setQueryData(evaluationKeys.eventPlan(eventId), plan);
		},
	});
}

// =============================================================================
// PLAYER EVALUATIONS QUERIES
// =============================================================================

/**
 * Hook to fetch all player evaluations for an event
 */
export function usePlayerEvaluations(eventId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: evaluationKeys.eventEvaluations(eventId),
		queryFn: () => getEventPlayerEvaluations(eventId),
		enabled: enabled && !!eventId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Hook to create a player evaluation for an event
 */
export function useCreatePlayerEvaluation(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: CreatePlayerEvaluationRequest) =>
			createPlayerEvaluation(eventId, request),
		onSuccess: () => {
			// Invalidate event evaluations
			queryClient.invalidateQueries({ queryKey: evaluationKeys.eventEvaluations(eventId) });
			// Invalidate my evaluations
			queryClient.invalidateQueries({ queryKey: evaluationKeys.myEvaluations() });
		},
	});
}

/**
 * Hook to fetch current user's evaluations with pagination
 */
export function useMyEvaluations(page: number = 1, pageSize: number = 20, enabled: boolean = true) {
	return useQuery({
		queryKey: evaluationKeys.myEvaluations(page, pageSize),
		queryFn: () => getMyEvaluations(page, pageSize),
		enabled,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}
