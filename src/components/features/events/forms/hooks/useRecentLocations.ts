import { useQuery } from "@tanstack/react-query";
import { loadEvents } from "@/lib/api/events";
import { useAuth } from "@/providers/AuthProvider";
import { Location } from "@/lib/models/Event";

/**
 * Hook to fetch and deduplicate recent locations from user's past events.
 * Returns up to 5 unique locations based on the user's organized events.
 */
export function useRecentLocations() {
	const { userProfile } = useAuth();

	return useQuery({
		queryKey: ["recent-locations", userProfile?.id],
		queryFn: async () => {
			if (!userProfile?.id) {
				return [];
			}

			// Fetch recent events organized by the current user
			const response = await loadEvents({
				organizerId: userProfile.id,
				limit: 20,
				sortBy: "startDate",
				sortOrder: "desc",
			});

			// Extract locations and deduplicate by name
			const locationMap = new Map<string, Location>();

			for (const event of response.items) {
				if (event.location && event.location.name) {
					const key = event.location.name.toLowerCase();
					if (!locationMap.has(key)) {
						locationMap.set(key, event.location);
					}
				}
			}

			// Return up to 5 recent unique locations
			return Array.from(locationMap.values()).slice(0, 5);
		},
		enabled: !!userProfile?.id,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
