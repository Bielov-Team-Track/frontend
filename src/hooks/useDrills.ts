import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
    loadDrills,
    loadDrill,
    createDrill,
    updateDrill,
    deleteDrill,
    loadMyDrills,
    loadClubDrills,
    likeDrill,
    unlikeDrill,
    getLikeStatus,
    bookmarkDrill,
    unbookmarkDrill,
    loadMyBookmarkedDrills,
    createDrillComment,
    loadDrillComments,
    deleteDrillComment,
    addDrillAttachment,
    deleteDrillAttachment,
    updateDrillAnimation,
} from "@/lib/api/drills";
import { getMyClubMembership } from "@/lib/api/clubs/clubs";
import {
    Drill,
    DrillFilterRequest,
    CreateDrillRequest,
    UpdateDrillRequest,
    CreateDrillCommentRequest,
    CreateDrillAttachmentRequest,
    DrillAnimation,
} from "@/lib/models/Drill";
import { ClubRole } from "@/lib/models/Club";
import { useMemo } from "react";

// Query keys
export const drillKeys = {
    all: ["drills"] as const,
    lists: () => [...drillKeys.all, "list"] as const,
    list: (filter?: DrillFilterRequest) => [...drillKeys.lists(), filter] as const,
    details: () => [...drillKeys.all, "detail"] as const,
    detail: (id: string) => [...drillKeys.details(), id] as const,
    myDrills: () => [...drillKeys.all, "my"] as const,
    clubDrills: (clubId: string) => [...drillKeys.all, "club", clubId] as const,
    likes: () => [...drillKeys.all, "likes"] as const,
    likeStatus: (drillId: string) => [...drillKeys.likes(), drillId] as const,
    bookmarks: () => [...drillKeys.all, "bookmarks"] as const,
    myBookmarks: () => [...drillKeys.bookmarks(), "my"] as const,
    comments: () => [...drillKeys.all, "comments"] as const,
    drillComments: (drillId: string) => [...drillKeys.comments(), drillId] as const,
};

// Club query keys (for membership checks)
export const clubKeys = {
    all: ["clubs"] as const,
    myMembership: (clubId: string) => [...clubKeys.all, "my-membership", clubId] as const,
};

// Roles that can edit club drills
const DRILL_EDIT_ROLES: ClubRole[] = [ClubRole.Owner, ClubRole.Admin, ClubRole.Coach];

// =============================================================================
// DRILLS QUERIES
// =============================================================================

/**
 * Hook to fetch all public drills with optional filtering
 */
export function useDrills(filter?: DrillFilterRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: drillKeys.list(filter),
        queryFn: () => loadDrills(filter),
        enabled,
        staleTime: 0, // Data is immediately stale
        refetchOnMount: "always", // Always refetch when component mounts
    });
}

/**
 * Hook to fetch a single drill by ID
 */
export function useDrill(drillId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: drillKeys.detail(drillId),
        queryFn: () => loadDrill(drillId),
        enabled: enabled && !!drillId,
        staleTime: 0, // Data is immediately stale
        refetchOnMount: "always", // Always refetch when component mounts
    });
}

/**
 * Hook to fetch current user's drills (includes private)
 */
export function useMyDrills(enabled: boolean = true) {
    return useQuery({
        queryKey: drillKeys.myDrills(),
        queryFn: loadMyDrills,
        enabled,
    });
}

/**
 * Hook to fetch drills for a specific club
 */
export function useClubDrills(clubId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: drillKeys.clubDrills(clubId),
        queryFn: () => loadClubDrills(clubId),
        enabled: enabled && !!clubId,
    });
}

// =============================================================================
// DRILLS MUTATIONS
// =============================================================================

/**
 * Hook to create a new drill
 */
export function useCreateDrill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateDrillRequest) => createDrill(request),
        onSuccess: () => {
            // Invalidate drill lists
            queryClient.invalidateQueries({ queryKey: drillKeys.lists() });
            queryClient.invalidateQueries({ queryKey: drillKeys.myDrills() });
        },
    });
}

/**
 * Hook to update a drill
 */
export function useUpdateDrill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ drillId, data }: { drillId: string; data: UpdateDrillRequest }) =>
            updateDrill(drillId, data),
        onSuccess: (updatedDrill) => {
            // Update cache
            queryClient.setQueryData(drillKeys.detail(updatedDrill.id), updatedDrill);
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: drillKeys.lists() });
            queryClient.invalidateQueries({ queryKey: drillKeys.myDrills() });
        },
    });
}

/**
 * Hook to delete a drill
 */
export function useDeleteDrill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (drillId: string) => deleteDrill(drillId),
        onSuccess: (_, drillId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: drillKeys.detail(drillId) });
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: drillKeys.lists() });
            queryClient.invalidateQueries({ queryKey: drillKeys.myDrills() });
        },
    });
}

// =============================================================================
// LIKES QUERIES & MUTATIONS
// =============================================================================

/**
 * Hook to get like status for a drill
 */
export function useLikeStatus(drillId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: drillKeys.likeStatus(drillId),
        queryFn: () => getLikeStatus(drillId),
        enabled: enabled && !!drillId,
    });
}

/**
 * Hook to like a drill
 */
export function useLikeDrill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (drillId: string) => likeDrill(drillId),
        onSuccess: (status, drillId) => {
            // Update like status cache
            queryClient.setQueryData(drillKeys.likeStatus(drillId), status);
            // Invalidate drill detail to update like count
            queryClient.invalidateQueries({ queryKey: drillKeys.detail(drillId) });
            queryClient.invalidateQueries({ queryKey: drillKeys.lists() });
        },
    });
}

/**
 * Hook to unlike a drill
 */
export function useUnlikeDrill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (drillId: string) => unlikeDrill(drillId),
        onSuccess: (status, drillId) => {
            // Update like status cache
            queryClient.setQueryData(drillKeys.likeStatus(drillId), status);
            // Invalidate drill detail to update like count
            queryClient.invalidateQueries({ queryKey: drillKeys.detail(drillId) });
            queryClient.invalidateQueries({ queryKey: drillKeys.lists() });
        },
    });
}

// =============================================================================
// BOOKMARKS QUERIES & MUTATIONS
// =============================================================================

/**
 * Hook to get current user's bookmarked drills
 */
export function useMyBookmarkedDrills(enabled: boolean = true) {
    return useQuery({
        queryKey: drillKeys.myBookmarks(),
        queryFn: loadMyBookmarkedDrills,
        enabled,
    });
}

/**
 * Hook to bookmark a drill
 */
export function useBookmarkDrill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (drillId: string) => bookmarkDrill(drillId),
        onSuccess: (_, drillId) => {
            // Invalidate bookmarks list
            queryClient.invalidateQueries({ queryKey: drillKeys.myBookmarks() });
            // Invalidate drill detail and lists to update isBookmarked state
            queryClient.invalidateQueries({ queryKey: drillKeys.detail(drillId) });
            queryClient.invalidateQueries({ queryKey: drillKeys.lists() });
        },
    });
}

/**
 * Hook to remove bookmark from a drill
 */
export function useUnbookmarkDrill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (drillId: string) => unbookmarkDrill(drillId),
        onSuccess: (_, drillId) => {
            // Invalidate bookmarks list
            queryClient.invalidateQueries({ queryKey: drillKeys.myBookmarks() });
            // Invalidate drill detail and lists to update isBookmarked state
            queryClient.invalidateQueries({ queryKey: drillKeys.detail(drillId) });
            queryClient.invalidateQueries({ queryKey: drillKeys.lists() });
        },
    });
}

// =============================================================================
// COMMENTS QUERIES & MUTATIONS
// =============================================================================

/**
 * Hook to fetch comments for a drill with infinite scrolling
 */
export function useDrillComments(drillId: string, limit: number = 20, enabled: boolean = true) {
    return useInfiniteQuery({
        queryKey: drillKeys.drillComments(drillId),
        queryFn: ({ pageParam }) => loadDrillComments(drillId, pageParam, limit),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
        enabled: enabled && !!drillId,
    });
}

/**
 * Hook to create a comment on a drill
 */
export function useCreateDrillComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ drillId, data }: { drillId: string; data: CreateDrillCommentRequest }) =>
            createDrillComment(drillId, data),
        onSuccess: (_, { drillId }) => {
            // Invalidate comments
            queryClient.invalidateQueries({ queryKey: drillKeys.drillComments(drillId) });
        },
    });
}

/**
 * Hook to delete a comment
 */
export function useDeleteDrillComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ drillId, commentId }: { drillId: string; commentId: string }) =>
            deleteDrillComment(drillId, commentId),
        onSuccess: (_, { drillId }) => {
            // Invalidate comments
            queryClient.invalidateQueries({ queryKey: drillKeys.drillComments(drillId) });
        },
    });
}

// =============================================================================
// ATTACHMENTS MUTATIONS
// =============================================================================

/**
 * Hook to add an attachment to a drill
 */
export function useAddDrillAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ drillId, data }: { drillId: string; data: CreateDrillAttachmentRequest }) =>
            addDrillAttachment(drillId, data),
        onSuccess: (_, { drillId }) => {
            // Invalidate drill detail
            queryClient.invalidateQueries({ queryKey: drillKeys.detail(drillId) });
        },
    });
}

/**
 * Hook to delete an attachment from a drill
 */
export function useDeleteDrillAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ drillId, attachmentId }: { drillId: string; attachmentId: string }) =>
            deleteDrillAttachment(drillId, attachmentId),
        onSuccess: (_, { drillId }) => {
            // Invalidate drill detail
            queryClient.invalidateQueries({ queryKey: drillKeys.detail(drillId) });
        },
    });
}

// =============================================================================
// ANIMATION MUTATIONS
// =============================================================================

/**
 * Hook to update a drill's animation
 */
export function useUpdateDrillAnimation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ drillId, animation }: { drillId: string; animation: DrillAnimation | null }) =>
            updateDrillAnimation(drillId, animation),
        onSuccess: (updatedDrill) => {
            // Update cache with the returned drill data
            queryClient.setQueryData(drillKeys.detail(updatedDrill.id), updatedDrill);
        },
    });
}

// =============================================================================
// CLUB MEMBERSHIP QUERIES (for drill edit permissions)
// =============================================================================

/**
 * Hook to fetch the current user's membership in a club (lightweight)
 */
export function useMyClubMembership(clubId: string | undefined, enabled: boolean = true) {
    return useQuery({
        queryKey: clubKeys.myMembership(clubId || ""),
        queryFn: () => getMyClubMembership(clubId!),
        enabled: enabled && !!clubId,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
}

/**
 * Hook to check if the current user can edit a drill
 * Returns true if:
 * - User is the creator of the drill
 * - OR drill belongs to a club and user is Owner, Admin, or Coach in that club
 */
export function useCanEditDrill(drill: Drill | undefined, currentUserId: string | undefined) {
    const { data: membership, isLoading: isLoadingMembership } = useMyClubMembership(
        drill?.clubId,
        !!drill?.clubId && !!currentUserId
    );

    const canEdit = useMemo(() => {
        if (!drill || !currentUserId) return false;

        // Check if user is the creator
        if (drill.createdByUserId === currentUserId) return true;

        // If drill belongs to a club, check if user has edit permissions
        if (drill.clubId && membership) {
            if (membership.isActive && DRILL_EDIT_ROLES.includes(membership.role)) {
                return true;
            }
        }

        return false;
    }, [drill, currentUserId, membership]);

    return {
        canEdit,
        isLoading: !!drill?.clubId && isLoadingMembership,
    };
}
