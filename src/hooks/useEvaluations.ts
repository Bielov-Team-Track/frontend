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
	getEvaluationSession,
	getMySessions,
	getClubSessions,
	createEvaluationSession,
	updateEvaluationSession,
	deleteEvaluationSession,
	addSessionParticipants,
	removeSessionParticipant,
	startSession,
	pauseSession,
	resumeSession,
	completeSession,
	getSessionProgress,
	updateSessionSharing,
	updatePlayerSharing,
	createGroup,
	updateGroup,
	deleteGroup,
	autoSplitGroups,
	addPlayerToGroup,
	removePlayerFromGroup,
	movePlayer,
	submitExerciseScores,
	getSessionScores,
	getGroupExerciseScores,
} from "@/lib/api/evaluations";
import {
	CreateEvaluationExerciseRequest,
	CreateEvaluationPlanRequest,
	CreatePlayerEvaluationRequest,
	CreateEvaluationSessionRequest,
	UpdateEvaluationSessionRequest,
	UpdateSharingRequest,
	UpdatePlayerSharingRequest,
	CreateGroupRequest,
	UpdateGroupRequest,
	AutoSplitGroupsRequest,
	AssignPlayerToGroupRequest,
	MovePlayerRequest,
	SubmitExerciseScoresRequest,
	AddParticipantsRequest,
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
	sessions: () => [...evaluationKeys.all, "sessions"] as const,
	session: (id: string) => [...evaluationKeys.all, "session", id] as const,
	mySessions: (page?: number, pageSize?: number) =>
		[...evaluationKeys.all, "my-sessions", page, pageSize] as const,
	clubSessions: (clubId: string, page?: number, pageSize?: number) =>
		[...evaluationKeys.all, "club-sessions", clubId, page, pageSize] as const,
	sessionProgress: (id: string) => [...evaluationKeys.all, "session-progress", id] as const,
	sessionScores: (id: string) => [...evaluationKeys.all, "session-scores", id] as const,
	groupExerciseScores: (sessionId: string, groupId: string, exerciseId: string) =>
		[...evaluationKeys.all, "group-exercise-scores", sessionId, groupId, exerciseId] as const,
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

// =============================================================================
// EVALUATION SESSION QUERIES
// =============================================================================

export function useEvaluationSession(sessionId: string | null, enabled = true) {
	return useQuery({
		queryKey: evaluationKeys.session(sessionId ?? ""),
		queryFn: () => getEvaluationSession(sessionId!),
		enabled: enabled && !!sessionId,
		staleTime: 2 * 60 * 1000,
	});
}

export function useMySessions(page: number = 1, pageSize: number = 20, enabled = true) {
	return useQuery({
		queryKey: evaluationKeys.mySessions(page, pageSize),
		queryFn: () => getMySessions(page, pageSize),
		enabled,
		staleTime: 2 * 60 * 1000,
	});
}

export function useClubSessions(clubId: string, page: number = 1, pageSize: number = 20, enabled = true) {
	return useQuery({
		queryKey: evaluationKeys.clubSessions(clubId, page, pageSize),
		queryFn: () => getClubSessions(clubId, page, pageSize),
		enabled: enabled && !!clubId,
		staleTime: 2 * 60 * 1000,
	});
}

export function useSessionProgress(sessionId: string | null, enabled = true) {
	return useQuery({
		queryKey: evaluationKeys.sessionProgress(sessionId ?? ""),
		queryFn: () => getSessionProgress(sessionId!),
		enabled: enabled && !!sessionId,
		staleTime: 30 * 1000, // 30 seconds - more frequent for live data
	});
}

export function useSessionScores(sessionId: string | null, enabled = true) {
	return useQuery({
		queryKey: evaluationKeys.sessionScores(sessionId ?? ""),
		queryFn: () => getSessionScores(sessionId!),
		enabled: enabled && !!sessionId,
		staleTime: 30 * 1000,
	});
}

export function useGroupExerciseScores(
	sessionId: string | null,
	groupId: string | null,
	exerciseId: string | null,
	enabled = true
) {
	return useQuery({
		queryKey: evaluationKeys.groupExerciseScores(sessionId ?? "", groupId ?? "", exerciseId ?? ""),
		queryFn: () => getGroupExerciseScores(sessionId!, groupId!, exerciseId!),
		enabled: enabled && !!sessionId && !!groupId && !!exerciseId,
		staleTime: 30 * 1000,
	});
}

// =============================================================================
// EVALUATION SESSION MUTATIONS
// =============================================================================

export function useCreateEvaluationSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: CreateEvaluationSessionRequest) => createEvaluationSession(request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evaluationKeys.sessions() });
		},
	});
}

export function useUpdateEvaluationSession(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: UpdateEvaluationSessionRequest) => updateEvaluationSession(sessionId, request),
		onSuccess: (session) => {
			queryClient.setQueryData(evaluationKeys.session(sessionId), session);
		},
	});
}

export function useDeleteEvaluationSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (sessionId: string) => deleteEvaluationSession(sessionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evaluationKeys.sessions() });
		},
	});
}

export function useAddSessionParticipants(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: AddParticipantsRequest) => addSessionParticipants(sessionId, request),
		onSuccess: (session) => {
			queryClient.setQueryData(evaluationKeys.session(sessionId), session);
		},
	});
}

export function useRemoveSessionParticipant(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (participantId: string) => removeSessionParticipant(sessionId, participantId),
		onSuccess: (session) => {
			queryClient.setQueryData(evaluationKeys.session(sessionId), session);
		},
	});
}

export function useStartSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (sessionId: string) => startSession(sessionId),
		onSuccess: (session) => {
			queryClient.setQueryData(evaluationKeys.session(session.id), session);
			queryClient.invalidateQueries({ queryKey: evaluationKeys.sessions() });
		},
	});
}

export function usePauseSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (sessionId: string) => pauseSession(sessionId),
		onSuccess: (session) => {
			queryClient.setQueryData(evaluationKeys.session(session.id), session);
		},
	});
}

export function useResumeSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (sessionId: string) => resumeSession(sessionId),
		onSuccess: (session) => {
			queryClient.setQueryData(evaluationKeys.session(session.id), session);
		},
	});
}

export function useCompleteSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (sessionId: string) => completeSession(sessionId),
		onSuccess: (session) => {
			queryClient.setQueryData(evaluationKeys.session(session.id), session);
			queryClient.invalidateQueries({ queryKey: evaluationKeys.sessions() });
		},
	});
}

export function useUpdateSessionSharing(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: UpdateSharingRequest) => updateSessionSharing(sessionId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evaluationKeys.session(sessionId) });
		},
	});
}

export function useUpdatePlayerSharing(sessionId: string) {
	return useMutation({
		mutationFn: ({ evaluationId, request }: { evaluationId: string; request: UpdatePlayerSharingRequest }) =>
			updatePlayerSharing(sessionId, evaluationId, request),
	});
}

// === GROUP MUTATIONS ===

export function useCreateGroup(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: CreateGroupRequest) => createGroup(sessionId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evaluationKeys.session(sessionId) });
		},
	});
}

export function useUpdateGroup(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ groupId, request }: { groupId: string; request: UpdateGroupRequest }) =>
			updateGroup(sessionId, groupId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evaluationKeys.session(sessionId) });
		},
	});
}

export function useDeleteGroup(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (groupId: string) => deleteGroup(sessionId, groupId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evaluationKeys.session(sessionId) });
		},
	});
}

export function useAutoSplitGroups(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: AutoSplitGroupsRequest) => autoSplitGroups(sessionId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evaluationKeys.session(sessionId) });
		},
	});
}

export function useAddPlayerToGroup(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ groupId, request }: { groupId: string; request: AssignPlayerToGroupRequest }) =>
			addPlayerToGroup(sessionId, groupId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evaluationKeys.session(sessionId) });
		},
	});
}

export function useRemovePlayerFromGroup(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ groupId, playerId }: { groupId: string; playerId: string }) =>
			removePlayerFromGroup(sessionId, groupId, playerId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evaluationKeys.session(sessionId) });
		},
	});
}

export function useMovePlayer(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: MovePlayerRequest) => movePlayer(sessionId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evaluationKeys.session(sessionId) });
		},
	});
}

// === SCORING MUTATIONS ===

export function useSubmitExerciseScores(sessionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: SubmitExerciseScoresRequest) => submitExerciseScores(sessionId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evaluationKeys.sessionScores(sessionId) });
			queryClient.invalidateQueries({ queryKey: evaluationKeys.sessionProgress(sessionId) });
		},
	});
}
