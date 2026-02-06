import { useQuery } from "@tanstack/react-query";
import {
	getMyBadges,
	getMyBadgeStats,
	getRecentBadges,
	getUserBadges,
} from "@/lib/api/badges";

// Query keys
export const badgeKeys = {
	all: ["badges"] as const,
	myBadges: (page?: number, pageSize?: number) =>
		[...badgeKeys.all, "my", page, pageSize] as const,
	myStats: () => [...badgeKeys.all, "my", "stats"] as const,
	recent: (eventId?: string, limit?: number) =>
		[...badgeKeys.all, "recent", eventId, limit] as const,
	userBadges: (userId: string, page?: number, pageSize?: number) =>
		[...badgeKeys.all, "user", userId, page, pageSize] as const,
};

/**
 * Hook to fetch current user's badges with pagination
 */
export function useMyBadges(page: number = 1, pageSize: number = 20, enabled: boolean = true) {
	return useQuery({
		queryKey: badgeKeys.myBadges(page, pageSize),
		queryFn: () => getMyBadges(page, pageSize),
		enabled,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Hook to fetch current user's badge statistics
 */
export function useMyBadgeStats(enabled: boolean = true) {
	return useQuery({
		queryKey: badgeKeys.myStats(),
		queryFn: getMyBadgeStats,
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch recent badges awarded
 * @param eventId Optional event ID to filter by
 * @param limit Maximum number of badges to return
 */
export function useRecentBadges(eventId?: string, limit: number = 10, enabled: boolean = true) {
	return useQuery({
		queryKey: badgeKeys.recent(eventId, limit),
		queryFn: () => getRecentBadges(eventId, limit),
		enabled,
		staleTime: 1 * 60 * 1000, // 1 minute
	});
}

/**
 * Hook to fetch badges for a specific user
 */
export function useUserBadges(
	userId: string,
	page: number = 1,
	pageSize: number = 20,
	enabled: boolean = true
) {
	return useQuery({
		queryKey: badgeKeys.userBadges(userId, page, pageSize),
		queryFn: () => getUserBadges(userId, page, pageSize),
		enabled: enabled && !!userId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}
