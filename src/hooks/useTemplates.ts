import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
    loadPlan,
    createPlan,
    updatePlan,
    deletePlan,
    loadMyPlans,
    loadClubPlans,
    loadPublicPlans,
    loadBookmarkedPlans,
    addPlanSection,
    updatePlanSection,
    deletePlanSection,
    addPlanItem,
    updatePlanItem,
    deletePlanItem,
    reorderPlanItems,
    likePlan,
    unlikePlan,
    getPlanLikeStatus,
    bookmarkPlan,
    unbookmarkPlan,
    createPlanComment,
    loadPlanComments,
    deletePlanComment,
    createEventPlan,
    getEventPlan,
    promoteToTemplate,
} from "@/lib/api/templates";
import { getMyClubMembership } from "@/lib/api/clubs/clubs";
import {
    TrainingPlanDetail,
    PlanFilterRequest,
    CreatePlanRequest,
    UpdatePlanRequest,
    CreatePlanSectionRequest,
    UpdatePlanSectionRequest,
    CreatePlanItemRequest,
    UpdatePlanItemRequest,
    CreateEventPlanRequest,
} from "@/lib/models/Template";
import { ClubRole } from "@/lib/models/Club";
import { useMemo } from "react";

// Backward-compatible type re-exports for consumers that haven't migrated yet
export type { PlanFilterRequest as TemplateFilterRequest } from "@/lib/models/Template";
export type { CreatePlanRequest as CreateTemplateRequest } from "@/lib/models/Template";
export type { UpdatePlanRequest as UpdateTemplateRequest } from "@/lib/models/Template";
export type { CreatePlanSectionRequest as CreateTemplateSectionRequest } from "@/lib/models/Template";
export type { UpdatePlanSectionRequest as UpdateTemplateSectionRequest } from "@/lib/models/Template";
export type { CreatePlanItemRequest as CreateTemplateItemRequest } from "@/lib/models/Template";
export type { UpdatePlanItemRequest as UpdateTemplateItemRequest } from "@/lib/models/Template";

// Query keys
export const planKeys = {
    all: ["plans"] as const,
    lists: () => [...planKeys.all, "list"] as const,
    list: (filters?: PlanFilterRequest) => [...planKeys.lists(), filters] as const,
    myList: (filters?: PlanFilterRequest) => [...planKeys.all, "my", filters] as const,
    clubList: (clubId: string, filters?: PlanFilterRequest) => [...planKeys.all, "club", clubId, filters] as const,
    bookmarkedList: (filters?: PlanFilterRequest) => [...planKeys.all, "bookmarked", filters] as const,
    details: () => [...planKeys.all, "detail"] as const,
    detail: (id: string) => [...planKeys.details(), id] as const,
    eventPlan: (eventId: string) => [...planKeys.all, "event", eventId] as const,
    comments: (id: string) => [...planKeys.detail(id), "comments"] as const,
    likeStatus: (id: string) => [...planKeys.detail(id), "likeStatus"] as const,
};

/** @deprecated Use planKeys instead */
export const templateKeys = planKeys;

// Club query keys (for membership checks)
export const clubKeys = {
    all: ["clubs"] as const,
    myMembership: (clubId: string) => [...clubKeys.all, "my-membership", clubId] as const,
};

// Roles that can edit club plans
const PLAN_EDIT_ROLES: ClubRole[] = [ClubRole.Owner, ClubRole.Admin, ClubRole.HeadCoach];

// =============================================================================
// PLAN QUERIES
// =============================================================================

/**
 * Hook to fetch a single plan by ID
 */
export function usePlan(id: string, enabled: boolean = true) {
    return useQuery({
        queryKey: planKeys.detail(id),
        queryFn: () => loadPlan(id),
        enabled: enabled && !!id,
    });
}

/** @deprecated Use usePlan instead */
export const useTemplate = usePlan;

/**
 * Hook to fetch current user's plans (includes private)
 */
export function useMyPlans(filter?: PlanFilterRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: planKeys.myList(filter),
        queryFn: () => loadMyPlans(filter),
        select: (data) => data.items,
        enabled,
    });
}

/** @deprecated Use useMyPlans instead */
export const useMyTemplates = useMyPlans;

/**
 * Hook to fetch plans for a specific club
 */
export function useClubPlans(clubId: string, filter?: PlanFilterRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: planKeys.clubList(clubId, filter),
        queryFn: () => loadClubPlans(clubId, filter),
        select: (data) => data.items,
        enabled: enabled && !!clubId,
    });
}

/** @deprecated Use useClubPlans instead */
export const useClubTemplates = useClubPlans;

/**
 * Hook to fetch all public plans with optional filtering
 */
export function usePublicPlans(filter?: PlanFilterRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: planKeys.list(filter),
        queryFn: () => loadPublicPlans(filter),
        select: (data) => data.items,
        enabled,
    });
}

/** @deprecated Use usePublicPlans instead */
export const usePublicTemplates = usePublicPlans;

/**
 * Hook to fetch current user's bookmarked plans
 */
export function useBookmarkedPlans(filter?: PlanFilterRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: planKeys.bookmarkedList(filter),
        queryFn: () => loadBookmarkedPlans(filter),
        select: (data) => data.items,
        enabled,
    });
}

/** @deprecated Use useBookmarkedPlans instead */
export const useBookmarkedTemplates = useBookmarkedPlans;

// =============================================================================
// PLAN MUTATIONS
// =============================================================================

/**
 * Hook to create a new plan
 */
export function useCreatePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreatePlanRequest) => createPlan(request),
        onSuccess: () => {
            // Invalidate plan lists
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
            queryClient.invalidateQueries({ queryKey: planKeys.myList() });
        },
    });
}

/** @deprecated Use useCreatePlan instead */
export const useCreateTemplate = useCreatePlan;

/**
 * Hook to update a plan
 */
export function useUpdatePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) =>
            updatePlan(id, data),
        onSuccess: (updatedPlan) => {
            // Update cache
            queryClient.setQueryData(planKeys.detail(updatedPlan.id), updatedPlan);
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
            queryClient.invalidateQueries({ queryKey: planKeys.myList() });
        },
    });
}

/** @deprecated Use useUpdatePlan instead */
export const useUpdateTemplate = useUpdatePlan;

/**
 * Hook to delete a plan
 */
export function useDeletePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deletePlan(id),
        onSuccess: (_, id) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: planKeys.detail(id) });
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
            queryClient.invalidateQueries({ queryKey: planKeys.myList() });
        },
    });
}

/** @deprecated Use useDeletePlan instead */
export const useDeleteTemplate = useDeletePlan;

// =============================================================================
// SECTION MUTATIONS
// =============================================================================

/**
 * Hook to add a section to a plan
 */
export function useAddPlanSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ planId, data }: { planId: string; data: CreatePlanSectionRequest }) =>
            addPlanSection(planId, data),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
        },
    });
}

/** @deprecated Use useAddPlanSection instead */
export const useAddTemplateSection = useAddPlanSection;

/**
 * Hook to update a plan section
 */
export function useUpdatePlanSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ planId, sectionId, data }: { planId: string; sectionId: string; data: UpdatePlanSectionRequest }) =>
            updatePlanSection(planId, sectionId, data),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
        },
    });
}

/** @deprecated Use useUpdatePlanSection instead */
export const useUpdateTemplateSection = useUpdatePlanSection;

/**
 * Hook to delete a plan section
 */
export function useDeletePlanSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ planId, sectionId }: { planId: string; sectionId: string }) =>
            deletePlanSection(planId, sectionId),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
        },
    });
}

/** @deprecated Use useDeletePlanSection instead */
export const useDeleteTemplateSection = useDeletePlanSection;

// =============================================================================
// ITEM MUTATIONS
// =============================================================================

/**
 * Hook to add an item to a plan
 */
export function useAddPlanItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ planId, data }: { planId: string; data: CreatePlanItemRequest }) =>
            addPlanItem(planId, data),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
        },
    });
}

/** @deprecated Use useAddPlanItem instead */
export const useAddTemplateItem = useAddPlanItem;

/**
 * Hook to update a plan item
 */
export function useUpdatePlanItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ planId, itemId, data }: { planId: string; itemId: string; data: UpdatePlanItemRequest }) =>
            updatePlanItem(planId, itemId, data),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
        },
    });
}

/** @deprecated Use useUpdatePlanItem instead */
export const useUpdateTemplateItem = useUpdatePlanItem;

/**
 * Hook to delete a plan item
 */
export function useDeletePlanItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ planId, itemId }: { planId: string; itemId: string }) =>
            deletePlanItem(planId, itemId),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
        },
    });
}

/** @deprecated Use useDeletePlanItem instead */
export const useDeleteTemplateItem = useDeletePlanItem;

/**
 * Hook to reorder items in a plan
 */
export function useReorderPlanItems() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ planId, itemIds }: { planId: string; itemIds: string[] }) =>
            reorderPlanItems(planId, itemIds),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
        },
    });
}

/** @deprecated Use useReorderPlanItems instead */
export const useReorderTemplateItems = useReorderPlanItems;

// =============================================================================
// LIKES QUERIES & MUTATIONS
// =============================================================================

/**
 * Hook to get like status for a plan
 */
export function usePlanLikeStatus(planId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: planKeys.likeStatus(planId),
        queryFn: () => getPlanLikeStatus(planId),
        enabled: enabled && !!planId,
    });
}

/** @deprecated Use usePlanLikeStatus instead */
export const useTemplateLikeStatus = usePlanLikeStatus;

/**
 * Hook to like a plan
 */
export function useLikePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (planId: string) => likePlan(planId),
        onSuccess: (status, planId) => {
            queryClient.setQueryData(planKeys.likeStatus(planId), status);
            queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
    });
}

/** @deprecated Use useLikePlan instead */
export const useLikeTemplate = useLikePlan;

/**
 * Hook to unlike a plan
 */
export function useUnlikePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (planId: string) => unlikePlan(planId),
        onSuccess: (status, planId) => {
            queryClient.setQueryData(planKeys.likeStatus(planId), status);
            queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
    });
}

/** @deprecated Use useUnlikePlan instead */
export const useUnlikeTemplate = useUnlikePlan;

// =============================================================================
// BOOKMARKS MUTATIONS
// =============================================================================

/**
 * Hook to bookmark a plan
 */
export function useBookmarkPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (planId: string) => bookmarkPlan(planId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.bookmarkedList() });
        },
    });
}

/** @deprecated Use useBookmarkPlan instead */
export const useBookmarkTemplate = useBookmarkPlan;

/**
 * Hook to remove bookmark from a plan
 */
export function useUnbookmarkPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (planId: string) => unbookmarkPlan(planId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.bookmarkedList() });
        },
    });
}

/** @deprecated Use useUnbookmarkPlan instead */
export const useUnbookmarkTemplate = useUnbookmarkPlan;

// =============================================================================
// COMMENTS QUERIES & MUTATIONS
// =============================================================================

/**
 * Hook to fetch comments for a plan with infinite scrolling
 */
export function usePlanComments(planId: string, limit: number = 20, enabled: boolean = true) {
    return useInfiniteQuery({
        queryKey: planKeys.comments(planId),
        queryFn: ({ pageParam }) => loadPlanComments(planId, pageParam, limit),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
        enabled: enabled && !!planId,
    });
}

/** @deprecated Use usePlanComments instead */
export const useTemplateComments = usePlanComments;

/**
 * Hook to create a comment on a plan
 */
export function useCreatePlanComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ planId, content, parentCommentId }: { planId: string; content: string; parentCommentId?: string }) =>
            createPlanComment(planId, content, parentCommentId),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.comments(planId) });
        },
    });
}

/** @deprecated Use useCreatePlanComment instead */
export const useCreateTemplateComment = useCreatePlanComment;

/**
 * Hook to delete a comment
 */
export function useDeletePlanComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ planId, commentId }: { planId: string; commentId: string }) =>
            deletePlanComment(planId, commentId),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.comments(planId) });
        },
    });
}

/** @deprecated Use useDeletePlanComment instead */
export const useDeleteTemplateComment = useDeletePlanComment;

// =============================================================================
// EVENT PLAN HOOKS
// =============================================================================

/**
 * Hook to fetch the training plan for an event
 */
export function useEventPlan(eventId: string | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: planKeys.eventPlan(eventId!),
        queryFn: () => getEventPlan(eventId!),
        enabled: !!eventId && (options?.enabled !== false),
    });
}

/**
 * Hook to create a training plan for an event
 */
export function useCreateEventPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId, request }: { eventId: string; request: CreateEventPlanRequest }) =>
            createEventPlan(eventId, request),
        onSuccess: (_, { eventId }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.eventPlan(eventId) });
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            queryClient.invalidateQueries({ queryKey: ["events"] });
        },
    });
}

/**
 * Hook to promote an event plan to a reusable template
 */
export function usePromoteToTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ planId, request }: { planId: string; request?: { name?: string; clubId?: string } }) =>
            promoteToTemplate(planId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.all });
        },
    });
}

// =============================================================================
// CLUB MEMBERSHIP QUERIES (for plan edit permissions)
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
 * Hook to check if the current user can edit a plan
 * Returns true if:
 * - User is the creator of the plan
 * - OR plan belongs to a club and user is Owner, Admin, or Coach in that club
 */
export function useCanEditPlan(plan: TrainingPlanDetail | undefined, currentUserId: string | undefined) {
    const { data: membership, isLoading: isLoadingMembership } = useMyClubMembership(
        plan?.clubId,
        !!plan?.clubId && !!currentUserId
    );

    const canEdit = useMemo(() => {
        if (!plan || !currentUserId) return false;

        // Check if user is the creator
        if (plan.createdByUserId === currentUserId) return true;

        // If plan belongs to a club, check if user has edit permissions
        if (plan.clubId && membership) {
            if (membership.isActive && membership.roles.some(role => PLAN_EDIT_ROLES.includes(role))) {
                return true;
            }
        }

        return false;
    }, [plan, currentUserId, membership]);

    return {
        canEdit,
        isLoading: !!plan?.clubId && isLoadingMembership,
    };
}

/** @deprecated Use useCanEditPlan instead */
export const useCanEditTemplate = useCanEditPlan;

// =============================================================================
// BACKWARD COMPATIBILITY - Old event integration hooks (removed)
// =============================================================================

// useSaveEventPlanAsTemplate and useLoadTemplateToEvent have been removed.
// Use useCreateEventPlan and usePromoteToTemplate instead.
