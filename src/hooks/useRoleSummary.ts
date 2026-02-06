import { useQuery } from "@tanstack/react-query";
import { getMyRoleSummary } from "@/lib/api/clubs/clubs";
import { RoleSummaryResponse } from "@/lib/models/Club";

export const roleSummaryKeys = {
	all: ["role-summary"] as const,
	summary: () => [...roleSummaryKeys.all] as const,
};

/**
 * Hook to fetch the current user's role summary across all clubs.
 * Returns aggregated information about club memberships, team assignments, and group memberships.
 * @param enabled Whether the query should run (default: true)
 */
export const useRoleSummary = (enabled: boolean = true) => {
	return useQuery<RoleSummaryResponse>({
		queryKey: roleSummaryKeys.summary(),
		queryFn: () => getMyRoleSummary(),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
