import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	loadEvent,
	loadEvents,
	loadParticipants,
	getMyParticipation,
	joinEvent,
	leaveEvent,
	createEvent,
	saveEvent,
	deleteEvent,
	cancelEvent,
	inviteUsers,
	respondToInvitation,
	removeParticipant,
} from "@/lib/api/events";
import { CreateEvent, Event, EventFilterRequest } from "@/lib/models/Event";
import { EventParticipant } from "@/lib/models/EventParticipant";

// Query keys
export const eventKeys = {
	all: ["events"] as const,
	lists: () => [...eventKeys.all, "list"] as const,
	list: (filter?: EventFilterRequest) => [...eventKeys.lists(), filter] as const,
	infiniteLists: () => [...eventKeys.all, "infinite"] as const,
	infiniteList: (filter?: EventFilterRequest) => [...eventKeys.infiniteLists(), filter] as const,
	details: () => [...eventKeys.all, "detail"] as const,
	detail: (id: string) => [...eventKeys.details(), id] as const,
	participants: (eventId: string) => ["event-participants", eventId] as const,
	myParticipation: (eventId: string) => ["event-my-participation", eventId] as const,
};

// =============================================================================
// EVENT QUERIES
// =============================================================================

/**
 * Hook to fetch a specific event by ID
 */
export function useEvent(eventId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: eventKeys.detail(eventId),
		queryFn: () => loadEvent(eventId),
		enabled: enabled && !!eventId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch events with optional filters (single page)
 */
export function useEvents(filter?: EventFilterRequest, enabled: boolean = true) {
	return useQuery({
		queryKey: eventKeys.list(filter),
		queryFn: async () => {
			const response = await loadEvents(filter);
			return response.items;
		},
		enabled,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Hook to fetch events with infinite scroll pagination.
 * Uses offset-based pagination with useInfiniteQuery.
 */
export function useInfiniteEvents(filter?: EventFilterRequest, enabled: boolean = true) {
	return useInfiniteQuery({
		queryKey: eventKeys.infiniteList(filter),
		queryFn: ({ pageParam = 1 }) => loadEvents(filter, pageParam),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (lastPage.page < lastPage.totalPages) {
				return lastPage.page + 1;
			}
			return undefined;
		},
		enabled,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Hook to fetch event participants with infinite scroll pagination
 */
export function useEventParticipants(eventId: string, limit: number = 20, enabled: boolean = true) {
	return useInfiniteQuery({
		queryKey: eventKeys.participants(eventId),
		queryFn: ({ pageParam }) => loadParticipants(eventId, pageParam, limit),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
		enabled: enabled && !!eventId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

/**
 * Hook to fetch current user's participation in an event
 */
export function useMyParticipation(eventId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: eventKeys.myParticipation(eventId),
		queryFn: () => getMyParticipation(eventId),
		enabled: enabled && !!eventId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// =============================================================================
// EVENT MUTATIONS
// =============================================================================

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (event: CreateEvent) => createEvent(event),
		onSuccess: () => {
			// Invalidate events list
			queryClient.invalidateQueries({ queryKey: eventKeys.all });
		},
	});
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (event: Event) => saveEvent(event),
		onSuccess: (_, variables) => {
			// Update cache
			queryClient.setQueryData(eventKeys.detail(variables.id), variables);
			// Invalidate events list
			queryClient.invalidateQueries({ queryKey: eventKeys.all });
		},
	});
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (eventId: string) => deleteEvent(eventId),
		onSuccess: (_, eventId) => {
			// Remove from cache
			queryClient.removeQueries({ queryKey: eventKeys.detail(eventId) });
			// Invalidate events list
			queryClient.invalidateQueries({ queryKey: eventKeys.all });
		},
	});
}

/**
 * Hook to cancel an event
 */
export function useCancelEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (eventId: string) => cancelEvent(eventId),
		onSuccess: (_, eventId) => {
			// Invalidate event details
			queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
			// Invalidate events list
			queryClient.invalidateQueries({ queryKey: eventKeys.all });
		},
	});
}

// =============================================================================
// PARTICIPANT MUTATIONS
// =============================================================================

/**
 * Hook to join an event
 */
export function useJoinEvent(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => joinEvent(eventId),
		onSuccess: () => {
			// Invalidate participants and my participation
			queryClient.invalidateQueries({ queryKey: eventKeys.participants(eventId) });
			queryClient.invalidateQueries({ queryKey: eventKeys.myParticipation(eventId) });
		},
	});
}

/**
 * Hook to leave an event
 */
export function useLeaveEvent(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => leaveEvent(eventId),
		onSuccess: () => {
			// Invalidate participants and my participation
			queryClient.invalidateQueries({ queryKey: eventKeys.participants(eventId) });
			queryClient.invalidateQueries({ queryKey: eventKeys.myParticipation(eventId) });
		},
	});
}

/**
 * Hook to invite users to an event
 */
export function useInviteUsers(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userIds: string[]) => inviteUsers(eventId, userIds),
		onSuccess: () => {
			// Invalidate participants
			queryClient.invalidateQueries({ queryKey: eventKeys.participants(eventId) });
		},
	});
}

/**
 * Hook to respond to an event invitation
 */
export function useRespondToInvitation(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ accept, declineNote }: { accept: boolean; declineNote?: string }) =>
			respondToInvitation(eventId, accept, declineNote),
		onSuccess: () => {
			// Invalidate participants and my participation
			queryClient.invalidateQueries({ queryKey: eventKeys.participants(eventId) });
			queryClient.invalidateQueries({ queryKey: eventKeys.myParticipation(eventId) });
		},
	});
}

/**
 * Hook to remove a participant from an event
 */
export function useRemoveParticipant(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: string) => removeParticipant(eventId, userId),
		onSuccess: () => {
			// Invalidate participants
			queryClient.invalidateQueries({ queryKey: eventKeys.participants(eventId) });
		},
	});
}
