// Drill Types - Matching backend DTOs from Events.Application.DTOs.Drills

export type DrillCategory = "Warmup" | "Technical" | "Tactical" | "Game" | "Conditioning" | "Cooldown";
export type DrillIntensity = "Low" | "Medium" | "High";
export type DrillSkill = "Serving" | "Passing" | "Setting" | "Attacking" | "Blocking" | "Defense" | "Conditioning" | "Footwork";
export type DrillVisibility = "Public" | "Private";
export type DrillAttachmentType = "Image" | "Video" | "Document";

// Animation Types (stored as JSON in backend)
export type EquipmentType = "cone" | "target" | "ball" | "hoop" | "ladder" | "hurdle" | "antenna";

export interface PlayerPosition {
    id: string;
    x: number;
    y: number;
    color: string;
    label?: string;
    firstFrameIndex?: number;
    note?: string;
}

export interface EquipmentItem {
    id: string;
    type: EquipmentType;
    x: number;
    y: number;
    rotation?: number;
    firstFrameIndex?: number;
    note?: string;
    label?: string;
}

export interface AnimationKeyframe {
    id: string;
    players: PlayerPosition[];
    ball: { x: number; y: number };
    equipment?: EquipmentItem[];
}

export interface DrillAnimation {
    keyframes: AnimationKeyframe[];
    speed: number;
}

// Backend enum values (for API communication)
export const DrillCategoryEnum: Record<DrillCategory, number> = {
    Warmup: 0,
    Technical: 1,
    Tactical: 2,
    Game: 3,
    Conditioning: 4,
    Cooldown: 5,
};

export const DrillIntensityEnum: Record<DrillIntensity, number> = {
    Low: 0,
    Medium: 1,
    High: 2,
};

export const DrillSkillEnum: Record<DrillSkill, number> = {
    Serving: 0,
    Passing: 1,
    Setting: 2,
    Attacking: 3,
    Blocking: 4,
    Defense: 5,
    Conditioning: 6,
    Footwork: 7,
};

export const DrillVisibilityEnum: Record<DrillVisibility, number> = {
    Public: 0,
    Private: 1,
};

export const DrillAttachmentTypeEnum: Record<DrillAttachmentType, number> = {
    Image: 0,
    Video: 1,
    Document: 2,
};

// Reverse mappings for converting API responses
export const DrillCategoryFromEnum: Record<number, DrillCategory> = {
    0: "Warmup",
    1: "Technical",
    2: "Tactical",
    3: "Game",
    4: "Conditioning",
    5: "Cooldown",
};

export const DrillIntensityFromEnum: Record<number, DrillIntensity> = {
    0: "Low",
    1: "Medium",
    2: "High",
};

export const DrillSkillFromEnum: Record<number, DrillSkill> = {
    0: "Serving",
    1: "Passing",
    2: "Setting",
    3: "Attacking",
    4: "Blocking",
    5: "Defense",
    6: "Conditioning",
    7: "Footwork",
};

export const DrillVisibilityFromEnum: Record<number, DrillVisibility> = {
    0: "Public",
    1: "Private",
};

// Drill Equipment DTO
export interface DrillEquipmentDto {
    id: string;
    name: string;
    isOptional: boolean;
    order: number;
}

// Drill Variation DTO - represents a link to another drill
export interface DrillVariationDto {
    id: string;
    drillId: string;
    drillName: string;
    drillCategory: DrillCategory;
    drillIntensity: DrillIntensity;
    note?: string;
    order: number;
}

// Author info for display
export interface DrillAuthorDto {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
}

// API Response DTOs
// Note: Backend returns enums as strings (e.g., "Technical", "High")
export interface DrillDto {
    id: string;
    name: string;
    description?: string;
    category: DrillCategory;
    intensity: DrillIntensity;
    visibility: DrillVisibility;
    skills: DrillSkill[];
    duration?: number;
    minPlayers?: number;
    maxPlayers?: number;
    instructions: string[];
    coachingPoints: string[];
    equipment: DrillEquipmentDto[];
    videoUrl?: string;
    createdByUserId: string;
    clubId?: string;
    clubName?: string;
    clubLogoUrl?: string;
    author?: DrillAuthorDto;
    likeCount: number;
    bookmarkCount: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    createdAt: string;
    updatedAt?: string;
    attachments: DrillAttachmentDto[];
    variations: DrillVariationDto[];
    animation?: DrillAnimation;
}

export interface DrillAttachmentDto {
    id: string;
    drillId: string;
    fileName: string;
    fileUrl: string;
    fileType: DrillAttachmentType;
    fileSize: number;
    order: number;
}

// =============================================================================
// LIKES
// =============================================================================

export interface DrillLikeStatusDto {
    isLiked: boolean;
    likeCount: number;
}

// =============================================================================
// BOOKMARKS
// =============================================================================

export interface DrillBookmarkStatusDto {
    isBookmarked: boolean;
}

export interface BookmarkedDrillDto {
    id: string;
    name: string;
    category: DrillCategory;
    intensity: DrillIntensity;
    likeCount: number;
    bookmarkedAt: string;
}

export interface BookmarkedDrill {
    id: string;
    name: string;
    category: DrillCategory;
    intensity: DrillIntensity;
    likeCount: number;
    bookmarkedAt: Date;
}

// =============================================================================
// COMMENTS
// =============================================================================

export interface DrillCommentAuthorDto {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
}

export interface DrillCommentDto {
    id: string;
    drillId: string;
    userId: string;
    content: string;
    parentCommentId?: string;
    createdAt: string;
    author?: DrillCommentAuthorDto;
    replies: DrillCommentDto[];
}

export interface DrillCommentsResponseDto {
    items: DrillCommentDto[];
    nextCursor?: string;
    hasMore: boolean;
}

export interface CreateDrillCommentRequest {
    content: string;
    parentCommentId?: string;
}

export interface DrillComment {
    id: string;
    drillId: string;
    userId: string;
    content: string;
    parentCommentId?: string;
    createdAt: Date;
    author?: DrillCommentAuthorDto;
    replies: DrillComment[];
}

export interface DrillCommentsResponse {
    items: DrillComment[];
    nextCursor?: string;
    hasMore: boolean;
}

// Frontend-friendly equipment type
export interface DrillEquipment {
    id: string;
    name: string;
    isOptional: boolean;
    order: number;
}

// Frontend-friendly variation type
export interface DrillVariation {
    id: string;
    drillId: string;
    drillName: string;
    drillCategory: DrillCategory;
    drillIntensity: DrillIntensity;
    note?: string;
    order: number;
}

// Author info for display
export interface DrillAuthor {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
}

// Frontend-friendly transformed types
export interface Drill {
    id: string;
    name: string;
    description?: string;
    category: DrillCategory;
    intensity: DrillIntensity;
    visibility: DrillVisibility;
    skills: DrillSkill[];
    duration?: number;
    minPlayers?: number;
    maxPlayers?: number;
    instructions: string[];
    coachingPoints: string[];
    equipment: DrillEquipment[];
    videoUrl?: string;
    createdByUserId: string;
    clubId?: string;
    clubName?: string;
    clubLogoUrl?: string;
    author?: DrillAuthor;
    likeCount: number;
    bookmarkCount: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    createdAt: Date;
    updatedAt?: Date;
    attachments: DrillAttachment[];
    variations: DrillVariation[];
    animation?: DrillAnimation;
}

export interface DrillAttachment {
    id: string;
    drillId: string;
    fileName: string;
    fileUrl: string;
    fileType: DrillAttachmentType;
    fileSize: number;
    order: number;
}

// Variation input for create/update requests
export interface CreateDrillVariationInput {
    drillId: string;
    note?: string;
}

// Equipment input for create/update requests
export interface DrillEquipmentInput {
    name: string;
    isOptional: boolean;
}

// Request DTOs
export interface CreateDrillRequest {
    name: string;
    description?: string;
    category: number;
    intensity: number;
    visibility: number;
    skills: number[];
    duration?: number;
    minPlayers?: number;
    maxPlayers?: number;
    instructions: string[];
    coachingPoints: string[];
    variations: CreateDrillVariationInput[];
    equipment: DrillEquipmentInput[];
    videoUrl?: string;
    clubId?: string;
    animation?: DrillAnimation;
}

export interface UpdateDrillRequest {
    id: string;
    name: string;
    description?: string;
    category: number;
    intensity: number;
    visibility: number;
    skills: number[];
    duration?: number;
    minPlayers?: number;
    maxPlayers?: number;
    instructions: string[];
    coachingPoints: string[];
    variations: CreateDrillVariationInput[];
    equipment: DrillEquipmentInput[];
    videoUrl?: string;
    clubId?: string;
    animation?: DrillAnimation;
}

export interface DrillFilterRequest {
    category?: number;
    intensity?: number;
    skill?: number;
    createdByUserId?: string;
    clubId?: string;
    searchTerm?: string;
    visibility?: number;
    equipment?: string[];
    requiredEquipmentOnly?: boolean;
    sortBy?: string; // likeCount, name, createdAt, duration
    sortOrder?: string;
    page?: number;
    limit?: number;
}

export interface CreateDrillAttachmentRequest {
    fileName: string;
    fileUrl: string;
    fileType: number;
    fileSize: number;
}

// Transform functions
// Note: Backend returns enums as strings that match our TypeScript types directly
export function transformEquipmentDto(dto: DrillEquipmentDto): DrillEquipment {
    return {
        id: dto.id,
        name: dto.name,
        isOptional: dto.isOptional,
        order: dto.order,
    };
}

export function transformVariationDto(dto: DrillVariationDto): DrillVariation {
    return {
        id: dto.id,
        drillId: dto.drillId,
        drillName: dto.drillName,
        drillCategory: dto.drillCategory,
        drillIntensity: dto.drillIntensity,
        note: dto.note,
        order: dto.order,
    };
}

export function transformDrillDto(dto: DrillDto): Drill {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        intensity: dto.intensity,
        visibility: dto.visibility,
        skills: dto.skills,
        duration: dto.duration,
        minPlayers: dto.minPlayers,
        maxPlayers: dto.maxPlayers,
        instructions: dto.instructions || [],
        coachingPoints: dto.coachingPoints || [],
        equipment: dto.equipment?.map(transformEquipmentDto) || [],
        videoUrl: dto.videoUrl,
        createdByUserId: dto.createdByUserId,
        clubId: dto.clubId,
        clubName: dto.clubName,
        clubLogoUrl: dto.clubLogoUrl,
        author: dto.author,
        likeCount: dto.likeCount,
        bookmarkCount: dto.bookmarkCount || 0,
        isLiked: dto.isLiked,
        isBookmarked: dto.isBookmarked,
        createdAt: new Date(dto.createdAt),
        updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
        attachments: dto.attachments?.map(transformAttachmentDto) || [],
        variations: dto.variations?.map(transformVariationDto) || [],
        animation: dto.animation,
    };
}

export function transformAttachmentDto(dto: DrillAttachmentDto): DrillAttachment {
    return {
        id: dto.id,
        drillId: dto.drillId,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        fileType: dto.fileType,
        fileSize: dto.fileSize,
        order: dto.order,
    };
}

export function transformBookmarkedDrillDto(dto: BookmarkedDrillDto): BookmarkedDrill {
    return {
        id: dto.id,
        name: dto.name,
        category: dto.category,
        intensity: dto.intensity,
        likeCount: dto.likeCount,
        bookmarkedAt: new Date(dto.bookmarkedAt),
    };
}

export function transformCommentDto(dto: DrillCommentDto): DrillComment {
    return {
        id: dto.id,
        drillId: dto.drillId,
        userId: dto.userId,
        content: dto.content,
        parentCommentId: dto.parentCommentId,
        createdAt: new Date(dto.createdAt),
        author: dto.author,
        replies: dto.replies?.map(transformCommentDto) || [],
    };
}

export function transformCommentsResponseDto(dto: DrillCommentsResponseDto): DrillCommentsResponse {
    return {
        items: dto.items.map(transformCommentDto),
        nextCursor: dto.nextCursor,
        hasMore: dto.hasMore,
    };
}
