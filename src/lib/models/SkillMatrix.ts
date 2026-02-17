// =============================================================================
// SKILL MATRIX — Matching Events.Application.DTOs.SkillMatrix
// =============================================================================

export interface SkillBandDto {
  id: string;
  order: number;
  minScore: number;
  maxScore: number;
  label: string;
  criteria?: string;
  color?: string;
  description?: string;
}

export interface MatrixSkillDto {
  id: string;
  skill: string; // VolleyballSkill enum
  bands: SkillBandDto[];
}

export interface ClubSkillMatrixDto {
  id: string;
  clubId: string;
  name: string;
  isDefault: boolean;
  skills: MatrixSkillDto[];
  createdAt?: string;
  updatedAt?: string;
}

// Request types

export interface CreateSkillBandRequest {
  minScore: number;
  maxScore: number;
  label: string;
  criteria?: string;
  color?: string;
  description?: string;
}

export interface CreateMatrixSkillRequest {
  skill: string;
  bands: CreateSkillBandRequest[];
}

export interface CreateSkillMatrixRequest {
  name: string;
  isDefault: boolean;
  skills: CreateMatrixSkillRequest[];
}

export interface UpdateSkillMatrixRequest {
  name?: string;
  isDefault?: boolean;
}

export interface UpdateSkillBandRequest {
  minScore?: number;
  maxScore?: number;
  label?: string;
  criteria?: string;
  color?: string;
  description?: string;
}

export interface UpdateSkillBandFullRequest {
  order: number;
  minScore: number;
  maxScore: number;
  label: string;
  criteria?: string;
  color?: string;
  description?: string;
}

export interface UpdateMatrixSkillFullRequest {
  skill: string;
  bands: UpdateSkillBandFullRequest[];
}

export interface UpdateSkillMatrixFullRequest {
  name?: string;
  skills: UpdateMatrixSkillFullRequest[];
}

// Transformed frontend types (same shape, dates as Date)

export interface SkillBand {
  id: string;
  order: number;
  minScore: number;
  maxScore: number;
  label: string;
  criteria?: string;
  color?: string;
  description?: string;
}

export interface MatrixSkill {
  id: string;
  skill: string;
  bands: SkillBand[];
}

export interface ClubSkillMatrix {
  id: string;
  clubId: string;
  name: string;
  isDefault: boolean;
  skills: MatrixSkill[];
  createdAt?: Date;
  updatedAt?: Date;
}

export function transformSkillMatrixDto(dto: ClubSkillMatrixDto): ClubSkillMatrix {
  return {
    ...dto,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
  };
}
