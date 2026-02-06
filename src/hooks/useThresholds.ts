import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getClubThresholds,
	createClubThreshold,
	updateClubThreshold,
	deleteClubThreshold,
	checkPlayerThreshold,
} from "@/lib/api/thresholds";
import {
	CreateClubThresholdRequest,
	UpdateClubThresholdRequest,
} from "@/lib/models/Evaluation";

// Query keys
export const thresholdKeys = {
	all: ["thresholds"] as const,
	clubThresholds: (clubId: string) => [...thresholdKeys.all, "club", clubId] as const,
	playerCheck: (eventId: string, playerId: string) =>
		[...thresholdKeys.all, "check", eventId, playerId] as const,
};

// =============================================================================
// THRESHOLD QUERIES
// =============================================================================

/**
 * Hook to fetch all thresholds for a club
 */
export function useClubThresholds(clubId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: thresholdKeys.clubThresholds(clubId),
		queryFn: () => getClubThresholds(clubId),
		enabled: enabled && !!clubId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to check if a player meets threshold requirements for an event
 */
export function useCheckPlayerThreshold(
	eventId: string,
	playerId: string,
	enabled: boolean = true
) {
	return useQuery({
		queryKey: thresholdKeys.playerCheck(eventId, playerId),
		queryFn: () => checkPlayerThreshold(eventId, playerId),
		enabled: enabled && !!eventId && !!playerId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// =============================================================================
// THRESHOLD MUTATIONS
// =============================================================================

/**
 * Hook to create a new threshold for a club
 */
export function useCreateThreshold() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: CreateClubThresholdRequest) => createClubThreshold(request),
		onSuccess: (newThreshold) => {
			// Invalidate club thresholds
			queryClient.invalidateQueries({
				queryKey: thresholdKeys.clubThresholds(newThreshold.clubId),
			});
		},
	});
}

/**
 * Hook to update an existing threshold
 */
export function useUpdateThreshold() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			thresholdId,
			data,
		}: {
			thresholdId: string;
			data: UpdateClubThresholdRequest;
		}) => updateClubThreshold(thresholdId, data),
		onSuccess: (updatedThreshold) => {
			// Invalidate club thresholds
			queryClient.invalidateQueries({
				queryKey: thresholdKeys.clubThresholds(updatedThreshold.clubId),
			});
			// Invalidate any player checks
			queryClient.invalidateQueries({ queryKey: thresholdKeys.all });
		},
	});
}

/**
 * Hook to delete a threshold
 */
export function useDeleteThreshold() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (thresholdId: string) => deleteClubThreshold(thresholdId),
		onSuccess: () => {
			// Invalidate all threshold queries
			queryClient.invalidateQueries({ queryKey: thresholdKeys.all });
		},
	});
}
