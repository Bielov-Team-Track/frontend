// Training Plan Types - Matching backend DTOs from Coaching.Application.DTOs.Plans

import { Drill, DrillSkill } from "./Drill";

export type PlanVisibility = "Private" | "Public";
export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type PlanType = "Template" | "Instance";

/** @deprecated Use PlanVisibility instead */
export type TemplateVisibility = PlanVisibility;

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ["Beginner", "Intermediate", "Advanced"];

export const DIFFICULTY_LEVEL_COLORS: Record<DifficultyLevel, { bg: string; text: string; border: string }> = {
  Beginner: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/40" },
  Intermediate: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/40" },
  Advanced: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/40" },
};

export interface PlanAuthor {
  id: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

/** @deprecated Use PlanAuthor instead */
export type TemplateAuthor = PlanAuthor;

export interface TrainingPlan {
  id: string;
  name: string;
  description?: string;
  createdByUserId: string;
  clubId?: string;
  clubName?: string;
  clubLogoUrl?: string;
  author?: PlanAuthor;
  visibility: PlanVisibility;
  level: DifficultyLevel;
  totalDuration: number;
  likeCount: number;
  usageCount: number;
  commentCount: number;
  skills: string[];
  drillCount: number;
  sectionCount: number;
  planType?: PlanType;
  eventId?: string;
  createdAt: string;
  updatedAt?: string;
}

/** @deprecated Use TrainingPlan instead */
export type TrainingPlanTemplate = TrainingPlan;

export interface TrainingPlanDetail extends TrainingPlan {
  sections: PlanSection[];
  items: PlanItem[];
}

/** @deprecated Use TrainingPlanDetail instead */
export type TrainingPlanTemplateDetail = TrainingPlanDetail;

export interface PlanSection {
  id: string;
  name: string;
  order: number;
  duration: number;
  items: PlanItem[];
}

/** @deprecated Use PlanSection instead */
export type TemplateSection = PlanSection;

export interface PlanItem {
  id: string;
  drillId: string;
  sectionId?: string;
  order: number;
  duration: number;
  notes?: string;
  drill?: Drill;
}

/** @deprecated Use PlanItem instead */
export type TemplateItem = PlanItem;

// Request types
export interface CreatePlanRequest {
  name: string;
  description?: string;
  clubId?: string;
  visibility?: PlanVisibility;
  level?: DifficultyLevel;
  sections?: CreatePlanSectionRequest[];
  items?: CreatePlanItemRequest[];
}

/** @deprecated Use CreatePlanRequest instead */
export type CreateTemplateRequest = CreatePlanRequest;

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  clubId?: string;
  visibility?: PlanVisibility;
  level?: DifficultyLevel;
  sections?: CreatePlanSectionRequest[];
  items?: CreatePlanItemRequest[];
}

/** @deprecated Use UpdatePlanRequest instead */
export type UpdateTemplateRequest = UpdatePlanRequest;

export interface CreatePlanSectionRequest {
  id?: string;
  name: string;
  order: number;
}

/** @deprecated Use CreatePlanSectionRequest instead */
export type CreateTemplateSectionRequest = CreatePlanSectionRequest;

export interface UpdatePlanSectionRequest {
  name?: string;
  order?: number;
}

/** @deprecated Use UpdatePlanSectionRequest instead */
export type UpdateTemplateSectionRequest = UpdatePlanSectionRequest;

export interface CreatePlanItemRequest {
  drillId: string;
  sectionId?: string;
  duration: number;
  notes?: string;
  order?: number;
}

/** @deprecated Use CreatePlanItemRequest instead */
export type CreateTemplateItemRequest = CreatePlanItemRequest;

export interface UpdatePlanItemRequest {
  sectionId?: string;
  duration?: number;
  notes?: string;
}

/** @deprecated Use UpdatePlanItemRequest instead */
export type UpdateTemplateItemRequest = UpdatePlanItemRequest;

export interface SaveAsTemplateRequest {
  name: string;
  description?: string;
  clubId?: string;
  visibility?: PlanVisibility;
  level?: DifficultyLevel;
}

export interface CreateEventPlanRequest {
  name?: string;
  description?: string;
  sourceTemplateId?: string;
  sections?: CreatePlanSectionRequest[];
  items?: CreatePlanItemRequest[];
}

// Filter/List types
export interface PlanFilterRequest {
  searchTerm?: string;
  minDuration?: number;
  maxDuration?: number;
  skills?: string[];
  level?: DifficultyLevel;
  sortBy?: "newest" | "mostUsed" | "mostLiked" | "shortest" | "longest";
  page?: number;
  pageSize?: number;
}

/** @deprecated Use PlanFilterRequest instead */
export type TemplateFilterRequest = PlanFilterRequest;

export interface PlanListResponse {
  items: TrainingPlan[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** @deprecated Use PlanListResponse instead */
export type TemplateListResponse = PlanListResponse;

// Interaction types
export interface PlanLikeStatus {
  isLiked: boolean;
  likeCount: number;
}

/** @deprecated Use PlanLikeStatus instead */
export type TemplateLikeStatus = PlanLikeStatus;

export interface PlanBookmarkStatus {
  isBookmarked: boolean;
}

/** @deprecated Use PlanBookmarkStatus instead */
export type TemplateBookmarkStatus = PlanBookmarkStatus;

export interface PlanComment {
  id: string;
  planId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  replies: PlanComment[];
  createdAt: string;
}

/** @deprecated Use PlanComment instead */
export type TemplateComment = PlanComment;

export interface PlanCommentsResponse {
  items: PlanComment[];
  nextCursor?: string;
  hasMore: boolean;
}

/** @deprecated Use PlanCommentsResponse instead */
export type TemplateCommentsResponse = PlanCommentsResponse;
