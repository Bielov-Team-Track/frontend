// Training Plan Template Types - Matching backend DTOs from Events.Application.DTOs.Templates

import { Drill, DrillSkill } from "./Drill";

export type TemplateVisibility = "Private" | "Public";
export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ["Beginner", "Intermediate", "Advanced"];

export const DIFFICULTY_LEVEL_COLORS: Record<DifficultyLevel, { bg: string; text: string; border: string }> = {
  Beginner: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/40" },
  Intermediate: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/40" },
  Advanced: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/40" },
};

export interface TemplateAuthor {
  id: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface TrainingPlanTemplate {
  id: string;
  name: string;
  description?: string;
  createdByUserId: string;
  clubId?: string;
  clubName?: string;
  clubLogoUrl?: string;
  author?: TemplateAuthor;
  visibility: TemplateVisibility;
  level: DifficultyLevel;
  totalDuration: number;
  likeCount: number;
  usageCount: number;
  commentCount: number;
  skills: string[];
  drillCount: number;
  sectionCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TrainingPlanTemplateDetail extends TrainingPlanTemplate {
  sections: TemplateSection[];
  items: TemplateItem[];
}

export interface TemplateSection {
  id: string;
  name: string;
  order: number;
  duration: number;
  items: TemplateItem[];
}

export interface TemplateItem {
  id: string;
  drillId: string;
  sectionId?: string;
  order: number;
  duration: number;
  notes?: string;
  drill?: Drill;
}

// Request types
export interface CreateTemplateRequest {
  name: string;
  description?: string;
  clubId?: string;
  visibility?: TemplateVisibility;
  level?: DifficultyLevel;
  sections?: CreateTemplateSectionRequest[];
  items?: CreateTemplateItemRequest[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  clubId?: string;
  visibility?: TemplateVisibility;
  level?: DifficultyLevel;
  sections?: CreateTemplateSectionRequest[];
  items?: CreateTemplateItemRequest[];
}

export interface CreateTemplateSectionRequest {
  id?: string;
  name: string;
  order: number;
}

export interface UpdateTemplateSectionRequest {
  name?: string;
  order?: number;
}

export interface CreateTemplateItemRequest {
  drillId: string;
  sectionId?: string;
  duration: number;
  notes?: string;
  order?: number;
}

export interface UpdateTemplateItemRequest {
  sectionId?: string;
  duration?: number;
  notes?: string;
}

export interface SaveAsTemplateRequest {
  name: string;
  description?: string;
  clubId?: string;
  visibility?: TemplateVisibility;
  level?: DifficultyLevel;
}

// Filter/List types
export interface TemplateFilterRequest {
  searchTerm?: string;
  minDuration?: number;
  maxDuration?: number;
  skills?: string[];
  level?: DifficultyLevel;
  sortBy?: "newest" | "mostUsed" | "mostLiked" | "shortest" | "longest";
  page?: number;
  pageSize?: number;
}

export interface TemplateListResponse {
  items: TrainingPlanTemplate[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Interaction types
export interface TemplateLikeStatus {
  isLiked: boolean;
  likeCount: number;
}

export interface TemplateBookmarkStatus {
  isBookmarked: boolean;
}

export interface TemplateComment {
  id: string;
  templateId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  replies: TemplateComment[];
  createdAt: string;
}

export interface TemplateCommentsResponse {
  items: TemplateComment[];
  nextCursor?: string;
  hasMore: boolean;
}
