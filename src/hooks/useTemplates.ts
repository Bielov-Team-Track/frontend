import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
    loadTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    loadMyTemplates,
    loadClubTemplates,
    loadPublicTemplates,
    loadBookmarkedTemplates,
    addTemplateSection,
    updateTemplateSection,
    deleteTemplateSection,
    addTemplateItem,
    updateTemplateItem,
    deleteTemplateItem,
    reorderTemplateItems,
    likeTemplate,
    unlikeTemplate,
    getTemplateLikeStatus,
    bookmarkTemplate,
    unbookmarkTemplate,
    createTemplateComment,
    loadTemplateComments,
    deleteTemplateComment,
    saveEventPlanAsTemplate,
    loadTemplateToEvent,
} from "@/lib/api/templates";
import { getMyClubMembership } from "@/lib/api/clubs/clubs";
import {
    TrainingPlanTemplateDetail,
    TemplateFilterRequest,
    CreateTemplateRequest,
    UpdateTemplateRequest,
    CreateTemplateSectionRequest,
    UpdateTemplateSectionRequest,
    CreateTemplateItemRequest,
    UpdateTemplateItemRequest,
    SaveAsTemplateRequest,
} from "@/lib/models/Template";
import { ClubRole } from "@/lib/models/Club";
import { useMemo } from "react";

// Query keys
export const templateKeys = {
    all: ["templates"] as const,
    lists: () => [...templateKeys.all, "list"] as const,
    list: (filters?: TemplateFilterRequest) => [...templateKeys.lists(), filters] as const,
    myList: (filters?: TemplateFilterRequest) => [...templateKeys.all, "my", filters] as const,
    clubList: (clubId: string, filters?: TemplateFilterRequest) => [...templateKeys.all, "club", clubId, filters] as const,
    bookmarkedList: (filters?: TemplateFilterRequest) => [...templateKeys.all, "bookmarked", filters] as const,
    details: () => [...templateKeys.all, "detail"] as const,
    detail: (id: string) => [...templateKeys.details(), id] as const,
    comments: (id: string) => [...templateKeys.detail(id), "comments"] as const,
    likeStatus: (id: string) => [...templateKeys.detail(id), "likeStatus"] as const,
};

// Club query keys (for membership checks)
export const clubKeys = {
    all: ["clubs"] as const,
    myMembership: (clubId: string) => [...clubKeys.all, "my-membership", clubId] as const,
};

// Roles that can edit club templates
const TEMPLATE_EDIT_ROLES: ClubRole[] = [ClubRole.Owner, ClubRole.Admin, ClubRole.Coach];

// =============================================================================
// TEMPLATES QUERIES
// =============================================================================

/**
 * Hook to fetch a single template by ID
 */
export function useTemplate(id: string, enabled: boolean = true) {
    return useQuery({
        queryKey: templateKeys.detail(id),
        queryFn: () => loadTemplate(id),
        enabled: enabled && !!id,
    });
}

/**
 * Hook to fetch current user's templates (includes private)
 */
export function useMyTemplates(filter?: TemplateFilterRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: templateKeys.myList(filter),
        queryFn: () => loadMyTemplates(filter),
        select: (data) => data.items,
        enabled,
    });
}

/**
 * Hook to fetch templates for a specific club
 */
export function useClubTemplates(clubId: string, filter?: TemplateFilterRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: templateKeys.clubList(clubId, filter),
        queryFn: () => loadClubTemplates(clubId, filter),
        select: (data) => data.items,
        enabled: enabled && !!clubId,
    });
}

/**
 * Hook to fetch all public templates with optional filtering
 */
export function usePublicTemplates(filter?: TemplateFilterRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: templateKeys.list(filter),
        queryFn: () => loadPublicTemplates(filter),
        select: (data) => data.items,
        enabled,
    });
}

/**
 * Hook to fetch current user's bookmarked templates
 */
export function useBookmarkedTemplates(filter?: TemplateFilterRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: templateKeys.bookmarkedList(filter),
        queryFn: () => loadBookmarkedTemplates(filter),
        select: (data) => data.items,
        enabled,
    });
}

// =============================================================================
// TEMPLATE MUTATIONS
// =============================================================================

/**
 * Hook to create a new template
 */
export function useCreateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateTemplateRequest) => createTemplate(request),
        onSuccess: () => {
            // Invalidate template lists
            queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
            queryClient.invalidateQueries({ queryKey: templateKeys.myList() });
        },
    });
}

/**
 * Hook to update a template
 */
export function useUpdateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTemplateRequest }) =>
            updateTemplate(id, data),
        onSuccess: (updatedTemplate) => {
            // Update cache
            queryClient.setQueryData(templateKeys.detail(updatedTemplate.id), updatedTemplate);
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
            queryClient.invalidateQueries({ queryKey: templateKeys.myList() });
        },
    });
}

/**
 * Hook to delete a template
 */
export function useDeleteTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteTemplate(id),
        onSuccess: (_, id) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: templateKeys.detail(id) });
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
            queryClient.invalidateQueries({ queryKey: templateKeys.myList() });
        },
    });
}

// =============================================================================
// SECTION MUTATIONS
// =============================================================================

/**
 * Hook to add a section to a template
 */
export function useAddTemplateSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, data }: { templateId: string; data: CreateTemplateSectionRequest }) =>
            addTemplateSection(templateId, data),
        onSuccess: (_, { templateId }) => {
            // Invalidate template detail
            queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
        },
    });
}

/**
 * Hook to update a template section
 */
export function useUpdateTemplateSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, sectionId, data }: { templateId: string; sectionId: string; data: UpdateTemplateSectionRequest }) =>
            updateTemplateSection(templateId, sectionId, data),
        onSuccess: (_, { templateId }) => {
            // Invalidate template detail
            queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
        },
    });
}

/**
 * Hook to delete a template section
 */
export function useDeleteTemplateSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, sectionId }: { templateId: string; sectionId: string }) =>
            deleteTemplateSection(templateId, sectionId),
        onSuccess: (_, { templateId }) => {
            // Invalidate template detail
            queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
        },
    });
}

// =============================================================================
// ITEM MUTATIONS
// =============================================================================

/**
 * Hook to add an item to a template
 */
export function useAddTemplateItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, data }: { templateId: string; data: CreateTemplateItemRequest }) =>
            addTemplateItem(templateId, data),
        onSuccess: (_, { templateId }) => {
            // Invalidate template detail
            queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
        },
    });
}

/**
 * Hook to update a template item
 */
export function useUpdateTemplateItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, itemId, data }: { templateId: string; itemId: string; data: UpdateTemplateItemRequest }) =>
            updateTemplateItem(templateId, itemId, data),
        onSuccess: (_, { templateId }) => {
            // Invalidate template detail
            queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
        },
    });
}

/**
 * Hook to delete a template item
 */
export function useDeleteTemplateItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, itemId }: { templateId: string; itemId: string }) =>
            deleteTemplateItem(templateId, itemId),
        onSuccess: (_, { templateId }) => {
            // Invalidate template detail
            queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
        },
    });
}

/**
 * Hook to reorder items in a template
 */
export function useReorderTemplateItems() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, itemIds }: { templateId: string; itemIds: string[] }) =>
            reorderTemplateItems(templateId, itemIds),
        onSuccess: (_, { templateId }) => {
            // Invalidate template detail
            queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
        },
    });
}

// =============================================================================
// LIKES QUERIES & MUTATIONS
// =============================================================================

/**
 * Hook to get like status for a template
 */
export function useTemplateLikeStatus(templateId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: templateKeys.likeStatus(templateId),
        queryFn: () => getTemplateLikeStatus(templateId),
        enabled: enabled && !!templateId,
    });
}

/**
 * Hook to like a template
 */
export function useLikeTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateId: string) => likeTemplate(templateId),
        onSuccess: (status, templateId) => {
            // Update like status cache
            queryClient.setQueryData(templateKeys.likeStatus(templateId), status);
            // Invalidate template detail to update like count
            queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
            queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
        },
    });
}

/**
 * Hook to unlike a template
 */
export function useUnlikeTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateId: string) => unlikeTemplate(templateId),
        onSuccess: (status, templateId) => {
            // Update like status cache
            queryClient.setQueryData(templateKeys.likeStatus(templateId), status);
            // Invalidate template detail to update like count
            queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
            queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
        },
    });
}

// =============================================================================
// BOOKMARKS MUTATIONS
// =============================================================================

/**
 * Hook to bookmark a template
 */
export function useBookmarkTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateId: string) => bookmarkTemplate(templateId),
        onSuccess: () => {
            // Invalidate bookmarks list
            queryClient.invalidateQueries({ queryKey: templateKeys.bookmarkedList() });
        },
    });
}

/**
 * Hook to remove bookmark from a template
 */
export function useUnbookmarkTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateId: string) => unbookmarkTemplate(templateId),
        onSuccess: () => {
            // Invalidate bookmarks list
            queryClient.invalidateQueries({ queryKey: templateKeys.bookmarkedList() });
        },
    });
}

// =============================================================================
// COMMENTS QUERIES & MUTATIONS
// =============================================================================

/**
 * Hook to fetch comments for a template with infinite scrolling
 */
export function useTemplateComments(templateId: string, limit: number = 20, enabled: boolean = true) {
    return useInfiniteQuery({
        queryKey: templateKeys.comments(templateId),
        queryFn: ({ pageParam }) => loadTemplateComments(templateId, pageParam, limit),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
        enabled: enabled && !!templateId,
    });
}

/**
 * Hook to create a comment on a template
 */
export function useCreateTemplateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, content, parentCommentId }: { templateId: string; content: string; parentCommentId?: string }) =>
            createTemplateComment(templateId, content, parentCommentId),
        onSuccess: (_, { templateId }) => {
            // Invalidate comments
            queryClient.invalidateQueries({ queryKey: templateKeys.comments(templateId) });
        },
    });
}

/**
 * Hook to delete a comment
 */
export function useDeleteTemplateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, commentId }: { templateId: string; commentId: string }) =>
            deleteTemplateComment(templateId, commentId),
        onSuccess: (_, { templateId }) => {
            // Invalidate comments
            queryClient.invalidateQueries({ queryKey: templateKeys.comments(templateId) });
        },
    });
}

// =============================================================================
// EVENT INTEGRATION MUTATIONS
// =============================================================================

/**
 * Hook to save an event's training plan as a template
 */
export function useSaveEventPlanAsTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: string; data: SaveAsTemplateRequest }) =>
            saveEventPlanAsTemplate(eventId, data),
        onSuccess: () => {
            // Invalidate template lists
            queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
            queryClient.invalidateQueries({ queryKey: templateKeys.myList() });
        },
    });
}

/**
 * Hook to load a template into an event's training plan
 */
export function useLoadTemplateToEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, templateId, replace }: { eventId: string; templateId: string; replace?: boolean }) =>
            loadTemplateToEvent(eventId, templateId, replace),
        onSuccess: () => {
            // Invalidate event-related queries if they exist
            // Note: You may need to import event query keys if available
            queryClient.invalidateQueries({ queryKey: ["events"] });
        },
    });
}

// =============================================================================
// CLUB MEMBERSHIP QUERIES (for template edit permissions)
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
 * Hook to check if the current user can edit a template
 * Returns true if:
 * - User is the creator of the template
 * - OR template belongs to a club and user is Owner, Admin, or Coach in that club
 */
export function useCanEditTemplate(template: TrainingPlanTemplateDetail | undefined, currentUserId: string | undefined) {
    const { data: membership, isLoading: isLoadingMembership } = useMyClubMembership(
        template?.clubId,
        !!template?.clubId && !!currentUserId
    );

    const canEdit = useMemo(() => {
        if (!template || !currentUserId) return false;

        // Check if user is the creator
        if (template.createdByUserId === currentUserId) return true;

        // If template belongs to a club, check if user has edit permissions
        if (template.clubId && membership) {
            if (membership.isActive && TEMPLATE_EDIT_ROLES.includes(membership.role)) {
                return true;
            }
        }

        return false;
    }, [template, currentUserId, membership]);

    return {
        canEdit,
        isLoading: !!template?.clubId && isLoadingMembership,
    };
}
