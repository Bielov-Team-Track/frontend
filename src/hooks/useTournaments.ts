import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createTournament,
	loadTournament,
	loadTournaments,
	loadMyTournaments,
	updateTournament,
	deleteTournament,
	startTournament,
	completeTournament,
	cancelTournament,
	loadSlots,
	assignTeamToSlot,
	clearSlot,
	addStage,
	deleteStage,
	generateStageMatches,
	assignTeamsToGroup,
	loadStandings,
	loadTournamentMatches,
	recordMatchScore,
	startMatch,
	completeMatch,
} from "@/lib/api/tournaments";
import {
	CreateTournamentRequest,
	UpdateTournamentRequest,
	AssignTeamToSlotRequest,
	RecordMatchScoreRequest,
	AddStageRequest,
	AssignTeamsToGroupRequest,
} from "@/lib/models/Tournament";

// Query keys
export const tournamentKeys = {
	all: ["tournaments"] as const,
	lists: () => [...tournamentKeys.all, "list"] as const,
	list: () => [...tournamentKeys.lists()] as const,
	myList: () => [...tournamentKeys.all, "my"] as const,
	details: () => [...tournamentKeys.all, "detail"] as const,
	detail: (id: string) => [...tournamentKeys.details(), id] as const,
	matches: (id: string) => [...tournamentKeys.all, "matches", id] as const,
	standings: (tournamentId: string, stageId: string) =>
		[...tournamentKeys.all, "standings", tournamentId, stageId] as const,
	slots: (id: string) => [...tournamentKeys.all, "slots", id] as const,
};

// =============================================================================
// TOURNAMENT QUERIES
// =============================================================================

/**
 * Hook to fetch a specific tournament by ID
 */
export function useTournament(id: string, enabled: boolean = true) {
	return useQuery({
		queryKey: tournamentKeys.detail(id),
		queryFn: () => loadTournament(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch all public tournaments
 */
export function useTournaments(enabled: boolean = true) {
	return useQuery({
		queryKey: tournamentKeys.list(),
		queryFn: () => loadTournaments(),
		enabled,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Hook to fetch tournaments organized by the current user
 */
export function useMyTournaments(enabled: boolean = true) {
	return useQuery({
		queryKey: tournamentKeys.myList(),
		queryFn: () => loadMyTournaments(),
		enabled,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Hook to fetch all matches for a tournament
 */
export function useTournamentMatches(id: string, enabled: boolean = true) {
	return useQuery({
		queryKey: tournamentKeys.matches(id),
		queryFn: () => loadTournamentMatches(id),
		enabled: enabled && !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Hook to fetch group standings for a tournament stage
 */
export function useTournamentStandings(tournamentId: string, stageId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: tournamentKeys.standings(tournamentId, stageId),
		queryFn: () => loadStandings(tournamentId, stageId),
		enabled: enabled && !!tournamentId && !!stageId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Hook to fetch slots for a tournament
 */
export function useTournamentSlots(id: string, enabled: boolean = true) {
	return useQuery({
		queryKey: tournamentKeys.slots(id),
		queryFn: () => loadSlots(id),
		enabled: enabled && !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// =============================================================================
// TOURNAMENT MUTATIONS
// =============================================================================

/**
 * Hook to create a new tournament
 */
export function useCreateTournament() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (req: CreateTournamentRequest) => createTournament(req),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.myList() });
		},
	});
}

/**
 * Hook to update an existing tournament
 */
export function useUpdateTournament(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (req: UpdateTournamentRequest) => updateTournament(id, req),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.myList() });
		},
	});
}

/**
 * Hook to delete a tournament
 */
export function useDeleteTournament() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteTournament(id),
		onSuccess: (_, id) => {
			queryClient.removeQueries({ queryKey: tournamentKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.myList() });
		},
	});
}

// =============================================================================
// SLOT MUTATIONS
// =============================================================================

/**
 * Hook to assign a team to a tournament slot
 */
export function useAssignTeamToSlot(tournamentId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ slotNumber, req }: { slotNumber: number; req: AssignTeamToSlotRequest }) =>
			assignTeamToSlot(tournamentId, slotNumber, req),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.slots(tournamentId) });
		},
	});
}

/**
 * Hook to clear a tournament slot
 */
export function useClearSlot(tournamentId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (slotNumber: number) => clearSlot(tournamentId, slotNumber),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.slots(tournamentId) });
		},
	});
}

// =============================================================================
// STATUS TRANSITION MUTATIONS
// =============================================================================

/**
 * Hook to start a tournament
 */
export function useStartTournament() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => startTournament(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.myList() });
		},
	});
}

/**
 * Hook to complete a tournament
 */
export function useCompleteTournament() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => completeTournament(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.myList() });
		},
	});
}

/**
 * Hook to cancel a tournament
 */
export function useCancelTournament() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => cancelTournament(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.myList() });
		},
	});
}

// =============================================================================
// STAGE MUTATIONS
// =============================================================================

/**
 * Hook to add a stage to a tournament
 */
export function useAddStage(tournamentId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (req: AddStageRequest) => addStage(tournamentId, req),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) });
		},
	});
}

/**
 * Hook to delete a stage from a tournament
 */
export function useDeleteStage(tournamentId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (stageId: string) => deleteStage(tournamentId, stageId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) });
		},
	});
}

/**
 * Hook to generate matches for a tournament stage
 */
export function useGenerateStageMatches(tournamentId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (stageId: string) => generateStageMatches(tournamentId, stageId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.matches(tournamentId) });
		},
	});
}

// =============================================================================
// GROUP MUTATIONS
// =============================================================================

/**
 * Hook to assign teams to a group within a stage
 */
export function useAssignTeamsToGroup(tournamentId: string, stageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (req: AssignTeamsToGroupRequest) => assignTeamsToGroup(tournamentId, stageId, req),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.standings(tournamentId, stageId) });
		},
	});
}

// =============================================================================
// MATCH SCORING MUTATIONS
// =============================================================================

/**
 * Hook to record a match score
 */
export function useRecordMatchScore(tournamentId: string, matchId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (req: RecordMatchScoreRequest) => recordMatchScore(matchId, req),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.matches(tournamentId) });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) });
		},
	});
}

/**
 * Hook to start a match
 */
export function useStartMatch(tournamentId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (matchId: string) => startMatch(matchId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.matches(tournamentId) });
		},
	});
}

/**
 * Hook to complete a match
 */
export function useCompleteMatch(tournamentId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (matchId: string) => completeMatch(matchId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tournamentKeys.matches(tournamentId) });
			queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) });
		},
	});
}
