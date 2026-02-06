import { useQuery } from "@tanstack/react-query";
import {
	getPlayerDashboard,
	getCoachDashboard,
	getSkillProgress,
} from "@/lib/api/dashboard";

// Query keys
export const dashboardKeys = {
	all: ["dashboard"] as const,
	player: () => [...dashboardKeys.all, "player"] as const,
	coach: () => [...dashboardKeys.all, "coach"] as const,
	skillProgress: (months?: number) => [...dashboardKeys.all, "skill-progress", months] as const,
};

/**
 * Hook to fetch player dashboard data
 */
export function usePlayerDashboard(enabled: boolean = true) {
	return useQuery({
		queryKey: dashboardKeys.player(),
		queryFn: getPlayerDashboard,
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch coach dashboard data
 */
export function useCoachDashboard(enabled: boolean = true) {
	return useQuery({
		queryKey: dashboardKeys.coach(),
		queryFn: getCoachDashboard,
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch skill progress over time
 * @param months Number of months to retrieve (optional)
 */
export function useSkillProgress(months?: number, enabled: boolean = true) {
	return useQuery({
		queryKey: dashboardKeys.skillProgress(months),
		queryFn: () => getSkillProgress(months),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
