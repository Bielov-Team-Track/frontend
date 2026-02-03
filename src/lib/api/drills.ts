import client from "./client";
import {
    DrillDto,
    DrillAttachmentDto,
    DrillFilterRequest,
    CreateDrillRequest,
    UpdateDrillRequest,
    CreateDrillAttachmentRequest,
    Drill,
    DrillAttachment,
    DrillAnimation,
    DrillLikeStatusDto,
    DrillBookmarkStatusDto,
    BookmarkedDrillDto,
    BookmarkedDrill,
    DrillCommentDto,
    DrillCommentsResponseDto,
    DrillCommentsResponse,
    DrillComment,
    CreateDrillCommentRequest,
    transformDrillDto,
    transformAttachmentDto,
    transformBookmarkedDrillDto,
    transformCommentDto,
    transformCommentsResponseDto,
} from "../models/Drill";
import { getParamsFromObject } from "../utils/request";

const PREFIX = "/events";

// =============================================================================
// DRILLS
// =============================================================================

/**
 * Get all public drills with optional filtering
 */
export async function loadDrills(filter?: DrillFilterRequest): Promise<Drill[]> {
    const endpoint = "/v1/drills";
    const params = getParamsFromObject(filter);
    const response = await client.get<DrillDto[]>(PREFIX + endpoint, { params });
    return response.data.map(transformDrillDto);
}

/**
 * Get a specific drill by ID
 */
export async function loadDrill(drillId: string): Promise<Drill> {
    const endpoint = `/v1/drills/${drillId}`;
    const response = await client.get<DrillDto>(PREFIX + endpoint);
    return transformDrillDto(response.data);
}

/**
 * Create a new drill
 */
export async function createDrill(request: CreateDrillRequest): Promise<Drill> {
    const endpoint = "/v1/drills";
    const response = await client.post<DrillDto>(PREFIX + endpoint, request);
    return transformDrillDto(response.data);
}

/**
 * Update an existing drill
 */
export async function updateDrill(drillId: string, request: UpdateDrillRequest): Promise<Drill> {
    const endpoint = `/v1/drills/${drillId}`;
    const response = await client.put<DrillDto>(PREFIX + endpoint, { ...request, id: drillId });
    return transformDrillDto(response.data);
}

/**
 * Delete a drill
 */
export async function deleteDrill(drillId: string): Promise<void> {
    const endpoint = `/v1/drills/${drillId}`;
    await client.delete(PREFIX + endpoint);
}

/**
 * Get current user's drills (includes private)
 */
export async function loadMyDrills(): Promise<Drill[]> {
    const endpoint = "/v1/me/drills";
    const response = await client.get<DrillDto[]>(PREFIX + endpoint);
    return response.data.map(transformDrillDto);
}

/**
 * Get drills for a specific club
 */
export async function loadClubDrills(clubId: string): Promise<Drill[]> {
    const endpoint = `/v1/clubs/${clubId}/drills`;
    const response = await client.get<DrillDto[]>(PREFIX + endpoint);
    return response.data.map(transformDrillDto);
}

// =============================================================================
// LIKES
// =============================================================================

/**
 * Like a drill
 */
export async function likeDrill(drillId: string): Promise<DrillLikeStatusDto> {
    const endpoint = `/v1/drills/${drillId}/like`;
    const response = await client.post<DrillLikeStatusDto>(PREFIX + endpoint);
    return response.data;
}

/**
 * Unlike a drill
 */
export async function unlikeDrill(drillId: string): Promise<DrillLikeStatusDto> {
    const endpoint = `/v1/drills/${drillId}/like`;
    const response = await client.delete<DrillLikeStatusDto>(PREFIX + endpoint);
    return response.data;
}

/**
 * Get like status for a drill
 */
export async function getLikeStatus(drillId: string): Promise<DrillLikeStatusDto> {
    const endpoint = `/v1/drills/${drillId}/like`;
    const response = await client.get<DrillLikeStatusDto>(PREFIX + endpoint);
    return response.data;
}

// =============================================================================
// BOOKMARKS
// =============================================================================

/**
 * Bookmark a drill
 */
export async function bookmarkDrill(drillId: string): Promise<DrillBookmarkStatusDto> {
    const endpoint = `/v1/drills/${drillId}/bookmark`;
    const response = await client.post<DrillBookmarkStatusDto>(PREFIX + endpoint);
    return response.data;
}

/**
 * Remove bookmark from a drill
 */
export async function unbookmarkDrill(drillId: string): Promise<DrillBookmarkStatusDto> {
    const endpoint = `/v1/drills/${drillId}/bookmark`;
    const response = await client.delete<DrillBookmarkStatusDto>(PREFIX + endpoint);
    return response.data;
}

/**
 * Get current user's bookmarked drills
 */
export async function loadMyBookmarkedDrills(): Promise<BookmarkedDrill[]> {
    const endpoint = "/v1/me/drills/bookmarks";
    const response = await client.get<BookmarkedDrillDto[]>(PREFIX + endpoint);
    return response.data.map(transformBookmarkedDrillDto);
}

// =============================================================================
// COMMENTS
// =============================================================================

/**
 * Create a comment on a drill
 */
export async function createDrillComment(drillId: string, request: CreateDrillCommentRequest): Promise<DrillComment> {
    const endpoint = `/v1/drills/${drillId}/comments`;
    const response = await client.post<DrillCommentDto>(PREFIX + endpoint, request);
    return transformCommentDto(response.data);
}

/**
 * Get comments for a drill with cursor pagination
 */
export async function loadDrillComments(
    drillId: string,
    cursor?: string,
    limit: number = 20
): Promise<DrillCommentsResponse> {
    const endpoint = `/v1/drills/${drillId}/comments`;
    const params: Record<string, string | number> = { limit };
    if (cursor) {
        params.cursor = cursor;
    }
    const response = await client.get<DrillCommentsResponseDto>(PREFIX + endpoint, { params });
    return transformCommentsResponseDto(response.data);
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteDrillComment(drillId: string, commentId: string): Promise<void> {
    const endpoint = `/v1/drills/${drillId}/comments/${commentId}`;
    await client.delete(PREFIX + endpoint);
}

// =============================================================================
// ATTACHMENTS
// =============================================================================

/**
 * Add an attachment to a drill
 */
export async function addDrillAttachment(
    drillId: string,
    request: CreateDrillAttachmentRequest
): Promise<DrillAttachment> {
    const endpoint = `/v1/drills/${drillId}/attachments`;
    const response = await client.post<DrillAttachmentDto>(PREFIX + endpoint, request);
    return transformAttachmentDto(response.data);
}

/**
 * Delete an attachment from a drill
 */
export async function deleteDrillAttachment(drillId: string, attachmentId: string): Promise<void> {
    const endpoint = `/v1/drills/${drillId}/attachments/${attachmentId}`;
    await client.delete(PREFIX + endpoint);
}

// =============================================================================
// ANIMATION
// =============================================================================

/**
 * Update a drill's animation
 */
export async function updateDrillAnimation(drillId: string, animation: DrillAnimation | null): Promise<Drill> {
    const endpoint = `/v1/drills/${drillId}/animation`;
    const response = await client.put<DrillDto>(PREFIX + endpoint, { animation });
    return transformDrillDto(response.data);
}
