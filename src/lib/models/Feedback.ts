// Feedback Types - Matching backend DTOs from Events.Application.DTOs.Feedback.FeedbackDtos

import { Drill, DrillDto, transformDrillDto } from "./Drill";
import { BadgeType } from "./Evaluation";

// =============================================================================
// ENUMS
// =============================================================================

export type FeedbackMediaType = "Video" | "Article" | "Image";

// Enum mappings for API communication
export const FeedbackMediaTypeEnum: Record<FeedbackMediaType, number> = {
	Video: 0,
	Article: 1,
	Image: 2,
};

export const FeedbackMediaTypeFromEnum: Record<number, FeedbackMediaType> = {
	0: "Video",
	1: "Article",
	2: "Image",
};

// =============================================================================
// API RESPONSE DTOs
// =============================================================================

export interface FeedbackDto {
	id: string;
	recipientUserId: string;
	coachUserId: string;
	eventId?: string;
	comment?: string;
	sharedWithPlayer: boolean;
	improvementPoints: ImprovementPointDto[];
	praise?: PraiseDto;
	createdAt?: string;
	updatedAt?: string;
}

export interface ImprovementPointDto {
	id: string;
	description: string;
	order: number;
	attachedDrills: DrillDto[];
	mediaLinks: ImprovementPointMediaDto[];
}

export interface ImprovementPointMediaDto {
	id: string;
	url: string;
	type: FeedbackMediaType;
	title?: string;
}

export interface PraiseDto {
	id: string;
	message: string;
	badgeType?: string; // BadgeType enum as string
}

export interface FeedbackListResponseDto {
	items: FeedbackDto[];
	totalCount: number;
	page: number;
	pageSize: number;
}

// =============================================================================
// DOMAIN MODELS
// =============================================================================

export interface Feedback {
	id: string;
	recipientUserId: string;
	coachUserId: string;
	eventId?: string;
	comment?: string;
	sharedWithPlayer: boolean;
	improvementPoints: ImprovementPoint[];
	praise?: Praise;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface ImprovementPoint {
	id: string;
	description: string;
	order: number;
	attachedDrills: Drill[];
	mediaLinks: ImprovementPointMedia[];
}

export interface ImprovementPointMedia {
	id: string;
	url: string;
	type: FeedbackMediaType;
	title?: string;
}

export interface Praise {
	id: string;
	message: string;
	badgeType?: BadgeType;
}

export interface FeedbackListResponse {
	items: Feedback[];
	totalCount: number;
	page: number;
	pageSize: number;
}

// =============================================================================
// REQUEST DTOs
// =============================================================================

export interface CreateFeedbackRequest {
	recipientUserId: string;
	eventId?: string;
	comment?: string;
	sharedWithPlayer: boolean;
	improvementPoints?: CreateImprovementPointDto[];
	praise?: CreatePraiseDto;
}

export interface CreateImprovementPointDto {
	description: string;
	drillIds?: string[];
	mediaLinks?: CreateImprovementPointMediaDto[];
}

export interface CreateImprovementPointMediaDto {
	url: string;
	type: number; // FeedbackMediaType enum as number
	title?: string;
}

export interface CreatePraiseDto {
	message: string;
	badgeType?: string; // BadgeType enum as string
}

export interface UpdateFeedbackRequest {
	comment?: string;
	sharedWithPlayer?: boolean;
}

export interface AddImprovementPointRequest {
	description: string;
	order?: number;
	drillIds?: string[];
	mediaLinks?: CreateImprovementPointMediaDto[];
}

export interface UpdateImprovementPointRequest {
	description?: string;
}

export interface UpdatePraiseRequest {
	message?: string;
	badgeType?: string; // BadgeType enum as string
}

// =============================================================================
// TRANSFORM FUNCTIONS
// =============================================================================

export function transformImprovementPointMediaDto(dto: ImprovementPointMediaDto): ImprovementPointMedia {
	return {
		id: dto.id,
		url: dto.url,
		type: dto.type,
		title: dto.title,
	};
}

export function transformPraiseDto(dto: PraiseDto): Praise {
	return {
		id: dto.id,
		message: dto.message,
		badgeType: dto.badgeType as BadgeType | undefined,
	};
}

export function transformImprovementPointDto(dto: ImprovementPointDto): ImprovementPoint {
	return {
		id: dto.id,
		description: dto.description,
		order: dto.order,
		attachedDrills: dto.attachedDrills?.map(transformDrillDto) || [],
		mediaLinks: dto.mediaLinks?.map(transformImprovementPointMediaDto) || [],
	};
}

export function transformFeedbackDto(dto: FeedbackDto): Feedback {
	return {
		id: dto.id,
		recipientUserId: dto.recipientUserId,
		coachUserId: dto.coachUserId,
		eventId: dto.eventId,
		comment: dto.comment,
		sharedWithPlayer: dto.sharedWithPlayer,
		improvementPoints: dto.improvementPoints?.map(transformImprovementPointDto) || [],
		praise: dto.praise ? transformPraiseDto(dto.praise) : undefined,
		createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
		updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
	};
}

export function transformFeedbackListResponseDto(dto: FeedbackListResponseDto): FeedbackListResponse {
	return {
		items: dto.items.map(transformFeedbackDto),
		totalCount: dto.totalCount,
		page: dto.page,
		pageSize: dto.pageSize,
	};
}
