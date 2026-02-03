import client from "./client";
import {
    TrainingPlanTemplate,
    TrainingPlanTemplateDetail,
    TemplateListResponse,
    TemplateFilterRequest,
    CreateTemplateRequest,
    UpdateTemplateRequest,
    CreateTemplateSectionRequest,
    UpdateTemplateSectionRequest,
    CreateTemplateItemRequest,
    UpdateTemplateItemRequest,
    SaveAsTemplateRequest,
    TemplateLikeStatus,
    TemplateBookmarkStatus,
    TemplateComment,
    TemplateCommentsResponse,
    TemplateSection,
    TemplateItem,
} from "../models/Template";
import { getParamsFromObject } from "../utils/request";

const PREFIX = "/events";

// =============================================================================
// CRUD OPERATIONS
// =============================================================================

/**
 * Get a specific template by ID
 */
export async function loadTemplate(id: string): Promise<TrainingPlanTemplateDetail> {
    const endpoint = `/v1/templates/${id}`;
    const response = await client.get<TrainingPlanTemplateDetail>(PREFIX + endpoint);
    return response.data;
}

/**
 * Create a new template
 */
export async function createTemplate(request: CreateTemplateRequest): Promise<TrainingPlanTemplateDetail> {
    const endpoint = "/v1/templates";
    const response = await client.post<TrainingPlanTemplateDetail>(PREFIX + endpoint, request);
    return response.data;
}

/**
 * Update an existing template
 */
export async function updateTemplate(id: string, request: UpdateTemplateRequest): Promise<TrainingPlanTemplateDetail> {
    const endpoint = `/v1/templates/${id}`;
    const response = await client.put<TrainingPlanTemplateDetail>(PREFIX + endpoint, request);
    return response.data;
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<void> {
    const endpoint = `/v1/templates/${id}`;
    await client.delete(PREFIX + endpoint);
}

// =============================================================================
// LIST/BROWSE OPERATIONS
// =============================================================================

/**
 * Get current user's templates with optional filtering
 */
export async function loadMyTemplates(filter?: TemplateFilterRequest): Promise<TemplateListResponse> {
    const endpoint = "/v1/me/templates";
    const params = getParamsFromObject(filter);
    const response = await client.get<TemplateListResponse>(PREFIX + endpoint, { params });
    return response.data;
}

/**
 * Get templates for a specific club with optional filtering
 */
export async function loadClubTemplates(clubId: string, filter?: TemplateFilterRequest): Promise<TemplateListResponse> {
    const endpoint = `/v1/clubs/${clubId}/templates`;
    const params = getParamsFromObject(filter);
    const response = await client.get<TemplateListResponse>(PREFIX + endpoint, { params });
    return response.data;
}

/**
 * Get all public templates with optional filtering
 */
export async function loadPublicTemplates(filter?: TemplateFilterRequest): Promise<TemplateListResponse> {
    const endpoint = "/v1/templates";
    const params = getParamsFromObject(filter);
    const response = await client.get<TemplateListResponse>(PREFIX + endpoint, { params });
    return response.data;
}

/**
 * Get current user's bookmarked templates with optional filtering
 */
export async function loadBookmarkedTemplates(filter?: TemplateFilterRequest): Promise<TemplateListResponse> {
    const endpoint = "/v1/me/templates/bookmarks";
    const params = getParamsFromObject(filter);
    const response = await client.get<TemplateListResponse>(PREFIX + endpoint, { params });
    return response.data;
}

// =============================================================================
// SECTIONS
// =============================================================================

/**
 * Add a section to a template
 */
export async function addTemplateSection(templateId: string, request: CreateTemplateSectionRequest): Promise<TemplateSection> {
    const endpoint = `/v1/templates/${templateId}/sections`;
    const response = await client.post<TemplateSection>(PREFIX + endpoint, request);
    return response.data;
}

/**
 * Update a section in a template
 */
export async function updateTemplateSection(
    templateId: string,
    sectionId: string,
    request: UpdateTemplateSectionRequest
): Promise<TemplateSection> {
    const endpoint = `/v1/templates/${templateId}/sections/${sectionId}`;
    const response = await client.put<TemplateSection>(PREFIX + endpoint, request);
    return response.data;
}

/**
 * Delete a section from a template
 */
export async function deleteTemplateSection(templateId: string, sectionId: string): Promise<void> {
    const endpoint = `/v1/templates/${templateId}/sections/${sectionId}`;
    await client.delete(PREFIX + endpoint);
}

// =============================================================================
// ITEMS
// =============================================================================

/**
 * Add an item to a template
 */
export async function addTemplateItem(templateId: string, request: CreateTemplateItemRequest): Promise<TemplateItem> {
    const endpoint = `/v1/templates/${templateId}/items`;
    const response = await client.post<TemplateItem>(PREFIX + endpoint, request);
    return response.data;
}

/**
 * Update an item in a template
 */
export async function updateTemplateItem(
    templateId: string,
    itemId: string,
    request: UpdateTemplateItemRequest
): Promise<TemplateItem> {
    const endpoint = `/v1/templates/${templateId}/items/${itemId}`;
    const response = await client.put<TemplateItem>(PREFIX + endpoint, request);
    return response.data;
}

/**
 * Delete an item from a template
 */
export async function deleteTemplateItem(templateId: string, itemId: string): Promise<void> {
    const endpoint = `/v1/templates/${templateId}/items/${itemId}`;
    await client.delete(PREFIX + endpoint);
}

/**
 * Reorder items in a template
 */
export async function reorderTemplateItems(templateId: string, itemIds: string[]): Promise<void> {
    const endpoint = `/v1/templates/${templateId}/items/reorder`;
    await client.put(PREFIX + endpoint, { itemIds });
}

// =============================================================================
// EVENT INTEGRATION
// =============================================================================

/**
 * Save an event's training plan as a template
 */
export async function saveEventPlanAsTemplate(
    eventId: string,
    request: SaveAsTemplateRequest
): Promise<TrainingPlanTemplateDetail> {
    const endpoint = `/v1/events/${eventId}/training-plan/save-as-template`;
    const response = await client.post<TrainingPlanTemplateDetail>(PREFIX + endpoint, request);
    return response.data;
}

/**
 * Load a template into an event's training plan
 */
export async function loadTemplateToEvent(eventId: string, templateId: string, replace: boolean = false): Promise<void> {
    const endpoint = `/v1/events/${eventId}/training-plan/load-template/${templateId}`;
    await client.post(PREFIX + endpoint, null, { params: { replace } });
}

// =============================================================================
// LIKES
// =============================================================================

/**
 * Like a template
 */
export async function likeTemplate(id: string): Promise<TemplateLikeStatus> {
    const endpoint = `/v1/templates/${id}/like`;
    const response = await client.post<TemplateLikeStatus>(PREFIX + endpoint);
    return response.data;
}

/**
 * Unlike a template
 */
export async function unlikeTemplate(id: string): Promise<TemplateLikeStatus> {
    const endpoint = `/v1/templates/${id}/like`;
    const response = await client.delete<TemplateLikeStatus>(PREFIX + endpoint);
    return response.data;
}

/**
 * Get like status for a template
 */
export async function getTemplateLikeStatus(id: string): Promise<TemplateLikeStatus> {
    const endpoint = `/v1/templates/${id}/like`;
    const response = await client.get<TemplateLikeStatus>(PREFIX + endpoint);
    return response.data;
}

// =============================================================================
// BOOKMARKS
// =============================================================================

/**
 * Bookmark a template
 */
export async function bookmarkTemplate(id: string): Promise<TemplateBookmarkStatus> {
    const endpoint = `/v1/templates/${id}/bookmark`;
    const response = await client.post<TemplateBookmarkStatus>(PREFIX + endpoint);
    return response.data;
}

/**
 * Remove bookmark from a template
 */
export async function unbookmarkTemplate(id: string): Promise<TemplateBookmarkStatus> {
    const endpoint = `/v1/templates/${id}/bookmark`;
    const response = await client.delete<TemplateBookmarkStatus>(PREFIX + endpoint);
    return response.data;
}

// =============================================================================
// COMMENTS
// =============================================================================

/**
 * Create a comment on a template
 */
export async function createTemplateComment(
    templateId: string,
    content: string,
    parentCommentId?: string
): Promise<TemplateComment> {
    const endpoint = `/v1/templates/${templateId}/comments`;
    const response = await client.post<TemplateComment>(PREFIX + endpoint, { content, parentCommentId });
    return response.data;
}

/**
 * Get comments for a template with cursor pagination
 */
export async function loadTemplateComments(
    templateId: string,
    cursor?: string,
    limit: number = 20
): Promise<TemplateCommentsResponse> {
    const endpoint = `/v1/templates/${templateId}/comments`;
    const params: Record<string, string | number> = { limit };
    if (cursor) {
        params.cursor = cursor;
    }
    const response = await client.get<TemplateCommentsResponse>(PREFIX + endpoint, { params });
    return response.data;
}

/**
 * Delete a comment from a template
 */
export async function deleteTemplateComment(templateId: string, commentId: string): Promise<void> {
    const endpoint = `/v1/templates/${templateId}/comments/${commentId}`;
    await client.delete(PREFIX + endpoint);
}
