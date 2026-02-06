import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getEvaluationExercises,
	getEvaluationExercise,
	createEvaluationExercise,
	updateEvaluationExercise,
	deleteEvaluationExercise,
	getClubEvaluationExercises,
	addExerciseMetric,
	updateExerciseMetric,
	deleteExerciseMetric,
} from "@/lib/api/evaluations";
import {
	CreateEvaluationExerciseRequest,
	UpdateEvaluationExerciseRequest,
	AddMetricRequest,
	UpdateEvaluationMetricRequest,
} from "@/lib/models/Evaluation";

// Query keys
export const exerciseKeys = {
	all: ["evaluation-exercises"] as const,
	lists: () => [...exerciseKeys.all, "list"] as const,
	list: (page?: number, pageSize?: number) => [...exerciseKeys.lists(), { page, pageSize }] as const,
	details: () => [...exerciseKeys.all, "detail"] as const,
	detail: (id: string) => [...exerciseKeys.details(), id] as const,
	clubExercises: (clubId: string) => [...exerciseKeys.all, "club", clubId] as const,
};

// =============================================================================
// EXERCISE QUERIES
// =============================================================================

export function useEvaluationExercises(page: number = 1, pageSize: number = 20, enabled: boolean = true) {
	return useQuery({
		queryKey: exerciseKeys.list(page, pageSize),
		queryFn: () => getEvaluationExercises(page, pageSize),
		enabled,
		staleTime: 0,
		refetchOnMount: "always",
	});
}

export function useEvaluationExercise(id: string, enabled: boolean = true) {
	return useQuery({
		queryKey: exerciseKeys.detail(id),
		queryFn: () => getEvaluationExercise(id),
		enabled: enabled && !!id,
		staleTime: 0,
		refetchOnMount: "always",
	});
}

export function useClubEvaluationExercises(clubId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: exerciseKeys.clubExercises(clubId),
		queryFn: () => getClubEvaluationExercises(clubId),
		enabled: enabled && !!clubId,
	});
}

// =============================================================================
// EXERCISE MUTATIONS
// =============================================================================

export function useCreateEvaluationExercise() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: CreateEvaluationExerciseRequest) => createEvaluationExercise(request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
		},
	});
}

export function useUpdateEvaluationExercise() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateEvaluationExerciseRequest }) =>
			updateEvaluationExercise(id, data),
		onSuccess: (updatedExercise) => {
			queryClient.setQueryData(exerciseKeys.detail(updatedExercise.id), updatedExercise);
			queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
		},
	});
}

export function useDeleteEvaluationExercise() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteEvaluationExercise(id),
		onSuccess: (_, id) => {
			queryClient.removeQueries({ queryKey: exerciseKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
		},
	});
}

// =============================================================================
// METRIC MUTATIONS
// =============================================================================

export function useAddExerciseMetric() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ exerciseId, data }: { exerciseId: string; data: AddMetricRequest }) =>
			addExerciseMetric(exerciseId, data),
		onSuccess: (updatedExercise) => {
			queryClient.setQueryData(exerciseKeys.detail(updatedExercise.id), updatedExercise);
			queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
		},
	});
}

export function useUpdateExerciseMetric() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ exerciseId, metricId, data }: { exerciseId: string; metricId: string; data: UpdateEvaluationMetricRequest }) =>
			updateExerciseMetric(exerciseId, metricId, data),
		onSuccess: (updatedExercise) => {
			queryClient.setQueryData(exerciseKeys.detail(updatedExercise.id), updatedExercise);
		},
	});
}

export function useDeleteExerciseMetric() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ exerciseId, metricId }: { exerciseId: string; metricId: string }) =>
			deleteExerciseMetric(exerciseId, metricId),
		onSuccess: (_, { exerciseId }) => {
			queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(exerciseId) });
		},
	});
}
