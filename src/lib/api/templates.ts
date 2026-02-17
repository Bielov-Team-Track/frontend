import client from "./client";
import {
    TrainingPlan,
    TrainingPlanDetail,
    PlanListResponse,
    PlanFilterRequest,
    CreatePlanRequest,
    UpdatePlanRequest,
    CreatePlanSectionRequest,
    UpdatePlanSectionRequest,
    CreatePlanItemRequest,
    UpdatePlanItemRequest,
    CreateEventPlanRequest,
    PlanLikeStatus,
    PlanBookmarkStatus,
    PlanComment,
    PlanCommentsResponse,
    PlanSection,
    PlanItem,
} from "../models/Template";
import { getParamsFromObject } from "../utils/request";

const COACHING_PREFIX = "/coaching";

// =============================================================================
// CRUD OPERATIONS
// =============================================================================

/**
 * Get a specific plan by ID
 */
export async function loadPlan(id: string): Promise<TrainingPlanDetail> {
    const endpoint = `/v1/plans/${id}`;
    const response = await client.get<TrainingPlanDetail>(COACHING_PREFIX + endpoint);
    return response.data;
}

/** @deprecated Use loadPlan instead */
export const loadTemplate = loadPlan;

/**
 * Create a new plan
 */
export async function createPlan(request: CreatePlanRequest): Promise<TrainingPlanDetail> {
    const endpoint = "/v1/plans";
    const response = await client.post<TrainingPlanDetail>(COACHING_PREFIX + endpoint, request);
    return response.data;
}

/** @deprecated Use createPlan instead */
export const createTemplate = createPlan;

/**
 * Update an existing plan
 */
export async function updatePlan(id: string, request: UpdatePlanRequest): Promise<TrainingPlanDetail> {
    const endpoint = `/v1/plans/${id}`;
    const response = await client.put<TrainingPlanDetail>(COACHING_PREFIX + endpoint, request);
    return response.data;
}

/** @deprecated Use updatePlan instead */
export const updateTemplate = updatePlan;

/**
 * Delete a plan
 */
export async function deletePlan(id: string): Promise<void> {
    const endpoint = `/v1/plans/${id}`;
    await client.delete(COACHING_PREFIX + endpoint);
}

/** @deprecated Use deletePlan instead */
export const deleteTemplate = deletePlan;

// =============================================================================
// LIST/BROWSE OPERATIONS
// =============================================================================

/**
 * Get current user's plans with optional filtering
 */
export async function loadMyPlans(filter?: PlanFilterRequest): Promise<PlanListResponse> {
    const endpoint = "/v1/me/plans";
    const params = getParamsFromObject(filter as Record<string, unknown> | undefined);
    const response = await client.get<PlanListResponse>(COACHING_PREFIX + endpoint, { params });
    return response.data;
}

/** @deprecated Use loadMyPlans instead */
export const loadMyTemplates = loadMyPlans;

/**
 * Get plans for a specific club with optional filtering
 */
export async function loadClubPlans(clubId: string, filter?: PlanFilterRequest): Promise<PlanListResponse> {
    const endpoint = `/v1/clubs/${clubId}/plans`;
    const params = getParamsFromObject(filter as Record<string, unknown> | undefined);
    const response = await client.get<PlanListResponse>(COACHING_PREFIX + endpoint, { params });
    return response.data;
}

/** @deprecated Use loadClubPlans instead */
export const loadClubTemplates = loadClubPlans;

/**
 * Get all public plans with optional filtering
 */
export async function loadPublicPlans(filter?: PlanFilterRequest): Promise<PlanListResponse> {
    const endpoint = "/v1/plans";
    const params = getParamsFromObject(filter as Record<string, unknown> | undefined);
    const response = await client.get<PlanListResponse>(COACHING_PREFIX + endpoint, { params });
    return response.data;
}

/** @deprecated Use loadPublicPlans instead */
export const loadPublicTemplates = loadPublicPlans;

/**
 * Get current user's bookmarked plans with optional filtering
 */
export async function loadBookmarkedPlans(filter?: PlanFilterRequest): Promise<PlanListResponse> {
    const endpoint = "/v1/me/plans/bookmarks";
    const params = getParamsFromObject(filter as Record<string, unknown> | undefined);
    const response = await client.get<PlanListResponse>(COACHING_PREFIX + endpoint, { params });
    return response.data;
}

/** @deprecated Use loadBookmarkedPlans instead */
export const loadBookmarkedTemplates = loadBookmarkedPlans;

// =============================================================================
// SECTIONS
// =============================================================================

/**
 * Add a section to a plan
 */
export async function addPlanSection(planId: string, request: CreatePlanSectionRequest): Promise<PlanSection> {
    const endpoint = `/v1/plans/${planId}/sections`;
    const response = await client.post<PlanSection>(COACHING_PREFIX + endpoint, request);
    return response.data;
}

/** @deprecated Use addPlanSection instead */
export const addTemplateSection = addPlanSection;

/**
 * Update a section in a plan
 */
export async function updatePlanSection(
    planId: string,
    sectionId: string,
    request: UpdatePlanSectionRequest
): Promise<PlanSection> {
    const endpoint = `/v1/plans/${planId}/sections/${sectionId}`;
    const response = await client.put<PlanSection>(COACHING_PREFIX + endpoint, request);
    return response.data;
}

/** @deprecated Use updatePlanSection instead */
export const updateTemplateSection = updatePlanSection;

/**
 * Delete a section from a plan
 */
export async function deletePlanSection(planId: string, sectionId: string): Promise<void> {
    const endpoint = `/v1/plans/${planId}/sections/${sectionId}`;
    await client.delete(COACHING_PREFIX + endpoint);
}

/** @deprecated Use deletePlanSection instead */
export const deleteTemplateSection = deletePlanSection;

// =============================================================================
// ITEMS
// =============================================================================

/**
 * Add an item to a plan
 */
export async function addPlanItem(planId: string, request: CreatePlanItemRequest): Promise<PlanItem> {
    const endpoint = `/v1/plans/${planId}/items`;
    const response = await client.post<PlanItem>(COACHING_PREFIX + endpoint, request);
    return response.data;
}

/** @deprecated Use addPlanItem instead */
export const addTemplateItem = addPlanItem;

/**
 * Update an item in a plan
 */
export async function updatePlanItem(
    planId: string,
    itemId: string,
    request: UpdatePlanItemRequest
): Promise<PlanItem> {
    const endpoint = `/v1/plans/${planId}/items/${itemId}`;
    const response = await client.put<PlanItem>(COACHING_PREFIX + endpoint, request);
    return response.data;
}

/** @deprecated Use updatePlanItem instead */
export const updateTemplateItem = updatePlanItem;

/**
 * Delete an item from a plan
 */
export async function deletePlanItem(planId: string, itemId: string): Promise<void> {
    const endpoint = `/v1/plans/${planId}/items/${itemId}`;
    await client.delete(COACHING_PREFIX + endpoint);
}

/** @deprecated Use deletePlanItem instead */
export const deleteTemplateItem = deletePlanItem;

/**
 * Reorder items in a plan
 */
export async function reorderPlanItems(planId: string, itemIds: string[]): Promise<void> {
    const endpoint = `/v1/plans/${planId}/items/reorder`;
    await client.put(COACHING_PREFIX + endpoint, { itemIds });
}

/** @deprecated Use reorderPlanItems instead */
export const reorderTemplateItems = reorderPlanItems;

// =============================================================================
// EVENT PLAN OPERATIONS
// =============================================================================

/**
 * Create a training plan for an event
 */
export async function createEventPlan(eventId: string, request: CreateEventPlanRequest): Promise<TrainingPlanDetail> {
    const { data } = await client.post<TrainingPlanDetail>(`${COACHING_PREFIX}/v1/events/${eventId}/plans`, request);
    return data;
}

/**
 * Get the training plan for an event
 */
export async function getEventPlan(eventId: string): Promise<TrainingPlanDetail> {
    const { data } = await client.get<TrainingPlanDetail>(`${COACHING_PREFIX}/v1/events/${eventId}/plans`);
    return data;
}

/**
 * Promote an event plan (Instance) to a reusable template (Template)
 */
export async function promoteToTemplate(planId: string, request?: { name?: string; clubId?: string }): Promise<TrainingPlanDetail> {
    const { data } = await client.post<TrainingPlanDetail>(`${COACHING_PREFIX}/v1/plans/${planId}/promote`, request ?? {});
    return data;
}

// =============================================================================
// LIKES
// =============================================================================

/**
 * Like a plan
 */
export async function likePlan(id: string): Promise<PlanLikeStatus> {
    const endpoint = `/v1/plans/${id}/like`;
    const response = await client.post<PlanLikeStatus>(COACHING_PREFIX + endpoint);
    return response.data;
}

/** @deprecated Use likePlan instead */
export const likeTemplate = likePlan;

/**
 * Unlike a plan
 */
export async function unlikePlan(id: string): Promise<PlanLikeStatus> {
    const endpoint = `/v1/plans/${id}/like`;
    const response = await client.delete<PlanLikeStatus>(COACHING_PREFIX + endpoint);
    return response.data;
}

/** @deprecated Use unlikePlan instead */
export const unlikeTemplate = unlikePlan;

/**
 * Get like status for a plan
 */
export async function getPlanLikeStatus(id: string): Promise<PlanLikeStatus> {
    const endpoint = `/v1/plans/${id}/like`;
    const response = await client.get<PlanLikeStatus>(COACHING_PREFIX + endpoint);
    return response.data;
}

/** @deprecated Use getPlanLikeStatus instead */
export const getTemplateLikeStatus = getPlanLikeStatus;

// =============================================================================
// BOOKMARKS
// =============================================================================

/**
 * Bookmark a plan
 */
export async function bookmarkPlan(id: string): Promise<PlanBookmarkStatus> {
    const endpoint = `/v1/plans/${id}/bookmark`;
    const response = await client.post<PlanBookmarkStatus>(COACHING_PREFIX + endpoint);
    return response.data;
}

/** @deprecated Use bookmarkPlan instead */
export const bookmarkTemplate = bookmarkPlan;

/**
 * Remove bookmark from a plan
 */
export async function unbookmarkPlan(id: string): Promise<PlanBookmarkStatus> {
    const endpoint = `/v1/plans/${id}/bookmark`;
    const response = await client.delete<PlanBookmarkStatus>(COACHING_PREFIX + endpoint);
    return response.data;
}

/** @deprecated Use unbookmarkPlan instead */
export const unbookmarkTemplate = unbookmarkPlan;

// =============================================================================
// COMMENTS
// =============================================================================

/**
 * Create a comment on a plan
 */
export async function createPlanComment(
    planId: string,
    content: string,
    parentCommentId?: string
): Promise<PlanComment> {
    const endpoint = `/v1/plans/${planId}/comments`;
    const response = await client.post<PlanComment>(COACHING_PREFIX + endpoint, { content, parentCommentId });
    return response.data;
}

/** @deprecated Use createPlanComment instead */
export const createTemplateComment = createPlanComment;

/**
 * Get comments for a plan with cursor pagination
 */
export async function loadPlanComments(
    planId: string,
    cursor?: string,
    limit: number = 20
): Promise<PlanCommentsResponse> {
    const endpoint = `/v1/plans/${planId}/comments`;
    const params: Record<string, string | number> = { limit };
    if (cursor) {
        params.cursor = cursor;
    }
    const response = await client.get<PlanCommentsResponse>(COACHING_PREFIX + endpoint, { params });
    return response.data;
}

/** @deprecated Use loadPlanComments instead */
export const loadTemplateComments = loadPlanComments;

/**
 * Delete a comment from a plan
 */
export async function deletePlanComment(planId: string, commentId: string): Promise<void> {
    const endpoint = `/v1/plans/${planId}/comments/${commentId}`;
    await client.delete(COACHING_PREFIX + endpoint);
}

/** @deprecated Use deletePlanComment instead */
export const deleteTemplateComment = deletePlanComment;
